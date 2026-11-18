import { useState, type ComponentType } from 'react'
import { Curve, Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const cumsum = (r: number[]) => r.reduce<number[]>((a, x) => [...a, (a[a.length - 1] ?? 0) + x], [])
const mean = (r: number[]) => (r.length ? r.reduce((a, b) => a + b, 0) / r.length : NaN)
const sd = (r: number[]) => {
  const m = mean(r)
  return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length)
}
const sharpe = (r: number[]) => (mean(r) / sd(r)) * Math.sqrt(252)
const pct = (v: number) => `${fmt(100 * v, 1)}%`

/** Errors compound over the steps of a task; checks that catch an error and retry it once lift every step. */
function Steps() {
  const [p, setP] = useState(0.95)
  const [n, setN] = useState(20)
  const [c, setC] = useState(0)
  const pe = p + (1 - p) * c * p
  return (
    <div className="widget">
      <Plot x={[1, 50]} y={[0, 1]} xLabel="steps in the task" yLabel="chance the task succeeds">
        {s => (
          <>
            <Curve s={s} f={k => p ** k} color="bad" width={2} />
            <Curve s={s} f={k => pe ** k} color="good" width={2} dash={c ? undefined : '5 5'} />
            <Seg s={s} a={[n, 0]} b={[n, 1]} color="muted" dash="4 4" />
            <Dot s={s} x={n} y={p ** n} color="bad" />
            <Dot s={s} x={n} y={pe ** n} color="good" />
          </>
        )}
      </Plot>
      <Slider label="reliability of one step" value={p} min={0.8} max={0.995} step={0.005} onChange={setP} />
      <Slider label="steps in the task" value={n} min={1} max={50} step={1} onChange={setN} />
      <Slider label="share of errors caught and retried" value={c} min={0} max={1} step={0.05} onChange={setC} />
      <Readout
        items={[
          ['no checks', pct(p ** n), 'bad'],
          ['step with checks', fmt(pe, 3)],
          ['with checks', pct(pe ** n), 'good'],
          ['retries per task', fmt(n * (1 - p) * c, 1)],
        ]}
      />
      <p className="caption">
        Red is the chance a task of n steps goes right when each step is right with the chosen reliability; green is the same with checks that catch a share of the errors
        and retry the step once. Set 0.95 and 20 steps, then raise the share caught. Validation code around the model moves the result more than a few points of model
        accuracy.
      </p>
    </div>
  )
}

const LN = 800
const LR: number[] = (() => {
  const g = gaussian(seeded(73))
  return Array.from({ length: LN }, () => g())
})()
const LE: number[] = (() => {
  const g = gaussian(seeded(88))
  return Array.from({ length: LN }, () => g())
})()

/** A backtest of a model's news scores, where the scores carry the future up to the model's training cutoff. */
function Lookahead() {
  const [leak, setLeak] = useState(0.3)
  const [cut, setCut] = useState(300)
  const pnl = LR.map((r, t) => {
    const k = t < cut ? leak : 0
    return Math.sign(k * r + Math.sqrt(1 - k * k) * LE[t]) * r
  })
  const eq = [0, ...cumsum(pnl)]
  const lo = Math.min(...eq) - 5
  const hi = Math.max(...eq) + 5
  const before = sharpe(pnl.slice(0, cut))
  const after = sharpe(pnl.slice(cut))
  return (
    <div className="widget">
      <Plot x={[0, LN]} y={[lo, hi]} xLabel="day" yLabel="cumulative P&L, %">
        {s => (
          <>
            <rect x={s.x(0)} width={s.w(cut)} y={s.y(hi)} height={s.h(hi - lo)} fill="var(--amber)" opacity={0.1} />
            <Seg s={s} a={[cut, lo]} b={[cut, hi]} color="amber" width={2} />
            <Path s={s} pts={eq.map((v, i) => [i, v] as Pt)} color="accent" width={1.8} />
          </>
        )}
      </Plot>
      <Slider label="leak: how much the scores know of the next day" value={leak} min={0} max={0.6} step={0.05} onChange={setLeak} />
      <Slider label="model's training cutoff (day)" value={cut} min={100} max={700} step={50} onChange={setCut} />
      <Readout
        items={[
          ['Sharpe before cutoff', fmt(before, 1), before > 0 ? 'good' : 'bad'],
          ['Sharpe after cutoff', fmt(after, 1), after > 0 ? 'good' : 'bad'],
          ['days after cutoff', LN - cut],
        ]}
      />
      <p className="caption">
        A made-up long-short backtest on a model's headline scores. In the shaded days the model's training text covers what happened next, so the scores carry a share of
        tomorrow's return; after the cutoff they carry nothing. Move the cutoff: the strong part follows it. Only the days after the cutoff test the model, and there are few.
      </p>
    </div>
  )
}

const comb = (n: number, k: number) => {
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
  return c
}
/** Chance that a majority of n independent voters, each right with probability p, is right (n odd). */
const majority = (p: number, n: number) => {
  let s = 0
  for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += comb(n, k) * p ** k * (1 - p) ** (n - k)
  return s
}
const ODD = Array.from({ length: 11 }, (_, i) => 2 * i + 1)

/** Majority voting among agents whose errors are correlated: with probability ρ they all copy one shared vote. */
function Debate() {
  const [n, setN] = useState(9)
  const [p, setP] = useState(0.6)
  const [rho, setRho] = useState(0)
  const acc = (m: number) => rho * p + (1 - rho) * majority(p, m)
  return (
    <div className="widget">
      <Plot x={[1, 21]} y={[0.4, 1]} xLabel="number of agents voting" yLabel="chance the majority is right">
        {s => (
          <>
            <Seg s={s} a={[1, p]} b={[21, p]} color="muted" dash="4 4" />
            <Path s={s} pts={ODD.map(m => [m, majority(p, m)] as Pt)} color="blue" width={1.5} dash="5 4" />
            <Path s={s} pts={ODD.map(m => [m, acc(m)] as Pt)} color="accent" width={2} />
            {ODD.map(m => <Dot key={m} s={s} x={m} y={acc(m)} r={m === n ? 5.5 : 2.5} color="accent" />)}
          </>
        )}
      </Plot>
      <Slider label="agents (odd)" value={n} min={1} max={21} step={2} onChange={setN} />
      <Slider label="accuracy of one agent" value={p} min={0.5} max={0.8} step={0.01} onChange={setP} />
      <Slider label="correlation of their errors (ρ)" value={rho} min={0} max={1} step={0.05} onChange={setRho} />
      <Readout
        items={[
          ['one agent', pct(p)],
          ['majority', pct(acc(n)), 'accent'],
          ['if independent', pct(majority(p, n)), 'blue'],
          ['model calls', n],
        ]}
      />
      <p className="caption">
        Yellow is the accuracy of a majority vote; dashed blue is what it would be if the agents erred independently, and the grey line is one agent alone. Set 9 agents at
        60% and raise the correlation. Copies of one model reading the same data sit near the right end of the slider: more calls, little more accuracy.
      </p>
    </div>
  )
}

const RN = 250
const RUNS = 8
const RR: number[] = (() => {
  const g = gaussian(seeded(91))
  return Array.from({ length: RN }, () => g())
})()
/** The logged decisions of the first run: -1 sell, 0 hold, +1 buy, made up and with no edge. */
const BASE: number[] = (() => {
  const u = seeded(92)
  return Array.from({ length: RN }, () => Math.floor(u() * 3) - 1)
})()
/** For every other run and day: a uniform to decide whether the reply differs, and one to pick the other decision. */
const FLIP: number[][][] = Array.from({ length: RUNS }, (_, k) => {
  const u = seeded(200 + k)
  return Array.from({ length: RN }, () => [u(), u()])
})

/** The same agent on the same data, run several times with fresh replies or replayed from the log. */
function Runs() {
  const [q, setQ] = useState(0.1)
  const [replay, setReplay] = useState(false)
  const decisions = FLIP.map((run, k) =>
    BASE.map((d, t) => {
      if (replay || k === 0 || run[t][0] >= q) return d
      const others = [-1, 0, 1].filter(v => v !== d)
      return others[run[t][1] < 0.5 ? 0 : 1]
    }),
  )
  const curves = decisions.map(ds => [0, ...cumsum(ds.map((d, t) => d * RR[t]))])
  const finals = curves.map(c => c[c.length - 1])
  const all = curves.flat()
  const differ = mean(decisions.slice(1).map(ds => ds.filter((d, t) => d !== BASE[t]).length / RN))
  return (
    <div className="widget">
      <div className="seg">
        <button className={!replay ? 'on' : ''} onClick={() => setReplay(false)}>Fresh replies</button>
        <button className={replay ? 'on' : ''} onClick={() => setReplay(true)}>Replay from log</button>
      </div>
      <Plot x={[0, RN]} y={[Math.min(...all) - 3, Math.max(...all) + 3]} xLabel="day" yLabel="cumulative P&L, %">
        {s => (
          <>
            {curves.slice(1).map((c, k) => <Path key={k} s={s} pts={c.map((v, i) => [i, v] as Pt)} color="muted" width={1.2} opacity={0.75} />)}
            <Path s={s} pts={curves[0].map((v, i) => [i, v] as Pt)} color="accent" width={2} />
          </>
        )}
      </Plot>
      <Slider label="chance a decision differs between runs" value={q} min={0} max={0.5} step={0.05} onChange={setQ} />
      <Readout
        items={[
          ['runs', RUNS],
          ['decisions changed', pct(differ)],
          ['final P&L, lowest', `${fmt(Math.min(...finals), 1)}%`, 'bad'],
          ['final P&L, highest', `${fmt(Math.max(...finals), 1)}%`, 'good'],
        ]}
      />
      <p className="caption">
        Eight runs of one made-up agent over the same 250 days; yellow is the run whose replies were logged. With fresh replies each run changes a share of its decisions,
        and the runs end apart on identical data. Press <b>Replay from log</b>: every run reads the stored replies and they coincide. Report the spread of fresh runs; use
        the replay to debug one.
      </p>
    </div>
  )
}

export const agenticWidgets: Record<string, ComponentType> = {
  'agentic-steps': Steps,
  'agentic-lookahead': Lookahead,
  'agentic-debate': Debate,
  'agentic-runs': Runs,
}
