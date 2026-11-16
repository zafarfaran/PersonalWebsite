import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

const whole = (v: number) => Math.round(v).toLocaleString('en-GB')

// An evening bump in traffic, 0 to 1, centred on 20:00.
const bump = (hour: number) => {
  const d = Math.min(Math.abs(hour - 20), 24 - Math.abs(hour - 20))
  return Math.exp(-0.5 * (d / 1.5) ** 2)
}
const BUMP_MEAN = Array.from({ length: 240 }, (_, i) => bump(i / 10)).reduce((a, b) => a + b, 0) / 240

/** From daily users to requests per second to replicas. */
function Capacity() {
  const [users, setUsers] = useState(10)
  const [perUser, setPerUser] = useState(20)
  const [peak, setPeak] = useState(3)
  const [ms, setMs] = useState(50)
  const perDay = users * 1e6 * perUser
  const avg = perDay / 86400
  const peakQps = avg * peak
  const perReplica = 1000 / ms
  const replicas = Math.ceil(peakQps / (perReplica * 0.7))
  const capacity = replicas * perReplica
  // a daily curve whose mean is the average and whose top is the peak
  const base = (1 - peak * BUMP_MEAN) / (1 - BUMP_MEAN)
  const load = (hour: number) => avg * (base + (peak - base) * bump(hour))
  return (
    <div className="widget">
      <Plot x={[0, 24]} y={[0, capacity * 1.12]} height={260} xLabel="hour of the day" yLabel="requests per second">
        {s => (
          <>
            <rect x={s.x(0)} y={s.y(capacity)} width={s.w(24)} height={s.h(capacity * 0.3)} fill="var(--good)" opacity={0.12} />
            <Seg s={s} a={[0, capacity]} b={[24, capacity]} color="good" />
            <Seg s={s} a={[0, avg]} b={[24, avg]} color="blue" dash="4 4" />
            <Curve s={s} f={load} color="accent" n={240} />
            <Dot s={s} x={20} y={peakQps} />
            <Label s={s} x={0.3} y={capacity} color="good" dy={13}>capacity of {whole(replicas)} replicas</Label>
            <Label s={s} x={0.3} y={avg} color="blue">average</Label>
            <Label s={s} x={20} y={peakQps} color="accent" anchor="end" dx={-8} dy={4}>peak</Label>
          </>
        )}
      </Plot>
      <Slider label="daily users" value={users} min={0.5} max={50} step={0.5} onChange={setUsers} show={v => `${v}M`} />
      <Slider label="requests per user" value={perUser} min={1} max={100} step={1} onChange={setPerUser} show={v => String(v)} />
      <Slider label="peak factor" value={peak} min={1} max={5} step={0.5} onChange={setPeak} show={v => `${v}×`} />
      <Slider label="latency per request" value={ms} min={5} max={500} step={5} onChange={setMs} show={v => `${v} ms`} />
      <Readout
        items={[
          ['requests a day', `${fmt(perDay / 1e6, 0)}M`],
          ['average QPS', whole(avg), 'blue'],
          ['peak QPS', whole(peakQps), 'accent'],
          ['one replica serves', `${fmt(perReplica, 1)} QPS`],
          ['replicas at 70% load', whole(replicas), 'good'],
        ]}
      />
      <p className="caption">
        The curve is one day of traffic: its mean is the <b>average QPS</b> and its top is the <b>peak</b>. A replica handles one request at a time, so it serves 1000 ÷ latency
        requests per second, and the green band is the 30% of headroom you keep. Raise the peak factor and the replicas follow the peak, not the average. Halve the latency and
        the bill halves.
      </p>
    </div>
  )
}

const CATALOGUE = 10_000_000
const BUDGET = 150

/** The recommendation funnel: item counts per stage and what each stage costs in time. */
function Funnel() {
  const [retrieved, setRetrieved] = useState(1000)
  const [rankedRaw, setRanked] = useState(200)
  const [light, setLight] = useState(0.02)
  const [heavy, setHeavy] = useState(0.3)
  const ranked = Math.min(rankedRaw, retrieved)
  const stages: [string, number, string][] = [
    ['retrieval', 20, 'var(--blue)'],
    ['light ranker', retrieved * light, 'var(--purple)'],
    ['heavy ranker', ranked * heavy, 'var(--accent)'],
    ['re-rank', 5, 'var(--good)'],
  ]
  const total = stages.reduce((a, st) => a + st[1], 0)
  const rows: [string, number, string][] = [
    ['catalogue', CATALOGUE, 'var(--muted)'],
    ['retrieved', retrieved, 'var(--blue)'],
    ['to the heavy ranker', ranked, 'var(--accent)'],
    ['shown', 20, 'var(--good)'],
  ]
  const span = Math.max(BUDGET * 1.5, total)
  const px = (v: number) => (v / span) * 440
  let x = 0
  return (
    <div className="widget">
      <svg className="plot" viewBox="0 0 440 196" role="img">
        {rows.map(([name, count, color], i) => {
          const w = (Math.log10(count) / 7) * 440
          return (
            <g key={name}>
              <rect x={220 - w / 2} y={i * 30} width={w} height={14} fill={color} opacity={0.8} />
              <text className="tick" x={220} y={i * 30 + 25} textAnchor="middle">{name}: {whole(count)}</text>
            </g>
          )
        })}
        {stages.map(([name, t, color]) => {
          const rect = <rect key={name} x={x} y={132} width={px(t)} height={22} fill={color} />
          x += px(t)
          return rect
        })}
        <line x1={px(BUDGET)} x2={px(BUDGET)} y1={124} y2={162} stroke={total > BUDGET ? 'var(--bad)' : 'var(--text)'} strokeWidth={2} strokeDasharray="4 3" />
        <text className="tick" x={px(BUDGET)} y={176} textAnchor="middle">budget {BUDGET} ms</text>
        <text className="tick" x={0} y={192}>time per request: retrieval, light ranker, heavy ranker, re-rank</text>
      </svg>
      <Slider label="candidates retrieved" value={retrieved} min={100} max={5000} step={100} onChange={setRetrieved} show={v => whole(v)} />
      <Slider label="sent to heavy ranker" value={ranked} min={20} max={1000} step={10} onChange={setRanked} show={v => whole(v)} />
      <Slider label="light cost per item" value={light} min={0.005} max={0.1} step={0.005} onChange={setLight} show={v => `${fmt(v, 3)} ms`} />
      <Slider label="heavy cost per item" value={heavy} min={0.05} max={2} step={0.05} onChange={setHeavy} show={v => `${fmt(v, 2)} ms`} />
      <Readout
        items={[
          ['retrieval', '20 ms', 'blue'],
          ['light ranker', `${fmt(stages[1][1], 0)} ms`, 'purple'],
          ['heavy ranker', `${fmt(stages[2][1], 0)} ms`, 'accent'],
          ['re-rank', '5 ms', 'good'],
          ['total', `${fmt(total, 0)} of ${BUDGET} ms`, total > BUDGET ? 'bad' : 'good'],
        ]}
      />
      <p className="caption">
        Top: how many videos survive each stage (bar widths are on a log scale). Bottom: the time each stage takes, against the budget. A ranking stage costs
        <b> candidates × cost per item</b>, so the heavy ranker dominates long before it sees many videos. Push its candidates up until the bar passes the dashed line, then
        find the cheapest way back: fewer candidates, or a cheaper model.
      </p>
    </div>
  )
}

/** Error function, to a few parts in ten million. */
function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const above = (t: number, mean: number) => 0.5 * (1 - erf((t - mean) / Math.SQRT2))
const DAILY = 1_000_000
const GAP = 3.5

/** Fraud alerts: precision and recall against a threshold, and the limit set by review capacity. */
function Review() {
  const [thr, setThr] = useState(3)
  const [rate, setRate] = useState(0.5)
  const [cap, setCap] = useState(2000)
  const fraud = (DAILY * rate) / 100
  const honest = DAILY - fraud
  // honest scores are centred on 0 and fraud scores on GAP, both with spread 1
  const at = (t: number) => {
    const tp = fraud * above(t, GAP)
    const fp = honest * above(t, 0)
    return { tp, alerts: tp + fp, precision: tp / (tp + fp), recall: tp / fraud }
  }
  // the lowest threshold whose alerts still fit the review capacity
  let [lo, hi] = [-4, 10]
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (at(mid).alerts > cap) lo = mid
    else hi = mid
  }
  const now = at(thr)
  const over = now.alerts > cap
  return (
    <div className="widget">
      <Plot x={[0, 6]} y={[0, 1]} height={260} xLabel="alert threshold on the model score" yLabel="precision, recall">
        {s => (
          <>
            {hi > 0 && <rect x={s.x(0)} y={s.y(1)} width={s.w(Math.min(hi, 6))} height={s.h(1)} fill="var(--bad)" opacity={0.12} />}
            <Curve s={s} f={t => at(t).precision} color="accent" />
            <Curve s={s} f={t => at(t).recall} color="blue" />
            <Seg s={s} a={[thr, 0]} b={[thr, 1]} color={over ? 'bad' : 'text'} dash="4 3" />
            <Dot s={s} x={thr} y={now.precision} />
            <Dot s={s} x={thr} y={now.recall} color="blue" />
            <Label s={s} x={0.1} y={0.5} color="bad">more alerts than the team can review</Label>
            <Label s={s} x={5.9} y={0.93} color="accent" anchor="end" dx={0}>precision</Label>
            <Label s={s} x={5.9} y={0.1} color="blue" anchor="end" dx={0}>recall</Label>
          </>
        )}
      </Plot>
      <Slider label="threshold" value={thr} min={0} max={6} step={0.05} onChange={setThr} show={v => fmt(v, 2)} />
      <Slider label="fraud rate" value={rate} min={0.1} max={2} step={0.1} onChange={setRate} show={v => `${fmt(v, 1)}%`} />
      <Slider label="review capacity" value={cap} min={500} max={20000} step={500} onChange={setCap} show={v => `${whole(v)} a day`} />
      <Readout
        items={[
          ['alerts a day', whole(now.alerts), over ? 'bad' : 'good'],
          ['fraud caught', whole(now.tp), 'good'],
          ['fraud missed', whole(fraud - now.tp), 'bad'],
          ['precision', `${fmt(now.precision * 100, 0)}%`, 'accent'],
          ['recall', `${fmt(now.recall * 100, 0)}%`, 'blue'],
        ]}
      />
      <p className="caption">
        One million transactions a day, scored by a model that separates fraud from honest payments well but not perfectly. Lower the <b>threshold</b> and recall climbs, but
        alerts climb much faster, because honest transactions outnumber fraud by hundreds to one. In the red zone the team cannot review what you flag. The edge of that zone
        is the best recall this model can deliver with this team: to do better, improve the model, block the top scores automatically, or add reviewers.
      </p>
    </div>
  )
}

export const designWidgets: Record<string, ComponentType> = {
  'design-capacity': Capacity,
  'design-funnel': Funnel,
  'design-review': Review,
}
