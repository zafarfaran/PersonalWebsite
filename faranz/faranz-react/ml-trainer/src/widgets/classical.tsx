import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt, gaussian, nearest, seeded, type Color } from '../components/Plot'

type Pt = [number, number]
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length

/** Slope and intercept of the least-squares line. */
function leastSquares(pts: Pt[]): [number, number] {
  const mx = mean(pts.map(p => p[0]))
  const my = mean(pts.map(p => p[1]))
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0)
  const sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0)
  const slope = sxx ? sxy / sxx : 0
  return [slope, my - slope * mx]
}

const LINE_START: Pt[] = [[1, 1.8], [2, 1.9], [3, 2.9], [4, 2.7], [5, 3.8], [6, 3.6], [7, 4.9], [8, 4.6]]

/** Points you can drag, the least-squares line through them, and its residuals. */
function Linear() {
  const [pts, setPts] = useState<Pt[]>(LINE_START)
  const [held, setHeld] = useState(0)
  const [w, b] = leastSquares(pts)
  const mse = mean(pts.map(p => (p[1] - (w * p[0] + b)) ** 2))
  return (
    <div className="widget">
      <Plot
        x={[0, 10]}
        y={[0, 10]}
        height={380}
        xLabel="feature x"
        yLabel="target y"
        onDrag={(x, y, phase) => {
          const i = phase === 'down' ? nearest(pts, x, y, 10, 10) : held
          if (phase === 'down') setHeld(i)
          setPts(pts.map((p, j) => (j === i ? [+x.toFixed(1), +y.toFixed(1)] : p)) as Pt[])
        }}
      >
        {s => (
          <>
            {pts.map((p, i) => <Seg key={'r' + i} s={s} a={p} b={[p[0], w * p[0] + b]} color="bad" width={2} />)}
            <Curve s={s} f={x => w * x + b} n={2} />
            {pts.map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} color="blue" />)}
          </>
        )}
      </Plot>
      <div className="actions">
        <button className="btn primary" onClick={() => setPts(pts.map((p, i) => (i === 7 ? [8, 10] : p)) as Pt[])}>Make one outlier</button>
        <button className="btn" onClick={() => setPts(LINE_START)}>Reset</button>
      </div>
      <Readout items={[['slope w', fmt(w)], ['intercept b', fmt(b)], ['mean squared error', fmt(mse, 3), 'bad']]} />
      <p className="caption">
        Drag any point. The yellow line is the <b>least-squares</b> fit: the one line with the smallest mean squared error. The red bars are the residuals. Press
        <b> Make one outlier</b>: a single point is moved, yet the whole line tilts towards it, because its squared residual outweighs all the others. Check for points like
        this before you trust a fitted weight.
      </p>
    </div>
  )
}

// two classes on a line that overlap around x = 1
const LOGIT_DATA: [number, number][] = [
  ...[-2, -1.4, -0.8, -0.2, 0.4, 1.4].map((x): [number, number] => [x, 0]),
  ...[0.6, 1.6, 2.2, 2.8, 3.4, 4].map((x): [number, number] => [x, 1]),
]
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
function logLoss(w: number, b: number): number {
  return mean(LOGIT_DATA.map(([x, y]) => {
    const p = Math.min(1 - 1e-12, Math.max(1e-12, sigmoid(w * x + b)))
    return y ? -Math.log(p) : -Math.log(1 - p)
  }))
}

/** Logistic regression on one feature: weight, bias, boundary and log loss. */
function Logistic() {
  const [w, setW] = useState(1)
  const [b, setB] = useState(0)
  const boundary = w ? -b / w : NaN
  const right = LOGIT_DATA.filter(([x, y]) => (sigmoid(w * x + b) >= 0.5 ? 1 : 0) === y).length
  return (
    <div className="widget">
      <Plot x={[-3, 5]} y={[-0.15, 1.15]} height={280} xLabel="feature x" yLabel="P(class 1)">
        {s => (
          <>
            <Seg s={s} a={[-3, 0.5]} b={[5, 0.5]} dash="3 3" />
            {Number.isFinite(boundary) && <Seg s={s} a={[boundary, -0.15]} b={[boundary, 1.15]} color="text" dash="5 4" />}
            {LOGIT_DATA.map(([x, y], i) => <Seg key={'l' + i} s={s} a={[x, y]} b={[x, sigmoid(w * x + b)]} color="bad" opacity={0.6} />)}
            <Curve s={s} f={x => sigmoid(w * x + b)} n={200} />
            {LOGIT_DATA.map(([x, y], i) => <Dot key={i} s={s} x={x} y={y} color={y ? 'good' : 'blue'} />)}
          </>
        )}
      </Plot>
      <Slider label="weight w" value={w} min={-2} max={10} step={0.25} onChange={setW} />
      <Slider label="bias b" value={b} min={-10} max={10} step={0.25} onChange={setB} />
      <Readout
        items={[
          ['log loss', fmt(logLoss(w, b), 3), 'bad'],
          ['correct at 0.5', `${right} of ${LOGIT_DATA.length}`],
          ['boundary x = −b ÷ w', fmt(boundary)],
        ]}
      />
      <p className="caption">
        Green points are class 1 (drawn at 1), blue points are class 0 (drawn at 0). The curve is the predicted probability, <b>sigmoid(w·x + b)</b>, and the dashed vertical
        line is the decision boundary where it crosses 0.5. The bias slides the boundary, the weight sets how sharp the step is. Red bars show how far each prediction is from
        its label. The classes overlap, so a very steep curve is confidently wrong about two points and the log loss goes back up.
      </p>
    </div>
  )
}

/** Least-squares polynomial coefficients, lowest power first. */
function polyfit(pts: Pt[], degree: number): number[] {
  const n = degree + 1
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (j < n ? pts.reduce((a, p) => a + p[0] ** (i + j), 0) : pts.reduce((a, p) => a + p[1] * p[0] ** i, 0))))
  for (let c = 0; c < n; c++) {
    let top = c
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[top][c])) top = r
    ;[A[c], A[top]] = [A[top], A[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const k = A[r][c] / A[c][c]
      for (let j = c; j <= n; j++) A[r][j] -= k * A[c][j]
    }
  }
  return A.map((row, i) => row[n] / row[i])
}
const polyval = (coef: number[], x: number) => coef.reduceRight((acc, c) => acc * x + c, 0)
const truth = (x: number) => Math.sin(3 * x)
function sample(seed: number, n: number): Pt[] {
  const rnd = seeded(seed)
  const g = gaussian(rnd)
  return Array.from({ length: n }, (): Pt => { const x = -1 + 2 * rnd(); return [x, truth(x) + 0.25 * g()] }).sort((p, q) => p[0] - q[0])
}
const TRAIN_SMALL = sample(1, 12)
const TRAIN_LARGE = [...TRAIN_SMALL, ...sample(101, 48)]
const VALID = sample(201, 40)
const polyError = (coef: number[], pts: Pt[]) => mean(pts.map(p => (polyval(coef, p[0]) - p[1]) ** 2))

/** A polynomial of chosen degree fitted to noisy points: training error against validation error. */
function Overfit() {
  const [degree, setDegree] = useState(1)
  const [large, setLarge] = useState(false)
  const train = large ? TRAIN_LARGE : TRAIN_SMALL
  const coef = polyfit(train, degree)
  const [trainErr, validErr] = [polyError(coef, train), polyError(coef, VALID)]
  return (
    <div className="widget">
      <div className="seg">
        <button className={large ? '' : 'on'} onClick={() => setLarge(false)}>12 training points</button>
        <button className={large ? 'on' : ''} onClick={() => setLarge(true)}>60 training points</button>
      </div>
      <Plot x={[-1, 1]} y={[-2, 2]} height={300} xLabel="x" yLabel="y">
        {s => (
          <>
            <Curve s={s} f={truth} color="muted" dash="4 4" width={1.5} />
            {VALID.map((p, i) => <Dot key={'v' + i} s={s} x={p[0]} y={p[1]} color="blue" r={3} ring />)}
            <Curve s={s} f={x => polyval(coef, x)} n={300} />
            {train.map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} color="accent" r={large ? 3 : 4.5} />)}
          </>
        )}
      </Plot>
      <Slider label="degree" value={degree} min={0} max={9} step={1} onChange={setDegree} show={v => String(v)} />
      <Readout items={[['training error', fmt(trainErr, 3), 'accent'], ['validation error', fmt(validErr, 3), 'blue'], ['gap', fmt(validErr - trainErr, 3), validErr > 2 * trainErr + 0.05 ? 'bad' : 'good']]} />
      <p className="caption">
        Filled points are the training set, rings are validation points the fit never sees, and the dashed curve is the pattern that produced both. Raise the <b>degree</b>:
        the training error only ever falls, but the validation error falls and then climbs as the curve starts to chase noise. Switch to 60 training points and the same high
        degree behaves. More data cures overfitting. It does nothing for a degree that is too low.
      </p>
    </div>
  )
}

function cloud(): { p: Pt; c: number }[] {
  const rnd = seeded(27)
  const g = gaussian(rnd)
  const clamp = (v: number) => Math.min(9.6, Math.max(0.4, v))
  return Array.from({ length: 24 }, (_, i) => {
    const c = i % 2
    return { p: [+clamp((c ? 6.8 : 3.2) + 1.8 * g()).toFixed(2), +clamp((c ? 5.6 : 4.4) + 2.2 * g()).toFixed(2)] as Pt, c }
  })
}
const TREE_DATA = cloud()
function gini(group: { c: number }[]): number {
  if (!group.length) return 0
  const p = group.filter(d => d.c === 1).length / group.length
  return 1 - p * p - (1 - p) * (1 - p)
}

/** One split of a decision tree: move the threshold, read the impurity of both sides. */
function Split() {
  const [axis, setAxis] = useState(0)
  const [t, setT] = useState(2)
  const left = TREE_DATA.filter(d => d.p[axis] <= t)
  const rightSide = TREE_DATA.filter(d => d.p[axis] > t)
  const weighted = (left.length * gini(left) + rightSide.length * gini(rightSide)) / TREE_DATA.length
  const parent = gini(TREE_DATA)
  const count = (g: { c: number }[]) => `${g.filter(d => d.c === 0).length} blue, ${g.filter(d => d.c === 1).length} green`
  return (
    <div className="widget">
      <div className="seg">
        <button className={axis === 0 ? 'on' : ''} onClick={() => setAxis(0)}>Split on feature 1</button>
        <button className={axis === 1 ? 'on' : ''} onClick={() => setAxis(1)}>Split on feature 2</button>
      </div>
      <Plot x={[0, 10]} y={[0, 10]} height={380} xLabel="feature 1" yLabel="feature 2">
        {s => (
          <>
            {axis === 0
              ? <rect x={s.x(0)} y={s.y(10)} width={s.w(t)} height={s.h(10)} fill="var(--muted)" opacity={0.15} />
              : <rect x={s.x(0)} y={s.y(t)} width={s.w(10)} height={s.h(t)} fill="var(--muted)" opacity={0.15} />}
            <Seg s={s} a={axis === 0 ? [t, 0] : [0, t]} b={axis === 0 ? [t, 10] : [10, t]} color="accent" width={2.5} />
            {TREE_DATA.map((d, i) => <Dot key={i} s={s} x={d.p[0]} y={d.p[1]} color={d.c ? 'good' : 'blue'} />)}
            <Label s={s} x={axis === 0 ? t : 0.2} y={axis === 0 ? 9.6 : t} color="accent">{`feature ${axis + 1} ≤ ${fmt(t, 1)}`}</Label>
          </>
        )}
      </Plot>
      <Slider label="threshold" value={t} min={0} max={10} step={0.1} onChange={setT} show={v => fmt(v, 1)} />
      <Readout
        items={[
          ['shaded side (≤)', `${count(left)}: Gini ${fmt(gini(left), 3)}`],
          ['other side (>)', `${count(rightSide)}: Gini ${fmt(gini(rightSide), 3)}`],
          ['weighted Gini', fmt(weighted, 3), 'accent'],
          ['gain over no split', fmt(parent - weighted, 3), 'good'],
        ]}
      />
      <p className="caption">
        A tree chooses a split by trying every feature and every threshold and keeping the one with the lowest <b>weighted Gini impurity</b>. Slide the threshold and do the
        search by hand, then switch feature and try again. Before any split the impurity is 0.5: twelve of each colour. Notice that the score only changes when the line
        passes a point, which is why rescaling a feature cannot change a tree.
      </p>
    </div>
  )
}

function blobs(): Pt[] {
  const g = gaussian(seeded(5))
  const centres: Pt[] = [[2.5, 7], [7.5, 7.5], [5, 2.5]]
  return Array.from({ length: 45 }, (_, i): Pt => [centres[i % 3][0] + 0.9 * g(), centres[i % 3][1] + 0.9 * g()])
}
const KM_DATA = blobs()
const KM_STARTS: Pt[][] = [[[1, 1], [5, 9], [9, 2]], [[1.5, 8.5], [3.5, 6], [6.5, 5]]]
const d2 = (a: Pt, b: Pt) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

/** k-means after a number of half-steps: assign, update, assign, … */
function kmeans(start: Pt[], steps: number) {
  let cents = start
  let labels: number[] | null = null
  for (let i = 0; i < steps; i++) {
    if (i % 2 === 0) labels = KM_DATA.map(p => cents.reduce((best, c, j) => (d2(p, c) < d2(p, cents[best]) ? j : best), 0))
    else cents = cents.map((c, j) => { const mine = KM_DATA.filter((_, k) => labels![k] === j); return mine.length ? [mean(mine.map(p => p[0])), mean(mine.map(p => p[1]))] : c })
  }
  const inertia = labels ? KM_DATA.reduce((a, p, k) => a + d2(p, cents[labels![k]]), 0) : NaN
  return { cents, labels, inertia }
}

const CLUSTER: Color[] = ['accent', 'blue', 'good']

/** k-means one half-step at a time. */
function KMeans() {
  const [start, setStart] = useState(0)
  const [steps, setSteps] = useState(0)
  const { cents, labels, inertia } = kmeans(KM_STARTS[start], steps)
  const settled = steps > 1 && Math.abs(kmeans(KM_STARTS[start], steps + 2).inertia - inertia) < 1e-9 && steps % 2 === 0
  return (
    <div className="widget">
      <div className="seg">
        {['Start A', 'Start B'].map((name, i) => <button key={name} className={i === start ? 'on' : ''} onClick={() => { setStart(i); setSteps(0) }}>{name}</button>)}
      </div>
      <Plot x={[0, 10]} y={[0, 10]} height={380} bare>
        {s => (
          <>
            {labels && KM_DATA.map((p, i) => <Seg key={'s' + i} s={s} a={p} b={cents[labels[i]]} color={CLUSTER[labels[i]]} width={1} opacity={0.35} />)}
            {KM_DATA.map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} r={3.5} color={labels ? CLUSTER[labels[i]] : 'muted'} />)}
            {cents.map((c, j) => <Dot key={'c' + j} s={s} x={c[0]} y={c[1]} r={8} color={CLUSTER[j]} ring />)}
          </>
        )}
      </Plot>
      <div className="actions">
        <button className="btn primary" disabled={settled} onClick={() => setSteps(steps + 1)}>{settled ? 'Converged' : steps % 2 === 0 ? 'Assign points' : 'Update centroids'}</button>
        <button className="btn" onClick={() => setSteps(0)}>Reset</button>
      </div>
      <Readout items={[['half-steps taken', String(steps)], ['within-cluster squared distance', fmt(inertia, 1), 'accent']]} />
      <p className="caption">
        The rings are the centroids. <b>Assign</b> gives every point to its nearest centroid. <b>Update</b> moves every centroid to the mean of its points. Step through and
        watch the total squared distance: it falls or holds at every half-step, never rises. Then try <b>Start B</b>. It also converges, to a worse answer that splits one
        blob and merges two. This is why k-means is run from several starts and the lowest total kept.
      </p>
    </div>
  )
}

function ellipse(): Pt[] {
  const g = gaussian(seeded(11))
  const raw = Array.from({ length: 40 }, (): Pt => { const [u, v] = [2 * g(), 0.6 * g()]; return [u * Math.cos(0.5) - v * Math.sin(0.5), u * Math.sin(0.5) + v * Math.cos(0.5)] })
  const [mx, my] = [mean(raw.map(p => p[0])), mean(raw.map(p => p[1]))]
  return raw.map(p => [p[0] - mx, p[1] - my])
}
const PCA_DATA = ellipse()
const varianceAt = (deg: number) => { const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]; return mean(PCA_DATA.map(p => (p[0] * c + p[1] * s) ** 2)) }
const PCA_TOTAL = varianceAt(0) + varianceAt(90)

/** Project a 2-D cloud onto a line and see how much of its variance survives. */
function Pca() {
  const [deg, setDeg] = useState(100)
  const [c, s1] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]
  const v = varianceAt(deg)
  const foot = (p: Pt): Pt => { const k = p[0] * c + p[1] * s1; return [k * c, k * s1] }
  return (
    <div className="widget">
      <Plot x={[-5, 5]} y={[-5, 5]} height={440} xLabel="feature 1" yLabel="feature 2">
        {s => (
          <>
            <Seg s={s} a={[-7 * c, -7 * s1]} b={[7 * c, 7 * s1]} color="accent" width={2} />
            {PCA_DATA.map((p, i) => <Seg key={'s' + i} s={s} a={p} b={foot(p)} width={1} opacity={0.5} />)}
            {PCA_DATA.map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} color="blue" r={3.5} />)}
            {PCA_DATA.map((p, i) => <Dot key={'f' + i} s={s} x={foot(p)[0]} y={foot(p)[1]} color="accent" r={3} />)}
          </>
        )}
      </Plot>
      <Slider label="angle of the line" value={deg} min={0} max={180} step={1} onChange={setDeg} show={v => `${v}°`} />
      <Readout items={[['variance along the line', fmt(v)], ['share of the total kept', `${fmt((v / PCA_TOTAL) * 100, 1)}%`, 'accent'], ['total variance', fmt(PCA_TOTAL)]]} />
      <p className="caption">
        Each blue point drops onto the line at its yellow shadow. Replacing two features with the position along the line keeps only the spread of the shadows. Turn the line
        until the share kept is as high as it goes: that direction is the <b>first principal component</b>. The direction at right angles to it holds whatever is left, and it
        is the second component.
      </p>
    </div>
  )
}

export const classicalWidgets: Record<string, ComponentType> = {
  'classical-linear': Linear,
  'classical-logistic': Logistic,
  'classical-overfit': Overfit,
  'classical-split': Split,
  'classical-kmeans': KMeans,
  'classical-pca': Pca,
}
