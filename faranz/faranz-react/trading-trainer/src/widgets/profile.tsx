import { useMemo, useState, type ComponentType } from 'react'
import { Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded, type Scale } from '../components/Plot'

interface Bar { t: number; o: number; h: number; l: number; c: number; v: number }

/** Made-up 5-minute bars from a seed: the same on every visit. */
function makeBars(seed: number, drift: (i: number, p: number) => number, step = 0.12): Bar[] {
  const rnd = seeded(seed)
  const g = gaussian(rnd)
  const out: Bar[] = []
  let p = 450
  for (let i = 0; i < 78; i++) {
    const o = p
    const c = o + drift(i, o) + g() * step
    const h = Math.max(o, c) + Math.abs(g()) * step * 0.6
    const l = Math.min(o, c) - Math.abs(g()) * step * 0.6
    const u = 1 + 2.5 * Math.exp(-i / 8) + 1.5 * Math.exp(-(77 - i) / 6)
    out.push({ t: i * 5, o, h, l, c, v: Math.round(u * 10000 * (0.6 + 0.8 * rnd())) })
    p = c
  }
  return out
}

/** Volume by price: each bar's volume spread evenly over the rows from its low to its high. */
export function profileOf(bars: Bar[], size: number) {
  const lo = Math.round(Math.min(...bars.map(b => b.l)) / size)
  const hi = Math.round(Math.max(...bars.map(b => b.h)) / size)
  const vols = Array.from({ length: hi - lo + 1 }, () => 0)
  for (const b of bars) {
    const a = Math.round(b.l / size)
    const z = Math.round(b.h / size)
    for (let k = a; k <= z; k++) vols[k - lo] += b.v / (z - a + 1)
  }
  return { price: (i: number) => (lo + i) * size, vols }
}

/** The row with the most volume; ties go to the row nearer the middle, then the lower one. */
export function pocOf(vols: number[]): number {
  const best = Math.max(...vols)
  const n = vols.length
  let pick = -1
  vols.forEach((v, i) => {
    if (v === best && (pick < 0 || Math.abs(2 * i - n + 1) < Math.abs(2 * pick - n + 1))) pick = i
  })
  return pick
}

/** Grow from the POC, `step` rows at a time, adding the bigger side (tie: above), until `pct` of the volume is inside. */
export function valueArea(vols: number[], pct: number, step: number): [number, number, number] {
  const total = vols.reduce((a, b) => a + b, 0)
  let lo = pocOf(vols)
  let hi = lo
  let taken = vols[lo]
  const sum = (a: number, b: number) => vols.slice(a, b).reduce((x, y) => x + y, 0)
  while (taken < pct * total) {
    const up = hi + 1 < vols.length ? sum(hi + 1, hi + 1 + step) : -1
    const down = lo > 0 ? sum(Math.max(0, lo - step), lo) : -1
    if (up >= down) [hi, taken] = [Math.min(hi + step, vols.length - 1), taken + up]
    else [lo, taken] = [Math.max(lo - step, 0), taken + down]
  }
  return [lo, hi, taken / total]
}

const span = (bars: Bar[], pad = 0.08): [number, number] => {
  const lo = Math.min(...bars.map(b => b.l))
  const hi = Math.max(...bars.map(b => b.h))
  return [lo - (hi - lo) * pad, hi + (hi - lo) * pad]
}
const clock = (min: number) => `${Math.floor((570 + min) / 60)}:${String((570 + min) % 60).padStart(2, '0')}`

function Candles({ s, bars }: { s: Scale; bars: Bar[] }) {
  return (
    <>
      {bars.map(b => {
        const x = s.x(b.t + 2.5)
        const col = b.c >= b.o ? 'var(--good)' : 'var(--bad)'
        return (
          <g key={b.t}>
            <line x1={x} x2={x} y1={s.y(b.h)} y2={s.y(b.l)} stroke={col} strokeWidth={1} />
            <rect x={x - s.w(1.7)} width={s.w(3.4)} y={s.y(Math.max(b.o, b.c))} height={Math.max(1, s.h(Math.abs(b.c - b.o)))} fill={col} />
          </g>
        )
      })}
    </>
  )
}

/** Sideways bars from x = 400 to 520, one per row. */
function Sideways({ s, vols, price, size, max, color }: { s: Scale; vols: number[]; price: (i: number) => number; size: number; max: number; color: (i: number) => string }) {
  return <>{vols.map((v, i) => <rect key={i} x={s.x(400)} width={s.w((v / max) * 118)} y={s.y(price(i) + size / 2)} height={Math.max(0.5, s.h(size) - 0.5)} fill={color(i)} />)}</>
}

const DAY = makeBars(7, (i, p) => (i < 12 ? -0.06 : i >= 30 && i < 40 ? 0.15 : 0.08 * ((i < 30 ? 449.4 : 451.2) - p)))

/** A day of candles with its volume profile building beside it as time passes. */
function Build() {
  const [at, setAt] = useState(18)
  const [size, setSize] = useState(0.1)
  const shown = DAY.slice(0, at + 1)
  const prof = profileOf(shown, size)
  const full = useMemo(() => Math.max(...profileOf(DAY, size).vols), [size])
  const poc = pocOf(prof.vols)
  const maxV = Math.max(...DAY.map(b => b.v))
  return (
    <div className="widget">
      <div className="seg">{[0.05, 0.1, 0.25].map(r => <button key={r} className={r === size ? 'on' : ''} onClick={() => setSize(r)}>{fmt(r)} rows</button>)}</div>
      <Plot x={[0, 520]} y={span(DAY)} xLabel="minutes after 9:30, then volume at price" yLabel="price">
        {s => (
          <>
            <Candles s={s} bars={shown} />
            <Sideways s={s} vols={prof.vols} price={prof.price} size={size} max={full} color={i => (i === poc ? 'var(--amber)' : 'var(--blue)')} />
            <Seg s={s} a={[0, prof.price(poc)]} b={[520, prof.price(poc)]} color="amber" dash="4 4" width={1} />
          </>
        )}
      </Plot>
      <Plot x={[0, 520]} y={[0, maxV]} height={70} bare>
        {s => shown.map(b => <rect key={b.t} x={s.x(b.t + 0.5)} width={s.w(4)} y={s.y(b.v)} height={s.h(b.v)} fill="var(--muted)" />)}
      </Plot>
      <Slider label="time" value={at} min={0} max={77} step={1} onChange={setAt} show={v => clock(v * 5 + 5)} />
      <Readout
        items={[
          ['volume so far', shown.reduce((a, b) => a + b.v, 0).toLocaleString('en-US')],
          ['point of control', fmt(prof.price(poc)), 'amber'],
          ['rows', prof.vols.length],
        ]}
      />
      <p className="caption">
        The bars under the chart say when volume traded; the sideways bars say at what price. Drag the time from the morning to the close and watch the point of control (amber): it
        sits in the heavy morning area, then jumps when the afternoon area overtakes it. Change the row size: the same shares, a smoother or a more jagged shape.
      </p>
    </div>
  )
}

const BAL = makeBars(23, (i, p) => 0.05 * (450.6 - p) + (i > 50 && i < 58 ? 0.06 : 0), 0.14)
const BAL_P = profileOf(BAL, 0.1)

/** A profile with its value area, for a percentage and a method you choose. */
function Value() {
  const [pct, setPct] = useState(0.7)
  const [step, setStep] = useState(1)
  const { vols, price } = BAL_P
  const poc = pocOf(vols)
  const [lo, hi, share] = valueArea(vols, pct, step)
  const [olo, ohi] = valueArea(vols, pct, 3 - step)
  const max = Math.max(...vols)
  return (
    <div className="widget">
      <div className="seg">{[1, 2].map(k => <button key={k} className={k === step ? 'on' : ''} onClick={() => setStep(k)}>{k === 1 ? 'one row at a time' : 'two rows at a time'}</button>)}</div>
      <Plot x={[0, max * 1.05]} y={[price(0) - 0.1, price(vols.length - 1) + 0.1]} xLabel="volume" yLabel="price">
        {s => (
          <>
            {vols.map((v, i) => (
              <rect key={i} x={s.x(0)} width={s.w(v)} y={s.y(price(i) + 0.05)} height={s.h(0.1) - 0.6} fill={i === poc ? 'var(--amber)' : i >= lo && i <= hi ? 'var(--accent)' : 'var(--muted)'} opacity={i >= lo && i <= hi ? 1 : 0.5} />
            ))}
            <Seg s={s} a={[0, price(hi) + 0.05]} b={[max * 1.05, price(hi) + 0.05]} color="blue" dash="5 4" />
            <Seg s={s} a={[0, price(lo) - 0.05]} b={[max * 1.05, price(lo) - 0.05]} color="blue" dash="5 4" />
          </>
        )}
      </Plot>
      <Slider label="value area %" value={pct} min={0.5} max={0.95} step={0.05} onChange={setPct} show={v => `${Math.round(v * 100)}%`} />
      <Readout
        items={[
          ['POC', fmt(price(poc)), 'amber'],
          ['VAL to VAH', `${fmt(price(lo))} to ${fmt(price(hi))}`, 'accent'],
          ['share inside', `${fmt(share * 100, 1)}%`],
          ['other method', `${fmt(price(olo))} to ${fmt(price(ohi))}`],
        ]}
      />
      <p className="caption">
        Amber is the point of control, the shaded rows the value area. Move the percentage and switch between one and two rows at a time: the POC never moves, but the edges do, and
        the two methods can disagree by a row or more on the same day. That is why a value area edge is a zone, and why you should know which method your platform uses.
      </p>
    </div>
  )
}

const TWO = makeBars(41, (i, p) => (i >= 30 && i < 36 ? 0.45 : 0.12 * ((i < 30 ? 449.2 : 452.0) - p)), 0.1)

/** A double distribution day: the price path, its profile, and the nodes a window of k rows finds. */
function Nodes() {
  const [k, setK] = useState(2)
  const [smooth, setSmooth] = useState(false)
  const raw = useMemo(() => profileOf(TWO, 0.1), [])
  const vols = smooth ? raw.vols.map((_, i) => raw.vols.slice(Math.max(0, i - 1), i + 2).reduce((a, b) => a + b, 0) / raw.vols.slice(Math.max(0, i - 1), i + 2).length) : raw.vols
  const hvn: number[] = []
  const lvn: number[] = []
  for (let i = k; i < vols.length - k; i++) {
    const around = [...vols.slice(i - k, i), ...vols.slice(i + 1, i + k + 1)]
    if (vols[i] > Math.max(...around)) hvn.push(i)
    if (vols[i] < Math.min(...around)) lvn.push(i)
  }
  const deep = lvn.length ? lvn.reduce((a, b) => (vols[b] < vols[a] ? b : a)) : -1
  const poc = pocOf(vols)
  const minutes = (p: number) => TWO.filter(b => b.l <= p + 0.1 && b.h >= p - 0.1).length * 5
  const color = (i: number) => (hvn.includes(i) ? 'var(--good)' : lvn.includes(i) ? 'var(--bad)' : 'var(--muted)')
  return (
    <div className="widget">
      <div className="seg">{[false, true].map(m => <button key={String(m)} className={m === smooth ? 'on' : ''} onClick={() => setSmooth(m)}>{m ? '3-row average' : 'raw rows'}</button>)}</div>
      <Plot x={[0, 520]} y={span(TWO)} xLabel="minutes after 9:30, then volume at price" yLabel="price">
        {s => (
          <>
            <Path s={s} pts={TWO.map(b => [b.t + 2.5, b.c])} color="text" width={1.5} />
            <Sideways s={s} vols={vols} price={raw.price} size={0.1} max={Math.max(...vols)} color={color} />
          </>
        )}
      </Plot>
      <Slider label="window k" value={k} min={1} max={6} step={1} onChange={setK} />
      <Readout
        items={[
          ['HVNs', hvn.length, 'good'],
          ['LVNs', lvn.length, 'bad'],
          ['minutes near POC', poc >= 0 ? minutes(raw.price(poc)) : '–'],
          ['minutes near deepest LVN', deep >= 0 ? minutes(raw.price(deep)) : '–'],
        ]}
      />
      <p className="caption">
        Green rows are high volume nodes, red rows low volume nodes, found by the window rule. Raise k and the small wiggles drop out; smooth the rows and fewer false valleys appear.
        Compare the minutes price spent near the POC with the minutes near the deepest LVN: thin rows are thin because price passed them quickly that day.
      </p>
    </div>
  )
}

const P_DAY: [number, number][] = [[3, 9], [7, 13], [11, 18], [16, 22], [18, 23], [19, 24], [18, 22], [19, 23], [20, 24], [19, 23], [18, 22], [19, 23], [20, 23]]
const DAYS: Record<string, [number, number][]> = {
  normal: [[12, 22], [13, 21], [14, 19], [15, 20], [13, 18], [16, 21], [15, 19], [14, 18], [16, 20], [15, 19], [14, 23], [16, 20], [17, 19]],
  trend: [[2, 6], [4, 8], [7, 11], [10, 14], [12, 15], [14, 18], [16, 19], [17, 21], [19, 23], [21, 24], [22, 26], [24, 27], [25, 28]],
  'double dist.': [[3, 8], [4, 9], [3, 7], [5, 9], [6, 10], [9, 20], [18, 24], [19, 25], [20, 24], [19, 23], [20, 25], [21, 24], [20, 23]],
  neutral: [[12, 18], [13, 19], [14, 22], [16, 21], [14, 18], [9, 15], [10, 14], [12, 17], [13, 18], [14, 19], [13, 17], [14, 18], [14, 17]],
  'P shape': P_DAY,
  'b shape': P_DAY.map(([l, h]) => [27 - h, 27 - l]),
}
const LETTERS = 'ABCDEFGHIJKLM'
const row = (r: number) => 448 + r * 0.1

/** A TPO chart that fills in by half hour, for a choice of day types. */
function Tpo() {
  const [day, setDay] = useState('normal')
  const [n, setN] = useState(13)
  const periods = DAYS[day].slice(0, n)
  const rows: Record<number, string> = {}
  periods.forEach(([l, h], i) => { for (let r = l; r <= h; r++) rows[r] = (rows[r] ?? '') + LETTERS[i] })
  const keys = Object.keys(rows).map(Number).sort((a, b) => a - b)
  const counts = keys.map(r => rows[r].length)
  const poc = keys[pocOf(counts)]
  const ib = periods.slice(0, 2)
  const [ibLo, ibHi] = [Math.min(...ib.map(p => p[0])), Math.max(...ib.map(p => p[1]))]
  const [lo, hi] = [keys[0], keys[keys.length - 1]]
  const singles = n > 2 ? keys.filter(r => rows[r].length === 1).length : 0
  return (
    <div className="widget">
      <div className="seg">{Object.keys(DAYS).map(d => <button key={d} className={d === day ? 'on' : ''} onClick={() => setDay(d)}>{d}</button>)}</div>
      <Plot x={[0, 14]} y={[447.75, 450.95]} height={330} xLabel="letters, pushed to the left" yLabel="price">
        {s => (
          <>
            {keys.map(r => [...rows[r]].map((ch, j) => (
              <text key={r + ch} x={s.x(j + 0.5)} y={s.y(row(r)) + 3} fontSize={8} textAnchor="middle" fill={r === poc ? 'var(--amber)' : rows[r].length === 1 && n > 2 ? 'var(--bad)' : ch <= 'B' ? 'var(--blue)' : 'var(--text)'}>{ch}</text>
            )))}
            <Seg s={s} a={[13.6, row(ibLo)]} b={[13.6, row(ibHi)]} color="blue" width={3} />
          </>
        )}
      </Plot>
      <Slider label="half hours" value={n} min={1} max={13} step={1} onChange={setN} show={v => `A to ${LETTERS[v - 1]} (${clock(v * 30)})`} />
      <Readout
        items={[
          ['initial balance', `${fmt(row(ibLo))} to ${fmt(row(ibHi))}`, 'blue'],
          ['range ÷ IB', fmt((hi - lo) / (ibHi - ibLo), 1)],
          ['TPO POC', fmt(row(poc)), 'amber'],
          ['single-print rows', singles, 'bad'],
        ]}
      />
      <p className="caption">
        Each letter is a half hour that traded at that price; the blue bar on the right is the initial balance (A and B). Pick a day type and step through the half hours. Watch when
        the label becomes clear: a trend day only looks like one after several periods, and single prints (red) mark the fast moves. The shapes are descriptions, not forecasts.
      </p>
    </div>
  )
}

export const profileWidgets: Record<string, ComponentType> = {
  'profile-build': Build,
  'profile-value': Value,
  'profile-nodes': Nodes,
  'profile-tpo': Tpo,
}
