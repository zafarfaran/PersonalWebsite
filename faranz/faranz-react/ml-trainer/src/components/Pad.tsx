import { useEffect, useRef, useState, type PointerEvent } from 'react'

/** Where an arrow starts or ends: attached to a box, or a free point. */
export type End = { box: string } | { x: number; y: number }

export type Shape =
  | { id: string; kind: 'pen'; pts: number[]; color: Ink }
  | { id: string; kind: 'box'; x: number; y: number; w: number; h: number; text: string; store?: boolean }
  | { id: string; kind: 'arrow'; a: End; b: End; text: string }
  | { id: string; kind: 'text'; x: number; y: number; text: string }

const INKS = { text: 'var(--text)', accent: 'var(--accent)', good: 'var(--good)', bad: 'var(--bad)', blue: 'var(--blue)' } as const
export type Ink = keyof typeof INKS

type Tool = 'move' | 'pen' | 'box' | 'store' | 'arrow' | 'text' | 'erase'
const TOOLS: [Tool, string, string][] = [
  ['move', 'Move', 'Drag things around. Click one to select it and edit its label.'],
  ['pen', 'Pen', 'Draw freehand.'],
  ['box', 'Box', 'Drag out a box: a service, a model, a step.'],
  ['store', 'Store', 'Drag out a data store: a database, a queue, an index.'],
  ['arrow', 'Arrow', 'Drag from one box to another. The arrow stays attached when the boxes move.'],
  ['text', 'Text', 'Click to place a label.'],
  ['erase', 'Eraser', 'Click or drag over things to remove them.'],
]

const W = 800
type Pt = [number, number]
let counter = 0
const newId = () => `${Date.now().toString(36)}${(counter++).toString(36)}`

const boxOf = (shapes: Shape[], id: string) => shapes.find(s => s.id === id && s.kind === 'box') as Extract<Shape, { kind: 'box' }> | undefined
const centre = (b: { x: number; y: number; w: number; h: number }): Pt => [b.x + b.w / 2, b.y + b.h / 2]

/** The point of an arrow's end: a free point, or the edge of its box on the side facing the other end. */
export function endPoint(shapes: Shape[], end: End, towards: End): Pt | null {
  if (!('box' in end)) return [end.x, end.y]
  const b = boxOf(shapes, end.box)
  if (!b) return null
  const [cx, cy] = centre(b)
  const other = 'box' in towards ? boxOf(shapes, towards.box) : undefined
  const [tx, ty] = 'box' in towards ? (other ? centre(other) : [cx, cy]) : [towards.x, towards.y]
  const [dx, dy] = [tx - cx, ty - cy]
  if (!dx && !dy) return [cx, cy]
  // scale the direction so that it just reaches the edge of the box
  const k = Math.min(dx ? b.w / 2 / Math.abs(dx) : Infinity, dy ? b.h / 2 / Math.abs(dy) : Infinity)
  return [cx + dx * k, cy + dy * k]
}

/** Break a label into lines that fit a width, at spaces. */
export function wrap(text: string, width: number): string[] {
  const max = Math.max(4, Math.floor(width / 7.4))
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      if (line && (line + ' ' + word).length > max) {
        lines.push(line)
        line = word
      } else line = line ? line + ' ' + word : word
    }
    lines.push(line)
  }
  return lines
}

const pathOf = (pts: number[]) => pts.reduce((d, v, i) => d + (i % 2 ? `${v.toFixed(1)}` : `${i ? 'L' : 'M'}${v.toFixed(1)} `), '')

/**
 * A page to draw on: freehand ink, and diagrams made of boxes, data stores,
 * arrows that stay attached, and labels. The page is whatever `shapes` says;
 * every finished change is handed to `onChange`.
 */
export function Pad({ shapes, onChange, height = 440 }: { shapes: Shape[]; onChange: (shapes: Shape[]) => void; height?: number }) {
  const svg = useRef<SVGSVGElement>(null)
  const label = useRef<HTMLInputElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [ink, setInk] = useState<Ink>('text')
  const [selected, setSelected] = useState<string | null>(null)
  const [past, setPast] = useState<Shape[][]>([])
  /** What is being drawn or dragged right now, shown but not yet saved. */
  const [live, setLive] = useState<Shape[] | null>(null)
  const drag = useRef<{ from: Pt; id?: string; start?: Shape[] } | null>(null)
  /** Set when something that takes a label has just been made: its label field gets the cursor. */
  const focus = useRef(false)
  useEffect(() => {
    if (!focus.current || !label.current) return
    focus.current = false
    label.current.focus({ preventScroll: true })
    label.current.select()
  })
  const shown = live ?? shapes
  const current = shown.find(s => s.id === selected)

  const commit = (next: Shape[]) => {
    setPast([...past.slice(-30), shapes])
    onChange(next)
    setLive(null)
  }
  const at = (e: PointerEvent): Pt => {
    const box = svg.current!.getBoundingClientRect()
    return [((e.clientX - box.left) / box.width) * W, ((e.clientY - box.top) / box.height) * height]
  }
  // looked up from the pointer's position: while a drag is captured, the event's own target is the page itself
  const hit = (e: PointerEvent) => document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-id]')?.getAttribute('data-id') ?? undefined
  const boxAt = ([x, y]: Pt, list: Shape[]) => [...list].reverse().find(s => s.kind === 'box' && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h)?.id
  const without = (list: Shape[], id: string) => list.filter(s => s.id !== id && !(s.kind === 'arrow' && (('box' in s.a && s.a.box === id) || ('box' in s.b && s.b.box === id))))

  const down = (e: PointerEvent) => {
    svg.current!.setPointerCapture(e.pointerId)
    const p = at(e)
    const id = hit(e)
    drag.current = { from: p, id, start: shapes }
    if (tool === 'move') setSelected(id ?? null)
    if (tool === 'erase' && id) commit(without(shapes, id))
    if (tool === 'pen') setLive([...shapes, { id: newId(), kind: 'pen', pts: [...p], color: ink }])
    if (tool === 'text') {
      const shape: Shape = { id: newId(), kind: 'text', x: p[0], y: p[1], text: 'Label' }
      commit([...shapes, shape])
      setSelected(shape.id)
      setTool('move')
      focus.current = true
    }
  }

  const move = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const p = at(e)
    const [dx, dy] = [p[0] - d.from[0], p[1] - d.from[1]]
    if (tool === 'pen' && live) {
      const last = live[live.length - 1]
      if (last.kind === 'pen') setLive([...live.slice(0, -1), { ...last, pts: [...last.pts, ...p] }])
    } else if (tool === 'box' || tool === 'store') {
      const shape: Shape = { id: 'new', kind: 'box', x: Math.min(d.from[0], p[0]), y: Math.min(d.from[1], p[1]), w: Math.abs(dx), h: Math.abs(dy), text: '', store: tool === 'store' || undefined }
      setLive([...shapes, shape])
    } else if (tool === 'arrow') {
      const a = boxAt(d.from, shapes)
      setLive([...shapes, { id: 'new', kind: 'arrow', a: a ? { box: a } : { x: d.from[0], y: d.from[1] }, b: { x: p[0], y: p[1] }, text: '' }])
    } else if (tool === 'erase') {
      const id = hit(e)
      if (id) commit(without(shapes, id))
    } else if (tool === 'move' && d.id && d.start) {
      const shift = (end: End): End => ('box' in end ? end : { x: end.x + dx, y: end.y + dy })
      setLive(
        d.start.map(s => {
          if (s.id !== d.id) return s
          if (s.kind === 'pen') return { ...s, pts: s.pts.map((v, i) => v + (i % 2 ? dy : dx)) }
          if (s.kind === 'arrow') return { ...s, a: shift(s.a), b: shift(s.b) }
          return { ...s, x: s.x + dx, y: s.y + dy }
        }),
      )
    }
  }

  const up = (e: PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || !live) return
    const p = at(e)
    const made = live[live.length - 1]
    if (tool === 'move') return commit(live)
    if (tool === 'pen') return made.kind === 'pen' && made.pts.length >= 4 ? commit(live) : setLive(null)
    if (tool === 'box' || tool === 'store') {
      if (made.kind !== 'box' || made.w < 14 || made.h < 14) return setLive(null)
      const shape = { ...made, id: newId() }
      commit([...shapes, shape])
      setSelected(shape.id)
      focus.current = true
    }
    if (tool === 'arrow' && made.kind === 'arrow') {
      const b = boxAt(p, shapes)
      const same = b && 'box' in made.a && made.a.box === b
      if (same || Math.hypot(p[0] - d.from[0], p[1] - d.from[1]) < 12) return setLive(null)
      commit([...shapes, { ...made, id: newId(), b: b ? { box: b } : { x: p[0], y: p[1] } }])
    }
  }

  const remove = () => {
    if (!selected) return
    commit(without(shapes, selected))
    setSelected(null)
  }
  // Delete removes the selected thing, unless you are typing its label
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) remove()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const relabel = (text: string) => onChange(shapes.map(s => (s.id === selected && s.kind !== 'pen' ? { ...s, text } : s)))
  const mark = (id: string) => (id === selected ? ' sel' : '')

  return (
    <div className="pad">
      <div className="padbar">
        <div className="seg">
          {TOOLS.map(([id, name, tip]) => <button key={id} title={tip} className={tool === id ? 'on' : ''} onClick={() => setTool(id)}>{name}</button>)}
        </div>
        {tool === 'pen' && (
          <div className="inks">
            {(Object.keys(INKS) as Ink[]).map(c => <button key={c} aria-label={`${c} ink`} className={c === ink ? 'on' : ''} style={{ background: INKS[c] }} onClick={() => setInk(c)} />)}
          </div>
        )}
        <span className="spacer" />
        <button className="btn" disabled={!past.length} onClick={() => { onChange(past[past.length - 1]); setPast(past.slice(0, -1)); setLive(null) }}>Undo</button>
        <button className="btn" disabled={!shapes.length} onClick={() => { commit([]); setSelected(null) }}>Clear</button>
      </div>
      <div className="padfoot">
        {current && current.kind !== 'pen' ? (
          <>
            <input ref={label} value={current.text} placeholder={current.kind === 'arrow' ? 'Label for the arrow (optional)' : 'Label'} aria-label="Label" onChange={e => relabel(e.target.value)} />
            <button className="btn" onClick={remove}>Delete</button>
          </>
        ) : current ? (
          <button className="btn" onClick={remove}>Delete the selected line</button>
        ) : (
          <span className="note">{TOOLS.find(t => t[0] === tool)![2]}</span>
        )}
      </div>
      <svg ref={svg} className={'page tool-' + tool} viewBox={`0 0 ${W} ${height}`} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--line)" /></pattern>
        </defs>
        <rect width={W} height={height} fill="url(#dots)" />
        {shown.map(s => {
          if (s.kind === 'pen') return <path key={s.id} data-id={s.id} className={'ink' + mark(s.id)} d={pathOf(s.pts)} stroke={INKS[s.color]} />
          if (s.kind === 'text') return <text key={s.id} data-id={s.id} className={'free' + mark(s.id)} x={s.x} y={s.y}>{s.text || 'Label'}</text>
          if (s.kind === 'box') {
            const lines = wrap(s.text, s.w - 12)
            const top = s.y + s.h / 2 - (lines.length - 1) * 8 + 4.5
            return (
              <g key={s.id} data-id={s.id} className={'node' + mark(s.id)}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.store ? Math.min(18, s.h / 2) : 4} />
                {s.store && <path d={`M${s.x + 6} ${s.y + 9}H${s.x + s.w - 6}`} />}
                {lines.map((line, i) => <text key={i} x={s.x + s.w / 2} y={top + i * 16} textAnchor="middle">{line}</text>)}
              </g>
            )
          }
          const a = endPoint(shown, s.a, s.b)
          const b = endPoint(shown, s.b, s.a)
          if (!a || !b) return null
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
          const head = (da: number) => `${b[0] - 11 * Math.cos(ang + da)},${b[1] - 11 * Math.sin(ang + da)}`
          return (
            <g key={s.id} data-id={s.id} className={'link' + mark(s.id)}>
              <line className="grab" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
              <polygon points={`${b[0]},${b[1]} ${head(0.4)} ${head(-0.4)}`} />
              {s.text && <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 6} textAnchor="middle">{s.text}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
