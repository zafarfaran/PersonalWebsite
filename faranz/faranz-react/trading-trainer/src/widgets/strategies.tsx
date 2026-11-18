import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

/** Normal CDF (Abramowitz and Stegun 7.1.26, error below 1e-7). */
function ncdf(x: number) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2)
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-(x * x) / 2)
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y)
}

/** Black-Scholes price with no rates or dividends, rounded to cents like a quote. */
function bs(kind: 'call' | 'put', S: number, K: number, days: number, iv: number) {
  const t = days / 365
  const d1 = (Math.log(S / K) + (iv * iv * t) / 2) / (iv * Math.sqrt(t))
  const d2 = d1 - iv * Math.sqrt(t)
  const call = S * ncdf(d1) - K * ncdf(d2)
  return Math.round((kind === 'call' ? call : call - S + K) * 100) / 100
}

type Leg = { kind: 'call' | 'put'; K: number; qty: number; prem: number }
const pnl = (legs: Leg[], S: number) =>
  100 * legs.reduce((sum, l) => sum + l.qty * ((l.kind === 'call' ? Math.max(S - l.K, 0) : Math.max(l.K - S, 0)) - l.prem), 0)
const usd = (v: number) => (Number.isFinite(v) ? `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v))}` : v > 0 ? 'unlimited' : 'unlimited loss')

/** A long call against a call spread: the short strike sets the cost and the cap. */
function Cap() {
  const [k2, setK2] = useState(110)
  const c1 = bs('call', 100, 100, 30, 0.25)
  const c2 = bs('call', 100, k2, 30, 0.25)
  const debit = c1 - c2
  return (
    <div className="widget">
      <Plot x={[85, 130]} y={[-600, 1800]} xLabel="stock price at expiry" yLabel="P&L ($ per contract)">
        {s => (
          <>
            <Curve s={s} f={S => 100 * (Math.max(S - 100, 0) - c1)} color="muted" dash="5 4" />
            <Curve s={s} f={S => 100 * (Math.max(S - 100, 0) - Math.max(S - k2, 0) - debit)} color="accent" width={2.5} />
            <Dot s={s} x={100 + debit} y={0} color="good" />
            <Label s={s} x={86} y={1650} color="muted">dashed: the 100 call alone</Label>
          </>
        )}
      </Plot>
      <Slider label="short call strike" value={k2} min={101} max={125} step={1} onChange={setK2} />
      <Readout
        items={[
          ['100 call', fmt(c1)],
          [`${k2} call`, fmt(c2)],
          ['debit = max loss', usd(debit * 100), 'bad'],
          ['max profit', usd((k2 - 100 - debit) * 100), 'good'],
          ['breakeven', fmt(100 + debit)],
          ['call alone: risk, breakeven', `${usd(c1 * 100)}, ${fmt(100 + c1)}`],
        ]}
      />
      <p className="caption">
        Stock at 100, 30 days, prices from a model at 25% volatility. The yellow line buys the 100 call and sells a higher one. Move the <b>short strike</b> down: the spread
        gets cheaper and breaks even sooner, but its ceiling drops. Move it up and it turns back into the call alone. Every spread is a choice of where to stop being paid.
      </p>
    </div>
  )
}

/** Credit spread odds: the win rate you need, and expectancy, from width and credit. */
function Odds() {
  const [width, setWidth] = useState(5)
  const [credit, setCredit] = useState(1)
  const [p, setP] = useState(0.8)
  const c = Math.min(credit, width - 0.05)
  const win = c * 100
  const loss = (width - c) * 100
  const need = loss / (win + loss)
  const ev = (q: number) => q * win - (1 - q) * loss
  return (
    <div className="widget">
      <Plot x={[0.5, 1]} y={[-500, 300]} xLabel="chance of a full win" yLabel="expectancy ($ per trade)">
        {s => (
          <>
            <Curve s={s} f={ev} color="accent" width={2.5} />
            <Seg s={s} a={[need, -500]} b={[need, 300]} color="muted" dash="4 4" />
            <Dot s={s} x={p} y={ev(p)} color={ev(p) >= 0 ? 'good' : 'bad'} />
            {need >= 0.5 && need <= 0.97 && <Label s={s} x={need} y={250} color="muted">breakeven</Label>}
          </>
        )}
      </Plot>
      <Slider label="width" value={width} min={1} max={10} step={1} onChange={setWidth} />
      <Slider label="credit" value={c} min={0.05} max={width - 0.05} step={0.05} onChange={setCredit} show={v => v.toFixed(2)} />
      <Slider label="chance of a win" value={p} min={0.5} max={0.99} step={0.01} onChange={setP} show={v => `${Math.round(v * 100)}%`} />
      <Readout
        items={[
          ['max profit', usd(win), 'good'],
          ['max loss', usd(-loss), 'bad'],
          ['breakeven win rate', `${(need * 100).toFixed(1)}%`],
          ['expectancy', usd(ev(p)), ev(p) >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Each trade is treated as a full win (keep the credit) or a full loss (width − credit). Lower the <b>credit</b> for the same width and the win rate you need climbs
        towards 100%. The short strike's delta tells you roughly what chance the market prices in; if that matches the breakeven, the edge is zero before costs.
      </p>
    </div>
  )
}

const STRUCTS = { 'Long straddle': [100, 100, 1], 'Long strangle': [95, 105, 1], 'Short straddle': [100, 100, -1], 'Short strangle': [95, 105, -1] } as const
type StructName = keyof typeof STRUCTS

/** Straddles and strangles, long and short, and a move at expiry you choose. */
function Straddle() {
  const [name, setName] = useState<StructName>('Long straddle')
  const [move, setMove] = useState(0)
  const [kp, kc, side] = STRUCTS[name]
  const legs: Leg[] = [
    { kind: 'put', K: kp, qty: side, prem: bs('put', 100, kp, 30, 0.3) },
    { kind: 'call', K: kc, qty: side, prem: bs('call', 100, kc, 30, 0.3) },
  ]
  const prem = legs[0].prem + legs[1].prem
  const S = 100 + move
  return (
    <div className="widget">
      <div className="seg">{(Object.keys(STRUCTS) as StructName[]).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={[70, 130]} y={[-2000, 2000]} xLabel="stock price at expiry" yLabel="P&L ($ per contract)">
        {s => (
          <>
            <Curve s={s} f={x => pnl(legs, x)} color="accent" width={2.5} n={240} />
            <Dot s={s} x={S} y={pnl(legs, S)} color={pnl(legs, S) >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="move at expiry" value={move} min={-25} max={25} step={1} onChange={setMove} show={v => `${v > 0 ? '+' : ''}${v}`} />
      <Readout
        items={[
          [side > 0 ? 'debit' : 'credit', fmt(prem)],
          ['breakevens', `${fmt(kp - prem)} and ${fmt(kc + prem)}`],
          ['max loss', side > 0 ? usd(-prem * 100) : 'unlimited', 'bad'],
          ['P&L at this price', usd(pnl(legs, S)), pnl(legs, S) >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Stock at 100, 30 days, 30% volatility. Drag the <b>move</b> and watch the dot. The long versions need the stock to leave the band between the breakevens. Switch to a
        short version: the credit is the best case and the loss keeps growing the further the stock goes. That open end is what undefined risk means.
      </p>
    </div>
  )
}

/** Iron condor and iron butterfly: distance of the short strikes and width of the wings. */
function Condor() {
  const [dist, setDist] = useState(5)
  const [wing, setWing] = useState(5)
  const [sp, sc] = [100 - dist, 100 + dist]
  const legs: Leg[] = [
    { kind: 'put', K: sp - wing, qty: 1, prem: bs('put', 100, sp - wing, 30, 0.25) },
    { kind: 'put', K: sp, qty: -1, prem: bs('put', 100, sp, 30, 0.25) },
    { kind: 'call', K: sc, qty: -1, prem: bs('call', 100, sc, 30, 0.25) },
    { kind: 'call', K: sc + wing, qty: 1, prem: bs('call', 100, sc + wing, 30, 0.25) },
  ]
  const credit = -legs.reduce((sum, l) => sum + l.qty * l.prem, 0)
  return (
    <div className="widget">
      <Plot x={[70, 130]} y={[-1500, 800]} xLabel="stock price at expiry" yLabel="P&L ($ per contract)">
        {s => (
          <>
            <Curve s={s} f={x => pnl(legs, x)} color="accent" width={2.5} n={240} />
            <Dot s={s} x={sp - credit} y={0} color="muted" />
            <Dot s={s} x={sc + credit} y={0} color="muted" />
          </>
        )}
      </Plot>
      <Slider label="short strikes from 100" value={dist} min={0} max={15} step={1} onChange={setDist} show={v => (v === 0 ? '0 (butterfly)' : `±${v}`)} />
      <Slider label="wing width" value={wing} min={1} max={15} step={1} onChange={setWing} />
      <Readout
        items={[
          ['credit = max profit', usd(credit * 100), 'good'],
          ['max loss', usd(-(wing - credit) * 100), 'bad'],
          ['breakevens', `${fmt(sp - credit)} and ${fmt(sc + credit)}`],
          ['profit to loss', `1 : ${fmt((wing - credit) / credit, 1)}`],
        ]}
      />
      <p className="caption">
        Stock at 100, 30 days, 25% volatility. Move the <b>short strikes</b> in to 0 for an iron butterfly: a big credit and a narrow peak. Move them out and the credit
        shrinks while the profit zone widens. Widen the <b>wings</b> and watch the maximum loss grow much faster than the credit.
      </p>
    </div>
  )
}

export const strategiesWidgets: Record<string, ComponentType> = {
  'strategies-cap': Cap,
  'strategies-odds': Odds,
  'strategies-straddle': Straddle,
  'strategies-condor': Condor,
}
