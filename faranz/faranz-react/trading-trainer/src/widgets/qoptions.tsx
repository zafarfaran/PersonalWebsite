import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/** The error function, by the Abramowitz and Stegun approximation (good to about 1e-7). */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const N = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
const d1 = (S: number, K: number, T: number, r: number, s: number) => (Math.log(S / K) + (r + (s * s) / 2) * T) / (s * Math.sqrt(T))
const bsCall = (S: number, K: number, T: number, r: number, s: number) => {
  const a = d1(S, K, T, r, s)
  return S * N(a) - K * Math.exp(-r * T) * N(a - s * Math.sqrt(T))
}
const bsPut = (S: number, K: number, T: number, r: number, s: number) => bsCall(S, K, T, r, s) - S + K * Math.exp(-r * T)
const bsVega = (S: number, K: number, T: number, r: number, s: number) => {
  const a = d1(S, K, T, r, s)
  return (S * Math.sqrt(T) * Math.exp((-a * a) / 2)) / Math.sqrt(2 * Math.PI)
}

/** A CRR tree for a call or a put, with early exercise if asked. */
function crr(S: number, K: number, T: number, r: number, s: number, n: number, put: boolean, american: boolean): number {
  const dt = T / n
  const u = Math.exp(s * Math.sqrt(dt))
  const d = 1 / u
  const q = (Math.exp(r * dt) - d) / (u - d)
  const disc = Math.exp(-r * dt)
  const pay = (x: number) => Math.max(put ? K - x : x - K, 0)
  let V = Array.from({ length: n + 1 }, (_, j) => pay(S * u ** j * d ** (n - j)))
  for (let i = n - 1; i >= 0; i--) {
    V = Array.from({ length: i + 1 }, (_, j) => {
      const hold = disc * (q * V[j + 1] + (1 - q) * V[j])
      return american ? Math.max(hold, pay(S * u ** j * d ** (i - j))) : hold
    })
  }
  return V[0]
}

const TREE_MAX = 60
/** Tree price against the number of steps, beside Black-Scholes. */
function Tree() {
  const [kind, setKind] = useState<'call' | 'put' | 'amput'>('call')
  const [n, setN] = useState(10)
  const put = kind !== 'call'
  const prices = useMemo(() => Array.from({ length: TREE_MAX }, (_, i) => crr(100, 100, 1, 0.05, 0.2, i + 1, put, kind === 'amput')), [kind, put])
  const bs = put ? bsPut(100, 100, 1, 0.05, 0.2) : bsCall(100, 100, 1, 0.05, 0.2)
  const euTree = crr(100, 100, 1, 0.05, 0.2, n, put, false)
  const lo = Math.min(bs, ...prices) - 0.3
  const hi = Math.max(bs, ...prices) + 0.3
  return (
    <div className="widget">
      <div className="seg">
        <button className={kind === 'call' ? 'on' : ''} onClick={() => setKind('call')}>European call</button>
        <button className={kind === 'put' ? 'on' : ''} onClick={() => setKind('put')}>European put</button>
        <button className={kind === 'amput' ? 'on' : ''} onClick={() => setKind('amput')}>American put</button>
      </div>
      <Plot x={[0, TREE_MAX + 1]} y={[lo, hi]} xLabel="steps in the tree" yLabel="price ($)">
        {s => (
          <>
            <Seg s={s} a={[0, bs]} b={[TREE_MAX + 1, bs]} color="blue" dash="5 4" width={1.5} />
            <Path s={s} pts={prices.map((p, i) => [i + 1, p] as Pt)} color="muted" width={1} />
            {prices.map((p, i) => <Dot key={i} s={s} x={i + 1} y={p} r={2} color="muted" />)}
            <Dot s={s} x={n} y={prices[n - 1]} r={5} color="accent" />
          </>
        )}
      </Plot>
      <Slider label="steps N" value={n} min={1} max={TREE_MAX} step={1} onChange={setN} />
      <Readout
        items={[
          ['tree price', fmt(prices[n - 1], 3), 'accent'],
          ['Black-Scholes (European)', fmt(bs, 3), 'blue'],
          [kind === 'amput' ? 'early exercise value' : 'tree − BS', fmt(kind === 'amput' ? prices[n - 1] - euTree : prices[n - 1] - bs, 3)],
          ['average of N and N+1', n < TREE_MAX ? fmt((prices[n - 1] + prices[n]) / 2, 3) : '–'],
        ]}
      />
      <p className="caption">
        A one-year option at the money: S = K = $100, r = 5%, σ = 20%. Step N one at a time and watch the European prices jump above and below the dashed Black-Scholes line,
        with the jumps shrinking. Switch to the American put: it settles about 50 cents above the European line, the value of being able to take the strike early.
      </p>
    </div>
  )
}

const MC_MAX = 64000
const MC_Z: number[] = (() => {
  const g = gaussian(seeded(77))
  return Array.from({ length: MC_MAX }, () => g())
})()
const MC_N = [250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]
/** Standard deviation of one plain discounted payoff, from all the draws. */
const PLAIN_SD = (() => {
  const y = MC_Z.map(z => Math.exp(-0.05) * Math.max(100 * Math.exp(0.05 - 0.02 + 0.2 * z) - 100, 0))
  const m = y.reduce((a, b) => a + b, 0) / y.length
  return Math.sqrt(y.reduce((a, b) => a + (b - m) ** 2, 0) / (y.length - 1))
})()

/** Running Monte Carlo estimates with their 95% band, plain or with variance reduction. */
function MonteCarlo() {
  const [method, setMethod] = useState<'plain' | 'anti' | 'cv'>('plain')
  const [idx, setIdx] = useState(2)
  const S0 = 100
  const K = 100
  const r = 0.05
  const sig = 0.2
  const disc = Math.exp(-r)
  const bs = bsCall(S0, K, 1, r, sig)
  const st = (z: number) => S0 * Math.exp(r - 0.5 * sig * sig + sig * z)
  const curve = useMemo(() => {
    const out: { n: number; est: number; se: number }[] = []
    let sy = 0
    let syy = 0
    let sx = 0
    let sxx = 0
    let sxy = 0
    let m = 0
    const marks = new Set(Array.from({ length: 41 }, (_, i) => Math.round(250 * 2 ** ((i * 8) / 40))))
    for (let i = 0; i < MC_MAX; i++) {
      const z = MC_Z[i]
      let y: number
      let x: number
      if (method === 'anti') {
        if (i % 2 === 1) continue
        y = 0.5 * disc * (Math.max(st(z) - K, 0) + Math.max(st(-z) - K, 0))
        x = 0
      } else {
        y = disc * Math.max(st(z) - K, 0)
        x = disc * st(z)
      }
      m++
      sy += y
      syy += y * y
      sx += x
      sxx += x * x
      sxy += x * y
      const paths = method === 'anti' ? 2 * m : m
      if (!marks.has(paths) && paths !== MC_MAX && !MC_N.includes(paths)) continue
      const my = sy / m
      const vy = (syy - m * my * my) / (m - 1)
      if (method === 'cv') {
        const mx = sx / m
        const vx = (sxx - m * mx * mx) / (m - 1)
        const cxy = (sxy - m * mx * my) / (m - 1)
        const beta = cxy / vx
        out.push({ n: paths, est: my - beta * (mx - S0), se: Math.sqrt(Math.max(vy - (cxy * cxy) / vx, 0) / m) })
      } else out.push({ n: paths, est: my, se: Math.sqrt(vy / m) })
    }
    return out
  }, [method, disc])
  const nSel = MC_N[idx]
  const at = curve.find(c => c.n === nSel) ?? curve[curve.length - 1]
  const plainSe = PLAIN_SD / Math.sqrt(nSel)
  const lx = (n: number) => Math.log10(n)
  return (
    <div className="widget">
      <div className="seg">
        <button className={method === 'plain' ? 'on' : ''} onClick={() => setMethod('plain')}>Plain</button>
        <button className={method === 'anti' ? 'on' : ''} onClick={() => setMethod('anti')}>Antithetic</button>
        <button className={method === 'cv' ? 'on' : ''} onClick={() => setMethod('cv')}>Control variate</button>
      </div>
      <Plot x={[lx(250), lx(MC_MAX)]} y={[8.5, 12.5]} xLabel="log10 of the number of paths" yLabel="estimated price ($)">
        {s => (
          <>
            <Path s={s} pts={curve.map(c => [lx(c.n), c.est + 1.96 * c.se] as Pt)} color="accent" width={1} dash="3 3" />
            <Path s={s} pts={curve.map(c => [lx(c.n), c.est - 1.96 * c.se] as Pt)} color="accent" width={1} dash="3 3" />
            <Path s={s} pts={curve.map(c => [lx(c.n), c.est] as Pt)} color="accent" width={2} />
            <Seg s={s} a={[lx(250), bs]} b={[lx(MC_MAX), bs]} color="blue" dash="5 4" />
            <Seg s={s} a={[lx(nSel), at.est - 1.96 * at.se]} b={[lx(nSel), at.est + 1.96 * at.se]} color="text" width={2} />
            <Dot s={s} x={lx(nSel)} y={at.est} color="text" />
          </>
        )}
      </Plot>
      <Slider label="paths" value={idx} min={0} max={MC_N.length - 1} step={1} onChange={setIdx} show={v => MC_N[v].toLocaleString()} />
      <Readout
        items={[
          ['estimate', fmt(at.est, 3), 'accent'],
          ['Black-Scholes', fmt(bs, 3), 'blue'],
          ['95% band width', fmt(2 * 1.96 * at.se, 3)],
          ['plain paths for same error', Math.round(nSel * (plainSe / at.se) ** 2).toLocaleString()],
        ]}
      />
      <p className="caption">
        A one-year at-the-money call priced from up to 64,000 made-up normal draws. The dashed lines are the 95% band as paths are added. Move from 1,000 to 16,000 paths and
        the band narrows to a quarter. Then switch to antithetic or control variates at the same number of paths and read how many plain paths the same accuracy would cost.
      </p>
    </div>
  )
}

const CASES = {
  atm: { label: 'At the money, 3 months', K: 100, T: 0.25, truth: 0.25 },
  otm: { label: 'Strike 115, 2 weeks', K: 115, T: 0.04, truth: 0.5 },
}

/** Newton's method on the Black-Scholes price curve, with tangent steps drawn. */
function Newton() {
  const [which, setWhich] = useState<'atm' | 'otm'>('atm')
  const [start, setStart] = useState(0.2)
  const c = CASES[which]
  const f = (s: number) => bsCall(100, c.K, c.T, 0, s)
  const target = f(c.truth)
  const steps: number[] = [start]
  let note = ''
  for (let i = 0; i < 8; i++) {
    const s = steps[steps.length - 1]
    const next = s - (f(s) - target) / bsVega(100, c.K, c.T, 0, s)
    steps.push(next)
    if (!Number.isFinite(next) || next <= 0 || next > 3) {
      note = next <= 0 ? 'went below zero' : 'left the range'
      break
    }
    if (Math.abs(next - s) < 1e-7) break
  }
  const last = steps[steps.length - 1]
  const yMax = f(1.5) * 1.1
  const inView = (s: number) => s > 0 && s <= 1.5
  return (
    <div className="widget">
      <div className="seg">
        {(Object.keys(CASES) as ('atm' | 'otm')[]).map(k => (
          <button key={k} className={which === k ? 'on' : ''} onClick={() => setWhich(k)}>{CASES[k].label}</button>
        ))}
      </div>
      <Plot x={[0, 1.5]} y={[0, yMax]} xLabel="volatility σ" yLabel="call price ($)">
        {s => (
          <>
            <Curve s={s} from={0.01} f={f} color="accent" width={2} />
            <Seg s={s} a={[0, target]} b={[1.5, target]} color="blue" dash="5 4" />
            {steps.slice(0, -1).map((v, i) =>
              inView(v) ? (
                <g key={i}>
                  <Seg s={s} a={[v, f(v)]} b={[Math.min(Math.max(steps[i + 1], 0), 1.5), f(v) + bsVega(100, c.K, c.T, 0, v) * (Math.min(Math.max(steps[i + 1], 0), 1.5) - v)]} color="bad" width={1.5} />
                  <Dot s={s} x={v} y={f(v)} r={4} color={i === 0 ? 'text' : 'bad'} />
                </g>
              ) : null,
            )}
          </>
        )}
      </Plot>
      <Slider label="starting σ" value={start} min={0.05} max={1.2} step={0.05} onChange={setStart} />
      <Readout
        items={[
          ['market price', `$${fmt(target, 3)}`, 'blue'],
          ['first steps', steps.slice(1, 4).map(v => (Math.abs(v) > 100 ? v.toExponential(1) : fmt(v, 3))).join(', ')],
          ['result', note ? note : `${fmt(last, 4)} after ${steps.length - 1} steps`, note ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        The solid curve is the call price against σ, the dashed line the market price; each red segment is one Newton tangent. At the money, any start converges in two or
        three steps. Choose the 2-week option struck at 115 and start at 20%: the curve is nearly flat there, so the first tangent shoots far past the answer. A bracket would catch it.
      </p>
    </div>
  )
}

const H_PATHS = 300
const H_FINE = 100
const H_Z: number[][] = (() => {
  const g = gaussian(seeded(91))
  return Array.from({ length: H_PATHS }, () => Array.from({ length: H_FINE }, () => g()))
})()
const H_STEPS = [5, 10, 20, 25, 50, 100]

/** Final P&L of a short call, delta hedged at 20% implied, over 300 made-up paths. */
function Hedge() {
  const [real, setReal] = useState(0.2)
  const [hi, setHi] = useState(2)
  const n = H_STEPS[hi]
  const K = 100
  const T = 0.25
  const iv = 0.2
  const pnl = useMemo(() => {
    const k = H_FINE / n
    const dt = T / n
    return H_Z.map(zs => {
      let S = 100
      let sh = N(d1(S, K, T, 0, iv))
      let cash = bsCall(S, K, T, 0, iv) - sh * S
      for (let i = 0; i < n; i++) {
        let z = 0
        for (let j = 0; j < k; j++) z += zs[i * k + j]
        S *= Math.exp(-0.5 * real * real * dt + real * Math.sqrt(dt) * (z / Math.sqrt(k)))
        if (i < n - 1) {
          const nd = N(d1(S, K, T - (i + 1) * dt, 0, iv))
          cash -= (nd - sh) * S
          sh = nd
        }
      }
      return cash + sh * S - Math.max(S - K, 0)
    })
  }, [real, n])
  const w = 0.25
  const bins = Array.from({ length: 40 }, (_, i) => -5 + i * w)
  const counts = bins.map(b => pnl.filter(v => v >= b && v < b + w).length)
  const m = pnl.reduce((a, b) => a + b, 0) / H_PATHS
  const sd = Math.sqrt(pnl.reduce((a, b) => a + (b - m) ** 2, 0) / H_PATHS)
  return (
    <div className="widget">
      <Plot x={[-5, 5]} y={[0, Math.max(...counts) * 1.15 + 1]} xLabel="final P&L per share ($)" yLabel="paths">
        {s => (
          <>
            {bins.map((b, i) => counts[i] > 0 && (
              <rect key={b} x={s.x(b)} width={s.w(w) - 1} y={s.y(counts[i])} height={s.h(counts[i])} fill={b + w / 2 >= 0 ? 'var(--good)' : 'var(--bad)'} opacity={0.6} />
            ))}
            <Seg s={s} a={[m, 0]} b={[m, Math.max(...counts) * 1.15]} color="accent" width={2} />
          </>
        )}
      </Plot>
      <Slider label="realised volatility" value={real} min={0.1} max={0.3} step={0.01} onChange={setReal} show={v => `${Math.round(v * 100)}%`} />
      <Slider label="hedges over 3 months" value={hi} min={0} max={H_STEPS.length - 1} step={1} onChange={setHi} show={v => `${H_STEPS[v]}`} />
      <Readout
        items={[
          ['mean P&L', `$${fmt(m)}`, m >= 0 ? 'good' : 'bad'],
          ['spread (sd)', `$${fmt(sd)}`],
          ['paths losing', `${Math.round((100 * pnl.filter(v => v < 0).length) / H_PATHS)}%`],
          ['premium received', `$${fmt(bsCall(100, K, T, 0, iv))}`],
        ]}
      />
      <p className="caption">
        You sold a 3-month at-the-money call at 20% implied and delta hedge it, with no costs, on 300 made-up paths. Move realised volatility below and above 20%: the centre
        shifts by about vega × the difference. Then change the number of hedges: four times as many halve the spread, but never remove it.
      </p>
    </div>
  )
}

export const qoptionsWidgets: Record<string, ComponentType> = {
  'qoptions-tree': Tree,
  'qoptions-mc': MonteCarlo,
  'qoptions-newton': Newton,
  'qoptions-hedge': Hedge,
}
