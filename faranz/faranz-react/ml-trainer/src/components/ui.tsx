import type { ReactNode } from 'react'

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

/** Numbered move list; the most recent move is marked. */
export function MoveList({ moves, upto, pending }: { moves: string[]; upto: number; pending?: boolean }) {
  const shown = moves.slice(0, upto)
  if (!shown.length && !pending) return <div className="moves muted">No moves yet.</div>
  return (
    <div className="moves">
      {shown.map((san, i) => (
        <span key={i} className="mv">
          {i % 2 === 0 && <span className="num">{i / 2 + 1}.</span>}
          <b className={i === shown.length - 1 && !pending ? 'cur' : ''}>{san}</b>
        </span>
      ))}
      {pending && (
        <span className="mv">
          {shown.length % 2 === 0 && <span className="num">{shown.length / 2 + 1}.</span>}
          <b className="cur">?</b>
        </span>
      )}
    </div>
  )
}
