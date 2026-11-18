import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

/** Market sells arriving at the best bid, one number per second, the same on every visit. */
const QT = 120
const SELLS: number[] = (() => {
  const r = seeded(7)
  return Array.from({ length: QT }, () => (r() < 0.2 ? 50 * Math.ceil(r() * 4) : 0))
})()

/** Your bid in the queue: shares ahead shrink through trades and cancels; you fill only after them. */
function Queue() {
  const [ahead0, setAhead] = useState(1500)
  const [cancel, setCancel] = useState(0)
  const MINE = 200
  const sim = useMemo(() => {
    let ahead = ahead0
    let mine = MINE
    let cancelled = 0
    let filledAt = -1
    const a: Pt[] = [[0, ahead]]
    const m: Pt[] = [[0, mine]]
    SELLS.forEach((v, t) => {
      const c = ahead * (cancel / 100)
      cancelled += c
      ahead -= c
      const take = Math.min(v, ahead)
      ahead -= take
      const fill = Math.min(v - take, mine)
      mine -= fill
      if (mine === 0 && filledAt < 0) filledAt = t + 1
      a.push([t + 1, ahead])
      m.push([t + 1, mine])
    })
    return { a, m, cancelled, filledAt, mine }
  }, [ahead0, cancel])
  const sold = SELLS.reduce((x, y) => x + y, 0)
  return (
    <div className="widget">
      <Plot x={[0, QT]} y={[0, 3200]} xLabel="seconds" yLabel="shares">
        {s => (
          <>
            {SELLS.map((v, t) => v > 0 && <rect key={t} x={s.x(t)} width={Math.max(1, s.w(1) - 0.5)} y={s.y(v)} height={s.y(0) - s.y(v)} fill="var(--muted)" opacity={0.5} />)}
            <Path s={s} pts={sim.a} color="accent" />
            <Path s={s} pts={sim.m} color="good" />
            {sim.filledAt > 0 && <Seg s={s} a={[sim.filledAt, 0]} b={[sim.filledAt, 3200]} color="good" dash="4 4" />}
          </>
        )}
      </Plot>
      <Slider label="shares ahead of you" value={ahead0} min={0} max={3000} step={100} onChange={setAhead} />
      <Slider label="cancels ahead, % per second" value={cancel} min={0} max={3} step={0.25} onChange={setCancel} />
      <Readout
        items={[
          ['filled at', sim.filledAt > 0 ? `${sim.filledAt} s` : 'not filled', sim.filledAt > 0 ? 'good' : 'bad'],
          ['your shares filled', `${MINE - sim.mine} of ${MINE}`],
          ['sold at your price', sold],
          ['removed by cancels', fmt(sim.cancelled, 0)],
        ]}
      />
      <p className="caption">
        Your bid for 200 shares joins the back of the queue at the best bid. Grey bars are market sells (the same in every run), yellow the shares still ahead of you, green
        your shares not yet filled. Move the queue size and the cancel rate: the price never changes, only whether and when your turn comes.
      </p>
    </div>
  )
}

/** The average path of the price while a buy order is worked, and after it ends, under the square-root rule. */
function Impact() {
  const [size, setSize] = useState(1)
  const [vol, setVol] = useState(2)
  const [dur, setDur] = useState(120)
  const peak = (vol / 100) * Math.sqrt(size / 100) * 10000
  const f = (t: number) => (t <= dur ? peak * Math.sqrt(t / dur) : peak * (2 / 3 + (1 / 3) * Math.exp(-(t - dur) / 45)))
  const avg = (2 / 3) * peak
  const shares = (size / 100) * 2_000_000
  return (
    <div className="widget">
      <Plot x={[0, 390]} y={[0, 220]} xLabel="minutes after the decision" yLabel="price move (bps)">
        {s => (
          <>
            <Curve s={s} f={f} n={200} color="accent" />
            <Seg s={s} a={[0, avg]} b={[dur, avg]} color="blue" dash="4 4" />
            <Seg s={s} a={[dur, 0]} b={[dur, 220]} color="muted" dash="2 4" />
          </>
        )}
      </Plot>
      <Slider label="order size, % of daily volume" value={size} min={0.25} max={10} step={0.25} onChange={setSize} />
      <Slider label="daily volatility, %" value={vol} min={1} max={4} step={0.25} onChange={setVol} />
      <Slider label="minutes to work the order" value={dur} min={30} max={300} step={15} onChange={setDur} />
      <Readout
        items={[
          ['peak impact', `${fmt(peak, 1)} bps`, 'accent'],
          ['average fill cost', `${fmt(avg, 1)} bps`, 'blue'],
          ['cost on a $50 stock', `$${fmt((shares * 50 * avg) / 10000, 0)}`],
          ['left at the close', `${fmt(f(390), 1)} bps`],
        ]}
      />
      <p className="caption">
        The average price path, in bps above the arrival price, of a buy order worked at a steady rate in a made-up stock trading 2 million shares a day. During the order the
        price rises like √(shares done); the blue line is the average cost of your fills, two thirds of the peak. After the order ends the temporary part fades towards two thirds of
        the peak. Change the size, then the time: in this rule the time changes when you pay, not how much.
      </p>
    </div>
  )
}

const SX = 10000
const SN = 10
const SSIG = 0.5
const SETA = 1e-4
function holdings(lam: number): number[] {
  const k = Math.acosh(1 + (lam * SSIG * SSIG) / (2 * SETA))
  return Array.from({ length: SN + 1 }, (_, j) => (k < 1e-9 ? (SX * (SN - j)) / SN : (SX * Math.sinh(k * (SN - j))) / Math.sinh(k * SN)))
}
function score(x: number[]): [number, number] {
  const n = x.slice(1).map((v, i) => x[i] - v)
  return [SETA * n.reduce((a, b) => a + b * b, 0), SSIG * Math.sqrt(x.slice(1).reduce((a, b) => a + b * b, 0))]
}
const FRONTIER: Pt[] = Array.from({ length: 41 }, (_, i) => {
  const [c, sd] = score(holdings(10 ** (-8 + i * 0.125)))
  return [sd, c]
})

/** Almgren-Chriss holdings for a chosen risk aversion, and where that schedule sits on the cost-risk frontier. */
function Schedule() {
  const [e, setE] = useState(-7)
  const x = holdings(10 ** e)
  const [cost, sd] = score(x)
  return (
    <div className="widget">
      <Plot x={[0, SN]} y={[0, SX]} xLabel="period" yLabel="shares left to sell" height={220}>
        {s => (
          <>
            <Seg s={s} a={[0, SX]} b={[SN, 0]} color="muted" dash="4 4" />
            <Path s={s} pts={x.map((v, j) => [j, v] as Pt)} color="accent" />
            {x.map((v, j) => <Dot key={j} s={s} x={j} y={v} r={3} />)}
          </>
        )}
      </Plot>
      <Plot x={[0, 9000]} y={[0, 8000]} xLabel="standard deviation ($)" yLabel="expected cost ($)" height={180}>
        {s => (
          <>
            <Path s={s} pts={FRONTIER} color="blue" />
            <Dot s={s} x={sd} y={cost} color="accent" />
          </>
        )}
      </Plot>
      <Slider label="risk aversion λ (log10)" value={e} min={-8} max={-3} step={0.25} onChange={setE} show={v => `1e${v}`} />
      <Readout
        items={[
          ['expected cost', `$${fmt(cost, 0)}`, 'accent'],
          ['standard deviation', `$${fmt(sd, 0)}`, 'blue'],
          ['first slice', `${fmt(x[0] - x[1], 0)} shares`],
        ]}
      />
      <p className="caption">
        Selling 10,000 made-up shares in 10 periods with linear impact (η = 0.0001) and a price that moves $0.50 a period. The dashed line is TWAP. Raise λ: the schedule bends
        towards an early finish, and the dot slides along the frontier from cheap and risky to dear and safe. Every point is optimal for someone.
      </p>
    </div>
  )
}

const MT = 600
const MDRAW = (() => {
  const g = gaussian(seeded(31))
  const r = seeded(32)
  return Array.from({ length: MT }, () => ({ z: g(), ub: r(), us: r() }))
})()

/** A market maker quoting around the mid, with inventory skew and optional informed flow. */
function MarketMaker() {
  const [skew, setSkew] = useState(0)
  const [informed, setInformed] = useState(false)
  const sim = useMemo(() => {
    let mid = 50
    let inv = 0
    let cash = 0
    let spread = 0
    let worst = 0
    const path: Pt[] = [[0, 0]]
    MDRAW.forEach(({ z, ub, us }, t) => {
      const move = 0.01 * z
      const centre = mid - (skew / 100) * (inv / 100)
      const bid = centre - 0.02
      const ask = centre + 0.02
      const tilt = informed ? 0.6 * Math.sign(move) : 0
      const pBuy = Math.min(1, 0.6 * Math.exp(-30 * (ask - mid)) * (1 + tilt))
      const pSell = Math.min(1, 0.6 * Math.exp(-30 * (mid - bid)) * (1 - tilt))
      if (ub < pBuy) [inv, cash, spread] = [inv - 100, cash + 100 * ask, spread + 100 * (ask - mid)]
      if (us < pSell) [inv, cash, spread] = [inv + 100, cash - 100 * bid, spread + 100 * (mid - bid)]
      mid += move
      worst = Math.max(worst, Math.abs(inv))
      path.push([t + 1, inv])
    })
    const total = cash + inv * mid
    return { path, spread, total, worst }
  }, [skew, informed])
  return (
    <div className="widget">
      <div className="seg">
        <button className={!informed ? 'on' : ''} onClick={() => setInformed(false)}>Random flow</button>
        <button className={informed ? 'on' : ''} onClick={() => setInformed(true)}>Some informed flow</button>
      </div>
      <Plot x={[0, MT]} y={[-2000, 2000]} xLabel="step" yLabel="inventory (shares)">
        {s => <Path s={s} pts={sim.path} color="accent" width={1.5} />}
      </Plot>
      <Slider label="skew, cents per 100 shares held" value={skew} min={0} max={1} step={0.05} onChange={setSkew} />
      <Readout
        items={[
          ['spread captured', `$${fmt(sim.spread, 0)}`, 'good'],
          ['inventory P&L', `$${fmt(sim.total - sim.spread, 0)}`, sim.total - sim.spread >= 0 ? 'good' : 'bad'],
          ['total P&L', `$${fmt(sim.total, 0)}`, sim.total >= 0 ? 'good' : 'bad'],
          ['largest inventory', sim.worst],
        ]}
      />
      <p className="caption">
        A made-up maker quotes 2 cents either side of a centre, trading 100 shares each time a quote is hit; the price and the order arrivals are the same in every run. With no
        skew, inventory wanders and the inventory P&L swamps the spread. Raise the skew, then switch on informed flow, where buyers arrive more often shortly before the price rises.
      </p>
    </div>
  )
}

export const executionWidgets: Record<string, ComponentType> = {
  'execution-queue': Queue,
  'execution-impact': Impact,
  'execution-schedule': Schedule,
  'execution-mm': MarketMaker,
}
