import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Slider, fmt, gaussian, seeded, type Scale } from '../components/Plot'

/** One made-up 5-minute bar. */
export interface Bar {
  o: number
  h: number
  l: number
  c: number
  v: number
}

/**
 * A made-up session of 78 five-minute bars (9:30 to 16:00). `drift` pushes every bar one way (a trend day),
 * `pull` draws price back towards the open (a range day). Both start after bar `calm`, so two sessions with the
 * same seed look identical until then.
 */
export function session(seed: number, drift: number, pull: number, start = 500, calm = 0): Bar[] {
  const g = gaussian(seeded(seed))
  const bars: Bar[] = []
  let p = start
  for (let i = 0; i < 78; i++) {
    const [d, k] = i < calm ? [0, 0] : [drift, pull]
    const o = p
    let [h, l] = [p, p]
    for (let step = 0; step < 5; step++) {
      p += d / 5 - (k * (p - start)) / 5 + 0.16 * g() * (i < 6 ? 1.7 : 1)
      h = Math.max(h, p)
      l = Math.min(l, p)
    }
    // volume is heavy at the open and the close, light at midday
    bars.push({ o, h, l, c: p, v: 1 + 2.5 * Math.exp(-i / 6) + 1.2 * Math.exp(-(77 - i) / 5) })
  }
  return bars
}

export const ORB_DAYS: Bar[][] = [
  session(11, 0.05, 0, 500),
  session(22, 0, 0.06, 498),
  session(33, -0.05, 0, 503),
  session(44, 0.01, 0.02, 501),
  session(55, 0, 0.1, 500),
  session(66, 0.08, 0, 497),
]

/** Opening range breakout on one day: range of the first n bars, entry on a close outside it before 11:30, target 2R. */
export function orb(bars: Bar[], n: number, mid: boolean) {
  const hi = Math.max(...bars.slice(0, n).map(b => b.h))
  const lo = Math.min(...bars.slice(0, n).map(b => b.l))
  for (let i = n; i < 24; i++) {
    const side = bars[i].c > hi ? 1 : bars[i].c < lo ? -1 : 0
    if (!side) continue
    const entry = bars[i].c
    const stop = mid ? (hi + lo) / 2 : side > 0 ? lo : hi
    const risk = Math.abs(entry - stop)
    const target = entry + side * 2 * risk
    const out = { hi, lo, i, side, entry, stop, target, risk }
    for (let j = i + 1; j < bars.length; j++) {
      const b = bars[j]
      if (side > 0 ? b.l <= stop : b.h >= stop) return { ...out, j, r: -1 }
      if (side > 0 ? b.h >= target : b.l <= target) return { ...out, j, r: 2 }
    }
    return { ...out, j: bars.length - 1, r: (side * (bars[bars.length - 1].c - entry)) / risk }
  }
  return { hi, lo, i: -1, side: 0, entry: 0, stop: 0, target: 0, risk: 0, j: -1, r: 0 }
}

function Candles({ s, bars }: { s: Scale; bars: Bar[] }) {
  return (
    <>
      {bars.map((b, i) => (
        <g key={i} stroke={b.c >= b.o ? 'var(--good)' : 'var(--bad)'} fill={b.c >= b.o ? 'var(--good)' : 'var(--bad)'}>
          <line x1={s.x(i)} x2={s.x(i)} y1={s.y(b.h)} y2={s.y(b.l)} />
          <rect x={s.x(i) - s.w(0.35)} width={s.w(0.7)} y={s.y(Math.max(b.o, b.c))} height={Math.max(1, s.h(Math.abs(b.c - b.o)))} />
        </g>
      ))}
    </>
  )
}

const span = (bars: Bar[], pad = 0.5): [number, number] => [Math.min(...bars.map(b => b.l)) - pad, Math.max(...bars.map(b => b.h)) + pad]

function Orb() {
  const [day, setDay] = useState(0)
  const [n, setN] = useState(3)
  const [mid, setMid] = useState(false)
  const bars = ORB_DAYS[day]
  const t = orb(bars, n, mid)
  const total = ORB_DAYS.reduce((sum, d) => sum + orb(d, n, mid).r, 0)
  return (
    <div className="widget">
      <div className="seg">{ORB_DAYS.map((_, i) => <button key={i} className={i === day ? 'on' : ''} onClick={() => setDay(i)}>Day {i + 1}</button>)}</div>
      <Plot x={[-1, 78]} y={span(bars)} xLabel="5-minute bars from 9:30" yLabel="price">
        {s => (
          <>
            <rect x={s.x(-0.5)} width={s.w(n)} y={s.y(t.hi)} height={s.h(t.hi - t.lo)} fill="var(--blue)" opacity={0.18} />
            <Path s={s} pts={[[-1, t.hi], [78, t.hi]]} color="blue" width={1} dash="4 3" />
            <Path s={s} pts={[[-1, t.lo], [78, t.lo]]} color="blue" width={1} dash="4 3" />
            <Candles s={s} bars={bars} />
            {t.i >= 0 && (
              <>
                <Path s={s} pts={[[t.i, t.stop], [t.j, t.stop]]} color="bad" width={1.5} />
                <Path s={s} pts={[[t.i, t.target], [t.j, t.target]]} color="good" width={1.5} />
                <Dot s={s} x={t.i} y={t.entry} color="accent" />
                <Label s={s} x={t.i} y={t.entry} color="accent">{t.side > 0 ? 'long' : 'short'}</Label>
              </>
            )}
          </>
        )}
      </Plot>
      <div className="seg">
        {[1, 3, 6].map(k => <button key={k} className={k === n ? 'on' : ''} onClick={() => setN(k)}>{k * 5}-min range</button>)}
      </div>
      <div className="seg">
        <button className={!mid ? 'on' : ''} onClick={() => setMid(false)}>stop: far side</button>
        <button className={mid ? 'on' : ''} onClick={() => setMid(true)}>stop: middle</button>
      </div>
      <Readout
        items={[
          ['range width', fmt(t.hi - t.lo)],
          ['risk per share', t.i >= 0 ? fmt(t.risk) : 'no trade'],
          ['this day', t.i >= 0 ? `${fmt(t.r, 2)} R` : 'no trade', t.r > 0 ? 'good' : t.r < 0 ? 'bad' : 'muted'],
          ['all 6 days', `${fmt(total, 2)} R`, total > 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        The blue box is the opening range. The rule: enter on the first 5-minute close outside it before 11:30, stop at the far side or the middle of the range, target 2R,
        otherwise out at the close. Fills are assumed exactly at the stop and target, with no costs. Change the range length and the stop and watch the single day and the
        six-day total move. Six days is far too few to judge a rule: it shows how much the result depends on choices made before you see the data.
      </p>
    </div>
  )
}

/** A trend day and a range day that start the same way. */
export const VWAP_DAYS: Record<string, Bar[]> = { 'Trend day': session(7, 0.09, 0, 500, 8), 'Range day': session(7, 0, 0.09, 500, 8) }

export function vwapLine(bars: Bar[]): number[] {
  let pv = 0
  let v = 0
  return bars.map(b => {
    pv += ((b.h + b.l + b.c) / 3) * b.v
    v += b.v
    return pv / v
  })
}

/** VWAP crosses, share of closes above VWAP, and where the last close sits in the range so far. */
export function dayStats(bars: Bar[], vw: number[]) {
  let crosses = 0
  for (let i = 1; i < bars.length; i++) if (Math.sign(bars[i].c - vw[i]) !== Math.sign(bars[i - 1].c - vw[i - 1])) crosses++
  const above = bars.filter((b, i) => b.c > vw[i]).length / bars.length
  const [lo, hi] = span(bars, 0)
  return { crosses, above, where: hi > lo ? (bars[bars.length - 1].c - lo) / (hi - lo) : 0.5 }
}

function Vwap() {
  const [name, setName] = useState('Trend day')
  const [upto, setUpto] = useState(78)
  const all = VWAP_DAYS[name]
  const full = useMemo(() => vwapLine(all), [all])
  const bars = all.slice(0, upto)
  const vw = full.slice(0, upto)
  const st = dayStats(bars, vw)
  const clock = (k: number) => {
    const m = 570 + 5 * k
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
  }
  return (
    <div className="widget">
      <div className="seg">{Object.keys(VWAP_DAYS).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={[-1, 78]} y={span(Object.values(VWAP_DAYS).flat())} xLabel="5-minute bars from 9:30" yLabel="price">
        {s => (
          <>
            <Candles s={s} bars={bars} />
            <Path s={s} pts={vw.map((v, i) => [i, v])} color="amber" width={2} />
          </>
        )}
      </Plot>
      <Slider label="time now" value={upto} min={6} max={78} step={1} onChange={setUpto} show={clock} />
      <Readout
        items={[
          ['VWAP crosses', String(st.crosses)],
          ['closes above VWAP', `${fmt(100 * st.above, 0)}%`],
          ['close within range so far', `${fmt(100 * st.where, 0)}%`],
        ]}
      />
      <p className="caption">
        The amber line is VWAP. Both days share their first 40 minutes. Drag the time back to 10:00 and switch between them: you cannot tell them apart. By midday the trend
        day sits on one side of VWAP and closes near its high, while the range day keeps crossing it. When you decide, you only ever see the left part of the chart.
      </p>
    </div>
  )
}

function erf(x: number) {
  // Abramowitz and Stegun 7.1.26, accurate to about 1e-7
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))

/** Black-Scholes call with no rates. `hours` are trading hours left: 6.5 a day, 252 days a year. */
export function call(S: number, K: number, hours: number, iv: number) {
  if (hours <= 1e-9) return { price: Math.max(0, S - K), delta: S > K ? 1 : 0 }
  const sd = iv * Math.sqrt(hours / 6.5 / 252)
  const d1 = Math.log(S / K) / sd + sd / 2
  return { price: S * cdf(d1) - K * cdf(d1 - sd), delta: cdf(d1) }
}

export const EXPIRIES: Record<string, number> = { '0DTE': 4, 'next day': 10.5, 'a week out': 36.5 }

function Choose() {
  const [exp, setExp] = useState('0DTE')
  const [off, setOff] = useState(0)
  const [move, setMove] = useState(1)
  const [hold, setHold] = useState(30)
  const S = 500
  const hours = EXPIRIES[exp]
  const now = call(S, S + off, hours, 0.15)
  const pnl = (m: number) => 100 * (call(S + m, S + off, hours - hold / 60, 0.15).price - now.price)
  const decay = 100 * (now.price - call(S, S + off, hours - 1, 0.15).price)
  return (
    <div className="widget">
      <div className="seg">{Object.keys(EXPIRIES).map(k => <button key={k} className={k === exp ? 'on' : ''} onClick={() => setExp(k)}>{k}</button>)}</div>
      <Plot x={[-5, 5]} y={[-300, 500]} xLabel="move in the stock ($)" yLabel="P&L per contract ($)">
        {s => (
          <>
            <Curve s={s} f={m => 100 * m * now.delta} color="muted" dash="4 4" width={1.5} />
            <Curve s={s} f={pnl} color="accent" />
            <Dot s={s} x={move} y={pnl(move)} />
          </>
        )}
      </Plot>
      <Slider label="strike − stock" value={off} min={-5} max={5} step={1} onChange={setOff} show={v => `${v > 0 ? '+' : ''}${v}`} />
      <Slider label="stock move" value={move} min={-5} max={5} step={0.25} onChange={setMove} show={v => `$${fmt(v)}`} />
      <Slider label="minutes held" value={hold} min={0} max={180} step={5} onChange={setHold} />
      <Readout
        items={[
          ['call price', `$${fmt(now.price)}`],
          ['delta', fmt(now.delta)],
          ['decay, next hour', `$${fmt(decay, 0)}`, 'bad'],
          ['P&L', `$${fmt(pnl(move), 0)}`, pnl(move) >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        A call on a $500 stock at 15% implied volatility, time counted in trading hours (the 0DTE has 4 hours left), per contract of 100 shares. The yellow curve is the P&L
        after the time you hold; the dashed line is delta alone. Set the move to 0 and compare the decay of the three expiries. Then compare how much each curve bends: the
        0DTE bends most, which helps on a big move and leaves nothing on a small one.
      </p>
    </div>
  )
}

function ZeroDte() {
  const [off, setOff] = useState(0)
  const [iv, setIv] = useState(0.15)
  const [left, setLeft] = useState(4)
  const S = 500
  const at = (h: number) => call(S, S + off, h, iv)
  const now = at(left)
  const later = at(Math.max(0, left - 1))
  return (
    <div className="widget">
      <Plot x={[6.5, 0]} y={[0, 2.5]} xLabel="trading hours left until the close" yLabel="call price ($)">
        {s => (
          <>
            <Curve s={s} f={h => at(h).price} from={6.5} to={0.001} n={160} color="accent" />
            <Curve s={s} f={h => call(S + 1, S + off, h, iv).price} from={6.5} to={0.001} n={160} color="good" dash="4 4" width={1.5} />
            <Dot s={s} x={left} y={now.price} />
          </>
        )}
      </Plot>
      <Slider label="strike − stock" value={off} min={0} max={5} step={0.5} onChange={setOff} show={v => `+${v}`} />
      <Slider label="implied vol" value={iv} min={0.1} max={0.4} step={0.01} onChange={setIv} show={v => `${fmt(100 * v, 0)}%`} />
      <Slider label="hours left" value={left} min={0.25} max={6.5} step={0.25} onChange={setLeft} />
      <Readout
        items={[
          ['price', `$${fmt(now.price)}`],
          ['lost in the next hour', `${fmt(now.price > 0 ? (100 * (now.price - later.price)) / now.price : 0, 0)}%`, 'bad'],
          ['delta', fmt(now.delta)],
          ['delta if $1 higher', fmt(call(S + 1, S + off, left, iv).delta)],
        ]}
      />
      <p className="caption">
        A same-day call on a $500 stock that does not move (yellow), and the same call with the stock $1 higher (green, dashed). Slide the hours left towards the close: the
        price drains fastest at the end, and an out-of-the-money strike is worth almost nothing well before 4:00. Watch delta: late in the day a $1 move swings it a long way.
        That is gamma, and it is why a 0DTE position can change character in minutes.
      </p>
    </div>
  )
}

export const daytradingWidgets: Record<string, ComponentType> = {
  'daytrading-orb': Orb,
  'daytrading-vwap': Vwap,
  'daytrading-choose': Choose,
  'daytrading-0dte': ZeroDte,
}
