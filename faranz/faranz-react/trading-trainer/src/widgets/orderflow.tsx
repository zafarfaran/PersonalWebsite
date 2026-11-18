import { useState, type ComponentType } from 'react'
import { Label, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

const TICK = 0.25

// Made-up trades: a fixed draw decides each trade's size, and whether it is a buyer depends on the share you set.
const rt = seeded(11)
const TRADES = Array.from({ length: 48 }, () => ({ u: rt(), size: 1 + Math.floor(rt() * 8) }))

/** A tape of market orders meeting a book with the same depth at every level: delta and how far price travels. */
function Tape() {
  const [share, setShare] = useState(0.7)
  const [depth, setDepth] = useState(20)
  let bid = 0
  let askQ = depth
  let bidQ = depth
  let cvd = 0
  const path: { price: number; cvd: number }[] = []
  const prints: { price: number; size: number; buy: boolean }[] = []
  for (const t of TRADES) {
    const buy = t.u < share
    let s = t.size
    cvd += buy ? s : -s
    while (s > 0) {
      const q = buy ? askQ : bidQ
      const take = Math.min(s, q)
      prints.push({ price: 6000 + (buy ? bid + 1 : bid) * TICK, size: take, buy })
      s -= take
      if (buy) askQ -= take
      else bidQ -= take
      if (askQ === 0 || bidQ === 0) {
        bid += askQ === 0 ? 1 : -1
        askQ = depth
        bidQ = depth
      }
    }
    path.push({ price: prints[prints.length - 1].price, cvd })
  }
  const buyVol = TRADES.filter(t => t.u < share).reduce((a, t) => a + t.size, 0)
  const sellVol = TRADES.reduce((a, t) => a + t.size, 0) - buyVol
  const ticks = bid
  return (
    <div className="widget">
      <Plot x={[0, 47]} y={[5990, 6010]} height={150} yLabel="last price">
        {s => <Path s={s} pts={path.map((p, i) => [i, p.price])} color="text" />}
      </Plot>
      <Plot x={[0, 47]} y={[-220, 220]} height={130} xLabel="trade" yLabel="cum. delta">
        {s => <Path s={s} pts={path.map((p, i) => [i, p.cvd])} color={cvd >= 0 ? 'good' : 'bad'} />}
      </Plot>
      <Slider label="share of trades by buyers" value={share} min={0.2} max={0.8} step={0.05} onChange={setShare} show={v => `${Math.round(v * 100)}%`} />
      <Slider label="resting depth per level" value={depth} min={5} max={80} step={5} onChange={setDepth} show={v => `${v} contracts`} />
      <table className="cells">
        <tbody>
          <tr><th>last prints</th>{prints.slice(-5).map((p, i) => <td key={i} style={{ color: p.buy ? 'var(--good)' : 'var(--bad)' }}>{p.size} @ {fmt(p.price)}</td>)}</tr>
        </tbody>
      </table>
      <Readout
        items={[
          ['at the ask', String(buyVol), 'good'],
          ['at the bid', String(sellVol), 'bad'],
          ['delta', (cvd > 0 ? '+' : '') + cvd, cvd >= 0 ? 'good' : 'bad'],
          ['price moved', `${ticks > 0 ? '+' : ''}${ticks} ticks`, 'accent'],
        ]}
      />
      <p className="caption">
        Green prints hit the ask (buyers aggressive), red prints hit the bid. Price ticks up only when a whole ask level is used up. Keep the buyer share fixed and change the
        <b> depth</b>: the delta does not change at all, but how far price travels does. The same aggression moves a thin book a long way and a thick one hardly at all.
      </p>
    </div>
  )
}

// Made-up 5-minute bars (close, delta) for three kinds of morning.
function bars(kind: string): [number, number][] {
  const g = gaussian(seeded(kind === 'Together' ? 3 : kind === 'Divergence' ? 5 : 7))
  let p = 6000
  return Array.from({ length: 60 }, (_, i) => {
    const [a, b] = [g(), g()]
    let d: number
    let dp: number
    if (kind === 'Together') {
      d = 250 * a + 20
      dp = d / 120 + 0.4 * b
    } else if (kind === 'Divergence') {
      d = i < 30 ? 150 * a + 90 : 100 * a - 110
      dp = i < 30 ? d / 120 + 0.3 * b : 0.35 + 0.3 * b
    } else {
      const quiet = i >= 20 && i < 40
      d = quiet ? 150 * a - 260 : 200 * a + 30
      dp = quiet ? 0.25 * b : d / 120 + 0.4 * b
    }
    p += dp
    return [p, Math.round(d)]
  })
}

/** Price against cumulative delta, with the start of counting under your control. */
function Cvd() {
  const [kind, setKind] = useState('Divergence')
  const [start, setStart] = useState(0)
  const data = bars(kind)
  let c = 0
  const cvd = data.map(([, d], i) => (i < start ? NaN : (c += d)))
  const prices = data.map(([p]) => p)
  const shown = cvd.filter(Number.isFinite)
  const lo = Math.min(0, ...shown) - 300
  const hi = Math.max(0, ...shown) + 300
  return (
    <div className="widget">
      <div className="seg">{['Together', 'Divergence', 'Absorption'].map(k => <button key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}</div>
      <Plot x={[0, 59]} y={[Math.min(...prices) - 2, Math.max(...prices) + 2]} height={160} yLabel="price">
        {s => (
          <>
            <Path s={s} pts={prices.map((p, i) => [i, p])} color="text" />
            <Seg s={s} a={[start, s.y0]} b={[start, s.y1]} color="muted" dash="3 3" />
          </>
        )}
      </Plot>
      <Plot x={[0, 59]} y={[lo, hi]} height={140} xLabel="5-minute bar" yLabel="cum. delta">
        {s => (
          <>
            <Path s={s} pts={cvd.map((v, i) => [i, v])} color="blue" />
            <Label s={s} x={start} y={0} color="muted">start</Label>
          </>
        )}
      </Plot>
      <Slider label="start counting at bar" value={start} min={0} max={50} step={1} onChange={setStart} show={v => String(v)} />
      <Readout
        items={[
          ['price since start', `${fmt(prices[59] - prices[start])} pts`],
          ['cum. delta at the end', String(shown[shown.length - 1]), shown[shown.length - 1] >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        <b>Together</b> is the usual case: price and cumulative delta rise and fall as one. In <b>Divergence</b> price keeps making highs after bar 30 while delta falls. In
        <b> Absorption</b> heavy selling from bar 20 to 40 hardly moves price. Move the start: the level of the line changes, its shape does not.
      </p>
    </div>
  )
}

// One made-up footprint bar, low price first: [price, bid volume, ask volume].
const ROWS: [number, number, number][] = [
  [6000.0, 35, 0], [6000.25, 60, 22], [6000.5, 48, 41], [6000.75, 30, 95], [6001.0, 25, 160],
  [6001.25, 40, 130], [6001.5, 52, 120], [6001.75, 70, 66], [6002.0, 44, 38], [6002.25, 18, 11],
]

/** A footprint bar whose imbalance ratio you set: diagonal imbalances, stacks and the auction at each end. */
function Footprint() {
  const [ratio, setRatio] = useState(3)
  const n = ROWS.length
  const buy = ROWS.map(([, , ask], i) => i > 0 && ask > 0 && ask >= ratio * ROWS[i - 1][1])
  const sell = ROWS.map(([, bid], i) => i < n - 1 && bid > 0 && bid >= ratio * ROWS[i + 1][2])
  const run = (flags: boolean[]) => flags.reduce<[number, number]>(([best, cur], f) => [Math.max(best, f ? cur + 1 : 0), f ? cur + 1 : 0], [0, 0])[0]
  const delta = ROWS.reduce((a, [, b, k]) => a + k - b, 0)
  const ends = (r: [number, number, number]) => (r[1] > 0 && r[2] > 0 ? 'unfinished' : 'finished')
  return (
    <div className="widget">
      <table className="cells">
        <thead><tr><th>price</th><th>bid</th><th>ask</th><th>buy ratio</th></tr></thead>
        <tbody>
          {ROWS.map((_, i) => i).reverse().map(i => (
            <tr key={i}>
              <th>{fmt(ROWS[i][0])}</th>
              <td style={sell[i] ? { color: 'var(--bad)', fontWeight: 700 } : undefined}>{ROWS[i][1]}</td>
              <td style={buy[i] ? { color: 'var(--good)', fontWeight: 700 } : undefined}>{ROWS[i][2]}</td>
              <td style={{ color: 'var(--muted)' }}>{i > 0 ? fmt(ROWS[i][2] / ROWS[i - 1][1], 2) : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Slider label="imbalance ratio" value={ratio} min={1.5} max={5} step={0.5} onChange={setRatio} show={v => `${fmt(v, 1)} to 1`} />
      <Readout
        items={[
          ['buy imbalances', String(buy.filter(Boolean).length), 'good'],
          ['sell imbalances', String(sell.filter(Boolean).length), 'bad'],
          ['longest buy stack', String(run(buy)), run(buy) >= 3 ? 'accent' : undefined],
          ['bar delta', `+${delta}`],
          ['high / low', `${ends(ROWS[n - 1])} / ${ends(ROWS[0])}`],
        ]}
      />
      <p className="caption">
        Each row is bid x ask volume at one price. The buy ratio compares the ask with the bid <b>one row below</b>. Green asks are buying imbalances and red bids selling
        imbalances at your ratio. Slide the ratio and watch the stack of three appear and vanish: the bar did not change, only the setting did.
      </p>
    </div>
  )
}

// A made-up ES ladder. Asks low to high; the 250-lot at 6001.50 is the "wall"; in Iceberg, 6001.00 hides 200 behind 20.
const ASKS: [number, number][] = [[6000.25, 15], [6000.5, 25], [6000.75, 30], [6001.0, 20], [6001.25, 35], [6001.5, 250], [6001.75, 40], [6002.0, 45], [6002.25, 50]]
const BIDS: [number, number][] = [[6000.0, 20], [5999.75, 30], [5999.5, 25], [5999.25, 40]]

/** A depth ladder you send market buys into: honest size, a wall that is pulled, and an iceberg that refills. */
function Ladder() {
  const [kind, setKind] = useState('Honest')
  const [bought, setBought] = useState(0)
  const size = ASKS.map(([p, q]) => (kind === 'Iceberg' && p === 6001 ? 200 : kind === 'Pulled' && p === 6001.5 && bought >= 90 ? 0 : q))
  let left = bought
  let cost = 0
  const taken = size.map((q, i) => {
    const t = Math.min(q, left)
    left -= t
    cost += t * ASKS[i][0]
    return t
  })
  const shown = size.map((q, i) => (kind === 'Iceberg' && ASKS[i][0] === 6001 ? Math.min(20, q - taken[i]) : q - taken[i]))
  const lastIdx = taken.reduce((a, t, i) => (t > 0 ? i : a), -1)
  const total = size.reduce((a, q) => a + q, 0)
  const pick = (k: string) => {
    setKind(k)
    setBought(0)
  }
  return (
    <div className="widget">
      <div className="seg">{['Honest', 'Pulled', 'Iceberg'].map(k => <button key={k} className={k === kind ? 'on' : ''} onClick={() => pick(k)}>{k}</button>)}</div>
      <table className="cells">
        <thead><tr><th>bid</th><th>price</th><th>ask</th><th>traded</th></tr></thead>
        <tbody>
          {ASKS.map((_, i) => i).reverse().map(i => (
            <tr key={i} style={i === lastIdx ? { color: 'var(--accent)' } : undefined}>
              <td /><th>{fmt(ASKS[i][0])}</th><td style={{ color: 'var(--bad)' }}>{shown[i] || ''}</td><td>{taken[i] || ''}</td>
            </tr>
          ))}
          {BIDS.map(([p, q]) => <tr key={p}><td style={{ color: 'var(--good)' }}>{q}</td><th>{fmt(p)}</th><td /><td /></tr>)}
        </tbody>
      </table>
      <div className="actions">
        <button className="btn" disabled={bought + 20 > total} onClick={() => setBought(bought + 20)}>market buy 20</button>
        <button className="btn" onClick={() => setBought(0)}>Reset</button>
      </div>
      <Readout
        items={[
          ['you bought', String(bought)],
          ['last trade', lastIdx >= 0 ? fmt(ASKS[lastIdx][0]) : '–', 'accent'],
          ['average fill', bought ? fmt(cost / bought, 3) : '–'],
          ['traded at 6001.00', String(taken[3])],
        ]}
      />
      <p className="caption">
        Send buys of 20 and watch them walk the asks. In <b>Pulled</b> the 250-lot at 6001.50 is cancelled as price comes near, and the same buying runs further. In
        <b> Iceberg</b> 6001.00 always shows 20 but keeps refilling, so far more trades there than was ever displayed. The ladder looks the same in all three at the start.
      </p>
    </div>
  )
}

export const orderflowWidgets: Record<string, ComponentType> = {
  'orderflow-tape': Tape,
  'orderflow-cvd': Cvd,
  'orderflow-footprint': Footprint,
  'orderflow-ladder': Ladder,
}
