import { useMemo, useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Path, Plot, Readout, Seg, Slider, fmt, gaussian, seeded } from '../components/Plot'

type Pt = [number, number]

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
const ACTS: Record<string, { f: (z: number) => number; df: (z: number) => number; y: [number, number] }> = {
  ReLU: { f: z => Math.max(0, z), df: z => (z > 0 ? 1 : 0), y: [-1, 5] },
  'Leaky ReLU': { f: z => (z > 0 ? z : 0.1 * z), df: z => (z > 0 ? 1 : 0.1), y: [-1, 5] },
  Sigmoid: { f: sigmoid, df: z => sigmoid(z) * (1 - sigmoid(z)), y: [-0.25, 1.25] },
  Tanh: { f: Math.tanh, df: z => 1 - Math.tanh(z) ** 2, y: [-1.25, 1.25] },
}

/** One neuron: weighted input plus bias, through a chosen activation, with the slope that backprop will use. */
function Activation() {
  const [name, setName] = useState('ReLU')
  const [x, setX] = useState(1)
  const [w, setW] = useState(1)
  const [b, setB] = useState(0)
  const { f, df, y } = ACTS[name]
  const z = w * x + b
  const slope = df(z)
  return (
    <div className="widget">
      <div className="seg">{Object.keys(ACTS).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={[-5, 5]} y={y} height={280} xLabel="z = w·x + b" yLabel="output and slope">
        {s => (
          <>
            <Seg s={s} a={[z, y[0]]} b={[z, y[1]]} dash="3 3" />
            <Curve s={s} f={df} color="blue" width={1.5} dash="5 4" n={400} />
            <Curve s={s} f={f} color="text" n={400} />
            <Dot s={s} x={z} y={slope} color="blue" />
            <Dot s={s} x={z} y={f(z)} />
          </>
        )}
      </Plot>
      <Slider label="input x" value={x} min={-2} max={2} step={0.1} onChange={setX} />
      <Slider label="weight w" value={w} min={-3} max={3} step={0.1} onChange={setW} />
      <Slider label="bias b" value={b} min={-4} max={4} step={0.1} onChange={setB} />
      <Readout
        items={[
          ['z = w·x + b', fmt(z)],
          ['output', fmt(f(z)), 'accent'],
          ['slope at z (dashed)', fmt(slope, 3), slope < 0.01 ? 'bad' : 'blue'],
          ['gradient reaching w: slope × x', fmt(slope * x, 3), Math.abs(slope * x) < 0.01 ? 'bad' : undefined],
        ]}
      />
      <p className="caption">
        The solid line is the activation and the dashed line is its slope. The weight and bias decide where the input lands on it. Push z far from zero with <b>sigmoid</b> or{' '}
        <b>tanh</b> and the slope goes to zero: the neuron is saturated and its weight stops learning. With <b>ReLU</b> the slope is 1 whenever the neuron is on, and exactly 0
        when it is off. A neuron that is off for every input is dead. The leaky ReLU is drawn with a slope of 0.1 on the left so that you can see it; 0.01 is the usual value.
      </p>
    </div>
  )
}

const target = (x: number) => Math.sin(1.5 * x) + 0.3 * x

/** A one-hidden-layer ReLU network on one input: a sum of hinges. */
function Hinges() {
  const [n, setN] = useState(3)
  const [pick, setPick] = useState(1)
  const [mult, setMult] = useState(1)
  const unit = Math.min(pick, n)
  // unit i is relu(x - kink i). The output weights are the changes of slope that make the sum pass through the target at every kink.
  const kinks = Array.from({ length: n }, (_, i) => -3 + (6 * i) / n)
  const ys = [...kinks, 3].map(target)
  const slopes = kinks.map((_, i) => ((ys[i + 1] - ys[i]) * n) / 6)
  const v = slopes.map((m, i) => (i ? m - slopes[i - 1] : m) * (i === unit - 1 ? mult : 1))
  const part = (i: number, x: number) => v[i] * Math.max(0, x - kinks[i])
  const net = (x: number) => v.reduce((sum, _, i) => sum + part(i, x), ys[0])
  const line: Pt[] = [...kinks, 3].map(x => [x, net(x)])
  const worst = Math.max(...Array.from({ length: 121 }, (_, i) => Math.abs(net(-3 + i / 20) - target(-3 + i / 20))))
  return (
    <div className="widget">
      <Plot x={[-3, 3]} y={[-3, 3]} height={300} xLabel="input x" yLabel="output">
        {s => (
          <>
            <Curve s={s} f={target} color="muted" dash="5 4" />
            {kinks.map((k, i) => <Path key={i} s={s} pts={[[-3, 0], [k, 0], [3, part(i, 3)]]} color={i === unit - 1 ? 'purple' : 'blue'} width={i === unit - 1 ? 2 : 1} opacity={i === unit - 1 ? 1 : 0.5} />)}
            <Path s={s} pts={line} width={2.5} />
            {line.slice(0, -1).map((p, i) => <Dot key={i} s={s} x={p[0]} y={p[1]} r={3.5} color={i === unit - 1 ? 'purple' : 'accent'} />)}
            <Label s={s} x={-2.9} y={2.6} color="muted" dy={4}>dashed: the function to fit</Label>
          </>
        )}
      </Plot>
      <Slider label="hidden units" value={n} min={1} max={8} step={1} onChange={k => { setN(k); setMult(1) }} show={String} />
      <Slider label="pick a unit" value={unit} min={1} max={n} step={1} onChange={k => { setPick(k); setMult(1) }} show={String} />
      <Slider label="scale its output weight" value={mult} min={-1} max={3} step={0.1} onChange={setMult} show={k => `×${fmt(k, 1)}`} />
      <Readout items={[['straight pieces', String(n)], ['parameters', `${n} + ${n} + ${n} + 1 = ${3 * n + 1}`], ['largest error', fmt(worst), worst > 0.3 ? 'bad' : 'good'], ['kink of the picked unit', `x = ${fmt(kinks[unit - 1], 2)}`, 'purple']]} />
      <p className="caption">
        Each thin line is one hidden unit times its output weight: zero up to its kink, then a ramp. The thick line is their sum plus the output bias, which is the whole
        network. It can only be made of straight pieces, one more for every unit (the first kink sits at the left edge). Add units and the fit tightens. Pick a unit and scale
        its output weight: only the part of the curve to the <b>right of its kink</b> moves, because the unit is off everywhere else.
      </p>
    </div>
  )
}

const WIDTH = 50
const INITS: Record<string, number> = { 'Too small': 0.05, Xavier: Math.sqrt(1 / WIDTH), He: Math.sqrt(2 / WIDTH), 'Too large': 0.5 }

/** How the size of the activations changes through ten layers, for a choice of activation and initial weight scale. */
function Depth() {
  const [act, setAct] = useState('ReLU')
  const [init, setInit] = useState('He')
  const { sizes, stuck } = useMemo(() => {
    const g = gaussian(seeded(7))
    const f = act === 'ReLU' ? (z: number) => Math.max(0, z) : Math.tanh
    const rms = (rows: number[][]) => Math.sqrt(rows.flat().reduce((sum, a) => sum + a * a, 0) / (rows.length * WIDTH))
    let a = Array.from({ length: 20 }, () => Array.from({ length: WIDTH }, g))
    const sizes = [rms(a)]
    for (let layer = 0; layer < 10; layer++) {
      const W = Array.from({ length: WIDTH }, () => Array.from({ length: WIDTH }, () => g() * INITS[init]))
      a = a.map(row => W.map(into => f(into.reduce((sum, wt, i) => sum + wt * row[i], 0))))
      sizes.push(rms(a))
    }
    return { sizes, stuck: a.flat().filter(v => Math.abs(v) > 0.95).length / (20 * WIDTH) }
  }, [act, init])
  const factor = (sizes[10] / sizes[0]) ** 0.1
  const ok = factor > 0.8 && factor < 1.2
  return (
    <div className="widget">
      <div className="seg">{['ReLU', 'Tanh'].map(k => <button key={k} className={k === act ? 'on' : ''} onClick={() => setAct(k)}>{k}</button>)}</div>
      <div className="seg">{Object.keys(INITS).map(k => <button key={k} className={k === init ? 'on' : ''} onClick={() => setInit(k)}>{k}</button>)}</div>
      <Plot x={[0, 10]} y={[-7, 5]} height={260} xLabel="layer" yLabel="activation size (log₁₀)">
        {s => (
          <>
            <Seg s={s} a={[0, 0]} b={[10, 0]} color="good" dash="4 4" />
            <Path s={s} pts={sizes.map((v, i): Pt => [i, Math.log10(v)])} color={ok ? 'accent' : 'bad'} />
            {sizes.map((v, i) => <Dot key={i} s={s} x={i} y={Math.log10(v)} r={3.5} color={ok ? 'accent' : 'bad'} />)}
            <Label s={s} x={0.1} y={0} color="good">size 1</Label>
          </>
        )}
      </Plot>
      <Readout
        items={[
          ['weight std', fmt(INITS[init], 3)],
          ['size after 10 layers', sizes[10].toExponential(1), ok ? 'good' : 'bad'],
          ['factor per layer', fmt(factor), ok ? 'good' : 'bad'],
          ...(act === 'Tanh' ? [['units saturated at layer 10', `${fmt(stuck * 100, 0)}%`, stuck > 0.3 ? 'bad' : 'good'] as [string, string, 'bad' | 'good']] : []),
        ]}
      />
      <p className="caption">
        Random inputs go through ten layers of {WIDTH} units, before any training. The line is the typical size of the activations at each layer, on a log scale. Each layer
        multiplies the size by a factor, so anything other than about 1 compounds: too small and the signal dies out, too large and it explodes (ReLU) or saturates (tanh). The
        gradients on the way back behave the same way. <b>He</b> keeps ReLU layers close to level and <b>Xavier</b> does roughly the same for tanh. Try ReLU with Xavier.
      </p>
    </div>
  )
}

const TOTAL = 10000
const SCHEDULES: Record<string, (step: number, warm: number) => number> = {
  Constant: () => 1,
  Step: step => (step < 5000 ? 1 : step < 7500 ? 0.1 : 0.01),
  Cosine: step => 0.5 * (1 + Math.cos((Math.PI * step) / TOTAL)),
  'Warm-up + cosine': (step, warm) => (step < warm ? step / warm : 0.5 * (1 + Math.cos((Math.PI * (step - warm)) / (TOTAL - warm)))),
}

/** Learning-rate schedules over a run of 10,000 steps. The rate is drawn in thousandths. */
function Schedule() {
  const [name, setName] = useState('Warm-up + cosine')
  const [peak, setPeak] = useState(3)
  const [warm, setWarm] = useState(1000)
  const [at, setAt] = useState(500)
  const share = (step: number) => SCHEDULES[name](step, warm)
  const pts: Pt[] = Array.from({ length: 401 }, (_, i) => [i * 25, peak * share(i * 25)])
  const mean = pts.reduce((sum, p) => sum + p[1], 0) / pts.length / peak
  return (
    <div className="widget">
      <div className="seg">{Object.keys(SCHEDULES).map(k => <button key={k} className={k === name ? 'on' : ''} onClick={() => setName(k)}>{k}</button>)}</div>
      <Plot x={[0, TOTAL]} y={[0, 11]} height={260} xLabel="training step" yLabel="learning rate × 1000" onDrag={x => setAt(Math.round(x / 100) * 100)}>
        {s => (
          <>
            <Path s={s} pts={pts} />
            <Seg s={s} a={[at, 0]} b={[at, peak * share(at)]} dash="3 3" />
            <Dot s={s} x={at} y={peak * share(at)} color="blue" />
          </>
        )}
      </Plot>
      <Slider label="peak rate" value={peak} min={1} max={10} step={0.5} onChange={setPeak} show={v => (v / 1000).toFixed(4)} />
      <Slider label="warm-up steps" value={warm} min={0} max={3000} step={100} onChange={setWarm} show={String} />
      <Readout
        items={[
          ['step (drag the plot)', String(at), 'blue'],
          ['rate at that step', ((peak * share(at)) / 1000).toFixed(5), 'blue'],
          ['share of the peak', `${fmt(share(at) * 100, 0)}%`],
          ['average over the run', `${fmt(mean * 100, 0)}% of the peak`],
        ]}
      />
      <p className="caption">
        Drag across the plot to read the rate at any step. <b>Constant</b> never slows down, so the loss keeps bouncing around the minimum at the end. <b>Step</b> cuts the rate
        by ten at fixed points, and each cut shows as a sudden drop in the loss. <b>Cosine</b> glides to zero. <b>Warm-up</b> ramps up from zero first, which protects the
        fragile first steps, and it only applies to the last schedule. The peak rate is still the number you have to tune.
      </p>
    </div>
  )
}

export const neuralWidgets: Record<string, ComponentType> = {
  'neural-activation': Activation,
  'neural-hinges': Hinges,
  'neural-depth': Depth,
  'neural-schedule': Schedule,
}
