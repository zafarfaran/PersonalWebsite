import { useRef, type PointerEvent, type ReactNode } from 'react'

/** Maps data to the drawing, and back. */
export interface Scale {
  x: (v: number) => number
  y: (v: number) => number
  /** Length of a data distance along x, in drawing units. */
  w: (v: number) => number
  h: (v: number) => number
  x0: number
  x1: number
  y0: number
  y1: number
}

export const COLOR = {
  accent: 'var(--accent)',
  good: 'var(--good)',
  bad: 'var(--bad)',
  blue: 'var(--blue)',
  muted: 'var(--muted)',
  text: 'var(--text)',
  amber: 'var(--amber)',
  purple: 'var(--purple)',
} as const
export type Color = keyof typeof COLOR

const M = { l: 40, r: 12, t: 12, b: 30 }

/** Round tick positions that cover a range. */
export function ticks(lo: number, hi: number, about = 6): number[] {
  const raw = (hi - lo) / about
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10))
  return out
}

const short = (v: number) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${+v.toFixed(2)}`)

interface PlotProps {
  x: [number, number]
  y: [number, number]
  width?: number
  height?: number
  xLabel?: string
  yLabel?: string
  /** Hide the tick labels and grid: for figures where the numbers do not matter. */
  bare?: boolean
  /** Called with the data coordinates under the pointer while a button or finger is down. */
  onDrag?: (x: number, y: number, phase: 'down' | 'move' | 'up') => void
  children: (s: Scale) => ReactNode
}

/** A chart frame: axes, grid and a scale handed to whatever is drawn inside. */
export function Plot({ x, y, width = 440, height = 300, xLabel, yLabel, bare, onDrag, children }: PlotProps) {
  const ref = useRef<SVGSVGElement>(null)
  const down = useRef(false)
  const iw = width - M.l - M.r
  const ih = height - M.t - M.b
  const s: Scale = {
    x: v => M.l + ((v - x[0]) / (x[1] - x[0])) * iw,
    y: v => M.t + ih - ((v - y[0]) / (y[1] - y[0])) * ih,
    w: v => (v / (x[1] - x[0])) * iw,
    h: v => (v / (y[1] - y[0])) * ih,
    x0: x[0],
    x1: x[1],
    y0: y[0],
    y1: y[1],
  }
  const at = (e: PointerEvent): [number, number] => {
    const box = ref.current!.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * width
    const py = ((e.clientY - box.top) / box.height) * height
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
    return [clamp(x[0] + ((px - M.l) / iw) * (x[1] - x[0]), x[0], x[1]), clamp(y[0] + ((M.t + ih - py) / ih) * (y[1] - y[0]), y[0], y[1])]
  }
  const drag = onDrag && {
    onPointerDown: (e: PointerEvent) => {
      down.current = true
      ref.current!.setPointerCapture(e.pointerId)
      onDrag(...at(e), 'down')
    },
    onPointerMove: (e: PointerEvent) => down.current && onDrag(...at(e), 'move'),
    onPointerUp: (e: PointerEvent) => {
      down.current = false
      onDrag(...at(e), 'up')
    },
  }

  return (
    <svg ref={ref} className={'plot' + (onDrag ? ' live' : '')} viewBox={`0 0 ${width} ${height}`} role="img" {...drag}>
      {!bare && ticks(x[0], x[1]).map(v => (
        <g key={'x' + v}>
          <line className="grid" x1={s.x(v)} x2={s.x(v)} y1={M.t} y2={M.t + ih} />
          <text className="tick" x={s.x(v)} y={M.t + ih + 14} textAnchor="middle">{short(v)}</text>
        </g>
      ))}
      {!bare && ticks(y[0], y[1], 5).map(v => (
        <g key={'y' + v}>
          <line className="grid" x1={M.l} x2={M.l + iw} y1={s.y(v)} y2={s.y(v)} />
          <text className="tick" x={M.l - 6} y={s.y(v) + 3.5} textAnchor="end">{short(v)}</text>
        </g>
      ))}
      {x[0] < 0 && x[1] > 0 && <line className="axis" x1={s.x(0)} x2={s.x(0)} y1={M.t} y2={M.t + ih} />}
      {y[0] < 0 && y[1] > 0 && <line className="axis" x1={M.l} x2={M.l + iw} y1={s.y(0)} y2={s.y(0)} />}
      <rect className="frame" x={M.l} y={M.t} width={iw} height={ih} />
      {xLabel && <text className="label" x={M.l + iw / 2} y={height - 3} textAnchor="middle">{xLabel}</text>}
      {yLabel && <text className="label" x={11} y={M.t + ih / 2} textAnchor="middle" transform={`rotate(-90 11 ${M.t + ih / 2})`}>{yLabel}</text>}
      <clipPath id={`clip-${width}-${height}`}><rect x={M.l} y={M.t} width={iw} height={ih} /></clipPath>
      <g clipPath={`url(#clip-${width}-${height})`}>{children(s)}</g>
    </svg>
  )
}

type Pt = [number, number]

/** A line through data points. */
export function Path({ s, pts, color = 'accent', width = 2, dash, opacity }: { s: Scale; pts: Pt[]; color?: Color; width?: number; dash?: string; opacity?: number }) {
  const d = pts.filter(p => Number.isFinite(p[1])).map((p, i) => `${i ? 'L' : 'M'}${s.x(p[0]).toFixed(1)} ${s.y(p[1]).toFixed(1)}`).join('')
  return <path d={d} fill="none" stroke={COLOR[color]} strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinejoin="round" />
}

/** The curve of a function across the plot. */
export function Curve({ s, f, n = 120, from = s.x0, to = s.x1, ...rest }: { s: Scale; f: (x: number) => number; n?: number; from?: number; to?: number; color?: Color; width?: number; dash?: string; opacity?: number }) {
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / n
    return [x, f(x)]
  })
  return <Path s={s} pts={pts} {...rest} />
}

export function Dot({ s, x, y, color = 'accent', r = 4.5, ring, opacity }: { s: Scale; x: number; y: number; color?: Color; r?: number; ring?: boolean; opacity?: number }) {
  return <circle cx={s.x(x)} cy={s.y(y)} r={r} fill={ring ? 'var(--surface)' : COLOR[color]} stroke={COLOR[color]} strokeWidth={ring ? 2 : 0} opacity={opacity} />
}

export function Seg({ s, a, b, color = 'muted', width = 1.5, dash, arrow, opacity }: { s: Scale; a: Pt; b: Pt; color?: Color; width?: number; dash?: string; arrow?: boolean; opacity?: number }) {
  const [x1, y1, x2, y2] = [s.x(a[0]), s.y(a[1]), s.x(b[0]), s.y(b[1])]
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const head = (da: number) => `${x2 - 9 * Math.cos(ang + da)},${y2 - 9 * Math.sin(ang + da)}`
  return (
    <g stroke={COLOR[color]} strokeWidth={width} opacity={opacity} strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dash} />
      {arrow && Math.hypot(x2 - x1, y2 - y1) > 4 && <polygon points={`${x2},${y2} ${head(0.4)} ${head(-0.4)}`} fill={COLOR[color]} stroke="none" />}
    </g>
  )
}

export function Label({ s, x, y, children, color = 'text', dx = 6, dy = -6, anchor = 'start' }: { s: Scale; x: number; y: number; children: ReactNode; color?: Color; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return <text className="mark" x={s.x(x) + dx} y={s.y(y) + dy} fill={COLOR[color]} textAnchor={anchor}>{children}</text>
}

/** A slider with its name and current value. */
export function Slider({ label, value, min, max, step = 0.01, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; show?: (v: number) => string }) {
  return (
    <label className="slider">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
      <b>{show ? show(value) : +value.toFixed(3)}</b>
    </label>
  )
}

/** Numbers that go with a figure. */
export function Readout({ items }: { items: [string, ReactNode, Color?][] }) {
  return (
    <div className="readout">
      {items.map(([name, value, color]) => (
        <div key={name}>
          <span>{name}</span>
          <b style={color ? { color: COLOR[color] } : undefined}>{value}</b>
        </div>
      ))}
    </div>
  )
}

/** The index of the point nearest to (x, y), in drawing distance. */
export function nearest(pts: Pt[], x: number, y: number, xr: number, yr: number): number {
  let best = 0
  let d = Infinity
  pts.forEach((p, i) => {
    const dist = ((p[0] - x) / xr) ** 2 + ((p[1] - y) / yr) ** 2
    if (dist < d) [best, d] = [i, dist]
  })
  return best
}

export const fmt = (v: number, digits = 2) => (Number.isFinite(v) ? v.toFixed(digits) : '–')

/** A random number generator that gives the same numbers every time, so that a figure looks the same on every visit. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** Normally distributed numbers from a seeded generator. */
export const gaussian = (rnd: () => number) => () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd())
