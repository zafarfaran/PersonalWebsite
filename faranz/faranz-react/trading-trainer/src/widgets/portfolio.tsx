import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

const pct = (v: number, d = 1) => `${fmt(100 * v, d)}%`
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)
const mul = (m: number[][], v: number[]) => m.map(r => dot(r, v))
const qform = (w: number[], m: number[][]) => dot(w, mul(m, w))
const covOf = (vol: number[], corr: number[][]) => corr.map((r, i) => r.map((c, j) => c * vol[i] * vol[j]))

/** Solve m x = b by Gaussian elimination with partial pivoting (small matrices only). */
function solve(m: number[][], b: number[]): number[] {
  const n = b.length
  const a = m.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r
    ;[a[c], a[p]] = [a[p], a[c]]
    for (let r = c + 1; r < n; r++) {
      const f = a[r][c] / a[c][c]
      for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k]
    }
  }
  const x: number[] = Array(n).fill(0)
  for (let r = n - 1; r >= 0; r--) x[r] = (a[r][n] - dot(a[r].slice(r + 1, n), x.slice(r + 1))) / a[r][r]
  return x
}

/** Lower triangular L with L Lᵀ = m. */
function chol(m: number[][]): number[][] {
  const n = m.length
  const L: number[][] = m.map(() => Array(n).fill(0))
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = m[i][j]
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k]
      L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j]
    }
  return L
}

/** Portfolio volatility of two assets against the weight in the first, for a chosen correlation. */
function TwoAsset() {
  const [rho, setRho] = useState(0.3)
  const [w, setW] = useState(0.5)
  const sa = 0.2
  const sb = 0.1
  const vol = (x: number) => Math.sqrt(Math.max(0, x * x * sa * sa + (1 - x) ** 2 * sb * sb + 2 * x * (1 - x) * rho * sa * sb))
  const raw = (sb * sb - rho * sa * sb) / (sa * sa + sb * sb - 2 * rho * sa * sb)
  const wmin = Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0
  return (
    <div className="widget">
      <Plot x={[0, 1]} y={[0, 0.22]} xLabel="weight in A (the rest in B)" yLabel="portfolio volatility">
        {s => (
          <>
            <Seg s={s} a={[0, sb]} b={[1, sa]} color="muted" dash="4 4" />
            <Curve s={s} f={vol} color="accent" width={2.5} />
            <Dot s={s} x={wmin} y={vol(wmin)} color="good" />
            <Dot s={s} x={w} y={vol(w)} color="blue" ring />
            <Label s={s} x={0} y={sb} color="muted">B 10%</Label>
            <Label s={s} x={1} y={sa} color="muted" anchor="end" dx={-6}>A 20%</Label>
          </>
        )}
      </Plot>
      <Slider label="correlation ρ" value={rho} min={-1} max={1} step={0.05} onChange={setRho} />
      <Slider label="weight in A" value={w} min={0} max={1} step={0.01} onChange={setW} />
      <Readout
        items={[
          ['your mix', pct(vol(w)), 'blue'],
          ['average of the two', pct(w * sa + (1 - w) * sb)],
          ['least risky mix', `${fmt(wmin)} in A`, 'good'],
          ['its volatility', pct(vol(wmin)), 'good'],
        ]}
      />
      <p className="caption">
        Asset A has 20% volatility and B has 10%. The dashed line is the weighted average of their volatilities, which is what you would get with no diversification. Move ρ
        and watch the curve sag below the line. The green dot is the least risky long-only mix: find where it goes at ρ = −1 and at ρ = +1.
      </p>
    </div>
  )
}

const ON = ['US stk', 'Intl stk', 'Bonds', 'Commod.']
const OVOL = [0.16, 0.18, 0.06, 0.2]
const OMU = [0.05, 0.05, 0.015, 0.03]
const OCORR = [
  [1, 0.8, 0.1, 0.3],
  [0.8, 1, 0.1, 0.3],
  [0.1, 0.1, 1, 0],
  [0.3, 0.3, 0, 1],
]
const OCOV = covOf(OVOL, OCORR)
const OL = chol(OCOV)
const TRUE_RAW = solve(OCOV, OMU)
const LAMBDA = TRUE_RAW.reduce((a, b) => a + b, 0)
const TRUE_W = TRUE_RAW.map(v => v / LAMBDA)
/** Five histories of 80 yearly returns each, drawn from the true means and covariance. */
const OSAMPLES: number[][][] = Array.from({ length: 5 }, (_, k) => {
  const g = gaussian(seeded(510 + k))
  return Array.from({ length: 80 }, () => {
    const z = OVOL.map(() => g())
    return OMU.map((m, i) => m + dot(OL[i], z))
  })
})
const sharpe = (w: number[]) => dot(w, OMU) / Math.sqrt(qform(w, OCOV))

/** The mean-variance optimiser fed means estimated from a sample, against the weights from the true means. */
function Optimiser() {
  const [years, setYears] = useState(10)
  const [k, setK] = useState(0)
  const est = useMemo(() => {
    const rows = OSAMPLES[k].slice(0, years)
    const mu = OMU.map((_, i) => rows.reduce((a, r) => a + r[i], 0) / years)
    return { mu, w: solve(OCOV, mu).map(v => v / LAMBDA) }
  }, [years, k])
  const ew = [0.25, 0.25, 0.25, 0.25]
  const lim = Math.ceil(Math.max(1, ...est.w.map(Math.abs), ...TRUE_W.map(Math.abs)) * 2) / 2 + 0.25
  return (
    <div className="widget">
      <div className="seg">
        {[10, 20, 40, 80].map(y => <button key={y} className={years === y ? 'on' : ''} onClick={() => setYears(y)}>{y} years</button>)}
      </div>
      <div className="seg">
        {[0, 1, 2, 3, 4].map(i => <button key={i} className={k === i ? 'on' : ''} onClick={() => setK(i)}>Sample {i + 1}</button>)}
      </div>
      <Plot x={[0, 4]} y={[-lim, lim]} yLabel="weight">
        {s => (
          <>
            <Seg s={s} a={[0, 0]} b={[4, 0]} color="muted" />
            {ON.map((name, i) => (
              <g key={name}>
                <rect x={s.x(i + 0.12)} width={s.w(0.36)} y={s.y(Math.max(0, TRUE_W[i]))} height={s.h(Math.abs(TRUE_W[i]))} fill="var(--muted)" opacity={0.55} />
                <rect x={s.x(i + 0.5)} width={s.w(0.36)} y={s.y(Math.max(0, est.w[i]))} height={s.h(Math.abs(est.w[i]))} fill={est.w[i] >= 0 ? 'var(--accent)' : 'var(--bad)'} opacity={0.85} />
                <Label s={s} x={i + 0.5} y={-lim} dx={0} dy={-4} anchor="middle" color="muted">{name}</Label>
              </g>
            ))}
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['true Sharpe, true optimum', fmt(sharpe(TRUE_W)), 'good'],
          ['true Sharpe, your estimate', fmt(sharpe(est.w)), sharpe(est.w) >= sharpe(ew) ? 'accent' : 'bad'],
          ['true Sharpe, equal weight', fmt(sharpe(ew))],
          ['weights: true / yours', `${TRUE_W.map(v => fmt(v, 1)).join(' ')} / ${est.w.map(v => fmt(v, 1)).join(' ')}`],
        ]}
      />
      <p className="caption">
        Grey bars are the mean-variance weights from the true expected returns; coloured bars use returns averaged over a made-up history (red is a short). Only the means are
        estimated; the covariance is the true one. Step through the five samples at 10 years, then at 80. Watch the two highly correlated stock markets.
      </p>
    </div>
  )
}

const RN = ['Stocks', 'Bonds', 'Gold']
const RVOL = [0.16, 0.06, 0.15]

/** Capital weights against risk shares for three assets, and the leverage needed to reach a 10% volatility budget. */
function RiskParity() {
  const [rho, setRho] = useState(-0.3)
  const [w, setW] = useState([0.6, 0.4, 0])
  const [mode, setMode] = useState('60/40')
  const corr = [
    [1, rho, 0.1],
    [rho, 1, 0.2],
    [0.1, 0.2, 1],
  ]
  const cov = covOf(RVOL, corr)
  const choose = (name: string) => {
    setMode(name)
    if (name === '60/40') setW([0.6, 0.4, 0])
    if (name === 'Equal capital') setW([1 / 3, 1 / 3, 1 / 3])
    if (name === 'Equal risk') {
      const x = [1 / 3, 1 / 3, 1 / 3]
      for (let it = 0; it < 300; it++)
        for (let i = 0; i < 3; i++) {
          const a = dot(cov[i], x) - cov[i][i] * x[i]
          x[i] = (-a + Math.sqrt(a * a + (4 * cov[i][i]) / 3)) / (2 * cov[i][i])
        }
      const t = x.reduce((p, q) => p + q, 0)
      setW(x.map(v => v / t))
    }
  }
  const sw = mul(cov, w)
  const vp2 = qform(w, cov)
  const share = w.map((x, i) => (x * sw[i]) / vp2)
  const vp = Math.sqrt(vp2)
  return (
    <div className="widget">
      <div className="seg">
        {['60/40', 'Equal capital', 'Equal risk'].map(n => <button key={n} className={mode === n ? 'on' : ''} onClick={() => choose(n)}>{n}</button>)}
      </div>
      <Plot x={[0, 3]} y={[-0.15, 1]} yLabel="weight / risk share">
        {s => (
          <>
            <Seg s={s} a={[0, 0]} b={[3, 0]} color="muted" />
            {RN.map((name, i) => (
              <g key={name}>
                <rect x={s.x(i + 0.12)} width={s.w(0.36)} y={s.y(Math.max(0, w[i]))} height={s.h(Math.abs(w[i]))} fill="var(--blue)" opacity={0.7} />
                <rect x={s.x(i + 0.52)} width={s.w(0.36)} y={s.y(Math.max(0, share[i]))} height={s.h(Math.abs(share[i]))} fill="var(--accent)" opacity={0.85} />
                <Label s={s} x={i + 0.5} y={-0.15} dx={0} dy={-4} anchor="middle" color="muted">{`${name} ${pct(RVOL[i], 0)}`}</Label>
              </g>
            ))}
          </>
        )}
      </Plot>
      <Slider label="stock-bond correlation" value={rho} min={-0.5} max={0.8} step={0.05} onChange={setRho} />
      <Readout
        items={[
          ['weights', w.map(x => pct(x, 0)).join(' / '), 'blue'],
          ['risk shares', share.map(x => pct(x, 0)).join(' / '), 'accent'],
          ['portfolio volatility', pct(vp)],
          ['leverage for 10%', `${fmt(0.1 / vp)}×`, 0.1 / vp > 1.5 ? 'bad' : undefined],
        ]}
      />
      <p className="caption">
        Blue bars are capital, yellow bars the share of portfolio variance each asset brings. Start with 60/40 and see how much of the risk is stocks. Press Equal risk, then
        move the stock-bond correlation: the weights stay put, but the risk shares and the volatility change. The last readout is the leverage a 10% risk budget would need.
      </p>
    </div>
  )
}

const KSIG = 0.15
const KX = 10

/** Growth rate against leverage for a strategy, when you size from an estimate of its Sharpe ratio that may be wrong. */
function Kelly() {
  const [sr, setSr] = useState(0.5)
  const [over, setOver] = useState(1)
  const [frac, setFrac] = useState(1)
  const mu = sr * KSIG
  const kTrue = mu / (KSIG * KSIG)
  const f = (frac * over * mu) / (KSIG * KSIG)
  const g = (x: number) => x * mu - (x * KSIG) ** 2 / 2
  const c = f / kTrue
  const halve = c >= 2 ? 1 : 0.5 ** (2 / c - 1)
  return (
    <div className="widget">
      <Plot x={[0, KX]} y={[-0.3, 0.2]} xLabel="leverage (× capital)" yLabel="growth a year (log)">
        {s => (
          <>
            <Seg s={s} a={[0, 0]} b={[KX, 0]} color="muted" />
            <Curve s={s} f={g} color="accent" width={2.5} />
            <Seg s={s} a={[kTrue, -0.3]} b={[kTrue, g(kTrue)]} color="good" dash="4 4" />
            <Label s={s} x={kTrue} y={g(kTrue)} color="good">true Kelly</Label>
            <Dot s={s} x={Math.min(f, KX)} y={Math.max(-0.3, g(f))} color={g(f) >= 0 ? 'blue' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="true Sharpe ratio" value={sr} min={0.2} max={0.6} step={0.05} onChange={setSr} />
      <Slider label="your estimate ÷ true" value={over} min={0.5} max={2.5} step={0.1} onChange={setOver} show={v => `${fmt(v, 1)}×`} />
      <Slider label="fraction of your Kelly" value={frac} min={0.1} max={1.5} step={0.05} onChange={setFrac} />
      <Readout
        items={[
          ['leverage you run', `${fmt(f)}×`, 'blue'],
          ['multiple of true Kelly', `${fmt(c)}×`, c > 1 ? 'bad' : undefined],
          ['growth / best possible', `${pct(g(f))} / ${pct(g(kTrue))}`, g(f) >= 0 ? 'good' : 'bad'],
          ['volatility', pct(f * KSIG, 0)],
          ['chance of ever halving', pct(halve, 0)],
        ]}
      />
      <p className="caption">
        A made-up strategy with 15% volatility and the true Sharpe ratio you set, held at constant leverage with no costs and no jumps. You size it from your estimate of the
        Sharpe ratio. Set the estimate to 2× the truth and the fraction to 1: the dot lands where growth is zero. Then try half Kelly and compare growth, volatility and the
        chance of ever losing half.
      </p>
    </div>
  )
}

export const portfolioWidgets: Record<string, ComponentType> = {
  'portfolio-twoasset': TwoAsset,
  'portfolio-optimiser': Optimiser,
  'portfolio-riskparity': RiskParity,
  'portfolio-kelly': Kelly,
}
