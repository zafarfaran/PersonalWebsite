import { useMemo, useState, type ComponentType } from 'react'
import { Dot, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded, type Scale } from '../components/Plot'

type Pt = [number, number]
interface Bar { t: number; o: number; h: number; l: number; c: number; v: number }

/** Made-up bars from a seed: the same on every visit. `drift` and `volume` shape the day. */
function makeBars(seed: number, n: number, start: number, step: number, drift: (i: number, p: number) => number, volume: (i: number) => number, span = 1): Bar[] {
  const rnd = seeded(seed)
  const g = gaussian(rnd)
  const out: Bar[] = []
  let p = start
  for (let i = 0; i < n; i++) {
    const o = p
    const c = o + drift(i, o) + g() * step
    const h = Math.max(o, c) + Math.abs(g()) * step * 0.5
    const l = Math.min(o, c) - Math.abs(g()) * step * 0.5
    out.push({ t: i * span, o, h, l, c, v: Math.round(volume(i) * 10000 * (0.6 + 0.8 * rnd())) })
    p = c
  }
  return out
}

/** Groups of k bars become one: first open, highest high, lowest low, last close, total volume. */
const resample = (bars: Bar[], k: number): Bar[] =>
  Array.from({ length: Math.floor(bars.length / k) }, (_, j) => {
    const g = bars.slice(j * k, j * k + k)
    return { t: g[0].t, o: g[0].o, h: Math.max(...g.map(b => b.h)), l: Math.min(...g.map(b => b.l)), c: g[k - 1].c, v: g.reduce((a, b) => a + b.v, 0) }
  })

const range = (bars: Bar[], pad = 0.15): [number, number] => {
  const lo = Math.min(...bars.map(b => b.l))
  const hi = Math.max(...bars.map(b => b.h))
  return [lo - (hi - lo) * pad, hi + (hi - lo) * pad]
}

const clock = (min: number) => `${Math.floor((570 + min) / 60)}:${String((570 + min) % 60).padStart(2, '0')}`

function Candles({ s, bars, span }: { s: Scale; bars: Bar[]; span: number }) {
  return (
    <>
      {bars.map(b => {
        const x = s.x(b.t + span / 2)
        const col = b.c >= b.o ? 'var(--good)' : 'var(--bad)'
        return (
          <g key={b.t}>
            <line x1={x} x2={x} y1={s.y(b.h)} y2={s.y(b.l)} stroke={col} strokeWidth={1} />
            <rect x={x - s.w(span * 0.35)} width={s.w(span * 0.7)} y={s.y(Math.max(b.o, b.c))} height={Math.max(1, s.h(Math.abs(b.c - b.o)))} fill={col} />
          </g>
        )
      })}
    </>
  )
}

const MINUTES = makeBars(11, 60, 450, 0.12, () => 0.01, i => 1 + 2 * Math.exp(-i / 8))

/** One hour of 1-minute bars, regrouped into 5- and 15-minute candles. */
function Resample() {
  const [k, setK] = useState(1)
  const bars = useMemo(() => resample(MINUTES, k), [k])
  const last = bars[bars.length - 1]
  return (
    <div className="widget">
      <div className="seg">{[1, 5, 15].map(n => <button key={n} className={n === k ? 'on' : ''} onClick={() => setK(n)}>{n}m</button>)}</div>
      <Plot x={[0, 60]} y={range(MINUTES)} xLabel="minutes after 9:30" yLabel="price">
        {s => <Candles s={s} bars={bars} span={k} />}
      </Plot>
      <Readout
        items={[
          ['bars', bars.length],
          ['highest high', fmt(Math.max(...bars.map(b => b.h)))],
          ['lowest low', fmt(Math.min(...bars.map(b => b.l)))],
          ['last bar O H L C', `${fmt(last.o)} ${fmt(last.h)} ${fmt(last.l)} ${fmt(last.c)}`],
          ['last bar volume', last.v.toLocaleString('en-US')],
        ]}
      />
      <p className="caption">
        The same 60 one-minute bars, grouped. Switch between 1m, 5m and 15m. The highest high, the lowest low and the final close never change: grouping keeps the extremes and the
        ends and throws away the path in between. A messy run of small candles can become one clean candle, so decide your timeframe before you look.
      </p>
    </div>
  )
}

const PROFILES: Record<string, (i: number) => number> = {
  'U-shaped': i => 1 + 2 * Math.exp(-i / 6) + 1.2 * Math.exp(-(77 - i) / 6),
  even: () => 1,
  'heavy open': i => 1 + 8 * Math.exp(-i / 4),
  'heavy close': i => 1 + 8 * Math.exp(-(77 - i) / 4),
}

/** A day of 5-minute bars with VWAP, a plain average, and a choice of where the volume falls. */
function Vwap() {
  const [profile, setProfile] = useState('U-shaped')
  const [at, setAt] = useState(77)
  const bars = useMemo(() => makeBars(5, 78, 450, 0.3, i => (i < 30 ? 0.12 : -0.07), PROFILES[profile], 5), [profile])
  const typical = bars.map(b => (b.h + b.l + b.c) / 3)
  let pv = 0
  let vol = 0
  let sum = 0
  const vwap: Pt[] = []
  const plain: Pt[] = []
  bars.forEach((b, i) => {
    pv += typical[i] * b.v
    vol += b.v
    sum += typical[i]
    vwap.push([b.t + 2.5, pv / vol])
    plain.push([b.t + 2.5, sum / (i + 1)])
  })
  const maxV = Math.max(...bars.map(b => b.v))
  return (
    <div className="widget">
      <div className="seg">{Object.keys(PROFILES).map(p => <button key={p} className={p === profile ? 'on' : ''} onClick={() => setProfile(p)}>{p}</button>)}</div>
      <Plot x={[0, 390]} y={range(bars, 0.05)} xLabel="minutes after 9:30" yLabel="price">
        {s => (
          <>
            <Candles s={s} bars={bars} span={5} />
            <Path s={s} pts={plain} color="muted" dash="5 4" />
            <Path s={s} pts={vwap} color="accent" width={2.5} />
            <Seg s={s} a={[bars[at].t + 2.5, s.y0]} b={[bars[at].t + 2.5, s.y1]} color="blue" width={1} />
          </>
        )}
      </Plot>
      <Plot x={[0, 390]} y={[0, maxV]} height={90} bare>
        {s => bars.map(b => <rect key={b.t} x={s.x(b.t + 0.5)} width={s.w(4)} y={s.y(b.v)} height={s.h(b.v)} fill="var(--muted)" />)}
      </Plot>
      <Slider label="time" value={at} min={0} max={77} step={1} onChange={setAt} show={v => clock(v * 5 + 5)} />
      <Readout
        items={[
          ['close', fmt(bars[at].c)],
          ['VWAP', fmt(vwap[at][1]), 'accent'],
          ['plain average', fmt(plain[at][1])],
          ['close − VWAP', fmt(bars[at].c - vwap[at][1]), bars[at].c >= vwap[at][1] ? 'good' : 'bad'],
        ]}
      />
      <p className="caption">
        The yellow line is VWAP, the dashed line the plain average of the same prices. Change where the volume falls: the prices stay the same, only the weights move. With heavy
        volume at the open, VWAP stays near the morning prices all day. Slide the time to the afternoon and watch how little VWAP moves once most of the day's volume is in it.
      </p>
    </div>
  )
}

const TREND = makeBars(8, 120, 100, 0.35, (i, p) => (i < 60 ? 0.15 : 0.15 * (109 - p)), () => 1)
const CLOSES = TREND.map(b => b.c)

function average(kind: 'SMA' | 'EMA', xs: number[], n: number): number[] {
  const out: number[] = xs.map(() => NaN)
  if (kind === 'SMA') for (let i = n - 1; i < xs.length; i++) out[i] = xs.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n
  else {
    const a = 2 / (n + 1)
    out[n - 1] = xs.slice(0, n).reduce((x, y) => x + y, 0) / n
    for (let i = n; i < xs.length; i++) out[i] = a * xs[i] + (1 - a) * out[i - 1]
  }
  return out
}

/** Price crossing a moving average: a trend half and a range half. */
function Averages() {
  const [n, setN] = useState(10)
  const [kind, setKind] = useState<'SMA' | 'EMA'>('SMA')
  const ma = average(kind, CLOSES, n)
  const crosses: number[] = []
  for (let i = n; i < CLOSES.length; i++) if (Math.sign(CLOSES[i] - ma[i]) !== Math.sign(CLOSES[i - 1] - ma[i - 1])) crosses.push(i)
  const inTrend = crosses.filter(i => i < 60).length
  return (
    <div className="widget">
      <div className="seg">{(['SMA', 'EMA'] as const).map(k => <button key={k} className={k === kind ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}</div>
      <Plot x={[0, 120]} y={[98, 112]} xLabel="bar" yLabel="price">
        {s => (
          <>
            <Seg s={s} a={[60, s.y0]} b={[60, s.y1]} dash="3 3" />
            <Path s={s} pts={CLOSES.map((c, i) => [i, c])} color="text" width={1.5} />
            <Path s={s} pts={ma.map((m, i) => [i, m])} color="accent" width={2.5} />
            {crosses.map(i => <Dot key={i} s={s} x={i} y={CLOSES[i]} r={3.5} color="bad" />)}
          </>
        )}
      </Plot>
      <Slider label="length n" value={n} min={3} max={40} step={1} onChange={setN} />
      <Readout
        items={[
          ['crossings, trend half', inTrend],
          ['crossings, range half', crosses.length - inTrend, 'bad'],
          ['price − average at bar 59', fmt(CLOSES[59] - ma[59])],
        ]}
      />
      <p className="caption">
        Bars 0 to 59 trend up, bars 60 to 119 go sideways. Each red dot is a close on the other side of the average from the bar before: a crossover signal. Make the average shorter
        and it hugs price but crosses it constantly in the range. Make it longer and it is calmer but sits further behind in the trend. No length avoids both, and every false cross
        costs a spread.
      </p>
    </div>
  )
}

const DAYS: Record<string, { prev: number; bars: Bar[] }> = {
  'Day A': { prev: 450, bars: makeBars(21, 120, 452.4, 0.12, i => (i > 30 ? 0.03 : 0), i => 1 + 3 * Math.exp(-i / 10)) },
  'Day B': { prev: 450, bars: makeBars(34, 120, 448.6, 0.12, i => (i < 40 ? 0.03 : -0.04), i => 1 + 3 * Math.exp(-i / 10)) },
}

/** The opening range of a gap day, for a choice of length, and the first close outside it. */
function OpeningRange() {
  const [day, setDay] = useState('Day A')
  const [len, setLen] = useState(15)
  const { prev, bars } = DAYS[day]
  const first = bars.slice(0, len)
  const hi = Math.max(...first.map(b => b.h))
  const lo = Math.min(...first.map(b => b.l))
  const brk = bars.findIndex((b, i) => i >= len && (b.c > hi || b.c < lo))
  const up = brk >= 0 && bars[brk].c > hi
  const back = brk >= 0 && bars.slice(brk + 1, brk + 11).some(b => b.c <= hi && b.c >= lo)
  const [y0, y1] = range([...bars, { t: 0, o: prev, h: prev, l: prev, c: prev, v: 0 }], 0.08)
  return (
    <div className="widget">
      <div className="seg">{Object.keys(DAYS).map(d => <button key={d} className={d === day ? 'on' : ''} onClick={() => setDay(d)}>{d}</button>)}</div>
      <div className="seg">{[5, 15, 30].map(m => <button key={m} className={m === len ? 'on' : ''} onClick={() => setLen(m)}>{m} min</button>)}</div>
      <Plot x={[0, 120]} y={[y0, y1]} xLabel="minutes after 9:30" yLabel="price">
        {s => (
          <>
            <rect x={s.x(0)} width={s.w(len)} y={s.y(hi)} height={s.h(hi - lo)} fill="var(--blue)" opacity={0.15} />
            <Candles s={s} bars={bars} span={1} />
            <Seg s={s} a={[len, hi]} b={[120, hi]} color="blue" dash="5 4" />
            <Seg s={s} a={[len, lo]} b={[120, lo]} color="blue" dash="5 4" />
            <Seg s={s} a={[0, prev]} b={[120, prev]} color="muted" dash="2 4" />
            {brk >= 0 && <Dot s={s} x={brk + 0.5} y={bars[brk].c} color={up ? 'good' : 'bad'} />}
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['gap', `${fmt(bars[0].o - prev)} (${fmt(((bars[0].o - prev) / prev) * 100)}%)`],
          ['range', `${fmt(lo)} to ${fmt(hi)}, width ${fmt(hi - lo)}`],
          ['known at', clock(len)],
          ['first close outside', brk < 0 ? 'none' : `${clock(brk + 1)}, ${up ? 'above' : 'below'}`, up ? 'good' : 'bad'],
          ['back inside within 10 min', brk < 0 ? '–' : back ? 'yes' : 'no', back ? 'bad' : undefined],
        ]}
      />
      <p className="caption">
        The shaded box is the opening range and the dotted line is yesterday's close. Change the length: a longer range is wider, is known later and is broken later. Compare the two
        days and check whether the first close outside the range held. A break is a level being crossed, not a promise of where price goes next.
      </p>
    </div>
  )
}

export const chartsWidgets: Record<string, ComponentType> = {
  'charts-resample': Resample,
  'charts-vwap': Vwap,
  'charts-averages': Averages,
  'charts-range': OpeningRange,
}
