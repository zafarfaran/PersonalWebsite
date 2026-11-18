import { useMemo, useState, type ComponentType } from 'react'
import { Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
const pct = (v: number, d = 1) => `${v >= 0 ? '+' : ''}${fmt(100 * v, d)}%`
const line = (a: number[]) => a.map((v, i) => [i, v] as Pt)

/* ---------- Corporate actions: raw, split-adjusted, total return ---------- */

const AD = 500
const SPLIT = 250
const AG = (() => {
  const g = gaussian(seeded(7))
  return Array.from({ length: AD }, () => 0.0004 + 0.015 * g())
})()

function Adjust() {
  const [mode, setMode] = useState<'raw' | 'split' | 'total'>('raw')
  const [yld, setYld] = useState(0)
  const { adj, tr } = useMemo(() => {
    const adj = [100]
    const tr = [100]
    for (let t = 1; t < AD; t++) {
      const d = t % 63 === 0 ? (yld / 400) * adj[t - 1] : 0
      const p = adj[t - 1] * (1 + AG[t]) - d
      adj.push(p)
      tr.push((tr[t - 1] * (p + d)) / adj[t - 1])
    }
    return { adj, tr }
  }, [yld])
  const raw = adj.map((p, t) => (t < SPLIT ? 4 * p : p))
  const shown = mode === 'raw' ? raw : mode === 'split' ? adj : [...adj, ...tr]
  const day = (a: number[]) => a[SPLIT] / a[SPLIT - 1] - 1
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'raw' ? 'on' : ''} onClick={() => setMode('raw')}>Raw</button>
        <button className={mode === 'split' ? 'on' : ''} onClick={() => setMode('split')}>Split-adjusted</button>
        <button className={mode === 'total' ? 'on' : ''} onClick={() => setMode('total')}>Total return</button>
      </div>
      <Plot x={[0, AD]} y={[0, Math.max(...shown) * 1.05]} xLabel="trading day" yLabel="price, $">
        {s => (
          <>
            <Seg s={s} a={[SPLIT, 0]} b={[SPLIT, s.y1]} color="muted" dash="3 4" />
            {mode === 'raw' && <Path s={s} pts={line(raw)} />}
            {mode !== 'raw' && <Path s={s} pts={line(adj)} color={mode === 'total' ? 'muted' : 'accent'} />}
            {mode === 'total' && <Path s={s} pts={line(tr)} color="good" />}
          </>
        )}
      </Plot>
      <Slider label="dividend yield, paid quarterly" value={yld} min={0} max={4} step={0.5} onChange={setYld} show={v => `${v}%`} />
      <Readout
        items={[
          ['day 250, raw', pct(day(raw)), 'bad'],
          ['day 250, adjusted', pct(day(adj), 2)],
          ['price return', pct(adj[AD - 1] / adj[0] - 1)],
          ['total return', pct(tr[AD - 1] / tr[0] - 1), 'good'],
        ]}
      />
      <p className="caption">
        Two years of a made-up stock that splits 4-for-1 on day 250 (dashed line) and pays a dividend every 63 days. On <b>Raw</b> the split looks like a 75% crash. On{' '}
        <b>Total return</b> the green line reinvests each dividend and the grey line is the split-adjusted price; raise the yield and watch the gap open up and keep growing.
      </p>
    </div>
  )
}

/* ---------- Bad ticks: trailing median and MAD ---------- */

const BN = 120
const BW = 10
const JUMP = 70
const BAD: Record<number, number> = { 22: 2.5, 41: -0.45, 55: -1.5, 88: 0.4, 103: 0.7 }
const TICKS = (() => {
  const g = gaussian(seeded(19))
  return Array.from({ length: BN }, (_, t) => 100 + 0.05 * g() + (t >= JUMP ? 1 : 0) + (BAD[t] ?? 0))
})()

function BadTicks() {
  const [k, setK] = useState(5)
  const flags = TICKS.map((p, t) => {
    if (t < BW) return false
    const w = TICKS.slice(t - BW, t)
    const m = median(w)
    const mad = median(w.map(x => Math.abs(x - m)))
    return mad > 0 && Math.abs(p - m) > k * 1.4826 * mad
  })
  const isBad = (t: number) => t in BAD
  const caught = flags.filter((f, t) => f && isBad(t)).length
  const falseFlags = flags.filter((f, t) => f && !isBad(t)).length
  const afterJump = flags.filter((f, t) => f && t >= JUMP && t < JUMP + BW).length
  return (
    <div className="widget">
      <Plot x={[0, BN]} y={[98.3, 102.9]} xLabel="tick" yLabel="price, $">
        {s => (
          <>
            <Path s={s} pts={line(TICKS)} color="muted" width={1} />
            {TICKS.map((p, t) => {
              if (isBad(t)) return <circle key={t} cx={s.x(t)} cy={s.y(p)} r={5} fill={flags[t] ? 'var(--good)' : 'none'} stroke={flags[t] ? 'var(--good)' : 'var(--bad)'} strokeWidth={2} />
              return flags[t] ? <circle key={t} cx={s.x(t)} cy={s.y(p)} r={3.5} fill="var(--amber)" /> : null
            })}
          </>
        )}
      </Plot>
      <Slider label="threshold k" value={k} min={2} max={10} step={0.5} onChange={setK} />
      <Readout
        items={[
          ['bad ticks caught', `${caught} of ${Object.keys(BAD).length}`, caught === 5 ? 'good' : 'bad'],
          ['real prices flagged', falseFlags, 'amber'],
          ['of them just after the jump', afterJump],
        ]}
      />
      <p className="caption">
        Made-up ticks with five bad prints (circles: green when caught, red when missed) and a real jump of $1 at tick 70. Each tick is judged against the median and MAD of the
        ten before it. Set k to 2: real prices light up in amber. Set k to 10: the smallest bad print slips through. The ticks right after the real jump are flagged at every k,
        because the trailing median is still at the old level: only persistence and volume tell a real move from an error.
      </p>
    </div>
  )
}

/* ---------- Bar types: time bars against volume bars ---------- */

const BD = 40
const BM = 390
const kurt = (x: number[]) => {
  const n = x.length
  const m = x.reduce((a, b) => a + b, 0) / n
  const v = x.reduce((a, b) => a + (b - m) ** 2, 0) / n
  return x.reduce((a, b) => a + (b - m) ** 4, 0) / n / v / v - 3
}
/** 40 made-up days of 390 minutes: U-shaped volume, busier and quieter days, price moves that scale with trading. */
const DAYS = (() => {
  const g = gaussian(seeded(31))
  const u = (m: number) => 1 + 2.2 * Math.exp(-m / 25) + 1.6 * Math.exp(-(BM - 1 - m) / 25)
  const vol = Array.from({ length: BD }, () => {
    const f = Math.exp(0.5 * g())
    return Array.from({ length: BM }, (_, m) => f * u(m) * Math.exp(0.4 * g()))
  })
  const vbar = vol.flat().reduce((a, b) => a + b, 0) / (BD * BM)
  const h = gaussian(seeded(37))
  const ret = vol.map(day => day.map(v => 0.0006 * Math.sqrt(v / vbar) * h()))
  return { vol, ret }
})()

function Bars() {
  const [kind, setKind] = useState<'time' | 'volume'>('time')
  const [n, setN] = useState(39)
  const res = useMemo(() => {
    const { vol, ret } = DAYS
    // the threshold comes from the first 20 days only; bars are built on the last 20
    const thr = vol.slice(0, 20).flat().reduce((a, b) => a + b, 0) / (20 * n)
    const tr: number[] = []
    const vr: number[] = []
    const tc: number[] = Array(13).fill(0)
    const vc: number[] = Array(13).fill(0)
    const len = BM / n
    for (let d = 20; d < BD; d++) {
      for (let b = 0; b < n; b++) {
        let s = 0
        for (let m = b * len; m < (b + 1) * len; m++) s += ret[d][m]
        tr.push(s)
        tc[Math.floor(((b + 1) * len - 1) / 30)]++
      }
      let cum = 0
      let s = 0
      for (let m = 0; m < BM; m++) {
        cum += vol[d][m]
        s += ret[d][m]
        if (cum >= thr) {
          vr.push(s)
          vc[Math.floor(m / 30)]++
          cum = 0
          s = 0
        }
      }
    }
    return { tc: tc.map(c => c / 20), vc: vc.map(c => c / 20), kt: kurt(tr), kv: kurt(vr), nv: vr.length / 20 }
  }, [n])
  const counts = kind === 'time' ? res.tc : res.vc
  const top = Math.max(...res.tc, ...res.vc) * 1.1
  return (
    <div className="widget">
      <div className="seg">
        <button className={kind === 'time' ? 'on' : ''} onClick={() => setKind('time')}>Time</button>
        <button className={kind === 'volume' ? 'on' : ''} onClick={() => setKind('volume')}>Volume</button>
      </div>
      <Plot x={[0, 13]} y={[0, top]} xLabel="half hour of the session (0 = 9:30 to 10:00)" yLabel="bars per day">
        {s => counts.map((c, i) => <rect key={i} x={s.x(i) + 2} width={s.w(1) - 4} y={s.y(c)} height={s.y(0) - s.y(c)} fill={kind === 'time' ? 'var(--blue)' : 'var(--accent)'} opacity={0.75} />)}
      </Plot>
      <Slider label="bars per day" value={n} min={26} max={78} step={13} onChange={setN} />
      <Readout
        items={[
          ['volume bars per day', fmt(res.nv, 1)],
          ['excess kurtosis, time bars', fmt(res.kt), kind === 'time' ? 'accent' : undefined],
          ['excess kurtosis, volume bars', fmt(res.kv), kind === 'volume' ? 'accent' : undefined],
        ]}
      />
      <p className="caption">
        Twenty made-up days of minute data where trading is heaviest at the open and close and price moves with trading. Switch between <b>Time</b> and <b>Volume</b> bars:
        volume bars crowd into the busy half hours. Compare the excess kurtosis of bar returns (0 for a normal curve). The volume threshold is set from twenty earlier days,
        so the count per day is close to, not exactly, the target.
      </p>
    </div>
  )
}

/* ---------- Futures: rolling and continuous series ---------- */

const RN = 504
const SPOT = (() => {
  const g = gaussian(seeded(53))
  const s = [4000]
  for (let t = 1; t < RN; t++) s.push(s[t - 1] * (1 + 0.0003 + 0.01 * g()))
  return s
})()
/** Quarterly contracts expire every 63 days; the position rolls 5 days before expiry. */
const held = (t: number) => Math.floor((t + 5) / 63)

function Roll() {
  const [carry, setCarry] = useState(5)
  const [mode, setMode] = useState<'raw' | 'back' | 'ratio'>('back')
  const fut = (k: number, t: number) => SPOT[t] * (1 + ((carry / 100) * (63 * (k + 1) - t)) / 252)
  const raw = SPOT.map((_, t) => fut(held(t), t))
  const back = [...raw]
  const ratio = [...raw]
  let gap = 0
  let mult = 1
  for (let t = RN - 1; t > 0; t--) {
    if (held(t) !== held(t - 1)) {
      gap += fut(held(t), t) - fut(held(t - 1), t)
      mult *= fut(held(t), t) / fut(held(t - 1), t)
    }
    back[t - 1] += gap
    ratio[t - 1] *= mult
  }
  const shown = mode === 'raw' ? raw : mode === 'back' ? back : ratio
  const all = [...SPOT, ...shown]
  return (
    <div className="widget">
      <div className="seg">
        <button className={mode === 'raw' ? 'on' : ''} onClick={() => setMode('raw')}>Unadjusted</button>
        <button className={mode === 'back' ? 'on' : ''} onClick={() => setMode('back')}>Back-adjusted</button>
        <button className={mode === 'ratio' ? 'on' : ''} onClick={() => setMode('ratio')}>Ratio-adjusted</button>
      </div>
      <Plot x={[0, RN]} y={[Math.min(...all) * 0.97, Math.max(...all) * 1.03]} xLabel="trading day" yLabel="index points">
        {s => (
          <>
            <Path s={s} pts={line(SPOT)} color="muted" width={1.5} />
            <Path s={s} pts={line(shown)} />
          </>
        )}
      </Plot>
      <Slider label="carry, % a year (positive = contango)" value={carry} min={-4} max={8} step={1} onChange={setCarry} show={v => `${v}%`} />
      <Readout
        items={[
          ['spot change', fmt(SPOT[RN - 1] - SPOT[0], 0)],
          ['held and rolled', fmt(back[RN - 1] - back[0], 0), 'accent'],
          ['sum of roll gaps', fmt(gap, 0), 'bad'],
        ]}
      />
      <p className="caption">
        A made-up index (grey) and its quarterly futures, rolled five days before each expiry. <b>Unadjusted</b> glues the raw prices and jumps at every roll. <b>Back-adjusted</b>
        removes the jumps, so its change is what a holder made. Move the carry above zero and compare the points a holder made with the change in spot; set it below zero for
        backwardation.
      </p>
    </div>
  )
}

export const qdataWidgets: Record<string, ComponentType> = {
  'qdata-adjust': Adjust,
  'qdata-badticks': BadTicks,
  'qdata-bars': Bars,
  'qdata-roll': Roll,
}
