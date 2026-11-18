import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Plot, Readout, Slider, fmt, gaussian, seeded, type Color } from '../components/Plot'

const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length
const sd = (r: number[]) => {
  const m = mean(r)
  return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (r.length - 1))
}
const draws = (seed: number, n: number) => {
  const g = gaussian(seeded(seed))
  return Array.from({ length: n }, () => g())
}

/** The error function, by the Abramowitz and Stegun approximation (good to about 1e-7). */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
/** The inverse of the normal CDF, by bisection. */
const phiInv = (p: number) => {
  let lo = -10
  let hi = 10
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (phi(mid) < p) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

const BN = 250
const MKT = draws(101, BN).map(z => 0.0006 + 0.01 * z)
const EPS = draws(100, BN)

/** A stock's daily returns against the market's: the fitted beta and alpha, and what a year of data can tell you. */
function Beta() {
  const [beta, setBeta] = useState(1.5)
  const [alpha, setAlpha] = useState(0)
  const [noise, setNoise] = useState(0.015)
  const r = MKT.map((m, i) => alpha / 252 + beta * m + noise * EPS[i])
  const mm = mean(MKT)
  const mr = mean(r)
  let cov = 0
  let vm = 0
  MKT.forEach((m, i) => {
    cov += (m - mm) * (r[i] - mr)
    vm += (m - mm) ** 2
  })
  const b = cov / vm
  const a = mr - b * mm
  const resid = r.map((v, i) => v - a - b * MKT[i])
  const t = a / (sd(resid) / Math.sqrt(BN))
  const total = (x: number[]) => x.reduce((acc, v) => acc * (1 + v), 1) - 1
  return (
    <div className="widget">
      <Plot x={[-3.5, 3.5]} y={[-9, 9]} xLabel="market return (%)" yLabel="stock return (%)">
        {s => (
          <>
            {MKT.map((m, i) => <Dot key={i} s={s} x={m * 100} y={r[i] * 100} r={2.2} color="blue" opacity={0.55} />)}
            <Curve s={s} f={x => x} color="muted" dash="4 4" width={1.2} />
            <Curve s={s} f={x => 100 * a + b * x} color="accent" width={2.5} />
          </>
        )}
      </Plot>
      <Slider label="true beta" value={beta} min={0} max={2} step={0.1} onChange={setBeta} />
      <Slider label="true alpha, per year" value={alpha} min={-0.1} max={0.1} step={0.01} onChange={setAlpha} show={v => `${fmt(v * 100, 0)}%`} />
      <Slider label="residual volatility, per day" value={noise} min={0.005} max={0.03} step={0.005} onChange={setNoise} show={v => `${fmt(v * 100, 1)}%`} />
      <Readout
        items={[
          ['fitted beta', fmt(b), 'accent'],
          ['fitted alpha a year', `${fmt(a * 252 * 100, 1)}%`],
          ['t of alpha', fmt(t, 1), Math.abs(t) > 2 ? 'good' : 'bad'],
          ['stock / market, year', `${fmt(total(r) * 100, 0)}% / ${fmt(total(MKT) * 100, 0)}%`],
        ]}
      />
      <p className="caption">
        A year of made-up daily returns. Each dot is a day; the yellow line is the least-squares fit, whose slope is beta and whose height at zero is alpha (the dashed line is beta 1).
        Set alpha to 0 and beta to 2: the stock beats the rising market with no skill at all. Then give it a true alpha of 4% and read the t: one year cannot find it.
      </p>
    </div>
  )
}

const QT = 60
const QN = 200
const QZ = Array.from({ length: QT }, (_, t) => draws(500 + t, QN))
const QE = Array.from({ length: QT }, (_, t) => draws(900 + t, QN))

/** Quantile portfolios of a signal with a chosen information coefficient. */
function Quantiles() {
  const [ic, setIc] = useState(0.05)
  const [q, setQ] = useState(5)
  const { bars, spreads, realised } = useMemo(() => {
    const sums: number[] = Array(q).fill(0)
    const spreads: number[] = []
    const ics: number[] = []
    for (let t = 0; t < QT; t++) {
      const z = QZ[t]
      const f = z.map((v, i) => 0.06 * (ic * v + Math.sqrt(1 - ic * ic) * QE[t][i]))
      const order = z.map((_, i) => i).sort((i, j) => z[i] - z[j])
      const m = Array.from({ length: q }, (_, k) => mean(order.slice(Math.round((k * QN) / q), Math.round(((k + 1) * QN) / q)).map(i => f[i])))
      m.forEach((v, k) => (sums[k] += v / QT))
      spreads.push(m[q - 1] - m[0])
      const mz = mean(z)
      const mf = mean(f)
      let c = 0
      z.forEach((v, i) => (c += (v - mz) * (f[i] - mf)))
      ics.push(c / (QN - 1) / (sd(z) * sd(f)))
    }
    return { bars: sums, spreads, realised: mean(ics) }
  }, [ic, q])
  const top = Math.max(1, ...bars.map(v => Math.abs(v * 100))) * 1.15
  const tSpread = mean(spreads) / (sd(spreads) / Math.sqrt(QT))
  const colour = (k: number): Color => (k === 0 ? 'bad' : k === q - 1 ? 'good' : 'accent')
  return (
    <div className="widget">
      <div className="seg">
        {[3, 5, 10].map(n => <button key={n} className={q === n ? 'on' : ''} onClick={() => setQ(n)}>{n} quantiles</button>)}
      </div>
      <Plot x={[0.5, q + 0.5]} y={[-top, top]} xLabel="quantile of the signal (1 = lowest)" yLabel="mean next-month return (%)">
        {s => (
          <>
            {bars.map((v, k) => (
              <rect key={k} x={s.x(k + 0.62)} width={s.w(0.76)} y={s.y(Math.max(0, v * 100))} height={Math.abs(s.y(0) - s.y(v * 100))} fill={`var(--${colour(k)})`} opacity={0.75} />
            ))}
          </>
        )}
      </Plot>
      <Slider label="true IC of the signal" value={ic} min={0} max={0.15} step={0.01} onChange={setIc} />
      <Readout
        items={[
          ['measured mean IC', fmt(realised, 3)],
          ['top minus bottom, a month', `${fmt(mean(spreads) * 100, 2)}%`, 'accent'],
          ['t of the spread', fmt(tSpread, 1), Math.abs(tSpread) > 2 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Five years of made-up months, 200 stocks, each month sorted by the signal and cut into quantiles. Bars are the average next-month return of each quantile, before costs.
        Set the IC to 0: the bars still wobble, which is what noise looks like. Raise it to 0.05 and a staircase appears; switch to 10 quantiles and the ends move further apart, on fewer stocks each.
      </p>
    </div>
  )
}

const SECTORS = ['Banks', 'Tech', 'Energy']
const SCOL: Color[] = ['accent', 'blue', 'purple']
const SEFF = [1, -0.4, -0.6]
const SN = 30
const SIDIO = draws(77, SN)
const sector = (i: number) => Math.floor(i / 10)

/** A signal with a sector tilt, raw and after removing each sector's mean. */
function Neutral() {
  const [tilt, setTilt] = useState(1)
  const [neutral, setNeutral] = useState(false)
  const raw = SIDIO.map((e, i) => tilt * SEFF[sector(i)] + e)
  const secMean = (x: number[], k: number) => mean(x.filter((_, i) => sector(i) === k))
  const adj = neutral ? raw.map((v, i) => v - secMean(raw, sector(i))) : raw.map(v => v - mean(raw))
  const gross = adj.reduce((a, v) => a + Math.abs(v), 0)
  const w = adj.map(v => (2 * v) / gross)
  const net = [0, 1, 2].map(k => w.filter((_, i) => sector(i) === k).reduce((a, v) => a + v, 0))
  const total = w.reduce((a, v) => a + v * v, 0)
  const between = [0, 1, 2].reduce((a, k) => a + 10 * secMean(w, k) ** 2, 0)
  const top = Math.max(0.25, ...w.map(Math.abs)) * 1.1
  return (
    <div className="widget">
      <div className="seg">
        <button className={!neutral ? 'on' : ''} onClick={() => setNeutral(false)}>Raw signal</button>
        <button className={neutral ? 'on' : ''} onClick={() => setNeutral(true)}>Sector neutral</button>
      </div>
      <Plot x={[0, SN]} y={[-top, top]} xLabel="stock (10 per sector)" yLabel="portfolio weight">
        {s => (
          <>
            {w.map((v, i) => (
              <rect key={i} x={s.x(i + 0.12)} width={s.w(0.76)} y={s.y(Math.max(0, v))} height={Math.abs(s.y(0) - s.y(v))} fill={`var(--${SCOL[sector(i)]})`} opacity={0.8} />
            ))}
          </>
        )}
      </Plot>
      <Slider label="sector tilt hidden in the signal" value={tilt} min={0} max={2} step={0.1} onChange={setTilt} />
      <Readout
        items={[
          ...SECTORS.map((name, k) => [`net ${name}`, `${fmt(net[k] * 100, 0)}%`, SCOL[k]] as [string, string, Color]),
          ['share that is a sector bet', `${fmt((100 * between) / total, 0)}%`, 'bad'],
        ]}
      />
      <p className="caption">
        Thirty made-up stocks in three sectors (banks yellow, tech blue, energy purple), long the high scores and short the low ones, 100% each way. With a tilt, much of the raw
        signal is a bet that banks beat energy. Press <b>Sector neutral</b>: each sector nets to zero and only the ranking within sectors is left. Ask which bet you meant to make.
      </p>
    </div>
  )
}

const KMAX = 500
const KZ = draws(4242, KMAX)

/** The best Sharpe ratio among many strategies that have no edge at all. */
function Search() {
  const [n, setN] = useState(100)
  const [years, setYears] = useState(5)
  const se = 1 / Math.sqrt(years)
  const est = KZ.slice(0, n).map(z => z * se)
  const best = Math.max(...est)
  const g = 0.5772156649
  const expMax = n === 1 ? 0 : se * ((1 - g) * phiInv(1 - 1 / n) + g * phiInv(1 - 1 / (n * Math.E)))
  const w = 0.1
  const bins = Array.from({ length: 50 }, (_, i) => -2.5 + i * w)
  const counts = bins.map(b => est.filter(v => v >= b && v < b + w).length)
  const top = Math.max(...counts, 1) * 1.15
  return (
    <div className="widget">
      <Plot x={[-2.5, 2.5]} y={[0, top]} xLabel="estimated annual Sharpe (true Sharpe 0)" yLabel="strategies">
        {s => (
          <>
            {bins.map((b, i) => counts[i] > 0 && <rect key={b} x={s.x(b)} width={Math.max(1, s.w(w) - 1)} y={s.y(counts[i])} height={s.y(0) - s.y(counts[i])} fill="var(--muted)" opacity={0.6} />)}
            <line x1={s.x(best)} x2={s.x(best)} y1={s.y(0)} y2={s.y(top)} stroke="var(--bad)" strokeWidth={2.5} />
            <line x1={s.x(expMax)} x2={s.x(expMax)} y1={s.y(0)} y2={s.y(top)} stroke="var(--accent)" strokeWidth={2} strokeDasharray="5 4" />
          </>
        )}
      </Plot>
      <Slider label="strategies tried" value={n} min={1} max={KMAX} step={1} onChange={setN} />
      <Slider label="years of data" value={years} min={1} max={20} step={1} onChange={setYears} />
      <Readout
        items={[
          ['best Sharpe found', fmt(best), 'bad'],
          ['expected best of n', fmt(expMax), 'accent'],
          ['t of the best', fmt(best * Math.sqrt(years), 1)],
          ['estimates above 1.0', `${est.filter(v => v > 1).length} of ${n}`],
        ]}
      />
      <p className="caption">
        Every strategy here has a true Sharpe of zero; each estimate is noise with a standard error of 1 ÷ √years. The red line is the best one, the one a researcher would
        report; the dashed line is the expected best of n from the formula in the lesson. Raise the number tried and watch the winner improve with no skill behind it.
      </p>
    </div>
  )
}

export const qalphaWidgets: Record<string, ComponentType> = {
  'qalpha-beta': Beta,
  'qalpha-quantiles': Quantiles,
  'qalpha-neutral': Neutral,
  'qalpha-search': Search,
}
