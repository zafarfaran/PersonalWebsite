import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/** Running total of a list, starting at 0: an equity curve in R. */
function cumulative(r: number[]): number[] {
  const out = [0]
  for (const x of r) out.push(out[out.length - 1] + x)
  return out
}

function tradeStats(r: number[]) {
  const gw = r.filter(x => x > 0).reduce((a, b) => a + b, 0)
  const gl = -r.filter(x => x < 0).reduce((a, b) => a + b, 0)
  const eq = cumulative(r)
  let peak = 0
  let at = 0
  let dd = 0
  let from = 0
  let to = 0
  eq.forEach((v, i) => {
    if (v > peak) [peak, at] = [v, i]
    if (peak - v > dd) [dd, from, to] = [peak - v, at, i]
  })
  return { win: r.filter(x => x > 0).length / r.length, exp: (gw - gl) / r.length, pf: gl ? gw / gl : Infinity, dd, from, to, eq }
}

const pct = (v: number, d = 0) => `${fmt(v * 100, d)}%`

/** 40 made-up trades: about 45% winners of 1R to 3R, the rest losers of 1R. */
const TRADES: number[] = (() => {
  const rnd = seeded(7)
  return Array.from({ length: 40 }, () => (rnd() < 0.45 ? Math.round(10 + 20 * rnd()) / 10 : -1))
})()

function shuffled(r: number[], seed: number): number[] {
  const rnd = seeded(seed)
  const a = [...r]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The same trades in a different order: same expectancy, different drawdown. */
function Order() {
  const [mode, setMode] = useState<'traded' | 'shuffled' | 'losses'>('traded')
  const [seed, setSeed] = useState(1)
  const r = mode === 'traded' ? TRADES : mode === 'losses' ? [...TRADES].sort((a, b) => a - b) : shuffled(TRADES, seed)
  const st = tradeStats(r)
  let top = 0
  const peak: Pt[] = st.eq.map((v, i) => [i, (top = Math.max(top, v))])
  const lo = Math.min(...st.eq)
  const hi = Math.max(...st.eq)
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'traded' ? 'on' : ''} onClick={() => setMode('traded')}>As traded</button>
        <button className={mode === 'shuffled' ? 'on' : ''} onClick={() => { setMode('shuffled'); setSeed(seed + 1) }}>Shuffle</button>
        <button className={mode === 'losses' ? 'on' : ''} onClick={() => setMode('losses')}>Losses first</button>
      </div>
      <Plot x={[0, r.length]} y={[Math.floor(lo) - 1, Math.ceil(hi) + 2]} xLabel="trade" yLabel="equity in R">
        {s => (
          <>
            <Path s={s} pts={peak} color="muted" dash="4 4" width={1.5} />
            <Path s={s} pts={st.eq.map((v, i) => [i, v] as Pt)} color="accent" />
            <Seg s={s} a={[st.to, st.eq[st.from]]} b={[st.to, st.eq[st.to]]} color="bad" width={3} />
            <Label s={s} x={st.to} y={st.eq[st.to]} color="bad" dy={16} anchor="middle">−{fmt(st.dd, 1)}R</Label>
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['win rate', pct(st.win)],
          ['expectancy', `${fmt(st.exp)}R`],
          ['profit factor', fmt(st.pf)],
          ['max drawdown', `${fmt(st.dd, 1)}R`, 'bad'],
        ]}
      />
      <p className="caption">
        Forty trades, always the same ones. The dashed line is the running peak and the red bar the deepest fall from it. Press <b>Shuffle</b> a few times, then <b>Losses
        first</b>: win rate, expectancy and profit factor never move, but the drawdown does. Your future trades will not arrive in your backtest's order.
      </p>
    </div>
  )
}

/** 50 strategies that are fair coins: +1R or −1R, 500 trades each. */
const FLIPS: number[][] = Array.from({ length: 50 }, (_, k) => {
  const rnd = seeded(100 + k)
  return Array.from({ length: 500 }, () => (rnd() < 0.5 ? 1 : -1))
})

/** The best of many coin flips looks like an edge. */
function Luck() {
  const [m, setM] = useState(1)
  const [n, setN] = useState(100)
  const curves = FLIPS.slice(0, m).map(f => cumulative(f.slice(0, n)))
  const finals = curves.map(c => c[n])
  const best = finals.indexOf(Math.max(...finals))
  const span = Math.max(3 * Math.sqrt(n), ...curves.flat().map(Math.abs)) + 2
  return (
    <div className="widget">
      <Plot x={[0, n]} y={[-span, span]} xLabel="trade" yLabel="equity in R">
        {s => (
          <>
            {curves.map((c, i) => i !== best && <Path key={i} s={s} pts={c.map((v, t) => [t, v] as Pt)} color="muted" width={1} opacity={0.4} />)}
            <Curve s={s} f={t => 2 * Math.sqrt(t)} color="blue" dash="4 4" width={1.5} />
            <Curve s={s} f={t => -2 * Math.sqrt(t)} color="blue" dash="4 4" width={1.5} />
            <Path s={s} pts={curves[best].map((v, t) => [t, v] as Pt)} color="accent" width={2.5} />
          </>
        )}
      </Plot>
      <Slider label="strategies tried" value={m} min={1} max={50} step={1} onChange={setM} />
      <Slider label="trades each" value={n} min={20} max={500} step={10} onChange={setN} />
      <Readout
        items={[
          ['best final', `${finals[best] > 0 ? '+' : ''}${finals[best]}R`, 'accent'],
          ['best win rate', pct((n + finals[best]) / 2 / n, 1)],
          ['2 SE for one', `50% ± ${fmt(100 / Math.sqrt(n), 1)} pts`, 'blue'],
        ]}
      />
      <p className="caption">
        Every line is a fair coin: no edge at all. The dashed curves are two standard errors for a single strategy. Raise <b>strategies tried</b> and watch the best one, in
        yellow, climb out of the band. Picking the best of many backtests picks the luckiest, and luck does not repeat.
      </p>
    </div>
  )
}

/** 200 made-up trades with a small gross edge: 38% winners of 2R, the rest losers of 1R. */
const GROSS: number[] = (() => {
  const rnd = seeded(18)
  return Array.from({ length: 200 }, () => (rnd() < 0.38 ? 2 : -1))
})()

/** A fixed cost per trade, measured in R, against a small edge. */
function Costs() {
  const [risk, setRisk] = useState(100)
  const [cost, setCost] = useState(5)
  const cr = cost / risk
  const gross = cumulative(GROSS)
  const net = cumulative(GROSS.map(x => x - cr))
  const n = GROSS.length
  const all = [...gross, ...net]
  const netExp = net[n] / n
  return (
    <div className="widget">
      <Plot x={[0, n]} y={[Math.min(...all) - 2, Math.max(...all) + 2]} xLabel="trade" yLabel="equity in R">
        {s => (
          <>
            <Path s={s} pts={gross.map((v, i) => [i, v] as Pt)} color="muted" width={1.5} />
            <Path s={s} pts={net.map((v, i) => [i, v] as Pt)} color={netExp > 0 ? 'good' : 'bad'} width={2.5} />
            <Label s={s} x={n} y={gross[n]} color="muted" anchor="end" dx={-4}>gross</Label>
            <Label s={s} x={n} y={net[n]} color={netExp > 0 ? 'good' : 'bad'} anchor="end" dx={-4} dy={14}>net</Label>
          </>
        )}
      </Plot>
      <Slider label="risk per trade" value={risk} min={25} max={500} step={25} onChange={setRisk} show={v => `$${v}`} />
      <Slider label="cost per trade" value={cost} min={0} max={40} step={1} onChange={setCost} show={v => `$${v}`} />
      <Readout
        items={[
          ['cost in R', fmt(cr, 3)],
          ['gross expectancy', `${fmt(gross[n] / n, 3)}R`],
          ['net expectancy', `${fmt(netExp, 3)}R`, netExp > 0 ? 'good' : 'bad'],
          ['net total', `${fmt(net[n], 1)}R`],
        ]}
      />
      <p className="caption">
        The same 200 trades before and after costs. Cost in R is the cost per trade divided by the risk per trade, so the same $10 is 0.05R on a $200 risk and 0.2R on a $50
        one. Lower the risk and watch a small edge vanish. Commissions, fees, the spread and slippage all go in this one number.
      </p>
    </div>
  )
}

const BARS = 600
const CUT = 400
const LENGTHS = Array.from({ length: 59 }, (_, i) => i + 2)

/** In-sample and out-of-sample return, in %, of "long when above the moving average" for every length, on a random walk. */
function sweep(seed: number): { is: number[]; oos: number[] } {
  const g = gaussian(seeded(seed))
  const ret = Array.from({ length: BARS }, () => 0.01 * g())
  const logp = cumulative(ret)
  const pre = cumulative(logp)
  const is: number[] = []
  const oos: number[] = []
  for (const L of LENGTHS) {
    let a = 0
    let b = 0
    for (let t = 60; t < BARS; t++) {
      // decide with prices up to the start of bar t, then earn bar t's return
      const sma = (pre[t + 1] - pre[t + 1 - L]) / L
      if (logp[t] <= sma) continue
      if (t < CUT) a += ret[t]
      else b += ret[t]
    }
    is.push(100 * a)
    oos.push(100 * b)
  }
  return { is, oos }
}

/** The best parameter in-sample, on data with no edge, and what it does next. */
function Overfit() {
  const [seed, setSeed] = useState(1)
  const [L, setL] = useState(20)
  const { is, oos } = useMemo(() => sweep(seed), [seed])
  const bi = is.indexOf(Math.max(...is))
  const li = L - 2
  const rank = oos.filter(v => v > oos[bi]).length + 1
  const all = [...is, ...oos]
  return (
    <div className="widget">
      <div className="seg">
        {[1, 2, 3].map(k => <button key={k} className={k === seed ? 'on' : ''} onClick={() => setSeed(k)}>Data set {k}</button>)}
      </div>
      <Plot x={[2, 60]} y={[Math.min(...all) - 2, Math.max(...all) + 2]} xLabel="moving average length" yLabel="return %">
        {s => (
          <>
            <Path s={s} pts={is.map((v, i) => [LENGTHS[i], v] as Pt)} color="accent" />
            <Path s={s} pts={oos.map((v, i) => [LENGTHS[i], v] as Pt)} color="blue" />
            <Dot s={s} x={LENGTHS[bi]} y={is[bi]} color="accent" ring r={6} />
            <Dot s={s} x={LENGTHS[bi]} y={oos[bi]} color="blue" ring r={6} />
            <Dot s={s} x={L} y={is[li]} color="accent" />
            <Dot s={s} x={L} y={oos[li]} color="blue" />
          </>
        )}
      </Plot>
      <Slider label="length" value={L} min={2} max={60} step={1} onChange={setL} />
      <Readout
        items={[
          [`length ${L}: in / out`, `${fmt(is[li], 1)}% / ${fmt(oos[li], 1)}%`],
          [`best in-sample: ${LENGTHS[bi]}`, `${fmt(is[bi], 1)}%`, 'accent'],
          ['its out-of-sample', `${fmt(oos[bi], 1)}%`, 'blue'],
          ['its out-of-sample rank', `${rank} of ${LENGTHS.length}`],
        ]}
      />
      <p className="caption">
        Prices are a random walk: no edge exists. The rule is long when the price is above its moving average. Yellow is the return on the first 400 bars (in-sample),
        blue on the next 200 (out-of-sample). The ringed length won in-sample; see where it ranks out-of-sample, then switch data sets.
      </p>
    </div>
  )
}

export const backtestWidgets: Record<string, ComponentType> = {
  'backtest-order': Order,
  'backtest-luck': Luck,
  'backtest-costs': Costs,
  'backtest-overfit': Overfit,
}
