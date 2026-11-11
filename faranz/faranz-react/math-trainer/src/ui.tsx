import { useEffect, useRef, useState, type ReactNode } from 'react'
import { parseAnswer } from './tricks'

export function Shell(props: { back: string; backLabel: string; title: string; mode?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <main className="screen">
      <div className="apphead">
        <a className="back" href={props.back}>← {props.backLabel}</a>
        <h1 className="crumb">
          {props.title}
          {props.mode && <small>{props.mode}</small>}
        </h1>
        <span className="spacer" />
        {props.right}
      </div>
      {props.children}
    </main>
  )
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="meter" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

export function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  )
}

/**
 * The question with a number box. Enter submits. Give it a new `key` for each
 * question so the box clears and takes focus again.
 */
export function AnswerBox(props: { q: string; unit?: string; disabled?: boolean; onSubmit: (value: number) => void }) {
  const [text, setText] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!props.disabled) input.current?.focus()
  }, [props.disabled])

  const value = parseAnswer(text)
  return (
    <form
      className="ask"
      onSubmit={e => {
        e.preventDefault()
        if (value !== null && !props.disabled) props.onSubmit(value)
      }}
    >
      <label htmlFor="answer" className="question">{props.q}</label>
      <div className="answer">
        <span className="eq">=</span>
        <input
          id="answer"
          ref={input}
          value={text}
          onChange={e => setText(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          disabled={props.disabled}
          aria-label={`Answer to ${props.q}`}
        />
        {props.unit && <span className="eq">{props.unit}</span>}
        <button className="btn primary" disabled={value === null || props.disabled}>Check</button>
      </div>
    </form>
  )
}

/** Runs `fn` when Enter is pressed anywhere, while `active`. */
export function useEnter(active: boolean, fn: () => void) {
  const latest = useRef(fn)
  latest.current = fn
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        latest.current()
      }
    }
    // registered on the next tick so the Enter that submitted the answer does not also skip the feedback
    const t = setTimeout(() => window.addEventListener('keydown', onKey), 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [active])
}
