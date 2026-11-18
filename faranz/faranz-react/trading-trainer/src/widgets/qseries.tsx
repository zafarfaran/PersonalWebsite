import { useMemo, useState, type ComponentType } from 'react'
import { Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const mean = (a: number[]) => sum(a) / a.length

/** Sample autocorrelations at lags 1..k, whole-series mean and denominator. */
function acfOf(x: number[], k: number): number[] {
  const m = mean(x)
  const d = x.map(v => v - m)
  const den = sum(d.map(v => v * v))
  return Array.from({ length: k }, (_, j) => {
    let s = 0
    for (let t = j + 1; t < d.length; t++) s += d[t] * d[t - j - 1]
    return s / den
  })
}

/** Partial autocorrelations from the ACF by the Durbin-Levinson recursion. */
function pacfOf(rho: number[]): number[] {
  const out: number[] = []
  let prev: number[] = []
  rho.forEach((_, i) => {
    const k = i + 1
    const num = rho[k - 1] - sum(prev.map((p, j) => p * rho[k - 2 - j]))
    const den = 1 - sum(prev.map((p, j) => p * rho[j]))
    const pkk = num / den
    prev = [...prev.map((p, j) => p - pkk * prev[k - 2 - j]), pkk]
    out.push(pkk)
  })
  return out
}

const CN = 500
const CE: number[] = (() => {
  const g = gaussian(seeded(5))
  return Array.from({ length: CN + 1 }, () => g())
})()
const LAGS = 15

/** ACF and PACF bars for noise, an AR(1) or an MA(1), with the noise band and Ljung-Box. */
function Correlogram() {
  const [kind, setKind] = useState<'noise' | 'ar' | 'ma'>('ar')
  const [c, setC] = useState(0.6)
  const x: number[] = []
  for (let t = 1; t <= CN; t++) {
    if (kind === 'noise') x.push(CE[t])
    else if (kind === 'ma') x.push(CE[t] + c * CE[t - 1])
    else x.push((t > 1 ? c * x[t - 2] : 0) + CE[t])
  }
  const rho = acfOf(x, LAGS)
  const pac = pacfOf(rho)
  const band = 1.96 / Math.sqrt(CN)
  const q10 = CN * (CN + 2) * sum(rho.slice(0, 10).map((r, j) => (r * r) / (CN - j - 1)))
  const bars = (vals: number[], label: string) => (
    <Plot x={[0, LAGS + 1]} y={[-1, 1]} height={170} xLabel={label}>
      {s => (
        <>
          {vals.map((v, j) => (
            <rect key={j} x={s.x(j + 1) - 4} width={8} y={s.y(Math.max(v, 0))} height={Math.abs(s.y(v) - s.y(0))} fill={Math.abs(v) > band ? 'var(--accent)' : 'var(--muted)'} />
          ))}
          <Seg s={s} a={[0, band]} b={[LAGS + 1, band]} color="blue" dash="4 4" />
          <Seg s={s} a={[0, -band]} b={[LAGS + 1, -band]} color="blue" dash="4 4" />
        </>
      )}
    </Plot>
  )
  return (
    <div className="widget">
      <div className="seg">
        {(['noise', 'ar', 'ma'] as const).map(k => (
          <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{k === 'noise' ? 'White noise' : k === 'ar' ? 'AR(1)' : 'MA(1)'}</button>
        ))}
      </div>
      {bars(rho, 'lag (ACF)')}
      {bars(pac, 'lag (PACF)')}
      {kind !== 'noise' && <Slider label={kind === 'ar' ? 'φ' : 'θ'} value={c} min={-0.9} max={0.9} step={0.1} onChange={setC} />}
      <Readout items={[['noise band', `±${fmt(band, 3)}`], ['Ljung-Box Q(10)', fmt(q10, 1), q10 > 18.31 ? 'bad' : 'good'], ['5% critical', '18.31']]} />
      <p className="caption">
        Five hundred made-up points from the same shocks. Bars beyond the dashed band are coloured. Compare where the ACF stops and where the PACF stops for AR(1) and
        MA(1), then set the coefficient near 0.1, closer to anything seen in daily returns, and watch the pattern sink into the noise band.
      </p>
    </div>
  )
}

const SN = 250
const PAIRS = 20
const WALKS: { a: number[]; b: number[] }[] = Array.from({ length: PAIRS }, (_, k) => {
  const g = gaussian(seeded(100 + k))
  const a = [0]
  const b = [0]
  for (let t = 1; t < SN; t++) {
    a.push(a[t - 1] + g())
    b.push(b[t - 1] + g())
  }
  return { a, b }
})
const diff = (x: number[]) => x.slice(1).map((v, i) => v - x[i])

/** Least squares of y on x with an intercept: slope, its t statistic and R². */
function ols(x: number[], y: number[]) {
  const mx = mean(x)
  const my = mean(y)
  const sxx = sum(x.map(v => (v - mx) ** 2))
  const b = sum(x.map((v, i) => (v - mx) * (y[i] - my))) / sxx
  const a = my - b * mx
  const sse = sum(y.map((v, i) => (v - a - b * x[i]) ** 2))
  const sst = sum(y.map(v => (v - my) ** 2))
  return { a, b, t: b / Math.sqrt(sse / (x.length - 2) / sxx), r2: 1 - sse / sst }
}
const FITS = WALKS.map(w => ({ lev: ols(w.a, w.b), chg: ols(diff(w.a), diff(w.b)) }))

/** Regressing one independent random walk on another, in levels and in changes. */
function Spurious() {
  const [k, setK] = useState(0)
  const [chg, setChg] = useState(false)
  const x = chg ? diff(WALKS[k].a) : WALKS[k].a
  const y = chg ? diff(WALKS[k].b) : WALKS[k].b
  const f = chg ? FITS[k].chg : FITS[k].lev
  const lo = Math.min(...x)
  const hi = Math.max(...x)
  const big = (m: 'lev' | 'chg') => FITS.filter(F => Math.abs(F[m].t) > 2).length
  return (
    <div className="widget">
      <div className="seg">
        <button className={!chg ? 'on' : ''} onClick={() => setChg(false)}>Levels</button>
        <button className={chg ? 'on' : ''} onClick={() => setChg(true)}>Changes</button>
      </div>
      <Plot x={[lo, hi]} y={[Math.min(...y), Math.max(...y)]} xLabel={chg ? 'change of A' : 'level of A'} yLabel={chg ? 'change of B' : 'level of B'}>
        {s => (
          <>
            {x.map((v, i) => <circle key={i} cx={s.x(v)} cy={s.y(y[i])} r={2} fill="var(--accent)" opacity={0.5} />)}
            <Seg s={s} a={[lo, f.a + f.b * lo]} b={[hi, f.a + f.b * hi]} color="bad" width={2} />
          </>
        )}
      </Plot>
      <div className="actions">
        <button className="btn" onClick={() => setK((k + 1) % PAIRS)}>Next pair ({k + 1} of {PAIRS})</button>
      </div>
      <Readout
        items={[
          ['slope t', fmt(f.t, 1), Math.abs(f.t) > 2 ? 'bad' : 'good'],
          ['R²', fmt(f.r2)],
          ['|t| > 2, levels', `${big('lev')} of ${PAIRS}`, 'bad'],
          ['|t| > 2, changes', `${big('chg')} of ${PAIRS}`, 'good'],
        ]}
      />
      <p className="caption">
        Each pair is two random walks drawn independently: there is no relationship at all. Step through the pairs in Levels and count how often the slope looks
        significant, then switch to Changes. A valid test would flag about one pair in twenty.
      </p>
    </div>
  )
}

const EN = 360
const SHOCK: [number, number] = [150, 162]
const JUMP = 250
const EZ: number[] = (() => {
  const g = gaussian(seeded(17))
  return Array.from({ length: EN }, () => g())
})()
const ETRUE = EZ.map((_, t) => (t >= SHOCK[0] && t < SHOCK[1] ? 0.03 : 0.01))
const ER = EZ.map((z, t) => (t === JUMP ? -0.05 : z * ETRUE[t]))
const ANN = Math.sqrt(252) * 100

/** EWMA against a 20-day rolling window through a stressed spell. */
function Ewma() {
  const [lam, setLam] = useState(0.94)
  const ew: number[] = [0.0001]
  for (let t = 1; t < EN; t++) ew.push(lam * ew[t - 1] + (1 - lam) * ER[t - 1] ** 2)
  const roll = ER.map((_, t) => (t < 20 ? NaN : Math.sqrt(mean(ER.slice(t - 20, t).map(v => v * v)))))
  const ewv = ew.map(Math.sqrt)
  const back = ewv.findIndex((v, t) => t >= SHOCK[1] && v < 0.0125)
  return (
    <div className="widget">
      <Plot x={[100, EN]} y={[0, 70]} xLabel="day" yLabel="annual vol %">
        {s => (
          <>
            <rect x={s.x(SHOCK[0])} width={s.w(SHOCK[1] - SHOCK[0])} y={s.y(70)} height={s.h(70)} fill="var(--amber)" opacity={0.12} />
            <Path s={s} pts={ETRUE.map((v, t) => [t, v * ANN] as Pt)} color="muted" width={1.5} dash="4 4" />
            <Path s={s} pts={roll.map((v, t) => [t, v * ANN] as Pt)} color="blue" width={1.5} />
            <Path s={s} pts={ewv.map((v, t) => [t, v * ANN] as Pt)} color="accent" />
          </>
        )}
      </Plot>
      <Slider label="λ" value={lam} min={0.8} max={0.99} step={0.01} onChange={setLam} />
      <Readout
        items={[
          ['half-life', `${fmt(Math.log(0.5) / Math.log(lam), 1)} days`],
          ['effective window', `${fmt(1 / (1 - lam), 0)} days`],
          ['EWMA peak', `${fmt(Math.max(...ewv) * ANN, 0)}%`, 'accent'],
          ['back near calm', back > 0 ? `${back - SHOCK[1]} days after` : 'not yet', 'good'],
        ]}
      />
      <p className="caption">
        Made-up returns at 16% annual volatility, a 12-day spell at 48% (shaded; dashed is the truth) and one 5% fall on day 250. Yellow is EWMA, blue a 20-day rolling
        estimate, both using only past days. After day 250 the blue line sits flat for 20 days, then falls off a cliff. Move λ: low λ reacts fast and jitters, high λ is smooth and slow.
      </p>
    </div>
  )
}

/** GARCH(1,1) variance forecasts returning to the long-run level. */
function Garch() {
  const [alpha, setAlpha] = useState(0.08)
  const [beta, setBeta] = useState(0.9)
  const [lr, setLr] = useState(18)
  const [now, setNow] = useState(40)
  const p = alpha + beta
  const ok = p < 0.999
  const vl = (lr / 100) ** 2 / 252
  const v1 = (now / 100) ** 2 / 252
  const H = 250
  const daily = Array.from({ length: H }, (_, i) => (ok ? vl + p ** i * (v1 - vl) : v1))
  const avg: number[] = []
  daily.reduce((acc, v, i) => ((avg[i] = (acc + v) / (i + 1)), acc + v), 0)
  const toVol = (v: number) => Math.sqrt(v * 252) * 100
  return (
    <div className="widget">
      <Plot x={[0, H]} y={[0, 85]} xLabel="days ahead" yLabel="annual vol %">
        {s => (
          <>
            {ok && <Seg s={s} a={[0, lr]} b={[H, lr]} color="muted" dash="4 4" />}
            <Path s={s} pts={daily.map((v, i) => [i + 1, toVol(v)] as Pt)} color="accent" />
            <Path s={s} pts={avg.map((v, i) => [i + 1, toVol(v)] as Pt)} color="blue" dash="5 4" />
          </>
        )}
      </Plot>
      <Slider label="α (reaction)" value={alpha} min={0.01} max={0.2} step={0.01} onChange={setAlpha} />
      <Slider label="β (memory)" value={beta} min={0.5} max={0.98} step={0.01} onChange={setBeta} />
      <Slider label="long-run vol %" value={lr} min={10} max={40} step={1} onChange={setLr} />
      <Slider label="vol forecast for tomorrow %" value={now} min={5} max={80} step={1} onChange={setNow} />
      <Readout
        items={[
          ['α + β', fmt(p), ok ? undefined : 'bad'],
          ['half-life', ok ? `${fmt(Math.log(0.5) / Math.log(p), 0)} days` : 'no long-run level', ok ? undefined : 'bad'],
          ['next 21 days', `${fmt(toVol(avg[20]), 1)}%`, 'blue'],
          ['next 63 days', `${fmt(toVol(avg[62]), 1)}%`, 'blue'],
        ]}
      />
      <p className="caption">
        Yellow is the forecast volatility of each future day, blue the average over the days up to that horizon, which is what you compare with an option of that
        expiry. Set tomorrow well above the long run and raise β: the forecast clings to today for longer. Push α + β to 1 and the long-run anchor disappears, as in EWMA.
      </p>
    </div>
  )
}

const DAYS = 4
const SEC = 23400
const SIG: { e: Float64Array; u: Float64Array }[] = Array.from({ length: DAYS }, (_, d) => {
  const g = gaussian(seeded(60 + d))
  const e = new Float64Array(SEC + 1)
  const u = new Float64Array(SEC + 1)
  for (let i = 1; i <= SEC; i++) e[i] = e[i - 1] + (g() * 0.01) / Math.sqrt(SEC)
  for (let i = 0; i <= SEC; i++) u[i] = g()
  return { e, u }
})
const STEPS = [1, 2, 5, 10, 20, 30, 60, 120, 300, 600, 900, 1800]

/** The volatility signature plot: RV against the sampling interval, with bid-ask noise. */
function Signature() {
  const [bp, setBp] = useState(1)
  const om = bp / 10000
  const rv = useMemo(
    () =>
      STEPS.map(k => {
        const per = SIG.map(({ e, u }) => {
          let s = 0
          for (let i = k; i <= SEC; i += k) s += (e[i] - e[i - k] + om * (u[i] - u[i - k])) ** 2
          return s
        })
        return Math.sqrt(mean(per) * 252) * 100
      }),
    [om],
  )
  const top = Math.max(40, ...rv.map(v => v + 5))
  return (
    <div className="widget">
      <Plot x={[0, 3.3]} y={[0, top]} xLabel="log10 of sampling interval in seconds" yLabel="annual RV %">
        {s => (
          <>
            <Seg s={s} a={[0, 15.87]} b={[3.3, 15.87]} color="muted" dash="4 4" />
            <Path s={s} pts={STEPS.map((k, i) => [Math.log10(k), rv[i]] as Pt)} color="accent" />
            {STEPS.map((k, i) => <circle key={k} cx={s.x(Math.log10(k))} cy={s.y(rv[i])} r={3} fill="var(--accent)" />)}
          </>
        )}
      </Plot>
      <Slider label="noise per price (basis points)" value={bp} min={0} max={5} step={0.5} onChange={setBp} />
      <Readout
        items={[
          ['true vol', '15.9%'],
          ['RV every second', `${fmt(rv[0], 1)}%`, 'bad'],
          ['RV every minute', `${fmt(rv[6], 1)}%`],
          ['RV every 5 minutes', `${fmt(rv[8], 1)}%`, 'good'],
        ]}
      />
      <p className="caption">
        Four made-up trading days, one price a second, true volatility 1% a day (dashed). Each recorded price carries its own small error, like a trade printing at the bid
        or the ask. With no noise the curve is flat; add a basis point or two and RV from every second explodes while 5-minute RV barely moves.
      </p>
    </div>
  )
}

const RN = 750
const RU: number[] = (() => {
  const r = seeded(77)
  return Array.from({ length: RN }, () => r())
})()
const RZ: number[] = (() => {
  const g = gaussian(seeded(78))
  return Array.from({ length: RN }, () => g())
})()

/** A two-state market: calm and stressed spells drawn from staying probabilities. */
function Regime() {
  const [p, setP] = useState(0.98)
  const [q, setQ] = useState(0.9)
  const st: number[] = []
  RU.forEach((u, t) => st.push(t === 0 ? 0 : st[t - 1] === 0 ? (u < p ? 0 : 1) : u < q ? 1 : 0))
  const r = st.map((k, t) => RZ[t] * (k ? 2.5 : 0.8))
  const m = mean(r)
  const v = mean(r.map(x => (x - m) ** 2))
  const kurt = mean(r.map(x => (x - m) ** 4)) / v ** 2 - 3
  const share = (1 - p) / (1 - p + (1 - q))
  return (
    <div className="widget">
      <Plot x={[0, RN]} y={[-9, 9]} xLabel="day" yLabel="daily return %">
        {s => (
          <>
            {st.map((k, t) => k === 1 && <rect key={t} x={s.x(t)} width={s.w(1) + 0.5} y={s.y(9)} height={s.h(18)} fill="var(--amber)" opacity={0.18} />)}
            <Path s={s} pts={r.map((x, t) => [t, x] as Pt)} color="accent" width={1} />
          </>
        )}
      </Plot>
      <Slider label="chance of staying calm (p)" value={p} min={0.8} max={0.995} step={0.005} onChange={setP} />
      <Slider label="chance of staying stressed (q)" value={q} min={0.5} max={0.99} step={0.01} onChange={setQ} />
      <Readout
        items={[
          ['calm spell', `${fmt(1 / (1 - p), 0)} days`],
          ['stressed spell', `${fmt(1 / (1 - q), 0)} days`, 'amber'],
          ['stressed share', `${fmt(share * 100, 0)}% (here ${fmt(mean(st) * 100, 0)}%)`, 'amber'],
          ['excess kurtosis', fmt(kurt, 1), 'bad'],
        ]}
      />
      <p className="caption">
        Three years of made-up returns: 0.8% a day when calm, 2.5% when stressed (shaded). Each regime is normal, yet the mixture has fat tails. Change the staying
        probabilities and compare the expected durations with what the sample shows: with so few spells, one sample can differ a lot from the long-run share.
      </p>
    </div>
  )
}

export const qseriesWidgets: Record<string, ComponentType> = {
  'qseries-correlogram': Correlogram,
  'qseries-spurious': Spurious,
  'qseries-ewma': Ewma,
  'qseries-garch': Garch,
  'qseries-signature': Signature,
  'qseries-regime': Regime,
}
