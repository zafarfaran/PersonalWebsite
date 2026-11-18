import { useMemo, useState, type ComponentType } from 'react'
import { Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length
const sd = (r: number[]) => {
  const m = mean(r)
  return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length)
}
const corr = (a: number[], b: number[]) => {
  const ma = mean(a)
  const mb = mean(b)
  let s = 0
  a.forEach((x, i) => (s += (x - ma) * (b[i] - mb)))
  return s / a.length / (sd(a) * sd(b))
}
const draws = (seed: number, n: number) => {
  const g = gaussian(seeded(seed))
  return Array.from({ length: n }, () => g())
}
const diff = (x: number[]) => x.slice(1).map((v, i) => v - x[i])
const cum = (r: number[]) => r.reduce<number[]>((a, x) => [...a, (a[a.length - 1] ?? 0) + x], [])
const line = (v: number[]) => v.map((y, i) => [i, y] as Pt)
const range = (v: number[], pad: number): [number, number] => [Math.min(...v) - pad, Math.max(...v) + pad]

/** Dickey-Fuller t statistic of a series with no constant, as in the lesson. */
function dfT(e: number[]) {
  const x = e.slice(0, -1)
  const dy = diff(e)
  let sxy = 0
  let sxx = 0
  x.forEach((v, i) => {
    sxy += v * dy[i]
    sxx += v * v
  })
  const g = sxy / sxx
  let ss = 0
  x.forEach((v, i) => (ss += (dy[i] - g * v) ** 2))
  return g / Math.sqrt(ss / (dy.length - 1) / sxx)
}

const NN = 250
const NM = draws(3, NN)
const NA = draws(4, NN)
const NB = draws(5, NN)

/** A long and a short leg with different betas: how much market move is left in the book. */
function Neutral() {
  const [bl, setBl] = useState(1.4)
  const [bs, setBs] = useState(0.7)
  const [h, setH] = useState(1)
  const m = NM.map(e => 0.0006 + 0.01 * e)
  const book = m.map((r, t) => bl * r + 0.006 * NA[t] - h * (bs * r + 0.006 * NB[t]))
  const cm = cum(m).map(v => 100 * v)
  const cb = cum(book).map(v => 100 * v)
  return (
    <div className="widget">
      <Plot x={[0, NN]} y={range([...cm, ...cb, 0], 3)} xLabel="day" yLabel="cumulative %">
        {s => (
          <>
            <Path s={s} pts={line(cm)} color="muted" width={1.5} />
            <Path s={s} pts={line(cb)} color="accent" />
          </>
        )}
      </Plot>
      <Slider label="β of the long stock" value={bl} min={0.5} max={2} step={0.1} onChange={setBl} />
      <Slider label="β of the short stock" value={bs} min={0.5} max={2} step={0.1} onChange={setBs} />
      <Slider label="short $ per $1 long" value={h} min={0} max={2.5} step={0.1} onChange={setH} />
      <Readout
        items={[
          ['book β', fmt(bl - h * bs), Math.abs(bl - h * bs) < 0.05 ? 'good' : 'bad'],
          ['correlation with market', fmt(corr(book, m))],
          ['net $ per $1 long', fmt(1 - h)],
          ['gross $ per $1 long', fmt(1 + h)],
        ]}
      />
      <p className="caption">
        Grey is the market, yellow the long-short book, both made up. Set the short dollars to 1.0: the book is dollar neutral but still follows the market when the long leg has the
        higher beta. Find the hedge where book β reads 0, and notice how the gross exposure, and with it the cost and the leverage, grows to get there.
      </p>
    </div>
  )
}

const CN = 250
const CF = draws(7, CN)
const CU = draws(8, CN)
const CV = draws(9, CN)

/** A cointegrated pair against a correlated pair that drifts apart. */
function Coint() {
  const [mode, setMode] = useState<'c' | 'd'>('c')
  const { la, lb } = useMemo(() => {
    const f = cum(CF.map(e => 0.01 * e))
    const la: number[] = []
    const lb: number[] = []
    let u = 0
    f.forEach((fv, t) => {
      u = 0.9 * u + 0.006 * CU[t]
      la.push(mode === 'c' ? fv + u : fv + 0.0015 * t + 0.002 * CU[t])
      lb.push(fv + 0.002 * CV[t])
    })
    return { la, lb }
  }, [mode])
  const pa = la.map(v => 100 * Math.exp(v))
  const pb = lb.map(v => 100 * Math.exp(v))
  const sp = la.map((v, i) => 100 * (v - lb[i]))
  const t = dfT(sp.map(v => v - mean(sp)))
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'c' ? 'on' : ''} onClick={() => setMode('c')}>Cointegrated</button>
        <button className={mode === 'd' ? 'on' : ''} onClick={() => setMode('d')}>Correlated, drifting</button>
      </div>
      <Plot x={[0, CN]} y={range([...pa, ...pb], 2)} height={190} xLabel="day" yLabel="price">
        {s => (
          <>
            <Path s={s} pts={line(pa)} color="accent" width={1.5} />
            <Path s={s} pts={line(pb)} color="blue" width={1.5} />
          </>
        )}
      </Plot>
      <Plot x={[0, CN]} y={[-10, 40]} height={170} xLabel="day" yLabel="spread, %">
        {s => <Path s={s} pts={line(sp)} color="purple" width={1.5} />}
      </Plot>
      <Readout
        items={[
          ['return correlation', fmt(corr(diff(la), diff(lb)))],
          ['Dickey-Fuller t of spread', fmt(t), t < -3.34 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Two made-up stocks (top) and the spread ln A − ln B in percent (bottom). Switch between the two pairs and compare the return correlation with what the spread does. The pair
        trader's question is the bottom panel: does the gap come back? The t statistic is compared with the Engle-Granger 5% value of about −3.34.
      </p>
    </div>
  )
}

const ON = 500
const OE = draws(31, ON)

/** An OU spread sampled daily, with a chosen half-life and a fixed width. */
function Ou() {
  const [hl, setHl] = useState(10)
  const phi = 2 ** (-1 / hl)
  const s: number[] = []
  OE.forEach((e, t) => s.push((t ? phi * s[t - 1] : 0) + Math.sqrt(1 - phi * phi) * e))
  const x = s.slice(0, -1)
  const y = s.slice(1)
  const mx = mean(x)
  const my = mean(y)
  let num = 0
  let den = 0
  x.forEach((v, i) => {
    num += (v - mx) * (y[i] - my)
    den += (v - mx) ** 2
  })
  const fit = num / den
  const crosses = s.filter((v, t) => t > 0 && Math.sign(v) !== Math.sign(s[t - 1])).length
  return (
    <div className="widget">
      <Plot x={[0, ON]} y={[-4, 4]} xLabel="day" yLabel="spread in σ_eq">
        {p => (
          <>
            {[-2, 2].map(v => <Seg key={v} s={p} a={[0, v]} b={[ON, v]} color="muted" dash="4 4" />)}
            <Path s={p} pts={line(s)} color="accent" width={1.3} />
          </>
        )}
      </Plot>
      <Slider label="true half-life, days" value={hl} min={2} max={120} step={1} onChange={setHl} />
      <Readout
        items={[
          ['φ = 2^(−1/half-life)', fmt(phi, 3)],
          ['fitted half-life', fit > 0 && fit < 1 ? `${fmt(-Math.log(2) / Math.log(fit), 1)} days` : 'none', 'accent'],
          ['crossings of the mean', crosses],
        ]}
      />
      <p className="caption">
        A made-up spread from 500 daily draws. The shocks are the same at every setting, scaled so that the long-run width stays at one σ_eq; only the speed of the pull changes. Move
        the half-life and count the crossings. Then compare the fitted half-life with the true one: slow spreads give far fewer reversions to learn from.
      </p>
    </div>
  )
}

const RN = 500
const RB = 250
const RE = draws(55, RN)
const COST = 0.3

/** Entry, exit and stop rules on a z-score, with costs, on a pair that holds or breaks. */
function Rules() {
  const [broken, setBroken] = useState(false)
  const [entry, setEntry] = useState(2)
  const [exit, setExit] = useState(0)
  const [stop, setStop] = useState(10)
  const z: number[] = []
  RE.forEach((e, t) => {
    const p = t ? z[t - 1] : 0
    z.push(broken && t >= RB ? p + 0.03 + 0.3 * e : 0.9 * p + Math.sqrt(0.19) * e)
  })
  const pos: number[] = []
  let cool = false
  let trades = 0
  let stops = 0
  z.forEach((x, t) => {
    let p = t ? pos[t - 1] : 0
    if (cool && Math.abs(x) < entry) cool = false
    if (p !== 0 && Math.abs(x) >= stop) {
      p = 0
      stops++
      cool = true
    } else if ((p === -1 && x <= exit) || (p === 1 && x >= -exit)) p = 0
    else if (p === 0 && !cool && Math.abs(x) >= entry && Math.abs(x) < stop) {
      p = x > 0 ? -1 : 1
      trades++
    }
    pos.push(p)
  })
  const net = (a: number, b: number) => {
    let v = 0
    for (let t = Math.max(a, 1); t < b; t++) v += pos[t - 1] * (z[t] - z[t - 1]) - (pos[t] !== 0 && pos[t - 1] === 0 ? COST : 0)
    return v
  }
  const n1 = net(0, RB)
  const n2 = net(RB, RN)
  return (
    <div className="widget">
      <div className="seg">
        <button className={!broken ? 'on' : ''} onClick={() => setBroken(false)}>Holds</button>
        <button className={broken ? 'on' : ''} onClick={() => setBroken(true)}>Breaks at day 250</button>
      </div>
      <Plot x={[0, RN]} y={[-5, 6]} xLabel="day" yLabel="z-score">
        {s => (
          <>
            {pos.map((p, t) => p !== 0 && <rect key={t} x={s.x(t)} width={s.w(1) + 0.5} y={s.y(6)} height={s.h(11)} fill={p > 0 ? 'var(--good)' : 'var(--bad)'} opacity={0.14} />)}
            {[entry, -entry].map(v => <Seg key={'e' + v} s={s} a={[0, v]} b={[RN, v]} color="muted" dash="4 4" />)}
            {stop < 10 && [stop, -stop].map(v => <Seg key={'s' + v} s={s} a={[0, v]} b={[RN, v]} color="bad" dash="2 3" />)}
            {broken && <Seg s={s} a={[RB, -5]} b={[RB, 6]} color="amber" width={2} />}
            <Path s={s} pts={line(z)} color="accent" width={1.3} />
          </>
        )}
      </Plot>
      <Slider label="entry |z|" value={entry} min={1} max={3} step={0.25} onChange={setEntry} />
      <Slider label="exit z" value={exit} min={-0.5} max={1} step={0.25} onChange={setExit} />
      <Slider label="stop |z|" value={stop} min={2.5} max={10} step={0.5} onChange={setStop} show={v => (v >= 10 ? 'off' : `${v}`)} />
      <Readout
        items={[
          ['trades', trades],
          ['stopped out', stops, stops ? 'bad' : undefined],
          ['net P&L days 0 to 250', `${fmt(n1, 1)}%`, n1 >= 0 ? 'good' : 'bad'],
          ['net P&L days 250 to 500', `${fmt(n2, 1)}%`, n2 >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        An idealised spread whose mean and width are known (σ_eq = 1% of the long leg), with 0.3% of costs per round trip; red shading is short the spread, green long. After a stop
        the rule waits until |z| is back inside the entry band. Try a stop on <b>Holds</b>, then on <b>Breaks at day 250</b>: the same stop costs money in one world and saves it in
        the other, and you cannot know in advance which world you are in.
      </p>
    </div>
  )
}

export const statarbWidgets: Record<string, ComponentType> = {
  'statarb-neutral': Neutral,
  'statarb-coint': Coint,
  'statarb-ou': Ou,
  'statarb-rules': Rules,
}
