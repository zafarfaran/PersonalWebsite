import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, seeded } from '../components/Plot'

const cents = (v: number) => Math.round(v * 100) / 100
const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`
const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`

/** From account, risk and stop to a number of contracts. */
function Sizer() {
  const [account, setAccount] = useState(10000)
  const [riskPct, setRiskPct] = useState(1)
  const [entry, setEntry] = useState(2)
  const [stop, setStop] = useState(0.5)
  const d = Math.min(stop, entry)
  const R = cents((account * riskPct) / 100)
  const per = (dist: number) => cents(dist * 100)
  const size = (dist: number) => Math.floor(R / per(dist))
  const n = size(d)
  const top = Math.max(6, Math.ceil(R / 25) + 1)
  return (
    <div className="widget">
      <Plot x={[0.1, 4]} y={[0, top]} xLabel="stop distance ($ of premium per share)" yLabel="contracts">
        {s => (
          <>
            <Curve s={s} f={size} n={390} color="blue" />
            <Seg s={s} a={[d, 0]} b={[d, n]} color="muted" dash="3 3" />
            <Dot s={s} x={d} y={n} color={n === 0 ? 'bad' : 'accent'} />
            <Label s={s} x={d} y={n} color={n === 0 ? 'bad' : 'accent'}>{n} contracts</Label>
          </>
        )}
      </Plot>
      <Slider label="account" value={account} min={2000} max={50000} step={1000} onChange={setAccount} show={money} />
      <Slider label="risk per trade" value={riskPct} min={0.25} max={3} step={0.25} onChange={setRiskPct} show={v => `${v}%`} />
      <Slider label="option price" value={entry} min={0.5} max={6} step={0.1} onChange={setEntry} show={v => `$${v.toFixed(2)}`} />
      <Slider label="stop below entry" value={d} min={0.1} max={entry} step={0.05} onChange={setStop} show={v => `$${v.toFixed(2)}`} />
      <Readout
        items={[
          ['R', money(R)],
          ['loss per contract', `$${per(d).toFixed(0)}`],
          ['contracts', n, n === 0 ? 'bad' : 'good'],
          ['risk taken', money(n * per(d))],
          ['if premium goes to 0', money(n * entry * 100), 'bad'],
        ]}
      />
      <p className="caption">
        R is fixed by the account and the risk fraction. Move the stop: a wider stop means fewer contracts, and the dollars at risk stay at or under R. When the
        stop is wider than R allows, the answer is 0 contracts and the trade does not fit. The last number is the loss if a gap skips the stop and the option goes to zero.
      </p>
    </div>
  )
}

/** Win rate against payoff: the breakeven line, and one seeded run of trades. */
function Expectancy() {
  const [p, setP] = useState(0.4)
  const [b, setB] = useState(2)
  const [cost, setCost] = useState(0)
  const draws = useMemo(() => {
    const rnd = seeded(11)
    return Array.from({ length: 200 }, () => rnd())
  }, [])
  const E = p * b - (1 - p) - cost
  const curve: [number, number][] = [[0, 0]]
  draws.forEach((u, i) => curve.push([i + 1, curve[i][1] + (u < p ? b : -1) - cost]))
  const lo = Math.min(-10, ...curve.map(c => c[1]))
  const hi = Math.max(10, ...curve.map(c => c[1]))
  return (
    <div className="widget">
      <Plot x={[0.1, 0.9]} y={[0, 4]} xLabel="win rate" yLabel="payoff ratio" onDrag={(x, y) => { setP(Math.round(x * 100) / 100); setB(Math.round(y * 10) / 10) }}>
        {s => (
          <>
            <Curve s={s} f={q => (1 - q + cost) / q} color="muted" dash="5 4" />
            <Label s={s} x={0.62} y={(0.38 + cost) / 0.62} color="muted">breakeven</Label>
            <Dot s={s} x={p} y={b} color={E > 0 ? 'good' : 'bad'} r={6} />
          </>
        )}
      </Plot>
      <Slider label="win rate" value={p} min={0.1} max={0.9} step={0.01} onChange={setP} show={v => pct(v, 0)} />
      <Slider label="payoff (avg win ÷ avg loss)" value={b} min={0.1} max={4} step={0.1} onChange={setB} show={v => v.toFixed(1)} />
      <Slider label="cost per trade (R)" value={cost} min={0} max={0.3} step={0.01} onChange={setCost} show={v => v.toFixed(2)} />
      <Readout items={[['expectancy', `${E >= 0 ? '+' : ''}${fmt(E)}R`, E > 0 ? 'good' : 'bad'], ['breakeven win rate', pct((1 + cost) / (1 + b))], ['after 200 trades', `${fmt(curve[200][1], 1)}R`]]} />
      <Plot x={[0, 200]} y={[lo, hi]} height={170} xLabel="trade" yLabel="total R">
        {s => <Path s={s} pts={curve} color={E > 0 ? 'good' : 'bad'} />}
      </Plot>
      <p className="caption">
        Drag the dot or use the sliders. Above the dashed line the expectancy is positive. Raise the cost and the line moves up, eating small edges first. The lower
        chart is one run of 200 trades with the same random draws each time: even a positive expectancy has long losing stretches.
      </p>
    </div>
  )
}

/** Losses in a row at a fixed fraction, and the gain needed to recover. */
function Drawdown() {
  const [risk, setRisk] = useState(2)
  const [losses, setLosses] = useState(10)
  const dd = 1 - (1 - risk / 100) ** losses
  const need = dd / (1 - dd)
  const x = Math.min(dd, 0.9) * 100
  const y = Math.min(need, 5) * 100
  return (
    <div className="widget">
      <Plot x={[0, 90]} y={[0, 500]} xLabel="drawdown (%)" yLabel="gain needed (%)">
        {s => (
          <>
            <Curve s={s} f={d => (100 * d) / (100 - d)} color="blue" />
            <Seg s={s} a={[0, 0]} b={[90, 90]} color="muted" dash="4 4" />
            <Label s={s} x={40} y={40} color="muted" dy={16}>if losses and gains were symmetric</Label>
            <Seg s={s} a={[x, 0]} b={[x, y]} color="muted" dash="3 3" />
            <Dot s={s} x={x} y={y} color={dd > 0.3 ? 'bad' : 'accent'} />
          </>
        )}
      </Plot>
      <Slider label="risk per trade" value={risk} min={0.5} max={20} step={0.5} onChange={setRisk} show={v => `${v}%`} />
      <Slider label="losses in a row" value={losses} min={1} max={20} step={1} onChange={setLosses} show={v => `${v}`} />
      <Readout
        items={[
          ['account left', pct(1 - dd)],
          ['drawdown', pct(dd), dd > 0.3 ? 'bad' : undefined],
          ['gain needed to recover', pct(need), need > 0.5 ? 'bad' : undefined],
          ['chance of this run at 50% wins', `1 in ${Math.round(2 ** losses).toLocaleString('en-US')}`],
        ]}
      />
      <p className="caption">
        Each loss takes a fixed fraction of what is left. The blue curve is the gain you then need, d ÷ (1 − d); the dashed line is what intuition expects. Keep the
        same losing run and raise the risk per trade: the same bad luck goes from a nuisance to a hole you may never climb out of.
      </p>
    </div>
  )
}

/** Growth per trade against the fraction risked: the Kelly curve. */
function Kelly() {
  const [p, setP] = useState(0.55)
  const [b, setB] = useState(1.5)
  const [f, setF] = useState(0.1)
  const g = (x: number) => p * Math.log(1 + b * x) + (1 - p) * Math.log(1 - x)
  const kelly = Math.max(0, p - (1 - p) / b)
  const top = Math.max(0.02, g(kelly) * 1.4)
  return (
    <div className="widget">
      <Plot x={[0, 0.6]} y={[-top, top]} xLabel="fraction of the account risked per trade" yLabel="growth per trade (log)">
        {s => (
          <>
            <Curve s={s} f={g} color="blue" />
            {kelly > 0 && <Seg s={s} a={[kelly, -top]} b={[kelly, top]} color="good" dash="4 4" />}
            {kelly > 0 && <Label s={s} x={kelly} y={top * 0.85} color="good">Kelly</Label>}
            {kelly > 0 && <Seg s={s} a={[kelly / 2, -top]} b={[kelly / 2, top]} color="muted" dash="2 4" />}
            <Dot s={s} x={f} y={Math.max(-top, g(f))} color={g(f) > 0 ? 'accent' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="win rate" value={p} min={0.3} max={0.7} step={0.01} onChange={setP} show={v => pct(v, 0)} />
      <Slider label="payoff ratio" value={b} min={0.5} max={3} step={0.1} onChange={setB} show={v => v.toFixed(1)} />
      <Slider label="fraction risked" value={f} min={0} max={0.6} step={0.01} onChange={setF} show={v => pct(v, 0)} />
      <Readout
        items={[
          ['expectancy', `${fmt(p * b - (1 - p))}R`],
          ['Kelly', pct(kelly), 'good'],
          ['growth per trade', fmt(g(f), 4), g(f) > 0 ? 'good' : 'bad'],
          ['typical multiple after 100 trades', `×${fmt(Math.exp(100 * g(f)), 2)}`],
        ]}
      />
      <p className="caption">
        The curve is the long-run growth per trade for each size. It peaks at Kelly (green) and is back to zero near twice Kelly, even though every trade keeps the
        same positive expectancy. The grey line is half Kelly: most of the growth for much less risk. Your real win rate and payoff are estimates, so the safe side
        of the peak is the left.
      </p>
    </div>
  )
}

export const riskWidgets: Record<string, ComponentType> = {
  'risk-sizer': Sizer,
  'risk-expectancy': Expectancy,
  'risk-drawdown': Drawdown,
  'risk-kelly': Kelly,
}
