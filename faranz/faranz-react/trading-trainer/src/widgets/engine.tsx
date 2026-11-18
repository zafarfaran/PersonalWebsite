import { useState, type ComponentType } from 'react'
import { Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/* ---------- Vectorised against event-driven: a moving average rule with and without a stop ---------- */

const PN = 250
const PW = 50
const PRICES: number[] = (() => {
  const g = gaussian(seeded(23))
  const p = [100]
  for (let t = 1; t < PN; t++) p.push(p[t - 1] * (1 + 0.001 + 0.025 * g()))
  return p
})()
const SIG: number[] = PRICES.map((c, t) => {
  if (t < PW - 1) return 0
  const m = PRICES.slice(t - PW + 1, t + 1).reduce((a, b) => a + b, 0) / PW
  return c > m ? 1 : 0
})

function curve(pos: number[]): number[] {
  const eq = [100]
  for (let t = 0; t < PN - 1; t++) eq.push(eq[t] * (1 + pos[t] * (PRICES[t + 1] / PRICES[t] - 1)))
  return eq
}

function stopped(stop: number) {
  const pos: number[] = []
  let held = 0
  let entry = 0
  let armed = true
  let fired = 0
  PRICES.forEach((c, t) => {
    const s = SIG[t]
    if (held === 1) {
      if (stop > 0 && c <= entry * (1 - stop / 100)) {
        held = 0
        armed = false
        fired++
      } else if (s === 0) held = 0
    } else if (s === 1 && armed) {
      held = 1
      entry = c
    }
    if (s === 0) armed = true
    pos.push(held)
  })
  return { pos, fired }
}

function Paths() {
  const [stop, setStop] = useState(0)
  const { pos, fired } = stopped(stop)
  const vec = curve(SIG)
  const evt = curve(pos)
  const first = pos.findIndex((p, t) => p !== SIG[t])
  const all = [...vec, ...evt]
  return (
    <div className="widget">
      <Plot x={[0, PN - 1]} y={[Math.min(...all) - 3, Math.max(...all) + 3]} xLabel="day" yLabel="equity">
        {s => (
          <>
            {first >= 0 && <Seg s={s} a={[first, s.y0]} b={[first, s.y1]} color="amber" dash="3 3" />}
            <Path s={s} pts={vec.map((v, t) => [t, v] as Pt)} color="blue" width={3} />
            <Path s={s} pts={evt.map((v, t) => [t, v] as Pt)} color="accent" dash="5 4" />
          </>
        )}
      </Plot>
      <Slider label="stop loss" value={stop} min={0} max={10} step={0.5} onChange={setStop} show={v => (v === 0 ? 'off' : `${v}%`)} />
      <Readout
        items={[
          ['vectorised', fmt(vec[PN - 1], 1), 'blue'],
          ['event-driven', fmt(evt[PN - 1], 1), 'accent'],
          ['stops fired', fired],
          ['first day that differs', first >= 0 ? first : 'none', first >= 0 ? 'amber' : 'good'],
        ]}
      />
      <p className="caption">
        One made-up stock, long when the close is above its 50-day average. Blue is the vectorised formula, dashed yellow the event-driven loop. With the stop off the two
        lie on top of each other. Give the loop a stop: from the first stop (amber line) the formula no longer describes the strategy, because it cannot remember being stopped out.
      </p>
    </div>
  )
}

/* ---------- The event queue: first in, first out against time order ---------- */

interface Ev { t: number; prio: number; kind: string }

function simulate(timeOrdered: boolean): Ev[] {
  const q: (Ev & { seq: number })[] = []
  let seq = 0
  const push = (e: Ev) => q.push({ ...e, seq: seq++ })
  for (let t = 1; t <= 6; t++) push({ t, prio: 1, kind: 'bar' })
  const earlier = (a: Ev & { seq: number }, b: Ev & { seq: number }) => a.t < b.t || (a.t === b.t && (a.prio < b.prio || (a.prio === b.prio && a.seq < b.seq)))
  const out: Ev[] = []
  while (q.length) {
    let i = 0
    if (timeOrdered) q.forEach((e, k) => { if (earlier(e, q[i])) i = k })
    const [e] = q.splice(i, 1)
    out.push(e)
    if (e.kind === 'bar' && (e.t === 1 || e.t === 4)) push({ t: e.t, prio: 2, kind: 'order' })
    if (e.kind === 'order') push({ t: e.t + 1, prio: 0, kind: 'fill' })
  }
  return out
}
const RUNS = { fifo: simulate(false), time: simulate(true) }

function Queue() {
  const [mode, setMode] = useState<'fifo' | 'time'>('time')
  const [step, setStep] = useState(1)
  const run = RUNS[mode]
  const shown = run.slice(0, step)
  const backAt = (i: number) => i > 0 && shown[i].t < shown[i - 1].t
  const back = shown.filter((_, i) => backAt(i)).length
  const choose = (m: 'fifo' | 'time') => {
    setMode(m)
    setStep(1)
  }
  const last = shown[step - 1]
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'fifo' ? 'on' : ''} onClick={() => choose('fifo')}>First in, first out</button>
        <button className={mode === 'time' ? 'on' : ''} onClick={() => choose('time')}>Time-ordered heap</button>
      </div>
      <Plot x={[0, run.length + 1]} y={[0, 7]} xLabel="order of handling" yLabel="event time" height={220}>
        {s => (
          <>
            <Path s={s} pts={shown.map((e, i) => [i + 1, e.t] as Pt)} color="muted" width={1.5} />
            {shown.map((e, i) => (
              <Dot key={i} s={s} x={i + 1} y={e.t} r={5} color={backAt(i) ? 'bad' : e.kind === 'bar' ? 'blue' : e.kind === 'order' ? 'amber' : 'good'} />
            ))}
          </>
        )}
      </Plot>
      <div className="actions">
        <button className="btn" onClick={() => setStep(Math.min(run.length, step + 1))} disabled={step >= run.length}>Next event</button>
        <button className="btn" onClick={() => setStep(run.length)}>Run to the end</button>
        <button className="btn" onClick={() => setStep(1)}>Reset</button>
      </div>
      <Readout
        items={[
          ['last handled', `${last.kind} at t = ${last.t}`],
          ['events handled', `${step} of ${run.length}`],
          ['clock went backwards', back, back ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        Six bars (blue) are loaded at the start. The bars at t = 1 and t = 4 each create an order (yellow), and each order creates a fill one step later (green). Step through
        both queues. The heap handles each fill before the bar that shares its time. First in, first out handles every bar first; the orders and fills come long after, and each
        time the clock jumps back the dot turns red.
      </p>
    </div>
  )
}

/* ---------- Portfolio and accounting: signed positions, flips and the identity ---------- */

function book(fills: [number, number][]) {
  let cash = 10000
  let pos = 0
  let avg = 0
  let realised = 0
  for (const [q, px] of fills) {
    cash -= q * px
    if (pos === 0 || pos > 0 === q > 0) avg = (avg * pos + px * q) / (pos + q)
    else {
      realised += Math.min(Math.abs(q), Math.abs(pos)) * (px - avg) * Math.sign(pos)
      if (Math.abs(q) > Math.abs(pos)) avg = px
    }
    pos += q
    if (pos === 0) avg = 0
  }
  return { cash, pos, avg, realised }
}

function Ledger() {
  const [fills, setFills] = useState<[number, number][]>([])
  const [mark, setMark] = useState(20)
  const b = book(fills)
  const unreal = b.pos * (mark - b.avg)
  const equity = b.cash + b.pos * mark
  const pnl = (m: number) => b.realised + b.pos * (m - b.avg)
  const lim = Math.max(400, Math.abs(pnl(15)), Math.abs(pnl(25))) * 1.1
  const trade = (q: number) => setFills([...fills, [q, mark]])
  return (
    <div className="widget">
      <Plot x={[15, 25]} y={[-lim, lim]} xLabel="mark price" yLabel="total P&L $" height={230}>
        {s => (
          <>
            <Path s={s} pts={[[15, pnl(15)], [25, pnl(25)]]} color="accent" />
            {b.pos !== 0 && <Dot s={s} x={b.avg} y={b.realised} r={4} color="muted" ring />}
            <Dot s={s} x={mark} y={pnl(mark)} color={pnl(mark) >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="mark price" value={mark} min={15} max={25} step={0.5} onChange={setMark} show={v => `$${v.toFixed(2)}`} />
      <div className="actions">
        <button className="btn" onClick={() => trade(100)}>Buy 100</button>
        <button className="btn" onClick={() => trade(-100)}>Sell 100</button>
        <button className="btn" onClick={() => trade(-300)}>Sell 300</button>
        <button className="btn" onClick={() => setFills([])}>Reset</button>
      </div>
      <Readout
        items={[
          ['position', b.pos],
          ['average price', b.pos ? `$${fmt(b.avg)}` : '–'],
          ['cash', `$${fmt(b.cash, 0)}`],
          ['realised', `$${fmt(b.realised, 0)}`, b.realised >= 0 ? 'good' : 'bad'],
          ['unrealised', `$${fmt(unreal, 0)}`, unreal >= 0 ? 'good' : 'bad'],
          ['equity − start', `$${fmt(equity - 10000, 0)} = $${fmt(b.realised + unreal, 0)}`, 'accent'],
        ]}
      />
      <p className="caption">
        Start with $10,000 and no fees; each button fills at the mark. The line is your total P&L against the mark: flat when you are flat, rising when long, falling when short,
        and the ring sits at your average price. Buy 100, move the mark, then sell 300: the closed 100 move into realised, the average restarts at the fill, and the last line
        always balances.
      </p>
    </div>
  )
}

/* ---------- Simulating fills: when does a resting buy limit really fill? ---------- */

const FN = 60
const BARS = (() => {
  const g = gaussian(seeded(19))
  const out: { o: number; h: number; l: number; c: number }[] = []
  let prev = 50
  for (let t = 0; t < FN; t++) {
    const o = prev + 0.25 * g()
    const c = o + 0.7 * g()
    const h = Math.max(o, c) + Math.abs(0.4 * g())
    const l = Math.min(o, c) - Math.abs(0.4 * g())
    out.push({ o, h, l, c })
    prev = c
  }
  return out
})()

const RULES = [['touched', 0], ['through 5¢', 0.05], ['through 10¢', 0.1]] as const

function fillsFor(offset: number, through: number) {
  const out: { t: number; px: number; lim: number }[] = []
  for (let t = 1; t < FN; t++) {
    const lim = BARS[t - 1].c - offset
    const b = BARS[t]
    if (b.o <= lim) out.push({ t, px: b.o, lim })
    else if (b.l <= lim - through) out.push({ t, px: lim, lim })
  }
  return out
}

function Fills() {
  const [offset, setOffset] = useState(0.5)
  const [rule, setRule] = useState(0)
  const fills = fillsFor(offset, RULES[rule][1])
  const loose = fillsFor(offset, 0)
  const total = fills.reduce((a, f) => a + BARS[f.t].c - f.px, 0)
  const lo = Math.min(...BARS.map(b => b.l)) - 0.3
  const hi = Math.max(...BARS.map(b => b.h)) + 0.3
  return (
    <div className="widget">
      <div className="seg">
        {RULES.map(([name], i) => (
          <button key={name} className={rule === i ? 'on' : ''} onClick={() => setRule(i)}>{name}</button>
        ))}
      </div>
      <Plot x={[0, FN]} y={[lo, hi]} xLabel="day" yLabel="price" height={250}>
        {s => (
          <>
            {BARS.map((b, t) => (
              <g key={t}>
                <line x1={s.x(t + 0.5)} x2={s.x(t + 0.5)} y1={s.y(b.h)} y2={s.y(b.l)} stroke="var(--muted)" />
                <rect x={s.x(t + 0.2)} width={s.w(0.6)} y={s.y(Math.max(b.o, b.c))} height={Math.max(1, s.h(Math.abs(b.c - b.o)))} fill={b.c >= b.o ? 'var(--good)' : 'var(--bad)'} opacity={0.6} />
              </g>
            ))}
            {loose.map(f => <Dot key={'l' + f.t} s={s} x={f.t + 0.5} y={f.px} r={4} color="muted" ring />)}
            {fills.map(f => <Dot key={f.t} s={s} x={f.t + 0.5} y={f.px} r={3} color="accent" />)}
          </>
        )}
      </Plot>
      <Slider label="limit below previous close" value={offset} min={0.1} max={1.4} step={0.1} onChange={setOffset} show={v => `$${v.toFixed(2)}`} />
      <Readout
        items={[
          ['fills', `${fills.length} (touched: ${loose.length})`],
          ['average P&L per fill', `$${fmt(fills.length ? total / fills.length : NaN)}`, total >= 0 ? 'good' : 'bad'],
          ['total per 100 shares', `$${fmt(total * 100, 0)}`, total >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Each day a buy limit rests below the previous close, and any fill is sold at that day's close; prices are made up and there are no costs. Rings mark every day the price
        reached the limit, yellow dots the fills under the chosen rule. Switch from "touched" to "through 10¢": the fills that disappear are days the price only reached your
        level and bounced, the ones you often miss live.
      </p>
    </div>
  )
}

export const engineWidgets: Record<string, ComponentType> = {
  'engine-paths': Paths,
  'engine-queue': Queue,
  'engine-ledger': Ledger,
  'engine-fills': Fills,
}
