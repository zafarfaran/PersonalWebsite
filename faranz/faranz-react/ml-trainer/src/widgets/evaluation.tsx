import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, seeded, type Scale } from '../components/Plot'

type Pt = [number, number]
const pct = (v: number, digits = 0) => `${fmt(v * 100, digits)}%`

const ROWS = 120
/** Whether a model got each of 120 rows right when that row was held out: about four in five, in a fixed order. */
const CORRECT = (() => {
  const rnd = seeded(7)
  return Array.from({ length: ROWS }, () => rnd() < 0.8)
})()

/** k-fold cross-validation: which block validates in each round, and the spread of the fold scores. */
function Folds() {
  const [k, setK] = useState(5)
  const [fold, setFold] = useState(1)
  const cur = Math.min(fold, k) - 1
  const blocks = useMemo(() => Array.from({ length: k }, (_, f) => CORRECT.filter((_, i) => Math.floor((i * k) / ROWS) === f)), [k])
  const scores = blocks.map(b => b.filter(Boolean).length / b.length)
  const mean = scores.reduce((a, b) => a + b, 0) / k
  const sd = Math.sqrt(scores.reduce((a, b) => a + (b - mean) ** 2, 0) / k)
  const se = sd / Math.sqrt(k)
  const rowH = Math.min(24, 180 / k)
  const top = k * rowH + 14
  const bw = 300 / k
  const sx = (v: number) => 60 + ((Math.max(0.4, v) - 0.4) / 0.6) * 300
  return (
    <div className="widget">
      <svg className="plot" viewBox={`0 0 440 ${top + 44}`} role="img">
        {scores.map((score, f) => (
          <g key={f} opacity={f === cur ? 1 : 0.35} onClick={() => setFold(f + 1)} style={{ cursor: 'pointer' }}>
            <text className="tick" x={0} y={f * rowH + rowH / 2 + 4}>round {f + 1}</text>
            {scores.map((_, j) => <rect key={j} x={60 + j * bw + 1} y={f * rowH + 1} width={bw - 2} height={rowH - 2} rx={2} fill={j === f ? 'var(--accent)' : 'var(--blue)'} />)}
            <text className="tick" x={368} y={f * rowH + rowH / 2 + 4}>{pct(score)}</text>
          </g>
        ))}
        <line x1={60} x2={360} y1={top + 14} y2={top + 14} stroke="var(--muted)" />
        {[0.4, 0.6, 0.8, 1].map(v => <text key={v} className="tick" x={sx(v)} y={top + 34} textAnchor="middle">{pct(v)}</text>)}
        <rect x={sx(mean - se)} y={top + 8} width={sx(mean + se) - sx(mean - se)} height={12} fill="var(--good)" opacity={0.45} />
        <line x1={sx(mean)} x2={sx(mean)} y1={top + 2} y2={top + 26} stroke="var(--good)" strokeWidth={2} />
        {scores.map((score, f) => <circle key={f} cx={sx(score)} cy={top + 14} r={f === cur ? 5 : 3.5} fill={f === cur ? 'var(--accent)' : 'var(--blue)'} />)}
        <text className="tick" x={368} y={top + 18}>fold scores</text>
      </svg>
      <Slider label="folds k" value={k} min={2} max={10} step={1} onChange={setK} show={v => String(v)} />
      <Slider label="round" value={cur + 1} min={1} max={k} step={1} onChange={setFold} show={v => String(v)} />
      <Readout
        items={[
          [`round ${cur + 1}`, `train on ${ROWS - blocks[cur].length} rows, validate on ${blocks[cur].length}`],
          ['its score', pct(scores[cur], 1), 'accent'],
          ['mean of the folds', pct(mean, 1), 'good'],
          ['spread of the folds (std)', pct(sd, 1), 'blue'],
          ['error bar: std ÷ √k', `± ${pct(se, 1)}`, 'good'],
        ]}
      />
      <p className="caption">
        120 rows cut into k blocks. In each round the model trains on the blue blocks and is scored on the yellow one, so every row is validated exactly once. Raise <b>k</b>:
        each validation block shrinks, so the single fold scores scatter more, while their mean barely moves. The green band is the mean plus or minus the error bar. A gain
        smaller than that band is noise until shown otherwise.
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
// the scores of the two classes: bell curves that overlap
const NEG = 0.35
const POS = 0.65
const SD = 0.15
const above = (t: number, mu: number) => Math.max(0, 0.5 * (1 - erf((t - mu) / (SD * Math.SQRT2))))
const pdf = (x: number, mu: number) => Math.exp(-0.5 * ((x - mu) / SD) ** 2) / (SD * Math.sqrt(2 * Math.PI))

/** The confusion matrix, as shares of all cases, when every score at or above t is flagged. */
function confusion(t: number, share: number) {
  const recall = above(t, POS)
  const fpr = above(t, NEG)
  const tp = share * recall
  const fp = (1 - share) * fpr
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
  return { recall, fpr, tp, fp, fn: share - tp, tn: 1 - share - fp, precision, f1, accuracy: tp + (1 - share - fp) }
}

function Area({ s, f, from, to, color }: { s: Scale; f: (x: number) => number; from: number; to: number; color: string }) {
  const pts: Pt[] = [[from, 0], ...Array.from({ length: 41 }, (_, i): Pt => { const x = from + ((to - from) * i) / 40; return [x, f(x)] }), [to, 0]]
  return <polygon points={pts.map(p => `${s.x(p[0])},${s.y(p[1])}`).join(' ')} fill={color} opacity={0.45} />
}

/** Two overlapping score distributions, a threshold, and the four counts it produces. */
function Threshold() {
  const [t, setT] = useState(0.5)
  const [share, setShare] = useState(0.5)
  const c = confusion(t, share)
  const neg = (x: number) => (1 - share) * pdf(x, NEG)
  const pos = (x: number) => share * pdf(x, POS)
  const count = (v: number) => Math.round(v * 10000).toLocaleString()
  return (
    <div className="widget">
      <Plot x={[0, 1]} y={[0, 2.8]} height={240} xLabel="model score" yLabel="how many cases" onDrag={x => setT(Math.min(0.95, Math.max(0.05, Math.round(x * 100) / 100)))}>
        {s => (
          <>
            <Area s={s} f={neg} from={t} to={1} color="var(--bad)" />
            <Area s={s} f={pos} from={0} to={t} color="var(--amber)" />
            <Area s={s} f={pos} from={t} to={1} color="var(--good)" />
            <Curve s={s} f={neg} color="muted" n={160} />
            <Curve s={s} f={pos} color="text" n={160} />
            <Seg s={s} a={[t, 0]} b={[t, 2.8]} color="accent" width={2} />
            <Label s={s} x={t} y={2.6} color="accent">flag →</Label>
          </>
        )}
      </Plot>
      <Slider label="threshold" value={t} min={0.05} max={0.95} step={0.01} onChange={setT} />
      <Slider label="positives" value={share} min={0.01} max={0.5} step={0.01} onChange={setShare} show={v => pct(v)} />
      <table className="cells">
        <thead>
          <tr><th>of 10,000 cases</th><th>flagged</th><th>not flagged</th></tr>
        </thead>
        <tbody>
          <tr><th style={{ textAlign: 'left' }}>really positive</th><td style={{ color: 'var(--good)' }}>TP {count(c.tp)}</td><td style={{ color: 'var(--amber)' }}>FN {count(c.fn)}</td></tr>
          <tr><th style={{ textAlign: 'left' }}>really negative</th><td style={{ color: 'var(--bad)' }}>FP {count(c.fp)}</td><td>TN {count(c.tn)}</td></tr>
        </tbody>
      </table>
      <Readout
        items={[
          ['accuracy', pct(c.accuracy, 1)],
          ['accuracy of always saying "negative"', pct(1 - share, 1), 'muted'],
          ['precision', pct(c.precision, 1), 'accent'],
          ['recall', pct(c.recall, 1), 'good'],
          ['F1', fmt(c.f1), 'blue'],
        ]}
      />
      <p className="caption">
        The grey curve is the scores of the negatives, the other curve the positives. Everything right of the <b>threshold</b> is flagged: green is caught, red is a false
        alarm, amber is missed. Slide the threshold and precision and recall trade against each other. Then make the positives rare: recall does not move, precision
        collapses, and accuracy becomes easy to win by flagging nothing.
      </p>
    </div>
  )
}

/** The ROC and precision-recall curves of the same scores, with the current threshold marked on both. */
function Curves() {
  const [t, setT] = useState(0.5)
  const [share, setShare] = useState(0.5)
  const { roc, pr, auc, ap } = useMemo(() => {
    // sweep the threshold from high (nothing flagged) to low (everything flagged)
    const cs = Array.from({ length: 271 }, (_, i) => confusion(1.1 - i * 0.005, share))
    let auc = 0
    let ap = 0
    for (let i = 1; i < cs.length; i++) {
      auc += ((cs[i].fpr - cs[i - 1].fpr) * (cs[i].recall + cs[i - 1].recall)) / 2
      ap += (cs[i].recall - cs[i - 1].recall) * cs[i].precision
    }
    return { roc: cs.map((c): Pt => [c.fpr, c.recall]), pr: cs.map((c): Pt => [c.recall, c.precision]), auc, ap }
  }, [share])
  const c = confusion(t, share)
  const frame: [number, number] = [-0.03, 1.03]
  return (
    <div className="widget">
      <Plot x={frame} y={frame} height={230} xLabel="false positive rate" yLabel="recall (true positive rate)">
        {s => (
          <>
            <Seg s={s} a={[0, 0]} b={[1, 1]} dash="4 4" />
            <Label s={s} x={0.62} y={0.56} color="muted">random scores</Label>
            <Path s={s} pts={roc} />
            <Dot s={s} x={c.fpr} y={c.recall} />
          </>
        )}
      </Plot>
      <Plot x={frame} y={frame} height={230} xLabel="recall" yLabel="precision">
        {s => (
          <>
            <Seg s={s} a={[0, share]} b={[1, share]} dash="4 4" />
            <Label s={s} x={0.02} y={share} color="muted">random scores: the share of positives</Label>
            <Path s={s} pts={pr} color="blue" />
            <Dot s={s} x={c.recall} y={c.precision} color="blue" />
          </>
        )}
      </Plot>
      <Slider label="threshold" value={t} min={0.05} max={0.95} step={0.01} onChange={setT} />
      <Slider label="positives" value={share} min={0.01} max={0.5} step={0.01} onChange={setShare} show={v => pct(v)} />
      <Readout
        items={[
          ['ROC AUC', fmt(auc), 'accent'],
          ['average precision (area under PR)', fmt(ap), 'blue'],
          ['recall', pct(c.recall, 1)],
          ['false positive rate', pct(c.fpr, 1)],
          ['precision', pct(c.precision, 1), 'blue'],
        ]}
      />
      <p className="caption">
        Both curves come from sweeping the threshold over the same scores as in the last figure. The dots are the current <b>threshold</b>. Now lower the share of
        positives: the ROC curve and its AUC do not move at all, while the precision-recall curve sinks, because the same false positive rate now means many more false
        alarms per real case. On rare positives, the lower curve is the one that shows what users will see.
      </p>
    </div>
  )
}

export const evaluationWidgets: Record<string, ComponentType> = {
  'evaluation-folds': Folds,
  'evaluation-threshold': Threshold,
  'evaluation-roc': Curves,
}
