import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Path, Plot, Readout, Seg, Slider, fmt, seeded } from '../components/Plot'

type Pt = [number, number]
const usd = (v: number) => `${v < 0 ? '−' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`
const range = (vals: number[], pad = 0.1): [number, number] => {
  const lo = Math.min(0, ...vals)
  const hi = Math.max(0, ...vals)
  const p = Math.max(1, (hi - lo) * pad)
  return [lo - p, hi + p]
}

/** Cutting winners and holding losers: the win rate rises, the expectancy does not. */
function Disposition() {
  const [target, setTarget] = useState(1)
  const [stop, setStop] = useState(1)
  const [cost, setCost] = useState(0)
  const n = 300
  const pWin = stop / (target + stop)
  const { pts, wins } = useMemo(() => {
    const rnd = seeded(2072)
    let eq = 0
    let w = 0
    const out: Pt[] = [[0, 0]]
    for (let i = 1; i <= n; i++) {
      const win = rnd() < pWin
      if (win) w++
      eq += (win ? target : -stop) - cost
      out.push([i, eq])
    }
    return { pts: out, wins: w }
  }, [target, stop, cost, pWin])
  const [lo, hi] = range(pts.map(p => p[1]))
  return (
    <div className="widget">
      <Plot x={[0, n]} y={[lo, hi]} xLabel="trade" yLabel="P&L per share ($)">
        {s => (
          <>
            <Curve s={s} f={x => (pWin * target - (1 - pWin) * stop - cost) * x} color="muted" dash="4 4" width={1.5} />
            <Path s={s} pts={pts} color={pts[n][1] >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="target (+$)" value={target} min={0.25} max={4} step={0.25} onChange={setTarget} />
      <Slider label="stop (−$)" value={stop} min={0.25} max={4} step={0.25} onChange={setStop} />
      <Slider label="cost per trade ($)" value={cost} min={0} max={0.1} step={0.01} onChange={setCost} />
      <Readout
        items={[
          ['win rate in theory', `${fmt(pWin * 100, 0)}%`],
          ['win rate here', `${fmt((wins / n) * 100, 0)}%`],
          ['expectancy per trade', `$${fmt(pWin * target - (1 - pWin) * stop - cost)}`, cost > 0 ? 'bad' : 'muted'],
          ['after 300 trades', `$${fmt(pts[n][1])}`, pts[n][1] >= 0 ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        The stock moves at random, so nothing here has an edge. Each trade exits at the target or the stop; the dashed line is what the exits earn on average. Pull the target in and push the stop out, as the disposition effect
        does, and the <b>win rate</b> climbs towards 90% while the expectancy stays at zero. Add a few cents of cost and every setting loses. A high win rate tells you where
        the exits are, not whether you have an edge.
      </p>
    </div>
  )
}

/** Revenge trading against a daily loss limit, over 250 made-up days. */
function Tilt() {
  const [tilt, setTilt] = useState(true)
  const [limit, setLimit] = useState(0)
  const days = 250
  const u = useMemo(() => {
    const rnd = seeded(7)
    return Array.from({ length: days }, () => Array.from({ length: 10 }, () => rnd()))
  }, [])
  const run = (onTilt: boolean, lim: number) => {
    const daily: number[] = []
    let stopped = 0
    for (const day of u) {
      let pnl = 0
      let size = 1
      let lostLast = false
      const trades = onTilt ? 10 : 6
      for (let t = 0; t < trades; t++) {
        if (lim > 0 && pnl <= -lim) { stopped++; break }
        // a calm trade wins 45% of the time; a trade taken on tilt after a loss wins 30%
        const p: number = onTilt && lostLast ? 0.3 : 0.45
        const r: number = day[t] < p ? 1.5 : -1
        pnl += r * size
        lostLast = r < 0
        if (onTilt) size = lostLast ? Math.min(size * 2, 8) : 1
      }
      daily.push(pnl)
    }
    return { daily, stopped }
  }
  const now = run(tilt, limit)
  const calm = run(false, 0)
  const curve = (d: number[]): Pt[] => {
    let eq = 0
    return [[0, 0], ...d.map((v, i): Pt => [i + 1, (eq += v)])]
  }
  const a = curve(now.daily)
  const b = curve(calm.daily)
  const [lo, hi] = range([...a, ...b].map(p => p[1]))
  const total = a[days][1]
  return (
    <div className="widget">
      <div className="seg">
        <button className={!tilt ? 'on' : ''} onClick={() => setTilt(false)}>Calm</button>
        <button className={tilt ? 'on' : ''} onClick={() => setTilt(true)}>On tilt</button>
      </div>
      <Plot x={[0, days]} y={[lo, hi]} xLabel="day" yLabel="account (R)">
        {s => (
          <>
            <Path s={s} pts={b} color="muted" dash="4 4" width={1.5} />
            <Path s={s} pts={a} color={total >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="daily loss limit" value={limit} min={0} max={10} step={1} onChange={setLimit} show={v => (v ? `${v}R` : 'off')} />
      <Readout
        items={[
          ['average day', `${fmt(total / days)}R`],
          ['worst day', `${fmt(Math.min(...now.daily), 1)}R`, 'bad'],
          ['total, 250 days', `${fmt(total, 0)}R`, total >= 0 ? 'good' : 'bad'],
          ['days stopped by the limit', String(now.stopped)],
        ]}
      />
      <p className="caption">
        The same setups on the same days. <b>Calm</b> takes up to 6 planned trades at 1R each (dashed line). <b>On tilt</b> doubles the size after each loss, takes worse trades
        after a loss and keeps going for up to 10 trades. Look at the worst day, then turn on a daily loss limit. The limit cannot make a bad habit profitable, but it
        removes the days that end an account.
      </p>
    </div>
  )
}

/** Good and bad processes over few and many trades. */
function Luck() {
  const [good, setGood] = useState(true)
  const [n, setN] = useState(20)
  const paths = 40
  const u = useMemo(() => {
    const rnd = seeded(23)
    return Array.from({ length: paths }, () => Array.from({ length: 200 }, () => rnd()))
  }, [])
  const [p, win, loss] = good ? [0.4, 2, 1] : [0.55, 1, 1.5]
  const edge = p * win - (1 - p) * loss
  const curves = u.map(row => {
    let eq = 0
    const pts: Pt[] = [[0, 0]]
    for (let i = 0; i < n; i++) {
      eq += row[i] < p ? win : -loss
      pts.push([i + 1, eq])
    }
    return pts
  })
  const ends = curves.map(c => c[n][1])
  const behind = ends.filter(v => v < 0).length
  const [lo, hi] = range(curves.flat().map(q => q[1]), 0.05)
  return (
    <div className="widget">
      <div className="seg">
        <button className={good ? 'on' : ''} onClick={() => setGood(true)}>Good process</button>
        <button className={!good ? 'on' : ''} onClick={() => setGood(false)}>Bad process</button>
      </div>
      <Plot x={[0, n]} y={[lo, hi]} xLabel="trade" yLabel="result (R)">
        {s => (
          <>
            {curves.map((c, i) => <Path key={i} s={s} pts={c} color={c[n][1] >= 0 ? 'good' : 'bad'} width={1} opacity={0.5} />)}
            <Seg s={s} a={[0, 0]} b={[n, 0]} color="muted" />
            <Curve s={s} f={x => edge * x} color="accent" width={2.5} />
          </>
        )}
      </Plot>
      <Slider label="trades" value={n} min={5} max={200} step={5} onChange={setN} />
      <Readout
        items={[
          ['setup', good ? 'wins 40%, +2R / −1R' : 'wins 55%, +1R / −1.5R'],
          ['expectancy', `${edge > 0 ? '+' : ''}${fmt(edge, 3)}R`, edge > 0 ? 'good' : 'bad'],
          ['traders behind', `${behind} of ${paths}`],
          ['best, worst', `${fmt(Math.max(...ends), 1)}R, ${fmt(Math.min(...ends), 1)}R`],
        ]}
      />
      <p className="caption">
        Forty traders follow the same rules. The thick line is what the rules earn on average. Over a few trades, many traders with the good process are behind and many
        with the bad process are ahead. Move the slider towards 200 and the results line up behind the process. Judge a single trade or a single week by the decision.
      </p>
    </div>
  )
}

/** A year of trading as a small business: per-trade costs, fixed costs and the edge that has to pay for them. */
function Costs() {
  const [account, setAccount] = useState(20000)
  const [perDay, setPerDay] = useState(5)
  const [cost, setCost] = useState(8)
  const [fixed, setFixed] = useState(100)
  const [edge, setEdge] = useState(10)
  const net = (k: number) => (edge - cost) * k * 252 - fixed * 12
  const year = net(perDay)
  const breakEven = cost + (fixed * 12) / (perDay * 252)
  const ys = Array.from({ length: 20 }, (_, i) => net(i + 1))
  const [lo, hi] = range(ys)
  return (
    <div className="widget">
      <Plot x={[1, 20]} y={[lo, hi]} xLabel="trades per day" yLabel="net for the year ($)">
        {s => (
          <>
            <Curve s={s} f={net} color={edge > cost ? 'good' : 'bad'} n={19} />
            <Dot s={s} x={perDay} y={year} color={year >= 0 ? 'good' : 'bad'} />
          </>
        )}
      </Plot>
      <Slider label="account" value={account} min={5000} max={100000} step={5000} onChange={setAccount} show={usd} />
      <Slider label="trades per day" value={perDay} min={1} max={20} step={1} onChange={setPerDay} />
      <Slider label="cost per round trip" value={cost} min={1} max={30} step={1} onChange={setCost} show={usd} />
      <Slider label="fixed costs a month" value={fixed} min={0} max={500} step={25} onChange={setFixed} show={usd} />
      <Slider label="gross edge per trade" value={edge} min={0} max={40} step={1} onChange={setEdge} show={usd} />
      <Readout
        items={[
          ['gross, 252 days', usd(edge * perDay * 252)],
          ['all costs', usd(cost * perDay * 252 + fixed * 12), 'bad'],
          ['net', usd(year), year >= 0 ? 'good' : 'bad'],
          ['net return on the account', `${fmt((year / account) * 100, 1)}%`],
          ['break-even edge per trade', `$${fmt(breakEven)}`],
        ]}
      />
      <p className="caption">
        Gross edge is what the trades make on average before any cost. When it is below the cost of a round trip, the line slopes down: every extra trade loses more. Fixed
        costs shift the whole line down and matter most for an account that trades little. Read the return the account would need to pay you a salary.
      </p>
    </div>
  )
}

export const businessWidgets: Record<string, ComponentType> = {
  'business-disposition': Disposition,
  'business-tilt': Tilt,
  'business-luck': Luck,
  'business-costs': Costs,
}
