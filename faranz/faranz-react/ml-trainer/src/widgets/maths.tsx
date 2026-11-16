import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, nearest, seeded } from '../components/Plot'

type Pt = [number, number]
const round = (v: number, step = 0.5) => Math.round(v / step) * step

/** Two arrows you can drag: dot product, lengths, angle and projection. */
function Vectors() {
  const [vs, setVs] = useState<Pt[]>([[3, 1], [1, 3]])
  const [held, setHeld] = useState(0)
  const [a, b] = vs
  const dot = a[0] * b[0] + a[1] * b[1]
  const la = Math.hypot(...a)
  const lb = Math.hypot(...b)
  const cos = la && lb ? dot / (la * lb) : 0
  // the shadow of a on b
  const k = lb ? dot / (lb * lb) : 0
  const proj: Pt = [b[0] * k, b[1] * k]
  return (
    <div className="widget">
      <Plot
        x={[-5, 5]}
        y={[-5, 5]}
        height={440}
        onDrag={(x, y, phase) => {
          const i = phase === 'down' ? nearest(vs, x, y, 10, 10) : held
          if (phase === 'down') setHeld(i)
          setVs(vs.map((v, j) => (j === i ? [round(x), round(y)] : v)) as Pt[])
        }}
      >
        {s => (
          <>
            <Seg s={s} a={a} b={proj} dash="4 4" />
            <Seg s={s} a={[0, 0]} b={proj} color="good" width={4} opacity={0.6} />
            <Seg s={s} a={[0, 0]} b={a} color="accent" width={2.5} arrow />
            <Seg s={s} a={[0, 0]} b={b} color="blue" width={2.5} arrow />
            <Label s={s} x={a[0]} y={a[1]} color="accent">a = ({a[0]}, {a[1]})</Label>
            <Label s={s} x={b[0]} y={b[1]} color="blue">b = ({b[0]}, {b[1]})</Label>
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['a · b', `${a[0]}×${b[0]} + ${a[1]}×${b[1]} = ${fmt(dot, 1)}`, dot > 0 ? 'good' : dot < 0 ? 'bad' : 'muted'],
          ['|a|', fmt(la)],
          ['|b|', fmt(lb)],
          ['cos θ', fmt(cos)],
          ['angle', `${fmt((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI, 0)}°`],
        ]}
      />
      <p className="caption">
        Drag the arrow tips. The <b>dot product</b> is positive when the arrows point the same way, zero when they are at right angles, negative when they point apart. Divide it
        by both lengths and you get <b>cosine similarity</b>, which ignores how long the arrows are. The green bar is the shadow of a on b.
      </p>
    </div>
  )
}

const PRESETS: Record<string, [number, number, number, number]> = {
  Identity: [1, 0, 0, 1],
  Stretch: [2, 0, 0, 0.5],
  Rotate: [0, -1, 1, 0],
  Shear: [1, 1, 0, 1],
  Flatten: [1, 2, 0.5, 1],
}

/** A 2 by 2 matrix as a machine that moves the plane. */
function Matrix() {
  const [m, setM] = useState<[number, number, number, number]>([1, 1, 0, 1])
  const [a, b, c, d] = m
  const at = ([x, y]: Pt): Pt => [a * x + b * y, c * x + d * y]
  const det = a * d - b * c
  const set = (i: number) => (v: number) => setM(m.map((old, j) => (j === i ? v : old)) as typeof m)
  const lines: Pt[][] = []
  for (let k = -3; k <= 3; k++) lines.push([[k, -3], [k, 3]], [[-3, k], [3, k]])
  const square: Pt[] = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
  return (
    <div className="widget">
      <div className="seg">
        {Object.entries(PRESETS).map(([name, preset]) => <button key={name} className={preset.join() === m.join() ? 'on' : ''} onClick={() => setM(preset)}>{name}</button>)}
      </div>
      <Plot x={[-4, 4]} y={[-4, 4]} height={440}>
        {s => (
          <>
            {lines.map((l, i) => <Path key={i} s={s} pts={l.map(at)} color="muted" width={1} opacity={0.45} />)}
            <Path s={s} pts={square} color="muted" dash="3 3" width={1.5} />
            <Path s={s} pts={square.map(at)} color="good" width={2.5} />
            <Seg s={s} a={[0, 0]} b={at([1, 0])} color="accent" width={2.5} arrow />
            <Seg s={s} a={[0, 0]} b={at([0, 1])} color="blue" width={2.5} arrow />
            <Label s={s} x={at([1, 0])[0]} y={at([1, 0])[1]} color="accent">first column</Label>
            <Label s={s} x={at([0, 1])[0]} y={at([0, 1])[1]} color="blue">second column</Label>
          </>
        )}
      </Plot>
      <Slider label="top left" value={a} min={-2} max={2} step={0.25} onChange={set(0)} />
      <Slider label="top right" value={b} min={-2} max={2} step={0.25} onChange={set(1)} />
      <Slider label="bottom left" value={c} min={-2} max={2} step={0.25} onChange={set(2)} />
      <Slider label="bottom right" value={d} min={-2} max={2} step={0.25} onChange={set(3)} />
      <Readout items={[['matrix', `[[${a}, ${b}], [${c}, ${d}]]`], ['determinant', fmt(det), Math.abs(det) < 1e-9 ? 'bad' : 'good']]} />
      <p className="caption">
        The columns of the matrix are where the two unit arrows land. Everything else follows. The <b>determinant</b> is the area of the green shape: how much the matrix
        stretches space. Choose Flatten: the determinant is zero, the plane is squashed onto a line, and the matrix cannot be inverted.
      </p>
    </div>
  )
}

const FUNCS: Record<string, { f: (x: number) => number; df: (x: number) => number; text: string }> = {
  'x²': { f: x => x * x, df: x => 2 * x, text: '2x' },
  'x³ − 3x': { f: x => x ** 3 - 3 * x, df: x => 3 * x * x - 3, text: '3x² − 3' },
  'sin x': { f: Math.sin, df: Math.cos, text: 'cos x' },
  'sigmoid': { f: x => 1 / (1 + Math.exp(-x)), df: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s) }, text: 'σ(x)(1 − σ(x))' },
}

/** The slope of a curve at a point, as the limit of a chord. */
function Derivative() {
  const [name, setName] = useState('x³ − 3x')
  const [x0, setX0] = useState(1.5)
  const [h, setH] = useState(1)
  const { f, df, text } = FUNCS[name]
  const y0 = f(x0)
  const chord = (f(x0 + h) - y0) / h
  const slope = df(x0)
  const range: [number, number] = name === 'sigmoid' ? [-0.5, 1.5] : [-4, 4]
  return (
    <div className="widget">
      <div className="seg">{Object.keys(FUNCS).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={[-3, 3]} y={range} onDrag={x => setX0(round(x, 0.1))} xLabel="x" yLabel="f(x)">
        {s => (
          <>
            <Curve s={s} f={f} color="text" />
            <Curve s={s} f={x => y0 + chord * (x - x0)} color="blue" width={1.5} dash="5 4" />
            <Curve s={s} f={x => y0 + slope * (x - x0)} color="accent" />
            <Dot s={s} x={x0 + h} y={f(x0 + h)} color="blue" />
            <Dot s={s} x={x0} y={y0} />
          </>
        )}
      </Plot>
      <Slider label="h (gap)" value={h} min={0.01} max={1.5} step={0.01} onChange={setH} />
      <Readout items={[['x', fmt(x0, 1)], ['chord slope (blue)', fmt(chord, 3), 'blue'], [`derivative ${text}`, fmt(slope, 3), 'accent'], ['error', fmt(Math.abs(chord - slope), 3)]]} />
      <p className="caption">
        Drag along the curve to move the point. The blue line joins two points h apart; its slope is rise over run. Shrink <b>h</b> and it turns into the yellow tangent: that
        limit is the <b>derivative</b>. Where the derivative is zero the curve is flat, which is where minima and maxima are.
      </p>
    </div>
  )
}

/** Gradient descent on a bowl: learning rate, stretch and momentum. */
function Descent() {
  const [lr, setLr] = useState(0.1)
  const [k, setK] = useState(8)
  const [beta, setBeta] = useState(0)
  const [start, setStart] = useState<Pt>([-3.5, 1.6])
  const [steps, setSteps] = useState(0)
  const loss = ([x, y]: Pt) => 0.5 * (x * x + k * y * y)
  const path = useMemo(() => {
    const out: Pt[] = [start]
    let [x, y] = start
    let [vx, vy] = [0, 0]
    for (let i = 0; i < steps; i++) {
      vx = beta * vx - lr * x
      vy = beta * vy - lr * k * y
      x += vx
      y += vy
      if (Math.abs(x) > 1e6 || Math.abs(y) > 1e6) break
      out.push([x, y])
    }
    return out
  }, [start, steps, lr, k, beta])
  const end = path[path.length - 1]
  const levels = [0.25, 1, 2.5, 5, 8]
  const blown = loss(end) > loss(start) * 2
  return (
    <div className="widget">
      <Plot x={[-4, 4]} y={[-2.5, 2.5]} height={300} onDrag={(x, y) => { setStart([round(x, 0.1), round(y, 0.1)]); setSteps(0) }} xLabel="weight 1" yLabel="weight 2">
        {s => (
          <>
            {levels.map(c => (
              <ellipse key={c} cx={s.x(0)} cy={s.y(0)} rx={s.w(Math.sqrt(2 * c))} ry={s.h(Math.sqrt((2 * c) / k))} fill="none" stroke="var(--muted)" opacity={0.4} />
            ))}
            <Path s={s} pts={path} color={blown ? 'bad' : 'accent'} width={1.5} />
            {path.map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} r={i === path.length - 1 ? 5 : 2.5} color={blown ? 'bad' : 'accent'} />)}
            <Dot s={s} x={0} y={0} color="good" r={4} />
          </>
        )}
      </Plot>
      <div className="actions">
        <button className="btn primary" onClick={() => setSteps(steps + 1)}>Step</button>
        <button className="btn" onClick={() => setSteps(steps + 20)}>20 steps</button>
        <button className="btn" onClick={() => setSteps(0)}>Reset</button>
      </div>
      <Slider label="learning rate" value={lr} min={0.01} max={0.3} step={0.005} onChange={v => { setLr(v); setSteps(0) }} />
      <Slider label="stretch" value={k} min={1} max={20} step={1} onChange={v => { setK(v); setSteps(0) }} show={v => `${v}×`} />
      <Slider label="momentum" value={beta} min={0} max={0.95} step={0.05} onChange={v => { setBeta(v); setSteps(0) }} />
      <Readout items={[['steps', String(path.length - 1)], ['loss', fmt(loss(end), 4), blown ? 'bad' : 'good'], ['limit for this bowl', `lr < ${fmt(2 / k, 3)}`]]} />
      <p className="caption">
        Each step moves against the gradient, which points straight uphill. Click to choose a start. With a round bowl (stretch 1) the path is a straight line. Stretch it and
        the same learning rate zig-zags across the steep direction while crawling along the shallow one; go past <b>2 ÷ stretch</b> and it blows up. That is why features are
        scaled before training. Momentum smooths the zig-zag.
      </p>
    </div>
  )
}

/** The chain rule on a one-neuron network, forwards and then backwards. */
function Chain() {
  const [w, setW] = useState(0.5)
  const [b, setB] = useState(1)
  const [step, setStep] = useState(0)
  const x = 2
  const t = 3
  const z = w * x
  const y = z + b
  const e = y - t
  const loss = e * e
  // backwards: each node's gradient is the one after it times a local slope
  const dLde = 2 * e
  const dLdy = dLde
  const dLdb = dLdy
  const dLdz = dLdy
  const dLdw = dLdz * x
  const nodes: [string, string, number, number | null, string][] = [
    ['w', 'weight', w, dLdw, `∂L/∂z × x = ${fmt(dLdz)} × ${x}`],
    ['z', 'z = w·x', z, dLdz, '∂L/∂y × 1'],
    ['y', 'y = z + b', y, dLdy, '∂L/∂e × 1'],
    ['e', 'e = y − t', e, dLde, `2e = 2 × ${fmt(e)}`],
    ['L', 'L = e²', loss, 1, 'start here: ∂L/∂L = 1'],
  ]
  const forward = Math.min(step, 5)
  const backward = Math.max(0, step - 5)
  return (
    <div className="widget">
      <table className="cells">
        <thead>
          <tr><th>node</th><th>value (forward)</th><th>gradient ∂L/∂node (backward)</th></tr>
        </thead>
        <tbody>
          {nodes.map(([id, name, value, grad, how], i) => (
            <tr key={id}>
              <th style={{ textAlign: 'left' }}>{name}</th>
              <td>{i < forward ? fmt(value) : '·'}</td>
              <td style={{ textAlign: 'left' }}>{4 - i < backward && grad !== null ? <><b className="accent">{fmt(grad)}</b> <span className="muted">{how}</span></> : '·'}</td>
            </tr>
          ))}
          <tr>
            <th style={{ textAlign: 'left' }}>b (bias)</th>
            <td>{fmt(b)}</td>
            <td style={{ textAlign: 'left' }}>{backward >= 3 ? <><b className="accent">{fmt(dLdb)}</b> <span className="muted">∂L/∂y × 1</span></> : '·'}</td>
          </tr>
        </tbody>
      </table>
      <div className="actions">
        <button className="btn primary" disabled={step >= 10} onClick={() => setStep(step + 1)}>{step < 5 ? 'Forward step' : step < 10 ? 'Backward step' : 'Done'}</button>
        <button className="btn" onClick={() => setStep(0)}>Reset</button>
        {step >= 10 && <button className="btn" onClick={() => { setW(+(w - 0.1 * dLdw).toFixed(3)); setB(+(b - 0.1 * dLdb).toFixed(3)); setStep(0) }}>Update w and b (lr 0.1)</button>}
      </div>
      <Slider label="w" value={w} min={-2} max={3} step={0.05} onChange={v => { setW(v); setStep(0) }} />
      <Slider label="b" value={b} min={-2} max={3} step={0.05} onChange={v => { setB(v); setStep(0) }} />
      <p className="caption">
        Input x = {x}, target t = {t}. Go <b>forward</b> to compute the loss, then <b>backward</b>: every gradient is the gradient of the node after it, multiplied by one local
        slope. That is the chain rule, and it is all backpropagation is. Update the weights a few times and watch the loss fall.
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
const cdf = (x: number, mu: number, sd: number) => 0.5 * (1 + erf((x - mu) / (sd * Math.SQRT2)))
const pdf = (x: number, mu: number, sd: number) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))

/** The normal curve: mean, spread and the chance of landing in a range. */
function Normal() {
  const [mu, setMu] = useState(0)
  const [sd, setSd] = useState(1)
  const [lo, setLo] = useState(-1)
  const [hi, setHi] = useState(1)
  const [a, b] = [Math.min(lo, hi), Math.max(lo, hi)]
  const p = cdf(b, mu, sd) - cdf(a, mu, sd)
  const shade: Pt[] = [[a, 0], ...Array.from({ length: 61 }, (_, i): Pt => { const x = a + ((b - a) * i) / 60; return [x, pdf(x, mu, sd)] }), [b, 0]]
  return (
    <div className="widget">
      <Plot x={[-6, 6]} y={[0, 0.85]} height={260} xLabel="value" yLabel="density">
        {s => (
          <>
            <polygon points={shade.map(q => `${s.x(q[0])},${s.y(q[1])}`).join(' ')} fill="var(--accent)" opacity={0.35} />
            <Curve s={s} f={x => pdf(x, mu, sd)} color="text" n={200} />
            <Seg s={s} a={[mu, 0]} b={[mu, pdf(mu, mu, sd)]} dash="3 3" />
          </>
        )}
      </Plot>
      <Slider label="mean μ" value={mu} min={-3} max={3} step={0.1} onChange={setMu} />
      <Slider label="std dev σ" value={sd} min={0.5} max={2.5} step={0.1} onChange={setSd} />
      <Slider label="from" value={lo} min={-6} max={6} step={0.1} onChange={setLo} />
      <Slider label="to" value={hi} min={-6} max={6} step={0.1} onChange={setHi} />
      <Readout items={[['P(from < X < to)', `${fmt(p * 100, 1)}%`, 'accent'], ['from, in σ', fmt((a - mu) / sd)], ['to, in σ', fmt((b - mu) / sd)]]} />
      <p className="caption">
        Probability is <b>area under the curve</b>. With the range set to one standard deviation either side of the mean the area is about 68%; two is about 95%; three is
        99.7%. Subtracting the mean and dividing by σ (the <b>z-score</b>) turns any normal curve into this one, which is what standardising a feature does.
      </p>
    </div>
  )
}

/** Bayes' rule with ten thousand people: why a positive test is often wrong. */
function Bayes() {
  const [prior, setPrior] = useState(0.01)
  const [sens, setSens] = useState(0.9)
  const [fpr, setFpr] = useState(0.05)
  const n = 10000
  const sick = n * prior
  const tp = sick * sens
  const fn = sick - tp
  const fp = (n - sick) * fpr
  const tn = n - sick - fp
  const post = tp + fp ? tp / (tp + fp) : 0
  const bars: [string, number, string][] = [['true positives', tp, 'var(--good)'], ['false positives', fp, 'var(--bad)'], ['false negatives', fn, 'var(--amber)'], ['true negatives', tn, 'var(--line)']]
  return (
    <div className="widget">
      <svg className="plot" viewBox="0 0 440 76" role="img">
        {(() => {
          let x = 0
          return bars.map(([name, count, color]) => {
            const w = (count / n) * 440
            const rect = <rect key={name} x={x} y={0} width={Math.max(w, 0)} height={30} fill={color} />
            x += w
            return rect
          })
        })()}
        <text className="tick" x={0} y={44}>all {n.toLocaleString()} people, by what the test says and what is true</text>
        <rect x={0} y={52} width={440 * post} height={16} fill="var(--good)" />
        <rect x={440 * post} y={52} width={440 * (1 - post)} height={16} fill="var(--bad)" />
        <text className="tick" x={0} y={76}>only the people who tested positive</text>
      </svg>
      <Slider label="base rate" value={prior} min={0.001} max={0.5} step={0.001} onChange={setPrior} show={v => `${fmt(v * 100, 1)}%`} />
      <Slider label="sensitivity" value={sens} min={0.5} max={1} step={0.01} onChange={setSens} show={v => `${fmt(v * 100, 0)}%`} />
      <Slider label="false positive rate" value={fpr} min={0} max={0.3} step={0.005} onChange={setFpr} show={v => `${fmt(v * 100, 1)}%`} />
      <Readout
        items={[
          ['true positives', fmt(tp, 0), 'good'],
          ['false positives', fmt(fp, 0), 'bad'],
          ['P(sick | positive)', `${fmt(tp, 0)} ÷ ${fmt(tp + fp, 0)} = ${fmt(post * 100, 1)}%`, 'accent'],
        ]}
      />
      <p className="caption">
        A test that catches 90% of cases and is wrong about healthy people only 5% of the time sounds good. But when the condition is rare, the healthy people are so many that
        their few false alarms outnumber the real cases. Slide the <b>base rate</b> and watch. The same sum governs the precision of any classifier on a rare class.
      </p>
    </div>
  )
}

/** Averages of samples pile up into a bell, whatever they were drawn from. */
function Clt() {
  const [n, setN] = useState(1)
  const [seed, setSeed] = useState(1)
  const means = useMemo(() => {
    const rnd = seeded(seed * 977 + n)
    // an exponential distribution: lopsided, with mean 1 and standard deviation 1
    return Array.from({ length: 3000 }, () => {
      let sum = 0
      for (let i = 0; i < n; i++) sum += -Math.log(1 - rnd())
      return sum / n
    })
  }, [n, seed])
  const bins = 40
  const width = 4 / bins
  const counts = Array.from({ length: bins }, () => 0)
  for (const m of means) if (m < 4) counts[Math.floor(m / width)]++
  const density = counts.map(c => c / (means.length * width))
  const mean = means.reduce((a, b) => a + b, 0) / means.length
  const sd = Math.sqrt(means.reduce((a, b) => a + (b - mean) ** 2, 0) / means.length)
  return (
    <div className="widget">
      <Plot x={[0, 4]} y={[0, Math.max(1.1, ...density) * 1.05]} height={260} xLabel="average of the sample" yLabel="density">
        {s => (
          <>
            {density.map((d, i) => <rect key={i} x={s.x(i * width) + 0.5} y={s.y(d)} width={s.w(width) - 1} height={s.y(0) - s.y(d)} fill="var(--blue)" opacity={0.7} />)}
            <Curve s={s} f={x => pdf(x, 1, 1 / Math.sqrt(n))} color="accent" n={200} />
          </>
        )}
      </Plot>
      <Slider label="sample size n" value={n} min={1} max={50} step={1} onChange={setN} show={v => String(v)} />
      <div className="actions"><button className="btn" onClick={() => setSeed(seed + 1)}>Draw again</button></div>
      <Readout items={[['mean of the averages', fmt(mean, 3)], ['their spread', fmt(sd, 3), 'blue'], ['1 ÷ √n', fmt(1 / Math.sqrt(n), 3), 'accent']]} />
      <p className="caption">
        Each bar counts averages of n draws from a lopsided distribution (mean 1, standard deviation 1). With n = 1 you see the distribution itself. Raise <b>n</b>: the averages
        gather into a bell around the true mean, and their spread shrinks like <b>1 ÷ √n</b>. To halve the noise in a metric you need four times the data.
      </p>
    </div>
  )
}

/** Entropy and cross-entropy for a yes/no outcome. */
function Entropy() {
  const [p, setP] = useState(0.8)
  const [q, setQ] = useState(0.6)
  const h = (a: number, b: number) => -(a * Math.log(b) + (1 - a) * Math.log(1 - b))
  const ent = h(p, p)
  const cross = h(p, q)
  return (
    <div className="widget">
      <Plot x={[0, 1]} y={[0, 3]} height={260} xLabel="predicted probability q" yLabel="cross-entropy (nats)">
        {s => (
          <>
            <Curve s={s} f={x => h(p, x)} from={0.005} to={0.995} n={200} />
            <Seg s={s} a={[0, ent]} b={[1, ent]} color="good" dash="4 4" />
            <Seg s={s} a={[q, ent]} b={[q, cross]} color="bad" width={3} />
            <Dot s={s} x={q} y={cross} />
            <Dot s={s} x={p} y={ent} color="good" />
            <Label s={s} x={0.02} y={ent} color="good">entropy of the truth</Label>
          </>
        )}
      </Plot>
      <Slider label="true rate p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} />
      <Slider label="predicted q" value={q} min={0.01} max={0.99} step={0.01} onChange={setQ} />
      <Readout items={[['entropy H(p)', fmt(ent, 3), 'good'], ['cross-entropy H(p, q)', fmt(cross, 3), 'accent'], ['KL divergence (the gap)', fmt(cross - ent, 3), 'bad']]} />
      <p className="caption">
        The curve is the average loss when the event really happens a fraction p of the time and the model says q. It is lowest where <b>q = p</b>, and there it equals the
        entropy: the loss no model can beat. The red gap is the KL divergence, the price of being wrong. Push q towards 0 or 1 and the loss shoots up: confident mistakes cost
        the most.
      </p>
    </div>
  )
}

export const mathsWidgets: Record<string, ComponentType> = {
  'maths-vectors': Vectors,
  'maths-matrix': Matrix,
  'maths-derivative': Derivative,
  'maths-descent': Descent,
  'maths-chain': Chain,
  'maths-normal': Normal,
  'maths-bayes': Bayes,
  'maths-clt': Clt,
  'maths-entropy': Entropy,
}
