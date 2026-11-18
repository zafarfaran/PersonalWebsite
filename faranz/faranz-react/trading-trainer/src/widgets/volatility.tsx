import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/** The error function (Abramowitz and Stegun 7.1.26, good to about 1e-7). */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x < 0 ? -y : y
}
const ncdf = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
/** Black-Scholes call with no interest rate: T in years, s as a decimal. */
function call(S: number, K: number, T: number, s: number): number {
  if (s <= 0 || T <= 0) return Math.max(S - K, 0)
  const d1 = (Math.log(S / K) + (s * s * T) / 2) / (s * Math.sqrt(T))
  return S * ncdf(d1) - K * ncdf(d1 - s * Math.sqrt(T))
}
const straddle = (S: number, K: number, T: number, s: number) => 2 * call(S, K, T, s) - S + K
const pct = (v: number, d = 1) => `${fmt(v * 100, d)}%`

const DAYS = 60
const Z = (() => {
  const g = gaussian(seeded(11))
  return Array.from({ length: DAYS }, () => g())
})()

/** A made-up price path with a volatility you set, and the realised volatility of its last few days. */
function Realised() {
  const [vol, setVol] = useState(0.16)
  const [win, setWin] = useState(20)
  const [shock, setShock] = useState(false)
  const r = Z.map((z, i) => (shock && i === DAYS - 6 ? -0.07 : (z * vol) / Math.sqrt(252)))
  const prices: Pt[] = [[0, 100]]
  r.forEach((x, i) => prices.push([i + 1, prices[i][1] * Math.exp(x)]))
  const last = r.slice(-win)
  const mean = last.reduce((a, b) => a + b, 0) / win
  const sd = Math.sqrt(last.reduce((a, b) => a + (b - mean) ** 2, 0) / (win - 1))
  const ys = prices.map(p => p[1])
  const lo = Math.min(...ys) * 0.97
  const hi = Math.max(...ys) * 1.03
  return (
    <div className="widget">
      <div className="seg">
        <button className={shock ? '' : 'on'} onClick={() => setShock(false)}>Calm</button>
        <button className={shock ? 'on' : ''} onClick={() => setShock(true)}>One −7% day</button>
      </div>
      <Plot x={[0, DAYS]} y={[lo, hi]} xLabel="trading day" yLabel="price ($)">
        {s => (
          <>
            <rect x={s.x(DAYS - win)} y={s.y(hi)} width={s.w(win)} height={s.h(hi - lo)} fill="var(--accent)" opacity={0.1} />
            <Path s={s} pts={prices} color="text" width={1.8} />
            {shock && <Dot s={s} x={DAYS - 5} y={prices[DAYS - 5][1]} color="bad" />}
            <Label s={s} x={DAYS - win} y={hi} dy={14} color="accent">window</Label>
          </>
        )}
      </Plot>
      <Slider label="true volatility" value={vol} min={0.05} max={0.8} step={0.01} onChange={setVol} show={v => pct(v, 0)} />
      <Slider label="window (days)" value={win} min={10} max={60} step={5} onChange={setWin} />
      <Readout
        items={[
          ['typical day (vol ÷ √252)', pct(vol / Math.sqrt(252), 2)],
          ['daily st. dev. in window', pct(sd, 2)],
          ['realised vol (× √252)', pct(sd * Math.sqrt(252)), shock ? 'bad' : 'accent'],
        ]}
      />
      <p className="caption">
        The returns are drawn at the volatility you set, so the realised figure lands near it but not on it: a sample is never exact. Add the one −7% day and
        watch a single day lift the 20-day number far above the true level. Widen the window and the same day matters less. When a big day drops out of a
        window, the number falls that day, whatever the stock does.
      </p>
    </div>
  )
}

const T30 = 30 / 365

/** Implied volatility found by bisection: the model price against volatility, and the market price as a line. */
function Implied() {
  const [K, setK] = useState(100)
  const [price, setPrice] = useState(2)
  const [steps, setSteps] = useState(0)
  const f = (v: number) => call(100, K, T30, v)
  const intrinsic = Math.max(100 - K, 0)
  const valid = price > intrinsic + 1e-9 && price < 100
  let [lo, hi] = [0, 1]
  for (let i = 0; i < steps; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < price) lo = mid
    else hi = mid
  }
  let [a, b] = [0, 3]
  for (let i = 0; i < 60; i++) {
    const mid = (a + b) / 2
    if (f(mid) < price) a = mid
    else b = mid
  }
  const iv = (a + b) / 2
  return (
    <div className="widget">
      <div className="seg">
        {[90, 100, 110].map(k => <button key={k} className={k === K ? 'on' : ''} onClick={() => setK(k)}>strike {k}</button>)}
      </div>
      <Plot x={[0, 1]} y={[0, 16]} xLabel="volatility" yLabel="call price ($)">
        {s => (
          <>
            <Curve s={s} f={f} color="text" />
            <Path s={s} pts={[[0, price], [1, price]]} color="blue" dash="5 4" width={1.5} />
            <Path s={s} pts={[[lo, 0], [lo, 16]]} color="muted" dash="3 3" width={1} />
            <Path s={s} pts={[[hi, 0], [hi, 16]]} color="muted" dash="3 3" width={1} />
            {valid && iv < 1 && <Dot s={s} x={iv} y={price} color="accent" />}
            <Label s={s} x={0.02} y={price} color="blue">market price</Label>
          </>
        )}
      </Plot>
      <Slider label="market price" value={price} min={0.25} max={14} step={0.25} onChange={setPrice} show={v => `$${fmt(v)}`} />
      <Slider label="bisection steps" value={steps} min={0} max={12} step={1} onChange={setSteps} />
      <Readout
        items={[
          ['intrinsic value', `$${fmt(intrinsic)}`],
          ['implied volatility', valid ? pct(iv) : 'none: price below intrinsic', valid ? 'accent' : 'bad'],
          ['bracket after steps', `${pct(lo)} to ${pct(hi)}`],
        ]}
      />
      <p className="caption">
        A 30-day call on a $100 stock. The curve is the model price at each volatility; the implied volatility is where it meets the market price. Each bisection
        step halves the bracket between the dashed lines. Pick strike 90 and a price under $10: no volatility gives a price below intrinsic value, so there is no IV.
      </p>
    </div>
  )
}

/** The range the market prices: a bell curve of the price at expiry with the one standard deviation band. */
function Move() {
  const [iv, setIv] = useState(0.2)
  const [days, setDays] = useState(30)
  const S = 100
  const m = S * iv * Math.sqrt(days / 365)
  const bell = (x: number) => Math.exp(-0.5 * ((x - S) / m) ** 2)
  const band: Pt[] = Array.from({ length: 41 }, (_, i) => S - m + (2 * m * i) / 40).map(x => [x, bell(x)] as Pt)
  return (
    <div className="widget">
      <Plot x={[60, 140]} y={[0, 1.1]} xLabel="price at expiry ($)" yLabel="how likely (relative)">
        {s => (
          <>
            <path d={`M${s.x(S - m)} ${s.y(0)}` + band.map(p => `L${s.x(p[0])} ${s.y(p[1])}`).join('') + `L${s.x(S + m)} ${s.y(0)}Z`} fill="var(--accent)" opacity={0.25} />
            <Curve s={s} f={bell} color="text" n={200} />
            <Path s={s} pts={[[S, 0], [S, 1]]} color="muted" dash="3 3" width={1} />
            <Label s={s} x={S} y={0.5} anchor="middle" dx={0} color="accent">68%</Label>
          </>
        )}
      </Plot>
      <Slider label="implied volatility" value={iv} min={0.05} max={0.8} step={0.01} onChange={setIv} show={v => pct(v, 0)} />
      <Slider label="calendar days" value={days} min={1} max={120} step={1} onChange={setDays} />
      <Readout
        items={[
          ['1σ move', `±$${fmt(m)}`, 'accent'],
          ['1σ range', `${fmt(S - m)} to ${fmt(S + m)}`],
          ['2σ range (about 95%)', `${fmt(S - 2 * m)} to ${fmt(S + 2 * m)}`],
          ['ATM straddle ≈ 0.8 × 1σ', `$${fmt(0.8 * m)}`],
        ]}
      />
      <p className="caption">
        A $100 stock under a normal model. The shaded band is one standard deviation each side: about two outcomes in three land inside it. Multiply the days by
        four and the band only doubles, because the move grows with the square root of time. Real prices have fatter tails than this curve.
      </p>
    </div>
  )
}

/** A long straddle bought before earnings and valued the morning after, when implied volatility has collapsed. */
function Crush() {
  const [before, setBefore] = useState(0.7)
  const [after, setAfter] = useState(0.3)
  const [next, setNext] = useState(104)
  const cost = straddle(100, 100, 7 / 365, before)
  const value = (x: number) => straddle(x, 100, 6 / 365, after)
  let up = NaN
  for (let x = 100; x <= 160; x += 0.01) {
    if (value(x) >= cost) {
      up = x
      break
    }
  }
  const pnl = (value(next) - cost) * 100
  return (
    <div className="widget">
      <Plot x={[80, 120]} y={[0, 22]} xLabel="stock price the morning after ($)" yLabel="straddle ($ per share)">
        {s => (
          <>
            <Path s={s} pts={[[80, cost], [120, cost]]} color="bad" dash="5 4" width={1.5} />
            <Curve s={s} f={value} color="accent" />
            <Curve s={s} f={x => Math.abs(x - 100)} color="muted" dash="3 3" width={1} />
            <Dot s={s} x={next} y={value(next)} color={pnl >= 0 ? 'good' : 'bad'} />
            <Label s={s} x={81} y={cost} color="bad">paid</Label>
          </>
        )}
      </Plot>
      <Slider label="IV before the report" value={before} min={0.2} max={1.2} step={0.05} onChange={setBefore} show={v => pct(v, 0)} />
      <Slider label="IV the morning after" value={after} min={0.1} max={0.8} step={0.05} onChange={setAfter} show={v => pct(v, 0)} />
      <Slider label="stock the morning after" value={next} min={80} max={120} step={0.5} onChange={setNext} show={v => `$${fmt(v, 1)}`} />
      <Readout
        items={[
          ['straddle cost', `$${fmt(cost)}`],
          ['implied move', pct(cost / 100)],
          ['value after', `$${fmt(value(next))}`],
          ['P&L per straddle', `${pnl < 0 ? '−' : ''}$${fmt(Math.abs(pnl), 0)}`, pnl >= 0 ? 'good' : 'bad'],
          ['break-even move up', Number.isFinite(up) ? pct((up - 100) / 100) : 'more than 60%'],
        ]}
      />
      <p className="caption">
        A $100 stock reports tonight. You buy the 7-day at-the-money straddle at the IV before the report and value it the next morning at the IV after. Move the
        stock: a 4% move with IV falling from 70% to 30% still loses. Set both IVs equal and the break-even move shrinks: the crush, not the move, is what hurts.
      </p>
    </div>
  )
}

export const volatilityWidgets: Record<string, ComponentType> = {
  'volatility-realised': Realised,
  'volatility-implied': Implied,
  'volatility-move': Move,
  'volatility-crush': Crush,
}
