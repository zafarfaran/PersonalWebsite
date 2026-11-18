import { useMemo, useState, type ComponentType } from 'react'
import { Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/* ---------- 1. The life of an order ---------- */

type State = 'pending' | 'new' | 'partial' | 'filled' | 'pending_cancel' | 'canceled' | 'rejected' | 'expired'
type Ev = 'accept' | 'reject' | 'fill' | 'cancel' | 'confirm' | 'expire'

const NODES: Record<State, { x: number; y: number; label: string }> = {
  pending: { x: 1.1, y: 4.6, label: 'sent' },
  new: { x: 3.7, y: 4.6, label: 'new' },
  partial: { x: 6.3, y: 4.6, label: 'partially filled' },
  filled: { x: 8.9, y: 4.6, label: 'filled' },
  rejected: { x: 1.1, y: 1.4, label: 'rejected' },
  expired: { x: 3.7, y: 1.4, label: 'expired' },
  pending_cancel: { x: 6.3, y: 1.4, label: 'pending cancel' },
  canceled: { x: 8.9, y: 1.4, label: 'cancelled' },
}
const EDGES: [State, State][] = [
  ['pending', 'new'], ['pending', 'rejected'], ['new', 'partial'], ['partial', 'filled'], ['new', 'expired'],
  ['new', 'pending_cancel'], ['partial', 'pending_cancel'], ['pending_cancel', 'canceled'], ['pending_cancel', 'filled'],
]
const TERMINAL: State[] = ['filled', 'canceled', 'rejected', 'expired']
const QTY = 100

function step(st: State, filled: number, ev: Ev): [State, number] | null {
  if (TERMINAL.includes(st)) return null
  if (ev === 'accept') return st === 'pending' ? ['new', filled] : null
  if (ev === 'reject') return st === 'pending' ? ['rejected', filled] : null
  if (ev === 'fill') {
    if (st === 'pending') return null
    const f = Math.min(QTY, filled + 40)
    return [f === QTY ? 'filled' : st === 'pending_cancel' ? 'pending_cancel' : 'partial', f]
  }
  if (ev === 'cancel') return st === 'new' || st === 'partial' ? ['pending_cancel', filled] : null
  if (ev === 'confirm') return st === 'pending_cancel' ? ['canceled', filled] : null
  return st === 'new' || st === 'partial' ? ['expired', filled] : null
}

const BUTTONS: [Ev, string][] = [['accept', 'Accept'], ['reject', 'Reject'], ['fill', 'Fill 40'], ['cancel', 'Cancel request'], ['confirm', 'Cancel confirmed'], ['expire', 'Expire']]

function Orders() {
  const [st, setSt] = useState<State>('pending')
  const [filled, setFilled] = useState(0)
  const [log, setLog] = useState<string[]>(['buy 100 sent'])
  const send = (ev: Ev, name: string) => {
    const next = step(st, filled, ev)
    if (!next) return setLog([`${name}: ignored in state "${NODES[st].label}"`, ...log].slice(0, 4))
    setSt(next[0])
    setFilled(next[1])
    setLog([`${name} → ${NODES[next[0]].label}`, ...log].slice(0, 4))
  }
  const reset = () => { setSt('pending'); setFilled(0); setLog(['buy 100 sent']) }
  return (
    <div className="widget">
      <Plot x={[0, 10]} y={[0, 6]} height={210} bare>
        {s => (
          <>
            {EDGES.map(([a, b]) => (
              <Seg key={a + b} s={s} a={[NODES[a].x, NODES[a].y]} b={[NODES[b].x, NODES[b].y]} color="muted" width={1.2} />
            ))}
            {(Object.keys(NODES) as State[]).map(k => {
              const n = NODES[k]
              const on = k === st
              return (
                <g key={k}>
                  <rect x={s.x(n.x) - 40} y={s.y(n.y) - 13} width={80} height={26} rx={6}
                    fill={on ? 'var(--accent)' : 'var(--surface)'} stroke={TERMINAL.includes(k) ? 'var(--text)' : 'var(--muted)'}
                    strokeWidth={TERMINAL.includes(k) ? 2 : 1} />
                  <text x={s.x(n.x)} y={s.y(n.y) + 4} textAnchor="middle" fontSize={11} fill={on ? 'var(--surface)' : 'var(--text)'}>{n.label}</text>
                </g>
              )
            })}
          </>
        )}
      </Plot>
      <div className="actions">
        {BUTTONS.map(([ev, name]) => <button key={ev} className="btn" onClick={() => send(ev, name)}>{name}</button>)}
        <button className="btn" onClick={reset}>Reset</button>
      </div>
      <Readout items={[['state', NODES[st].label, TERMINAL.includes(st) ? 'bad' : 'accent'], ['filled', `${filled} of ${QTY}`], ['remaining', `${QTY - filled}`]]} />
      <table className="cells"><tbody>{log.map((l, i) => <tr key={i}><td>{l}</td></tr>)}</tbody></table>
      <p className="caption">
        A buy order for 100 shares and the updates a broker can send about it. Boxes with a heavy border are terminal: try any button after reaching one. Then
        request a cancel and send fills before confirming it: the fill can win the race, and your program must believe the broker, not its own request.
      </p>
    </div>
  )
}

/* ---------- 2. TWAP against VWAP over a day ---------- */

const BUCKETS = 13
const EXPECTED = Array.from({ length: BUCKETS }, (_, k) => 1 + 2 * ((k - 6) / 6) ** 2)
const DRIFT = [0.12, -0.1, 0.05]

function makeDay(d: number) {
  const g = gaussian(seeded(346 + d))
  const vol = EXPECTED.map(e => Math.max(0.3, e * (1 + 0.25 * g())))
  const price: number[] = []
  let p = 100
  for (let k = 0; k < BUCKETS; k++) {
    p += DRIFT[d] + 0.08 * g()
    price.push(p)
  }
  const wavg = (w: number[]) => w.reduce((a, x, k) => a + x * price[k], 0) / w.reduce((a, x) => a + x, 0)
  return { vol, price, market: wavg(vol), twap: wavg(EXPECTED.map(() => 1)), vwap: wavg(EXPECTED) }
}
const DAYS = [0, 1, 2].map(makeDay)

function Execution() {
  const [d, setD] = useState(0)
  const [algo, setAlgo] = useState<'twap' | 'vwap'>('vwap')
  const day = DAYS[d]
  const lo = Math.min(...day.price, 100) - 0.6
  const hi = Math.max(...day.price, 100) + 0.3
  const vmax = Math.max(...day.vol)
  const band = (hi - lo) * 0.35
  const sched = algo === 'twap' ? EXPECTED.map(() => 1) : EXPECTED
  const smax = Math.max(...sched)
  const fill = algo === 'twap' ? day.twap : day.vwap
  const bps = (v: number) => `${fmt(((v - 100) / 100) * 10000, 1)} bps`
  return (
    <div className="widget">
      <div className="seg">
        {[0, 1, 2].map(k => <button key={k} className={k === d ? 'on' : ''} onClick={() => setD(k)}>Day {k + 1}</button>)}
      </div>
      <Plot x={[0, BUCKETS]} y={[lo, hi]} xLabel="half hours from 9:30" yLabel="price">
        {s => (
          <>
            {day.vol.map((v, k) => (
              <rect key={k} x={s.x(k + 0.08)} width={s.w(0.4)} y={s.y(lo + (band * v) / vmax)} height={s.h((band * v) / vmax)} fill="var(--muted)" opacity={0.5} />
            ))}
            {sched.map((v, k) => (
              <rect key={'s' + k} x={s.x(k + 0.52)} width={s.w(0.4)} y={s.y(lo + (band * v) / smax)} height={s.h((band * v) / smax)} fill="var(--accent)" opacity={0.7} />
            ))}
            <Path s={s} pts={day.price.map((p, k) => [k + 0.5, p] as Pt)} color="text" width={2} />
            <Seg s={s} a={[0, 100]} b={[BUCKETS, 100]} color="muted" dash="2 4" />
            <Seg s={s} a={[0, day.market]} b={[BUCKETS, day.market]} color="blue" dash="6 4" width={2} />
            <Seg s={s} a={[0, fill]} b={[BUCKETS, fill]} color="accent" width={2} />
          </>
        )}
      </Plot>
      <div className="seg">
        <button className={algo === 'twap' ? 'on' : ''} onClick={() => setAlgo('twap')}>TWAP slices</button>
        <button className={algo === 'vwap' ? 'on' : ''} onClick={() => setAlgo('vwap')}>VWAP slices</button>
      </div>
      <Readout
        items={[
          ['arrival', '100.00', 'muted'],
          ['market VWAP', fmt(day.market, 3), 'blue'],
          ['TWAP fill', `${fmt(day.twap, 3)} (${bps(day.twap)})`],
          ['VWAP fill', `${fmt(day.vwap, 3)} (${bps(day.vwap)})`],
          [`${algo.toUpperCase()} gap to VWAP`, fmt(Math.abs(fill - day.market), 3), 'accent'],
        ]}
      />
      <p className="caption">
        Grey bars are the volume that traded in each half hour, yellow bars your slices, the black line the price. The blue dashed line is the day's VWAP and the
        yellow line your average fill; shortfall is measured from the arrival price of 100. Switch between the slice plans and the three days: following the volume
        lands nearer VWAP, but near VWAP is not cheap: on day 1, which rises, both plans pay well above the arrival price.
      </p>
    </div>
  )
}

/* ---------- 3. Orders through the risk checks ---------- */

interface Order { t: number; qty: number; dev: number }

/** A made-up session: ordinary orders, one far-off price, one oversized order, and a burst from a looping bug. */
const ORDERS: Order[] = (() => {
  const rnd = seeded(12)
  const out: Order[] = []
  let t = 0
  for (let i = 0; i < 26; i++) {
    t += 15 + 30 * rnd()
    const side = rnd() < 0.5 ? 1 : -1
    out.push({ t, qty: side * 100 * (1 + Math.floor(4 * rnd())), dev: (rnd() - 0.5) * 0.008 })
    if (i === 6) out.push({ t: t + 5, qty: 200, dev: 0.04 })
    if (i === 9) out.push({ t: t + 5, qty: -1500, dev: -0.002 })
    if (i === 12) for (let k = 1; k <= 15; k++) out.push({ t: t + 0.12 * k, qty: 200, dev: 0.001 })
  }
  return out
})()

function Risk() {
  const [maxQty, setMaxQty] = useState(500)
  const [maxPos, setMaxPos] = useState(1000)
  const [collar, setCollar] = useState(2)
  const [rate, setRate] = useState(10)
  const run = useMemo(() => {
    let pos = 0
    const sent: number[] = []
    const why = { size: 0, position: 0, collar: 0, rate: 0 }
    const pts = ORDERS.map((o, i) => {
      let r: keyof typeof why | '' = ''
      if (Math.abs(o.qty) > maxQty) r = 'size'
      else if (Math.abs(pos + o.qty) > maxPos) r = 'position'
      else if (Math.abs(o.dev) > collar / 100) r = 'collar'
      else if (sent.filter(t => t > o.t - 60).length >= rate) r = 'rate'
      if (r) why[r]++
      else { pos += o.qty; sent.push(o.t) }
      return { i, pos, ok: !r }
    })
    return { pts, why, peak: Math.max(...pts.map(p => Math.abs(p.pos))) }
  }, [maxQty, maxPos, collar, rate])
  const span = Math.max(1200, run.peak + 300)
  return (
    <div className="widget">
      <Plot x={[0, ORDERS.length]} y={[-span, span]} xLabel="order" yLabel="position after">
        {s => (
          <>
            <Seg s={s} a={[0, maxPos]} b={[ORDERS.length, maxPos]} color="bad" dash="4 4" />
            <Seg s={s} a={[0, -maxPos]} b={[ORDERS.length, -maxPos]} color="bad" dash="4 4" />
            <Path s={s} pts={run.pts.map(p => [p.i, p.pos] as Pt)} color="muted" width={1.2} />
            {run.pts.map(p => <Dot key={p.i} s={s} x={p.i} y={p.pos} r={3.5} color={p.ok ? 'good' : 'bad'} ring={!p.ok} />)}
          </>
        )}
      </Plot>
      <Slider label="max order size" value={maxQty} min={200} max={2000} step={100} onChange={setMaxQty} />
      <Slider label="max position" value={maxPos} min={500} max={5000} step={250} onChange={setMaxPos} />
      <Slider label="price collar" value={collar} min={1} max={5} step={0.5} onChange={setCollar} show={v => `${v}%`} />
      <Slider label="max orders a minute" value={rate} min={5} max={60} step={1} onChange={setRate} />
      <Readout
        items={[
          ['passed', `${run.pts.filter(p => p.ok).length} of ${ORDERS.length}`, 'good'],
          ['blocked: size / position', `${run.why.size} / ${run.why.position}`, 'bad'],
          ['blocked: collar / rate', `${run.why.collar} / ${run.why.rate}`, 'bad'],
          ['largest position', `${run.peak}`],
        ]}
      />
      <p className="caption">
        A made-up session of orders, each assumed filled if it passes. Green dots passed, red rings were blocked. One order carries a price 4% away, one is 1,500
        shares, and partway through a looping bug fires 15 buys of 200 in under two seconds. Loosen each limit in turn and see which one stops which mistake.
      </p>
    </div>
  )
}

/* ---------- 4. Backtest against live ---------- */

/** 200 made-up trades with a small gross edge: 38% winners of 2R, the rest losers of 1R. */
const GROSS: number[] = (() => {
  const rnd = seeded(18)
  return Array.from({ length: 200 }, () => (rnd() < 0.38 ? 2 : -1))
})()
const RISK_CENTS = 40

function cumulative(r: number[]): number[] {
  const out = [0]
  for (const x of r) out.push(out[out.length - 1] + x)
  return out
}

function Live() {
  const [slip, setSlip] = useState(0)
  const [lat, setLat] = useState(0)
  const costR = (2 * slip + (lat / 100) * 0.5) / RISK_CENTS
  const back = cumulative(GROSS)
  const live = cumulative(GROSS.map(x => x - costR))
  const n = GROSS.length
  const all = [...back, ...live]
  const liveExp = live[n] / n
  return (
    <div className="widget">
      <Plot x={[0, n]} y={[Math.min(...all) - 2, Math.max(...all) + 2]} xLabel="trade" yLabel="equity in R">
        {s => (
          <>
            <Path s={s} pts={back.map((v, i) => [i, v] as Pt)} color="muted" width={1.5} />
            <Path s={s} pts={live.map((v, i) => [i, v] as Pt)} color={liveExp > 0 ? 'good' : 'bad'} width={2.5} />
          </>
        )}
      </Plot>
      <Slider label="slippage a side" value={slip} min={0} max={5} step={0.5} onChange={setSlip} show={v => `${v}¢`} />
      <Slider label="latency" value={lat} min={0} max={500} step={50} onChange={setLat} show={v => `${v} ms`} />
      <Readout
        items={[
          ['cost a trade', `${fmt(costR, 3)}R`],
          ['backtest', `${fmt(back[n] / n, 3)}R a trade`, 'muted'],
          ['live', `${fmt(liveExp, 3)}R a trade`, liveExp > 0 ? 'good' : 'bad'],
          ['live total', `${fmt(live[n], 1)}R`],
        ]}
      />
      <p className="caption">
        The grey curve is the backtest of 200 trades, the coloured one the same trades live, with a risk of 40¢ a share. Slippage is paid on entry and exit;
        latency lets the price move half a cent against you for every 100 ms. A few cents a share is enough to take most of a small edge, which is why the
        first live trades are small and are measured against the backtest one by one.
      </p>
    </div>
  )
}

export const algoWidgets: Record<string, ComponentType> = {
  'algo-orders': Orders,
  'algo-execution': Execution,
  'algo-risk': Risk,
  'algo-live': Live,
}
