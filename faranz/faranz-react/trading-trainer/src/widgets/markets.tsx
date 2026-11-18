import { useState, type ComponentType } from 'react'
import { Dot, Label, Path, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

type Level = [number, number]

// Made-up books around a 100.00 stock: price and shares at each level, best first.
const BOOKS: Record<string, { bids: Level[]; asks: Level[]; x: [number, number] }> = {
  Deep: {
    bids: [[99.99, 800], [99.98, 1200], [99.97, 1500], [99.96, 2000], [99.95, 2500]],
    asks: [[100.01, 800], [100.02, 1200], [100.03, 1500], [100.04, 2000], [100.05, 2500]],
    x: [99.93, 100.07],
  },
  Thin: {
    bids: [[99.99, 100], [99.96, 200], [99.9, 300], [99.82, 400], [99.7, 500]],
    asks: [[100.01, 100], [100.04, 200], [100.1, 300], [100.18, 400], [100.3, 500]],
    x: [99.66, 100.34],
  },
}

/** An order book you send a market buy into: depth, walking the book, average fill and slippage. */
function Book() {
  const [name, setName] = useState('Thin')
  const [qty, setQty] = useState(1000)
  const { bids, asks, x } = BOOKS[name]
  // walk the asks
  let left = qty
  let cost = 0
  const taken = asks.map(([p, size]) => {
    const t = Math.min(size, left)
    left -= t
    cost += t * p
    return t
  })
  const filled = qty - left
  const avg = filled ? cost / filled : NaN
  const slip = filled ? cost - filled * asks[0][0] : 0
  const used = taken.filter(t => t > 0).length
  const bw = (x[1] - x[0]) / 40
  return (
    <div className="widget">
      <div className="seg">{Object.keys(BOOKS).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={x} y={[0, 2700]} height={260} xLabel="price" yLabel="shares resting">
        {s => (
          <>
            {bids.map(([p, size]) => <rect key={'b' + p} x={s.x(p - bw / 2)} y={s.y(size)} width={s.w(bw)} height={s.y(0) - s.y(size)} fill="var(--good)" opacity={0.6} />)}
            {asks.map(([p, size], i) => (
              <g key={'a' + p}>
                <rect x={s.x(p - bw / 2)} y={s.y(size)} width={s.w(bw)} height={s.y(0) - s.y(size)} fill="var(--bad)" opacity={0.35} />
                <rect x={s.x(p - bw / 2)} y={s.y(taken[i])} width={s.w(bw)} height={s.y(0) - s.y(taken[i])} fill="var(--accent)" />
              </g>
            ))}
            {filled > 0 && <Seg s={s} a={[avg, 0]} b={[avg, 2700]} color="accent" dash="4 4" />}
            {filled > 0 && <Label s={s} x={avg} y={2500} color="accent">average fill</Label>}
          </>
        )}
      </Plot>
      <Slider label="market buy (shares)" value={qty} min={100} max={3000} step={100} onChange={setQty} show={v => String(v)} />
      <Readout
        items={[
          ['levels used', String(used)],
          ['filled', left > 0 ? `${filled} of ${qty}` : String(filled), left > 0 ? 'bad' : undefined],
          ['average fill', fmt(avg, 3), 'accent'],
          ['slippage vs best ask', `$${fmt(slip, 0)}`, slip > 20 ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        Green bars are bids, red bars asks, and the yellow part is what your market buy takes. Both books show the same quote, 99.99 x 100.01. Raise the order size and watch
        it <b>walk the book</b>: in the thin book each new level is several cents worse. The quote tells you the price of the first shares, not of the size you want.
      </p>
    </div>
  )
}

// Made-up trade prices. In Gap, the first five prints are one day and the rest the next morning.
const PATHS: Record<string, number[]> = {
  Slide: [100, 99.8, 99.6, 99.7, 99.3, 99.0, 98.9, 98.6, 98.2, 98.4, 97.9, 97.6, 97.8, 97.5, 97.7, 97.3],
  Gap: [100.4, 100.1, 99.9, 100.2, 99.8, 96.2, 95.8, 95.5, 96.0, 96.4, 96.1, 95.7],
}

/** A sell stop or stop-limit on a price path, with and without an overnight gap. */
function Stops() {
  const [path, setPath] = useState('Gap')
  const [kind, setKind] = useState('Stop')
  const [stop, setStop] = useState(98)
  const [offset, setOffset] = useState(0.5)
  const prices = PATHS[path]
  const entry = 100
  const limit = stop - offset
  const trigger = prices.findIndex(p => p <= stop + 1e-9)
  let fillAt = -1
  if (trigger >= 0) fillAt = kind === 'Stop' ? trigger : prices.findIndex((p, i) => i >= trigger && p >= limit - 1e-9)
  const fill = fillAt >= 0 ? prices[fillAt] : NaN
  const last = prices[prices.length - 1]
  const loss = (entry - (fillAt >= 0 ? fill : last)) * 100
  return (
    <div className="widget">
      <div className="seg">{Object.keys(PATHS).map(k => <button key={k} className={k === path ? 'on' : ''} onClick={() => setPath(k)}>{k}</button>)}</div>
      <div className="seg">{['Stop', 'Stop-limit'].map(k => <button key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}</div>
      <Plot x={[0, prices.length - 1]} y={[94.5, 101]} height={260} xLabel="time" yLabel="price">
        {s => (
          <>
            <Path s={s} pts={prices.map((p, i) => [i, p])} color="text" />
            <Seg s={s} a={[0, stop]} b={[prices.length - 1, stop]} color="bad" dash="5 4" />
            <Label s={s} x={0} y={stop} color="bad">stop {fmt(stop, 1)}</Label>
            {kind === 'Stop-limit' && <Seg s={s} a={[0, limit]} b={[prices.length - 1, limit]} color="amber" dash="2 3" />}
            {path === 'Gap' && <Seg s={s} a={[4.5, 94.5]} b={[4.5, 101]} color="muted" dash="3 3" />}
            {path === 'Gap' && <Label s={s} x={4.5} y={100.8} color="muted">overnight</Label>}
            {trigger >= 0 && <Dot s={s} x={trigger} y={prices[trigger]} color="bad" ring />}
            {fillAt >= 0 && <Dot s={s} x={fillAt} y={fill} color="accent" />}
          </>
        )}
      </Plot>
      <Slider label="stop price" value={stop} min={95} max={99.5} step={0.1} onChange={setStop} show={v => fmt(v, 1)} />
      {kind === 'Stop-limit' && <Slider label="limit below stop" value={offset} min={0} max={1.5} step={0.1} onChange={setOffset} show={v => fmt(v, 1)} />}
      <Readout
        items={[
          ['triggered at', trigger >= 0 ? fmt(prices[trigger]) : 'not triggered'],
          ['filled at', fillAt >= 0 ? fmt(fill) : trigger >= 0 ? 'no fill: still long' : '–', fillAt >= 0 ? 'accent' : 'bad'],
          ['planned loss (100 shares)', `$${fmt((entry - stop) * 100, 0)}`],
          [fillAt >= 0 ? 'actual loss' : 'loss at the last price', `$${fmt(loss, 0)}`, loss > (entry - stop) * 100 + 1 ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        You are long 100 shares from 100. A <b>stop</b> fires on the first trade at or below its price and sells at the market: in Slide it fills close to the stop, in Gap
        it fills at the first price of the morning. A <b>stop-limit</b> will not sell below its limit, so in a gap it can leave you holding the loss. Neither is a guaranteed exit price.
      </p>
    </div>
  )
}

// Made-up session profile for a liquid stock and one of its options, per half hour from 9:30 ET.
const TIMES = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']
const VOLUME = [34, 20, 15, 12, 10, 9, 8, 9, 10, 12, 15, 20, 28]
const SPREAD = [0.09, 0.06, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05]

/** Volume and option spread through the regular session, and what the time of day does to the cost of a trade. */
function Session() {
  const [view, setView] = useState('Volume')
  const [t, setT] = useState(0)
  const [n, setN] = useState(10)
  const data = view === 'Volume' ? VOLUME : SPREAD
  const top = view === 'Volume' ? 40 : 0.1
  const cost = SPREAD[t] * n * 100
  const cheapest = Math.min(...SPREAD) * n * 100
  return (
    <div className="widget">
      <div className="seg">{['Volume', 'Option spread'].map(k => <button key={k} className={k === view ? 'on' : ''} onClick={() => setView(k)}>{k}</button>)}</div>
      <Plot x={[0, 13]} y={[0, top]} height={240} xLabel="half hours from 9:30 ET" yLabel={view === 'Volume' ? 'shares (millions)' : 'spread ($)'}>
        {s => (
          <>
            {data.map((v, i) => (
              <rect key={i} x={s.x(i) + 1} y={s.y(v)} width={s.w(1) - 2} height={s.y(0) - s.y(v)} fill={i === t ? 'var(--accent)' : 'var(--blue)'} opacity={i === t ? 1 : 0.6} />
            ))}
          </>
        )}
      </Plot>
      <Slider label="time of your trade" value={t} min={0} max={12} step={1} onChange={setT} show={v => TIMES[v]} />
      <Slider label="contracts" value={n} min={1} max={20} step={1} onChange={setN} show={v => String(v)} />
      <Readout
        items={[
          ['volume', `${VOLUME[t]}m`],
          ['option spread', fmt(SPREAD[t])],
          ['round-trip spread cost', `$${fmt(cost, 0)}`, 'accent'],
          ['more than the cheapest time', `$${fmt(cost - cheapest, 0)}`, cost > cheapest ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        Volume makes a U: heavy at the open and the close, light at midday. Switch to the option spread and it is widest in the first half hour. Move the trade time and see
        what the same round trip costs. A setup that trades at the open has to earn more to pay for it.
      </p>
    </div>
  )
}

/** A gross edge per trade against spread, commission and slippage, over a year of trading. */
function Costs() {
  const [edge, setEdge] = useState(20)
  const [spread, setSpread] = useState(0.05)
  const [comm, setComm] = useState(0.65)
  const [slip, setSlip] = useState(0.01)
  const [per, setPer] = useState(3)
  const cost = spread * 100 + 2 * comm + 2 * slip * 100
  const net = edge - cost
  const days = 250
  const yearGross = edge * per * days
  const yearNet = net * per * days
  const hi = Math.max(1000, yearGross, yearNet) * 1.1
  const lo = Math.min(0, yearNet) * 1.1
  return (
    <div className="widget">
      <Plot x={[0, days]} y={[lo, hi]} height={240} xLabel="trading days" yLabel="cumulative $ per contract">
        {s => (
          <>
            <Path s={s} pts={[[0, 0], [days, yearGross]]} color="muted" dash="5 4" />
            <Path s={s} pts={[[0, 0], [days, yearNet]]} color={net >= 0 ? 'good' : 'bad'} width={2.5} />
            <Label s={s} x={days} y={yearGross} anchor="end" color="muted">before costs</Label>
            <Label s={s} x={days} y={yearNet} anchor="end" dy={14} color={net >= 0 ? 'good' : 'bad'}>after costs</Label>
          </>
        )}
      </Plot>
      <Slider label="gross edge per trade ($)" value={edge} min={0} max={50} step={1} onChange={setEdge} show={v => `$${v}`} />
      <Slider label="spread" value={spread} min={0.01} max={0.2} step={0.01} onChange={setSpread} show={v => fmt(v)} />
      <Slider label="commission per side" value={comm} min={0} max={1} step={0.05} onChange={setComm} show={v => `$${fmt(v)}`} />
      <Slider label="slippage per side" value={slip} min={0} max={0.1} step={0.01} onChange={setSlip} show={v => fmt(v)} />
      <Slider label="trades per day" value={per} min={1} max={10} step={1} onChange={setPer} show={v => String(v)} />
      <Readout
        items={[
          ['cost per trade', `$${fmt(cost)}`],
          ['net per trade', `$${fmt(net)}`, net >= 0 ? 'good' : 'bad'],
          ['costs as share of edge', edge > 0 ? `${fmt((cost / edge) * 100, 0)}%` : '–'],
          ['net per year', `$${fmt(yearNet, 0)}`, net >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        Everything is per option contract. The gross edge is what a trade makes on average at mid prices; the costs are the spread crossed once in total, commission and
        slippage on both sides. Shrink the edge or widen the spread and watch a profitable plan turn into a steady loss. Trading more often multiplies both lines.
      </p>
    </div>
  )
}

export const marketsWidgets: Record<string, ComponentType> = {
  'markets-book': Book,
  'markets-stops': Stops,
  'markets-session': Session,
  'markets-costs': Costs,
}
