import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Label, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded, type Color } from '../components/Plot'

type Pt = [number, number]

// 4,000 requests: a normal time, a draw that decides whether the request is one of the slow ones, and how slow
const REQUESTS = (() => {
  const rnd = seeded(11)
  const g = gaussian(seeded(12))
  return Array.from({ length: 4000 }, () => ({ base: 40 * Math.exp(0.3 * g()), u: rnd(), jitter: 0.75 + 0.5 * rnd() }))
})()
/** Nearest-rank percentile of a sorted list. */
const rank = (sorted: number[], p: number) => sorted[Math.ceil((p / 100) * sorted.length) - 1]

/** A latency distribution with a tail: what the mean and the percentiles each see. */
function Latency() {
  const [slow, setSlow] = useState(0.5)
  const [cost, setCost] = useState(600)
  const stats = useMemo(() => {
    const ms = REQUESTS.map(r => (r.u * 100 < slow ? cost * r.jitter : r.base)).sort((a, b) => a - b)
    const counts = Array.from({ length: 50 }, () => 0)
    for (const v of ms) counts[Math.min(49, Math.floor(v / 25))]++
    return { counts, mean: ms.reduce((a, b) => a + b, 0) / ms.length, p50: rank(ms, 50), p95: rank(ms, 95), p99: rank(ms, 99) }
  }, [slow, cost])
  const marks: [string, number, Color, number][] = [['p50', stats.p50, 'good', 3.6], ['mean', stats.mean, 'text', 3.25], ['p95', stats.p95, 'amber', 2.9], ['p99', stats.p99, 'bad', 2.55]]
  return (
    <div className="widget">
      <Plot x={[0, 1250]} y={[0, 3.9]} height={280} xLabel="latency (ms)" yLabel="log₁₀(1 + requests)">
        {s => (
          <>
            {stats.counts.map((c, i) => {
              const v = Math.log10(1 + c)
              return <rect key={i} x={s.x(i * 25) + 0.5} y={s.y(v)} width={s.w(25) - 1} height={s.y(0) - s.y(v)} fill="var(--blue)" opacity={0.7} />
            })}
            {marks.map(([name, v, color, top]) => (
              <g key={name}>
                <Seg s={s} a={[v, 0]} b={[v, top]} color={color} dash={name === 'mean' ? '4 3' : undefined} />
                <Label s={s} x={v} y={top} color={color} dx={v > 1000 ? -4 : 4} dy={4} anchor={v > 1000 ? 'end' : 'start'}>{name}</Label>
              </g>
            ))}
          </>
        )}
      </Plot>
      <Slider label="slow requests" value={slow} min={0} max={10} step={0.5} onChange={setSlow} show={v => `${fmt(v, 1)}%`} />
      <Slider label="a slow one takes" value={cost} min={200} max={1000} step={50} onChange={setCost} show={v => `${v} ms`} />
      <Readout
        items={[
          ['p50', `${fmt(stats.p50, 0)} ms`, 'good'],
          ['mean', `${fmt(stats.mean, 0)} ms`],
          ['p95', `${fmt(stats.p95, 0)} ms`, 'amber'],
          ['p99', `${fmt(stats.p99, 0)} ms`, 'bad'],
          ['a page of 20 calls hits a slow one', `${fmt((1 - (1 - slow / 100) ** 20) * 100, 0)}%`],
        ]}
      />
      <p className="caption">
        4,000 requests to one service. Most take about 40 ms; a few hit a cold cache or a busy worker. Raise <b>slow requests</b> from 0.5% to 2%, then to 6%. The median never
        moves and the mean creeps up, while <b>p99</b> and then <b>p95</b> jump into the tail. The height axis is logarithmic, or the tail would be too small to see: that is
        also why an average hides it.
      </p>
    </div>
  )
}

const WEIGHTS = (() => {
  const g = gaussian(seeded(5))
  return Array.from({ length: 2000 }, () => Math.max(-1, Math.min(1, 0.3 * g())))
})()
const WEIGHT_BARS = (() => {
  const counts = Array.from({ length: 40 }, () => 0)
  for (const w of WEIGHTS) counts[Math.min(39, Math.floor((w + 1) / 0.05))]++
  return counts.map(c => c / Math.max(...counts))
})()

/** Uniform quantisation: fewer bits, bigger steps, and what one outlier does to the range. */
function Quantise() {
  const [bits, setBits] = useState(4)
  const [range, setRange] = useState(1)
  const step = (2 * range) / (2 ** bits - 1)
  const level = (w: number) => Math.round((w + range) / step)
  const q = (w: number) => level(w) * step - range
  const rms = Math.sqrt(WEIGHTS.reduce((a, w) => a + (q(w) - w) ** 2, 0) / WEIGHTS.length)
  const used = new Set(WEIGHTS.map(level)).size
  return (
    <div className="widget">
      <div className="seg">
        <button className={range === 1 ? 'on' : ''} onClick={() => setRange(1)}>Range ±1 (the weights)</button>
        <button className={range === 4 ? 'on' : ''} onClick={() => setRange(4)}>Range ±4 (one outlier)</button>
      </div>
      <Plot x={[-1, 1]} y={[-1, 1]} height={320} xLabel="original weight" yLabel="stored weight">
        {s => (
          <>
            {WEIGHT_BARS.map((h, i) => <rect key={i} x={s.x(-1 + i * 0.05) + 0.5} y={s.y(-1 + 0.5 * h)} width={s.w(0.05) - 1} height={s.h(0.5 * h)} fill="var(--blue)" opacity={0.35} />)}
            <Seg s={s} a={[-1, -1]} b={[1, 1]} dash="4 4" />
            <Curve s={s} f={q} n={800} />
            <Label s={s} x={-0.95} y={0.9} color="blue" dy={4}>bars: where the weights are</Label>
          </>
        )}
      </Plot>
      <Slider label="bits per weight" value={bits} min={2} max={8} step={1} onChange={setBits} show={v => String(v)} />
      <Readout
        items={[
          ['levels', String(2 ** bits)],
          ['in use', String(used), used < 2 ** bits / 2 ? 'bad' : 'good'],
          ['step', fmt(step, 4)],
          ['typical error (RMS)', fmt(rms, 4), 'accent'],
          ['10 million weights', `${fmt((10 * bits) / 8, 2)} MB (40 MB as float32)`],
        ]}
      />
      <p className="caption">
        The staircase is what the model keeps of each weight: the nearest of 2ᵇⁱᵗˢ evenly spaced levels. Lower the <b>bits</b> and the steps, and so the error, grow while the
        file shrinks. Then switch to the range with one outlier: the levels are spread over ±4, most of them sit where there are no weights, and every weight gets a coarser
        step. This is why ranges are clipped or chosen per layer or per channel.
      </p>
    </div>
  )
}

const TRAIN = (() => { const g = gaussian(seeded(21)); return Array.from({ length: 2000 }, g) })()
const LIVE = (() => { const g = gaussian(seeded(22)); return Array.from({ length: 2000 }, g) })()
/** Share of the values in each of ten bins from −3 to 3; the end bins also take everything beyond. */
const shares = (values: number[]) => {
  const counts = Array.from({ length: 10 }, () => 0)
  for (const v of values) counts[Math.max(0, Math.min(9, Math.floor((v + 3) / 0.6)))]++
  return counts.map(c => Math.max(c / values.length, 1e-4))
}
const TRAIN_SHARES = shares(TRAIN)
const ZONES: [number, number, string][] = [[0, 0.1, 'var(--good)'], [0.1, 0.25, 'var(--amber)'], [0.25, 0.5, 'var(--bad)']]

/** One feature in training and in production, and the population stability index between them. */
function Drift() {
  const [mean, setMean] = useState(0)
  const [sd, setSd] = useState(1)
  const live = useMemo(() => shares(LIVE.map(z => mean + sd * z)), [mean, sd])
  const psi = live.reduce((a, l, i) => a + (l - TRAIN_SHARES[i]) * Math.log(l / TRAIN_SHARES[i]), 0)
  const [reading, color]: [string, Color] = psi < 0.1 ? ['stable', 'good'] : psi < 0.25 ? ['worth a look', 'amber'] : ['investigate', 'bad']
  return (
    <div className="widget">
      <Plot x={[-3, 3]} y={[0, Math.max(0.3, ...live) * 1.05]} height={250} xLabel="feature value (training mean 0, std 1)" yLabel="share of rows">
        {s => (
          <>
            {TRAIN_SHARES.map((t, i) => (
              <g key={i}>
                <rect x={s.x(-3 + i * 0.6) + 1} y={s.y(t)} width={s.w(0.3) - 1} height={s.y(0) - s.y(t)} fill="var(--blue)" opacity={0.75} />
                <rect x={s.x(-2.7 + i * 0.6)} y={s.y(live[i])} width={s.w(0.3) - 1} height={s.y(0) - s.y(live[i])} fill="var(--accent)" />
              </g>
            ))}
            <Label s={s} x={-2.95} y={s.y1} color="blue" dx={0} dy={14}>training</Label>
            <Label s={s} x={-2.95} y={s.y1} color="accent" dx={0} dy={28}>live</Label>
          </>
        )}
      </Plot>
      <svg className="plot" viewBox="0 0 440 30" role="img">
        {ZONES.map(([a, b, fill]) => <rect key={a} x={a * 880} y={0} width={(b - a) * 880} height={14} fill={fill} opacity={0.4} />)}
        <rect x={Math.min(psi, 0.5) * 880 - 2} y={0} width={4} height={14} fill="var(--text)" />
        <text className="tick" x={0} y={27}>PSI 0</text>
        <text className="tick" x={88} y={27} textAnchor="middle">0.1</text>
        <text className="tick" x={220} y={27} textAnchor="middle">0.25</text>
        <text className="tick" x={440} y={27} textAnchor="end">0.5 or more</text>
      </svg>
      <Slider label="live mean" value={mean} min={-2} max={2} step={0.1} onChange={setMean} />
      <Slider label="live spread" value={sd} min={0.5} max={2} step={0.1} onChange={setSd} />
      <Readout items={[['PSI', fmt(psi, 3), color], ['reading', reading, color], ['rows', '2,000 training, 2,000 live']]} />
      <p className="caption">
        Blue is one feature in the training data, yellow is the same feature in production, counted in the same ten bins. The <b>population stability index</b> adds up, over
        the bins, (live share − training share) × ln(live ÷ training). Move the <b>live mean</b>, then put it back and change only the <b>spread</b>: a monitor on the mean
        would miss the second kind. With nothing changed the score is small but not zero: two samples never match exactly.
      </p>
    </div>
  )
}

/** A year of a model going stale: retraining on a schedule or on a trigger, with late labels and a sudden change. */
function Retrain() {
  const [mode, setMode] = useState<'schedule' | 'trigger'>('schedule')
  const [every, setEvery] = useState(12)
  const [floor, setFloor] = useState(0.8)
  const [delay, setDelay] = useState(0)
  const [shock, setShock] = useState(false)
  const run = useMemo(() => {
    const pts: Pt[] = []
    let cut = -delay // the newest data the model in service has learned from
    let last = 0
    let retrains = 0
    for (let i = 0; i <= 520; i++) {
      const t = i / 10
      // after the change at week 30, a model needs two weeks of new data before it is any good
      const acc = (c: number) => 0.6 + 0.32 * Math.exp(-0.04 * (t - c + (shock && t >= 30 && c < 32 ? 25 : 0)))
      const due = mode === 'schedule' ? i > 0 && i % (every * 10) === 0 : acc(cut) < floor && t - last >= 2
      if (due) {
        cut = t - delay
        last = t
        retrains++
      }
      pts.push([t, acc(cut)])
    }
    const accs = pts.map(p => p[1])
    return { pts, retrains, mean: accs.reduce((a, b) => a + b, 0) / accs.length, worst: Math.min(...accs) }
  }, [mode, every, floor, delay, shock])
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'schedule' ? 'on' : ''} onClick={() => setMode('schedule')}>On a schedule</button>
        <button className={mode === 'trigger' ? 'on' : ''} onClick={() => setMode('trigger')}>On a trigger</button>
      </div>
      <Plot x={[0, 52]} y={[0.6, 0.95]} height={250} xLabel="week" yLabel="accuracy">
        {s => (
          <>
            {shock && <Seg s={s} a={[30, 0.6]} b={[30, 0.95]} color="bad" dash="4 4" />}
            {shock && <Label s={s} x={30} y={0.95} color="bad" dy={14}>the world changes</Label>}
            {mode === 'trigger' && <Seg s={s} a={[0, floor]} b={[52, floor]} color="amber" dash="4 4" />}
            <Path s={s} pts={run.pts} />
          </>
        )}
      </Plot>
      {mode === 'schedule'
        ? <Slider label="retrain every" value={every} min={1} max={26} step={1} onChange={setEvery} show={v => `${v} wk`} />
        : <Slider label="retrain below" value={floor} min={0.7} max={0.9} step={0.01} onChange={setFloor} show={v => fmt(v)} />}
      <Slider label="labels arrive after" value={delay} min={0} max={12} step={1} onChange={setDelay} show={v => `${v} wk`} />
      <div className="actions">
        <button className="btn" onClick={() => setShock(!shock)}>{shock ? 'Remove the sudden change' : 'Add a sudden change at week 30'}</button>
      </div>
      <Readout items={[['retrains in the year', String(run.retrains)], ['average accuracy', fmt(run.mean, 3), 'accent'], ['worst', fmt(run.worst, 3), 'bad']]} />
      <p className="caption">
        A toy model of staleness: accuracy decays with the age of the data the model learned from, and each retrain resets it. Shorten the schedule and the average rises, at
        the price of more retrains. Raise the <b>label delay</b>: every new model starts out already old, and no schedule fixes that. Add the sudden change and compare a
        12-week schedule with a trigger at 0.80: the trigger reacts at once, but it still has to wait for data from after the change.
      </p>
    </div>
  )
}

export const mlopsWidgets: Record<string, ComponentType> = {
  'mlops-latency': Latency,
  'mlops-quantise': Quantise,
  'mlops-drift': Drift,
  'mlops-retrain': Retrain,
}
