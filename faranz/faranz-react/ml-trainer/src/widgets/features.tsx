import { useState, type ComponentType } from 'react'
import { Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** 400 order values in pounds: most are small, a few are very large. */
const SPEND = (() => {
  const g = gaussian(seeded(7))
  return Array.from({ length: 400 }, () => Math.exp(3.4 + g()))
})()

const TRANSFORMS = ['raw', 'log', 'standardised'] as const

/** One long-tailed column under three transforms. */
function Scaling() {
  const [mode, setMode] = useState<(typeof TRANSFORMS)[number]>('raw')
  const m0 = mean(SPEND)
  const sd0 = Math.sqrt(mean(SPEND.map(v => (v - m0) ** 2)))
  const xs = SPEND.map(v => (mode === 'raw' ? v : mode === 'log' ? Math.log(1 + v) : (v - m0) / sd0))
  const sorted = [...xs].sort((a, b) => a - b)
  const m = mean(xs)
  const sd = Math.sqrt(mean(xs.map(v => (v - m) ** 2)))
  const median = (sorted[199] + sorted[200]) / 2
  const skew = mean(xs.map(v => ((v - m) / sd) ** 3))
  const lo = mode === 'raw' ? 0 : sorted[0]
  const hi = sorted[sorted.length - 1]
  const bins = 30
  const width = (hi - lo) / bins
  const counts = Array.from({ length: bins }, () => 0)
  for (const v of xs) counts[Math.min(bins - 1, Math.floor((v - lo) / width))]++
  const top = Math.max(...counts) * 1.12
  const digits = mode === 'raw' ? 0 : 2
  return (
    <div className="widget">
      <div className="seg">{TRANSFORMS.map(t => <button key={t} className={t === mode ? 'on' : ''} onClick={() => setMode(t)}>{t}</button>)}</div>
      <Plot x={[lo, hi]} y={[0, top]} height={260} xLabel={mode === 'raw' ? 'order value (£)' : mode === 'log' ? 'log(1 + order value)' : 'order value, standardised'} yLabel="orders">
        {s => (
          <>
            {counts.map((c, i) => <rect key={i} x={s.x(lo + i * width) + 0.5} y={s.y(c)} width={Math.max(s.w(width) - 1, 1)} height={s.y(0) - s.y(c)} fill="var(--blue)" opacity={0.7} />)}
            <Seg s={s} a={[m, 0]} b={[m, top]} color="accent" width={2} />
            <Seg s={s} a={[median, 0]} b={[median, top]} color="good" width={2} dash="4 3" />
            <Label s={s} x={m} y={top * 0.95} color="accent" dy={4}>mean</Label>
            <Label s={s} x={median} y={top * 0.8} color="good" dy={4}>median</Label>
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['mean', fmt(m, digits), 'accent'],
          ['median', fmt(median, digits), 'good'],
          ['skew', fmt(skew, 2), Math.abs(skew) > 1 ? 'bad' : 'good'],
          ['smallest', fmt(sorted[0], digits)],
          ['largest', fmt(hi, digits)],
        ]}
      />
      <p className="caption">
        The same 400 order values, three ways. <b>Raw</b>: a few huge orders stretch the axis and drag the mean well above the median. <b>Log</b>: the tail is pulled in, the
        skew drops to near zero and the mean and median meet. <b>Standardised</b>: only the numbers on the axis change. The shape and the skew are exactly those of the raw
        column, so standardising does not fix a long tail. For a column like this, take the log first and standardise after.
      </p>
    </div>
  )
}

const VISITS: [string, number][] = [
  ['london', 1], ['leeds', 0], ['york', 1], ['london', 1], ['leeds', 0], ['bath', 1],
  ['london', 0], ['york', 1], ['leeds', 1], ['london', 1], ['york', 0], ['london', 0],
]
const CITIES = ['bath', 'leeds', 'london', 'york']
const ENCODINGS = ['one-hot', 'frequency', 'target'] as const
const VARIANTS = ['naive', 'out-of-fold', 'smoothed'] as const

/** One categorical column and a yes/no target, encoded three ways. */
function Encoding() {
  const [mode, setMode] = useState<(typeof ENCODINGS)[number]>('one-hot')
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>('naive')
  const [m, setM] = useState(4)
  const rate = (rows: [string, number][]) => mean(rows.map(r => r[1]))
  const global = rate(VISITS)
  const of = (city: string, rows = VISITS) => rows.filter(r => r[0] === city)
  const target = (city: string, i: number) => {
    if (variant === 'naive') return rate(of(city))
    if (variant === 'smoothed') return (of(city).reduce((a, r) => a + r[1], 0) + m * global) / (of(city).length + m)
    const others = VISITS.filter((_, j) => j % 3 !== i % 3)
    return of(city, others).length ? rate(of(city, others)) : rate(others)
  }
  const bath = target('bath', 5)
  return (
    <div className="widget">
      <div className="seg">{ENCODINGS.map(e => <button key={e} className={e === mode ? 'on' : ''} onClick={() => setMode(e)}>{e}</button>)}</div>
      {mode === 'target' && <div className="seg">{VARIANTS.map(v => <button key={v} className={v === variant ? 'on' : ''} onClick={() => setVariant(v)}>{v}</button>)}</div>}
      {mode === 'target' && variant === 'smoothed' && <Slider label="smoothing m" value={m} min={0} max={20} step={1} onChange={setM} show={v => String(v)} />}
      <table className="cells">
        <thead>
          <tr>
            <th>row</th>
            <th>city</th>
            <th>bought</th>
            {mode === 'target' && variant === 'out-of-fold' && <th>fold</th>}
            {mode === 'one-hot' ? CITIES.map(c => <th key={c}>{c}</th>) : <th>city, encoded</th>}
          </tr>
        </thead>
        <tbody>
          {VISITS.map(([city, bought], i) => {
            const value = mode === 'frequency' ? of(city).length / VISITS.length : target(city, i)
            const copied = mode === 'target' && Math.abs(value - bought) < 1e-9
            return (
              <tr key={i}>
                <th>{i + 1}</th>
                <td style={{ textAlign: 'left' }}>{city}</td>
                <td>{bought}</td>
                {mode === 'target' && variant === 'out-of-fold' && <td className="muted">{(i % 3) + 1}</td>}
                {mode === 'one-hot' ? CITIES.map(c => <td key={c} className={c === city ? 'accent' : 'muted'}>{c === city ? 1 : 0}</td>) : <td><b className={copied ? 'bad' : 'accent'}>{fmt(value)}</b></td>}
              </tr>
            )
          })}
        </tbody>
      </table>
      {mode === 'one-hot' && <Readout items={[['columns added', String(CITIES.length)], ['a city never seen in training', 'all zeros']]} />}
      {mode === 'frequency' && <Readout items={[['columns added', '1'], ['leeds and york', 'both 0.25', 'bad'], ['their buying rates', '0.33 and 0.67']]} />}
      {mode === 'target' && <Readout items={[['overall buying rate', fmt(global)], ['bath, seen once, bought', fmt(bath), Math.abs(bath - 1) < 1e-9 ? 'bad' : 'good']]} />}
      <p className="caption">
        Twelve visits, one row each. <b>One-hot</b> gives every city its own column. <b>Frequency</b> uses one column, but leeds and york get the same code although they
        behave differently. <b>Target</b> encoding replaces the city with its buying rate. Naive, bath's single row is encoded as its own answer (red): the label has been
        copied into the feature. Out-of-fold computes each row's value from the other folds only, and smoothing pulls rare cities towards the overall rate. Raise m and watch
        bath move.
      </p>
    </div>
  )
}

/** Six weeks of daily sales for one shop, with a weekend peak. */
const SALES = (() => {
  const g = gaussian(seeded(11))
  const week = [0, -5, -8, -3, 6, 25, 18]
  return Array.from({ length: 42 }, (_, i) => 100 + 0.4 * i + week[i % 7] + 5 * g())
})()

/** Which past days feed a rolling-window feature for a chosen day. */
function TimeWindow() {
  const [day, setDay] = useState(30)
  const [window, setWindow] = useState(7)
  const [lag, setLag] = useState(1)
  const end = day - lag
  const start = Math.max(0, end - window + 1)
  const used = SALES.slice(start, end + 1)
  const feature = mean(used)
  const leak = lag === 0
  const color = leak ? 'bad' : 'good'
  return (
    <div className="widget">
      <Plot x={[0, 41]} y={[70, 160]} height={260} xLabel="day" yLabel="sales">
        {s => (
          <>
            <rect x={s.x(start - 0.5)} y={s.y(160)} width={s.w(end - start + 1)} height={s.h(90)} fill={leak ? 'var(--bad)' : 'var(--good)'} opacity={0.15} />
            <Path s={s} pts={SALES.map((v, i) => [i, v])} color="muted" width={1.5} />
            {SALES.map((v, i) => <Dot key={i} s={s} x={i} y={v} r={i >= start && i <= end ? 4 : 2.5} color={i >= start && i <= end ? color : 'muted'} />)}
            <Seg s={s} a={[start - 0.5, feature]} b={[end + 0.5, feature]} color={color} width={2.5} />
            {!leak && <Seg s={s} a={[end + 0.5, feature]} b={[day, feature]} color={color} dash="4 3" arrow />}
            <Seg s={s} a={[day, 70]} b={[day, 160]} color="accent" dash="3 3" />
            <Dot s={s} x={day} y={SALES[day]} color="accent" r={6} ring />
          </>
        )}
      </Plot>
      <Slider label="day to predict" value={day} min={20} max={41} step={1} onChange={setDay} show={v => String(v)} />
      <Slider label="window (days)" value={window} min={1} max={14} step={1} onChange={setWindow} show={v => String(v)} />
      <Slider label="lag (days)" value={lag} min={0} max={14} step={1} onChange={setLag} show={v => String(v)} />
      <Readout
        items={[
          ['days used', start === end ? String(start) : `${start} to ${end}`],
          ['feature: their mean', fmt(feature, 1), color],
          ['actual sales on the day', fmt(SALES[day], 1), 'accent'],
          ['window', leak ? 'uses the value it is meant to predict' : 'uses the past only', color],
        ]}
      />
      <p className="caption">
        The ringed point is the day you want to predict. The shaded days feed the feature: the mean of <b>window</b> days, ending <b>lag</b> days before. With lag 0 the
        window contains the answer and turns red. If the forecast has to be published k days ahead, the lag must be at least k. Set window 1 and lag 7: the feature is "the
        same weekday last week", which tracks the weekend peak better than a 7-day mean does.
      </p>
    </div>
  )
}

export const featuresWidgets: Record<string, ComponentType> = {
  'features-scaling': Scaling,
  'features-encoding': Encoding,
  'features-time': TimeWindow,
}
