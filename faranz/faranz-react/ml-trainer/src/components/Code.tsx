import type { ReactNode } from 'react'
import type { Block, ChartSpec } from '../types'
import { Path, Plot } from './Plot'

const KEYWORDS = new Set('def return if elif else for while in not and or import from as class with try except finally raise lambda pass break continue None True False yield assert is del global'.split(' '))
const TOKEN = /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|(\b\d+\.?\d*(?:e-?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/gm

/** One line of Python with comments, strings, numbers and keywords coloured. */
function paint(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let at = 0
  for (const m of line.matchAll(TOKEN)) {
    if (m.index! > at) out.push(line.slice(at, m.index))
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : KEYWORDS.has(m[4]) ? 'k' : ''
    out.push(cls ? <span key={m.index} className={cls}>{m[0]}</span> : m[0])
    at = m.index! + m[0].length
  }
  if (at < line.length) out.push(line.slice(at))
  return out
}

interface CodeProps {
  source: string
  /** Number the lines. */
  numbers?: boolean
  /** Make the lines clickable (find-the-bug questions). */
  onLine?: (line: number) => void
  /** Lines to mark, counted from 1. */
  marks?: Record<number, 'good' | 'bad'>
}

export function Code({ source, numbers, onLine, marks }: CodeProps) {
  const lines = source.replace(/\n$/, '').split('\n')
  return (
    <pre className={'code' + (onLine ? ' pick' : '')}>
      {lines.map((line, i) => {
        const cls = marks?.[i + 1] ?? ''
        const body = (
          <>
            {numbers && <i>{i + 1}</i>}
            <code>{paint(line)}{'\n'}</code>
          </>
        )
        return onLine && line.trim() ? (
          <button key={i} className={'ln ' + cls} onClick={() => onLine(i + 1)}>{body}</button>
        ) : (
          <span key={i} className={'ln ' + cls}>{body}</span>
        )
      })}
    </pre>
  )
}

/** A paragraph in which `backticks` mark code and **stars** mark bold. */
export function Prose({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('`') ? <code key={i} className="inline">{part.slice(1, -1)}</code> : part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part,
      )}
    </>
  )
}

/** The text of a lesson: paragraphs and code blocks. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b, i) => (typeof b === 'string' ? <p key={i}><Prose text={b} /></p> : <Code key={i} source={b.code} />))}</>
}

/** The chart that goes with a question: one or more lines over steps. */
export function LineChart({ chart }: { chart: ChartSpec }) {
  const value = (v: number) => (chart.log ? Math.log10(v) : v)
  const all = chart.series.flatMap(s => s.points.map(value))
  const n = Math.max(...chart.series.map(s => s.points.length))
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo || 1) * 0.08
  return (
    <figure className="chart">
      {chart.title && <figcaption>{chart.title}</figcaption>}
      <Plot x={[0, n - 1]} y={[lo - pad, hi + pad]} height={220} xLabel={chart.x} yLabel={chart.y && (chart.log ? `${chart.y} (log₁₀)` : chart.y)}>
        {s => chart.series.map((line, i) => <Path key={line.name} s={s} pts={line.points.map((v, k) => [k, value(v)])} color={line.color ?? (['accent', 'blue', 'good', 'bad'] as const)[i % 4]} />)}
      </Plot>
      <div className="legend">
        {chart.series.map((line, i) => (
          <span key={line.name} className={'key-' + (line.color ?? ['accent', 'blue', 'good', 'bad'][i % 4])}>{line.name}</span>
        ))}
      </div>
    </figure>
  )
}
