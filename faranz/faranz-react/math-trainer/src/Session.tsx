import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Outcome } from './store'
import { fmt, isRight, newProblem, type Problem, type Trick } from './tricks'
import { AnswerBox, Steps, useEnter } from './ui'

interface Props {
  /** One trick per question, in order. */
  plan: Trick[]
  /**
   * guided: the method is shown alongside from the start (lessons).
   * recall: the method is hidden until you ask for it or answer.
   * mixed: as recall, and the trick's name is hidden too, so you have to spot which one fits.
   */
  mode: 'guided' | 'recall' | 'mixed'
  onDone: (outcomes: Outcome[]) => void
  /** Buttons shown on the results card. */
  after: ReactNode
}

/** A set of questions with the trick shown alongside and the worked steps after each answer. */
export function Session({ plan, mode, onDone, after }: Props) {
  const [i, setI] = useState(0)
  const [problem, setProblem] = useState<Problem>(() => newProblem(plan[0]))
  const [phase, setPhase] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [given, setGiven] = useState<number | null>(null)
  const [help, setHelp] = useState(mode === 'guided')
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const started = useRef(Date.now())
  const trick = plan[i]
  const finished = i >= plan.length

  const reported = useRef(false)
  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true
      onDone(outcomes)
    }
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (i + 1 < plan.length) setProblem(newProblem(plan[i + 1]))
    setI(i + 1)
    setPhase('ask')
    setGiven(null)
    setHelp(mode === 'guided')
    started.current = Date.now()
  }
  useEnter(phase !== 'ask' && !finished, next)

  const submit = (value: number) => {
    const correct = isRight(value, problem.answer)
    // in recall and mixed practice, peeking at the method means the trick is not yet known cold
    const clean = correct && (mode === 'guided' || !help)
    setGiven(value)
    setPhase(correct ? 'right' : 'wrong')
    setOutcomes(o => [...o, { trickId: trick.id, correct: clean, ms: Date.now() - started.current }])
  }

  if (finished) {
    const right = outcomes.filter(o => o.correct).length
    const avg = outcomes.reduce((n, o) => n + o.ms, 0) / Math.max(1, outcomes.length) / 1000
    return (
      <div className="card result">
        <div className={'eyebrow ' + (right === outcomes.length ? 'good' : 'accent')}>{right === outcomes.length ? 'Clean run' : 'Set finished'}</div>
        <div className="move">{right} of {outcomes.length} right{mode === 'guided' ? '' : ' without help'}</div>
        <p className="muted">Average time per question: {avg.toFixed(1)} seconds.</p>
        {mode !== 'guided' && (
          <p className="muted">
            {right === outcomes.length
              ? 'These tricks move up a level and come back for review later.'
              : 'Tricks you missed or needed help with stay due until you get them clean.'}
          </p>
        )}
        <div className="actions">{after}</div>
      </div>
    )
  }

  const showName = mode !== 'mixed' || help || phase !== 'ask'
  return (
    <div className="trainer">
      <div className="card problem">
        <div className="eyebrow">Question {i + 1} of {plan.length}</div>
        <AnswerBox key={i} q={problem.q} disabled={phase !== 'ask'} onSubmit={submit} />
        {phase === 'right' && <p className="verdict good">Correct: {problem.q} = {fmt(problem.answer)}</p>}
        {phase === 'wrong' && (
          <p className="verdict bad">
            Not quite. You answered {fmt(given!)}; the answer is {fmt(problem.answer)}.
          </p>
        )}
        {phase !== 'ask' && (
          <div className="actions">
            <button className="btn primary" onClick={next}>{i + 1 < plan.length ? 'Next question' : 'See results'}</button>
            <span className="note">or press Enter</span>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="card">
          <div className="eyebrow">The trick</div>
          {showName ? (
            <>
              <div className="move">{trick.title}</div>
              <p>{trick.rule}</p>
            </>
          ) : (
            <>
              <div className="move muted">Which trick fits?</div>
              <p className="muted">Look at the numbers and decide which shortcut applies before you calculate.</p>
            </>
          )}
          {help && phase === 'ask' && (
            <>
              <div className="eyebrow sub">Method</div>
              <Steps steps={trick.how} />
            </>
          )}
          {!help && phase === 'ask' && (
            <div className="actions">
              <button className="btn" onClick={() => setHelp(true)}>Show me the trick</button>
              <span className="note">Counts as needing help</span>
            </div>
          )}
          {phase !== 'ask' && (
            <>
              <div className="eyebrow sub">Worked out for {problem.q}</div>
              <Steps steps={problem.steps} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
