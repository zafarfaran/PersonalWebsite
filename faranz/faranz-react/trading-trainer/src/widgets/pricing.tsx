import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

/** The error function (Abramowitz and Stegun 7.1.26, accurate to about 1e-7). */
function erf(x: number): number {
  const s = Math.sign(x)
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}
const N = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
const pdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)

/** Black-Scholes with no rates or dividends. days: calendar days left; vol: a decimal. */
function bs(S: number, K: number, days: number, vol: number, call = true) {
  const T = days / 365
  if (T <= 0 || vol <= 0) {
    const v = call ? Math.max(S - K, 0) : Math.max(K - S, 0)
    return { price: v, delta: call ? (S > K ? 1 : 0) : S < K ? -1 : 0, gamma: 0, vega: 0 }
  }
  const sd = vol * Math.sqrt(T)
  const d1 = (Math.log(S / K) + (vol * vol * T) / 2) / sd
  const d2 = d1 - sd
  const price = call ? S * N(d1) - K * N(d2) : K * N(-d2) - S * N(-d1)
  return { price, delta: call ? N(d1) : N(d1) - 1, gamma: pdf(d1) / (S * sd), vega: (S * pdf(d1) * Math.sqrt(T)) / 100 }
}
const theta = (S: number, K: number, days: number, vol: number, call = true) => bs(S, K, Math.max(days - 1, 0), vol, call).price - bs(S, K, days, vol, call).price
const pct = (v: number) => `${Math.round(v * 100)}%`

/** Option price against stock price: intrinsic value and the extrinsic value on top. */
function Value() {
  const [call, setCall] = useState(true)
  const [days, setDays] = useState(30)
  const [vol, setVol] = useState(0.2)
  const [S, setS] = useState(100)
  const K = 100
  const o = bs(S, K, days, vol, call)
  const intrinsic = call ? Math.max(S - K, 0) : Math.max(K - S, 0)
  return (
    <div className="widget">
      <div className="seg">
        <button className={call ? 'on' : ''} onClick={() => setCall(true)}>100 call</button>
        <button className={call ? '' : 'on'} onClick={() => setCall(false)}>100 put</button>
      </div>
      <Plot x={[80, 120]} y={[0, 22]} xLabel="stock price" yLabel="option price" onDrag={x => setS(Math.round(x))}>
        {s => (
          <>
            <Curve s={s} f={x => (call ? Math.max(x - K, 0) : Math.max(K - x, 0))} color="muted" width={1.5} dash="5 4" />
            <Curve s={s} f={x => bs(x, K, days, vol, call).price} color="accent" />
            <Seg s={s} a={[S, intrinsic]} b={[S, o.price]} color="good" width={4} opacity={0.7} />
            <Dot s={s} x={S} y={o.price} />
            <Label s={s} x={S} y={o.price}>{fmt(o.price)}</Label>
          </>
        )}
      </Plot>
      <Slider label="days to expiry" value={days} min={0} max={120} step={1} onChange={setDays} />
      <Slider label="volatility" value={vol} min={0.05} max={0.8} step={0.01} onChange={setVol} show={pct} />
      <Readout items={[['stock', fmt(S, 0)], ['option', fmt(o.price)], ['intrinsic', fmt(intrinsic), 'muted'], ['extrinsic', fmt(o.price - intrinsic), 'good']]} />
      <p className="caption">
        Drag across the chart to choose the stock price. The dashed line is the value at expiry; the yellow curve is the value today, and the green bar between them is the{' '}
        <b>extrinsic value</b>, what you pay for the chance of a bigger move. It is tallest at the strike. Add time or volatility and it grows; set days to 0 and it is gone.
      </p>
    </div>
  )
}

/** Delta against stock price, and how the curve steepens as expiry nears. */
function Delta() {
  const [call, setCall] = useState(true)
  const [days, setDays] = useState(30)
  const [vol, setVol] = useState(0.2)
  const [S, setS] = useState(100)
  const K = 100
  const o = bs(S, K, days, vol, call)
  return (
    <div className="widget">
      <div className="seg">
        <button className={call ? 'on' : ''} onClick={() => setCall(true)}>call</button>
        <button className={call ? '' : 'on'} onClick={() => setCall(false)}>put</button>
      </div>
      <Plot x={[85, 115]} y={call ? [0, 1] : [-1, 0]} xLabel="stock price" yLabel="delta" onDrag={x => setS(Math.round(x * 2) / 2)}>
        {s => (
          <>
            <Curve s={s} f={x => bs(x, K, days, vol, call).delta} color="accent" n={200} />
            <Curve s={s} f={x => o.delta + o.gamma * (x - S)} from={S - 3} to={S + 3} color="blue" width={1.5} dash="5 4" />
            <Dot s={s} x={S} y={o.delta} />
          </>
        )}
      </Plot>
      <Slider label="days to expiry" value={days} min={1} max={90} step={1} onChange={setDays} />
      <Slider label="volatility" value={vol} min={0.05} max={0.8} step={0.01} onChange={setVol} show={pct} />
      <Readout items={[['stock', fmt(S, 1)], ['delta', fmt(o.delta), 'accent'], ['gamma', fmt(o.gamma, 3), 'blue'], ['price', fmt(o.price)]]} />
      <p className="caption">
        The strike is 100. Drag to move the stock. <b>Delta</b> is the height of the curve; <b>gamma</b> is its slope (the blue dashes). Slide the days down to 1 and the curve
        becomes a step: near the strike a small move swings delta from near 0 to near 1. That is gamma, and it is why options about to expire are so jumpy.
      </p>
    </div>
  )
}

/** Option value against days left: decay is slow at first and fast at the end. */
function Decay() {
  const [dist, setDist] = useState(5)
  const [vol, setVol] = useState(0.2)
  const [day, setDay] = useState(30)
  const S = 100
  const atm = (d: number) => bs(S, S, d, vol).price
  const otm = (d: number) => bs(S, S + dist, d, vol).price
  return (
    <div className="widget">
      <Plot x={[0, 60]} y={[0, Math.max(4, atm(60) * 1.1)]} xLabel="days left to expiry" yLabel="price" onDrag={x => setDay(Math.max(1, Math.round(x)))}>
        {s => (
          <>
            <Curve s={s} f={atm} color="accent" from={0} to={60} n={240} />
            <Curve s={s} f={otm} color="blue" from={0} to={60} n={240} />
            <Dot s={s} x={day} y={atm(day)} />
            <Dot s={s} x={day} y={otm(day)} color="blue" />
            <Label s={s} x={50} y={atm(50)} dy={-10}>100 call</Label>
            <Label s={s} x={50} y={otm(50)} color="blue" dy={14}>{100 + dist} call</Label>
          </>
        )}
      </Plot>
      <Slider label="OTM strike above 100" value={dist} min={1} max={15} step={1} onChange={setDist} show={v => `+${v}`} />
      <Slider label="volatility" value={vol} min={0.05} max={0.6} step={0.01} onChange={setVol} show={pct} />
      <Slider label="days left" value={day} min={1} max={60} step={1} onChange={setDay} />
      <Readout
        items={[
          ['100 call', fmt(atm(day)), 'accent'],
          ['100 theta / day', fmt(theta(S, S, day, vol), 3), 'bad'],
          [`${100 + dist} call`, fmt(otm(day)), 'blue'],
          [`${100 + dist} theta / day`, fmt(theta(S, S + dist, day, vol), 3), 'bad'],
        ]}
      />
      <p className="caption">
        The stock stays at 100 the whole time; only the calendar moves. Read the chart from right to left, as time passes. The at-the-money call keeps much of its value until the
        last week and then falls fast. The out-of-the-money call loses most of its value earlier. Theta here is the loss from one more day passing.
      </p>
    </div>
  )
}

/** The Greek estimate of P&L against full repricing. */
function Estimate() {
  const [move, setMove] = useState(2)
  const [passed, setPassed] = useState(1)
  const [dIv, setDIv] = useState(-1)
  const [days, setDays] = useState(30)
  const K = 100
  const S = 100
  const vol = 0.2
  const o = bs(S, K, days, vol)
  const th = theta(S, K, days, vol)
  const est = (m: number) => o.delta * m + 0.5 * o.gamma * m * m + th * passed + o.vega * dIv
  const real = (m: number) => bs(S + m, K, Math.max(days - passed, 0), Math.max(vol + dIv / 100, 0.01)).price - o.price
  return (
    <div className="widget">
      <Plot x={[-10, 10]} y={[-4, 10]} xLabel="stock move ($)" yLabel="P&L per share" onDrag={x => setMove(Math.round(x * 2) / 2)}>
        {s => (
          <>
            <Curve s={s} f={real} color="accent" />
            <Curve s={s} f={est} color="blue" dash="5 4" />
            <Dot s={s} x={move} y={real(move)} />
            <Dot s={s} x={move} y={est(move)} color="blue" ring />
          </>
        )}
      </Plot>
      <Slider label="days that pass" value={passed} min={0} max={Math.min(10, days)} step={1} onChange={setPassed} />
      <Slider label="change in IV (points)" value={dIv} min={-10} max={10} step={1} onChange={setDIv} />
      <Slider label="days to expiry at the start" value={days} min={2} max={60} step={1} onChange={v => { setDays(v); setPassed(Math.min(passed, v)) }} />
      <Readout
        items={[
          ['delta part', fmt(o.delta * move)],
          ['gamma part', fmt(0.5 * o.gamma * move * move)],
          ['theta part', fmt(th * passed)],
          ['vega part', fmt(o.vega * dIv)],
          ['estimate', fmt(est(move)), 'blue'],
          ['repriced', fmt(real(move)), 'accent'],
        ]}
      />
      <p className="caption">
        A 100 call with the stock at 100 and IV at 20%. Drag to choose the move. The blue dashes add up delta, gamma, theta and vega; the yellow curve prices the option again
        from scratch. For a move of a dollar or two over a day they agree closely. Push the move to the edges, or the expiry close, and they part: the Greeks themselves change.
      </p>
    </div>
  )
}

export const pricingWidgets: Record<string, ComponentType> = {
  'pricing-value': Value,
  'pricing-delta': Delta,
  'pricing-decay': Decay,
  'pricing-estimate': Estimate,
}
