import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { runPython, type RunResult } from '../py'
import { NotePad } from '../screens/Notebook'
import { getState, recordAnswer, saveDraft } from '../store'
import type { Bug, Choice, Design, Numeric, Output, Question, Write } from '../types'
import { Code, LineChart, Prose } from './Code'

const KIND: Record<Question['kind'], string> = {
  choice: 'Pick one',
  output: 'What does it print?',
  bug: 'Find the bug',
  number: 'Work it out',
  write: 'Write the code',
  design: 'Design it',
}

/** Text typed as an answer, compared without regard to spacing at the ends of lines. */
export const tidy = (text: string) => text.replace(/\r/g, '').split('\n').map(l => l.trim()).join('\n').trim()

/** A number typed as "0.25", "1/4" or "25%". */
export function parseNumber(text: string): number {
  const t = text.trim().replace(/,/g, '')
  if (/^-?[\d.]+\s*\/\s*-?[\d.]+$/.test(t)) {
    const [a, b] = t.split('/').map(Number)
    return a / b
  }
  return t.endsWith('%') ? Number(t.slice(0, -1)) / 100 : Number(t)
}

export const closeEnough = (q: Numeric, value: number) => Math.abs(value - q.answer) <= (q.tol ?? Math.max(0.01, Math.abs(q.answer) * 0.01))

interface Part<Q> {
  q: Q
  /** Null until the question has been answered. */
  result: boolean | null
  finish: (correct: boolean) => void
}

/**
 * One question of any kind. It keeps its own state, records the answer once,
 * and shows the explanation and the button to go on.
 */
export function QuestionCard({ q, eyebrow, onNext, nextLabel }: { q: Question; eyebrow?: string; onNext: (correct: boolean) => void; nextLabel: string }) {
  const [result, setResult] = useState<boolean | null>(null)
  const [hint, setHint] = useState(false)
  const finish = (correct: boolean) => {
    if (result !== null) return
    setResult(correct)
    recordAnswer(q.id, correct)
  }
  const part = { result, finish }

  return (
    <div className="card question">
      <div className="eyebrow">{KIND[q.kind]}{eyebrow && ` · ${eyebrow}`}</div>
      <p className="ask"><Prose text={q.ask} /></p>
      {q.kind === 'choice' && <ChoicePart q={q} {...part} />}
      {q.kind === 'output' && <OutputPart q={q} {...part} />}
      {q.kind === 'bug' && <BugPart q={q} {...part} />}
      {q.kind === 'number' && <NumberPart q={q} {...part} />}
      {q.kind === 'write' && <WritePart q={q} {...part} />}
      {q.kind === 'design' && <DesignPart q={q} {...part} />}

      {result === null && q.hint && (hint ? <p className="note hintline"><Prose text={q.hint} /></p> : <div className="actions"><button className="btn" onClick={() => setHint(true)}>Hint</button></div>)}
      {result !== null && (
        <div className={'verdict ' + (result ? 'right' : 'wrong')}>
          <b>{result ? 'Right.' : q.kind === 'design' ? 'Go over the points you missed.' : 'Not quite.'}</b>
          <p><Prose text={q.why} /></p>
          <div className="actions">
            <button className="btn primary" autoFocus onClick={() => onNext(result)}>{nextLabel}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChoicePart({ q, result, finish }: Part<Choice>) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <>
      {q.code && <Code source={q.code} numbers />}
      {q.chart && <LineChart chart={q.chart} />}
      <div className="options">
        {q.options.map((option, i) => (
          <button
            key={i}
            className={'btn option' + (result === null ? '' : i === q.answer ? ' right' : i === picked ? ' wrong' : '')}
            disabled={result !== null}
            onClick={() => {
              setPicked(i)
              finish(i === q.answer)
            }}
          >
            <Prose text={option} />
          </button>
        ))}
      </div>
    </>
  )
}

function OutputPart({ q, result, finish }: Part<Output>) {
  const [text, setText] = useState('')
  const many = q.answer.includes('\n')
  const submit = () => text.trim() && finish(tidy(text) === tidy(q.answer))
  const field = { value: text, disabled: result !== null, spellCheck: false, placeholder: 'What it prints', 'aria-label': 'Your answer' }
  return (
    <>
      <Code source={q.code} numbers />
      <div className="answer">
        {many ? (
          <textarea rows={q.answer.split('\n').length + 1} {...field} onChange={e => setText(e.target.value)} />
        ) : (
          <input {...field} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        )}
        {result === null && <button className="btn primary" onClick={submit}>Check</button>}
      </div>
      {result === false && <Shown label="It prints">{q.answer}</Shown>}
    </>
  )
}

function BugPart({ q, result, finish }: Part<Bug>) {
  const [picked, setPicked] = useState<number | null>(null)
  const marks = result === null ? undefined : { ...(picked && picked !== q.line ? { [picked]: 'bad' as const } : {}), [q.line]: 'good' as const }
  return (
    <>
      <Code
        source={q.code}
        numbers
        marks={marks}
        onLine={result === null ? line => { setPicked(line); finish(line === q.line) } : undefined}
      />
      {result === null && <p className="note">Click the line that is wrong.</p>}
      {result !== null && <Shown label={`Line ${q.line} should read`}>{q.fix}</Shown>}
    </>
  )
}

function NumberPart({ q, result, finish }: Part<Numeric>) {
  const [text, setText] = useState('')
  const submit = () => {
    const value = parseNumber(text)
    if (text.trim() && !Number.isNaN(value)) finish(closeEnough(q, value))
  }
  return (
    <>
      <div className="answer">
        <input value={text} disabled={result !== null} inputMode="decimal" placeholder="A number, e.g. 0.25 or 1/4" aria-label="Your answer" onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        {result === null && <button className="btn primary" onClick={submit}>Check</button>}
      </div>
      {result === false && <Shown label="The answer">{String(q.answer)}</Shown>}
    </>
  )
}

function WritePart({ q, result, finish }: Part<Write>) {
  const [code, setCode] = useState(() => getState().drafts[q.id] ?? q.starter)
  const [run, setRun] = useState<RunResult | 'running' | null>(null)
  const [shown, setShown] = useState(false)

  const test = async () => {
    setRun('running')
    saveDraft(q.id, code)
    const outcome = await runPython(`${code}\n\n${q.tests}\n`, q.numpy)
    setRun(outcome)
    if (outcome.ok) finish(!shown)
  }
  // Tab indents instead of leaving the editor
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart: a, selectionEnd: b } = el
    const next = code.slice(0, a) + '    ' + code.slice(b)
    setCode(next)
    requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4))
  }

  return (
    <>
      <textarea className="editor" rows={Math.max(8, code.split('\n').length + 1)} value={code} spellCheck={false} aria-label="Your code" onChange={e => setCode(e.target.value)} onKeyDown={onKey} />
      <div className="actions">
        <button className="btn primary" disabled={run === 'running'} onClick={test}>{run === 'running' ? 'Running…' : 'Run the tests'}</button>
        <button className="btn" onClick={() => setCode(q.starter)}>Start again</button>
        {!shown && result === null && <button className="btn" onClick={() => { setShown(true); finish(false) }}>Show a solution</button>}
      </div>
      {run === 'running' && <p className="note">The first run downloads Python into the browser, which can take a little while. After that it is quick.</p>}
      {run && run !== 'running' && (
        <div className={'runout ' + (run.ok ? 'ok' : 'fail')}>
          <b>{run.ok ? 'All tests pass.' : 'A test failed.'}</b>
          {run.error && <pre>{run.error}</pre>}
          {run.out && <pre>{run.out}</pre>}
        </div>
      )}
      {(shown || result === true) && <Shown label="One way to write it" code>{q.solution}</Shown>}
    </>
  )
}

function DesignPart({ q, result, finish }: Part<Design>) {
  const [open, setOpen] = useState(false)
  const [ticked, setTicked] = useState<Set<number>>(new Set())
  const toggle = (i: number) => {
    const next = new Set(ticked)
    next.has(i) ? next.delete(i) : next.add(i)
    setTicked(next)
  }
  return (
    <>
      <NotePad page={`q:${q.id}`} height={380} placeholder="Work out your answer here first: what you would build, in what order, and what you would measure. Write a few lines, and draw the system below: boxes for the parts, stores for the data, arrows for what flows between them." />
      {!open && (
        <div className="actions">
          <button className="btn primary" onClick={() => setOpen(true)}>Compare with a good answer</button>
        </div>
      )}
      {open && (
        <>
          <p className="note">Tick the points your answer covered. Be honest: the ones you leave unticked are the ones to learn.</p>
          <ul className="checklist">
            {q.checklist.map((item, i) => (
              <li key={i}>
                <label>
                  <input type="checkbox" checked={ticked.has(i)} disabled={result !== null} onChange={() => toggle(i)} />
                  <span><b><Prose text={item.point} /></b><small><Prose text={item.why} /></small></span>
                </label>
              </li>
            ))}
          </ul>
          {result === null && (
            <div className="actions">
              <button className="btn primary" onClick={() => finish(ticked.size >= Math.ceil(q.checklist.length * 0.6))}>Done: {ticked.size} of {q.checklist.length} covered</button>
            </div>
          )}
        </>
      )}
    </>
  )
}

function Shown({ label, code, children }: { label: string; code?: boolean; children: string | ReactNode }) {
  return (
    <div className="shown">
      <span className="note">{label}</span>
      {code && typeof children === 'string' ? <Code source={children} /> : <pre>{children}</pre>}
    </div>
  )
}
