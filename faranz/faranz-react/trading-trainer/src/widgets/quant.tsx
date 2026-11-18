import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const cumsum = (r: number[]) => r.reduce<number[]>((a, x) => [...a, (a[a.length - 1] ?? 0) + x], [])
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
const normPdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)

/** 2000 days; for each, one normal for the numerator and 30 for the chi-square of a Student t. */
const TN = 2000
const TDRAWS: number[][] = (() => {
  const g = gaussian(seeded(11))
  return Array.from({ length: TN }, () => Array.from({ length: 31 }, () => g()))
})()

/** Fat tails at a fixed standard deviation: Student t returns against the normal curve. */
function Tails() {
  const [nu, setNu] = useState(30)
  const [log, setLog] = useState(false)
  const x = useMemo(() => {
    const t = TDRAWS.map(d => d[0] / Math.sqrt(d.slice(1, nu + 1).reduce((a, v) => a + v * v, 0) / nu))
    const m = mean(t)
    const s = sd(t)
    return t.map(v => (v - m) / s)
  }, [nu])
  const w = 0.25
  const bins = Array.from({ length: 48 }, (_, i) => -6 + i * w)
  const dens = bins.map(b => x.filter(v => v >= b && v < b + w).length / (TN * w))
  const kurt = mean(x.map(v => v ** 4)) - 3
  const beyond = (k: number) => x.filter(v => Math.abs(v) > k).length
  const tail = (k: number) => TN * (1 - erf(k / Math.SQRT2))
  const f = (d: number) => (log ? (d > 0 ? Math.log10(d) : -9) : d)
  return (
    <div className="widget">
      <div className="seg">
        <button className={!log ? 'on' : ''} onClick={() => setLog(false)}>Linear</button>
        <button className={log ? 'on' : ''} onClick={() => setLog(true)}>Log scale</button>
      </div>
      <Plot x={[-6, 6]} y={log ? [-4, 0] : [0, 0.65]} xLabel="return in standard deviations" yLabel={log ? 'log10 density' : 'density'}>
        {s => (
          <>
            {bins.map((b, i) => dens[i] > 0 && (
              <rect key={b} x={s.x(b)} width={s.w(w) - 1} y={s.y(f(dens[i]))} height={Math.max(0, s.y(log ? -4 : 0) - s.y(f(dens[i])))} fill="var(--accent)" opacity={0.55} />
            ))}
            <Curve s={s} f={v => f(normPdf(v))} color="blue" width={2} />
          </>
        )}
      </Plot>
      <Slider label="degrees of freedom (lower = fatter tails)" value={nu} min={3} max={30} step={1} onChange={setNu} />
      <Readout
        items={[
          ['days beyond 3σ', `${beyond(3)} (normal ${fmt(tail(3), 1)})`, 'accent'],
          ['days beyond 4σ', `${beyond(4)} (normal ${fmt(tail(4), 2)})`, 'bad'],
          ['excess kurtosis', fmt(kurt, 1)],
          ['largest move', `${fmt(Math.max(...x.map(Math.abs)), 1)}σ`],
        ]}
      />
      <p className="caption">
        Two thousand made-up daily returns, always rescaled to the same standard deviation; the blue line is the normal curve. Lower the degrees of freedom and switch to the
        log scale: the centre gets taller and the tails stretch far past the curve. Count the days beyond 3σ and 4σ against what the normal curve expects.
      </p>
    </div>
  )
}

/** The error function, by the Abramowitz and Stegun approximation (good to about 1e-7). */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}

const AN = 250
const EPS: number[] = (() => {
  const g = gaussian(seeded(23))
  return Array.from({ length: AN }, () => g())
})()

/** Returns with a chosen lag-1 autocorrelation, and two rules that bet on it. */
function Autocorr() {
  const [phi, setPhi] = useState(0)
  const r: number[] = []
  EPS.forEach((e, i) => r.push((i ? phi * r[i - 1] : 0) + e * Math.sqrt(1 - phi * phi)))
  const price = [0, ...cumsum(r)]
  const follow = [0, ...cumsum(r.slice(1).map((x, i) => Math.sign(r[i]) * x))]
  const all = [...price, ...follow, ...follow.map(v => -v)]
  const ac = corr(r.slice(0, -1), r.slice(1))
  return (
    <div className="widget">
      <Plot x={[0, AN]} y={[Math.min(...all) - 2, Math.max(...all) + 2]} xLabel="day" yLabel="cumulative %">
        {s => (
          <>
            <Path s={s} pts={price.map((v, i) => [i, v] as Pt)} color="muted" width={1.5} />
            <Path s={s} pts={follow.map((v, i) => [i + 1, v] as Pt)} color="good" />
            <Path s={s} pts={follow.map((v, i) => [i + 1, -v] as Pt)} color="bad" />
          </>
        )}
      </Plot>
      <Slider label="φ (autocorrelation)" value={phi} min={-0.6} max={0.6} step={0.05} onChange={setPhi} />
      <Readout
        items={[
          ['measured lag-1', fmt(ac), 'accent'],
          ['noise band ±2/√n', fmt(2 / Math.sqrt(AN - 1))],
          ['follow total', `${fmt(follow[follow.length - 1], 1)}%`, 'good'],
          ['fade total', `${fmt(-follow[follow.length - 1], 1)}%`, 'bad'],
        ]}
      />
      <p className="caption">
        Grey is the price (in % from the start), green a rule that follows yesterday's direction, red one that fades it. The shocks are the same at every setting; only φ
        changes. Move φ below and above zero and see which rule wins. Near zero, where real index returns sit, neither has anything to work with.
      </p>
    </div>
  )
}

const SP = 20
const STEP = 21
const SK = 120
/** For each path, the running mean and standard deviation of unit normal draws at every month end, 10 years. */
const SPATHS: { m: number; s: number }[][] = Array.from({ length: SP }, (_, k) => {
  const g = gaussian(seeded(300 + k))
  let a = 0
  let b = 0
  const out: { m: number; s: number }[] = []
  for (let t = 1; t <= SK * STEP; t++) {
    const z = g()
    a += z
    b += z * z
    if (t % STEP === 0) out.push({ m: a / t, s: Math.sqrt(b / t - (a / t) ** 2) })
  }
  return out
})

/** Estimated Sharpe ratios against the length of the sample. */
function SharpeEst() {
  const [sr, setSr] = useState(1)
  const k = Math.sqrt(252)
  const est = SPATHS.map(p => p.map(({ m, s }) => (sr / k + m) / s * k))
  const at = (i: number) => est.map(e => e[i])
  const y1 = at(11)
  const y10 = at(SK - 1)
  return (
    <div className="widget">
      <Plot x={[0, 10]} y={[-3, 5]} xLabel="years of daily data" yLabel="estimated Sharpe">
        {s => (
          <>
            {est.map((e, i) => <Path key={i} s={s} pts={e.map((v, j) => [((j + 1) * STEP) / 252, v] as Pt)} color="muted" width={1} opacity={0.6} />)}
            <Curve s={s} from={0.2} f={t => sr + 2 / Math.sqrt(t)} color="blue" dash="4 4" width={1.5} />
            <Curve s={s} from={0.2} f={t => sr - 2 / Math.sqrt(t)} color="blue" dash="4 4" width={1.5} />
            <Seg s={s} a={[0, sr]} b={[10, sr]} color="accent" width={2} />
          </>
        )}
      </Plot>
      <Slider label="true Sharpe" value={sr} min={0} max={2} step={0.25} onChange={setSr} />
      <Readout
        items={[
          ['after 1 year', `${fmt(Math.min(...y1), 1)} to ${fmt(Math.max(...y1), 1)}`],
          ['below 0 at 1 year', `${y1.filter(v => v < 0).length} of ${SP}`, 'bad'],
          ['after 10 years', `${fmt(Math.min(...y10), 1)} to ${fmt(Math.max(...y10), 1)}`, 'accent'],
        ]}
      />
      <p className="caption">
        Twenty strategies with the same true Sharpe (yellow line), each estimated from its own daily returns as the history grows. The dashed funnel is two standard errors,
        2 ÷ √years. Set a true Sharpe of 1 and read the spread after one year, then after ten. A great year is weak evidence; a long, modest record is stronger.
      </p>
    </div>
  )
}

const PN = 500
const BREAK = 250
const PW = 60
const PDRAWS: number[] = (() => {
  const g = gaussian(seeded(41))
  return Array.from({ length: PN }, () => g())
})()

/** A pair's spread, its rolling z-score and a fade rule, with or without a break in the relationship. */
function Pairs() {
  const [broken, setBroken] = useState(false)
  const [entry, setEntry] = useState(2)
  const sp: number[] = []
  PDRAWS.forEach((e, t) => {
    const prev = t ? sp[t - 1] : 0
    sp.push(broken && t >= BREAK ? prev + 0.0015 + 0.004 * e : 0.95 * prev + 0.004 * e)
  })
  const z = sp.map((v, t) => (t < PW - 1 ? NaN : (v - mean(sp.slice(t - PW + 1, t + 1))) / sd(sp.slice(t - PW + 1, t + 1))))
  const pos: number[] = []
  z.forEach((x, t) => {
    const p = t ? pos[t - 1] : 0
    pos.push(p === 0 ? (x > entry ? -1 : x < -entry ? 1 : 0) : (p === -1 && x < 0) || (p === 1 && x > 0) ? 0 : p)
  })
  const pnl = (a: number, b: number) => 100 * sp.slice(a + 1, b).reduce((acc, v, i) => acc + pos[a + i] * (v - sp[a + i]), 0)
  const trades = pos.filter((p, t) => p !== 0 && (t === 0 || pos[t - 1] === 0)).length
  return (
    <div className="widget">
      <div className="seg">
        <button className={!broken ? 'on' : ''} onClick={() => setBroken(false)}>Stays together</button>
        <button className={broken ? 'on' : ''} onClick={() => setBroken(true)}>Breaks at day 250</button>
      </div>
      <Plot x={[0, PN]} y={[-4.5, 4.5]} xLabel="day" yLabel="z-score of spread">
        {s => (
          <>
            {pos.map((p, t) => p !== 0 && <rect key={t} x={s.x(t)} width={s.w(1) + 0.5} y={s.y(4.5)} height={s.h(9)} fill={p > 0 ? 'var(--good)' : 'var(--bad)'} opacity={0.12} />)}
            <Seg s={s} a={[0, entry]} b={[PN, entry]} color="bad" dash="4 4" />
            <Seg s={s} a={[0, -entry]} b={[PN, -entry]} color="good" dash="4 4" />
            {broken && <Seg s={s} a={[BREAK, -4.5]} b={[BREAK, 4.5]} color="amber" width={2} />}
            <Path s={s} pts={z.map((v, t) => [t, v] as Pt)} color="accent" width={1.5} />
          </>
        )}
      </Plot>
      <Slider label="entry |z|" value={entry} min={1} max={3} step={0.25} onChange={setEntry} />
      <Readout
        items={[
          ['trades', trades],
          ['P&L days 0 to 250', `${fmt(pnl(0, BREAK), 1)}%`, pnl(0, BREAK) >= 0 ? 'good' : 'bad'],
          ['P&L days 250 to 500', `${fmt(pnl(BREAK - 1, PN), 1)}%`, pnl(BREAK - 1, PN) >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        The z-score of a made-up pair spread over a 60-day window; red shading is short the spread, green long, each held until z crosses 0. Before costs it earns while the
        spread keeps returning. Press <b>Breaks at day 250</b>: the spread starts to trend, and the same rule keeps fading it. Without a stop, nothing in the rule notices.
      </p>
    </div>
  )
}

export const quantWidgets: Record<string, ComponentType> = {
  'quant-tails': Tails,
  'quant-autocorr': Autocorr,
  'quant-sharpe': SharpeEst,
  'quant-pairs': Pairs,
}
