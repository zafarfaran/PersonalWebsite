import { useState, type ComponentType } from 'react'
import { Curve, Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

interface Op { name: string; shape: number[]; vals: number[]; sum?: boolean; note: string }
const BASE = [0, 1, 2, 3, 4, 5]
const OPS: Op[] = [
  { name: 'x', shape: [2, 3], vals: BASE, note: 'the starting tensor: 2 rows of 3' },
  { name: 'x.unsqueeze(0)', shape: [1, 2, 3], vals: BASE, note: 'a new axis of size 1 in front: a batch of one' },
  { name: 'x.unsqueeze(1)', shape: [2, 1, 3], vals: BASE, note: 'a new axis in the middle: two blocks of one row' },
  { name: 'x.permute(1, 0)', shape: [3, 2], vals: [0, 3, 1, 4, 2, 5], note: 'axes swapped: rows become columns, the numbers move' },
  { name: 'x.reshape(3, 2)', shape: [3, 2], vals: BASE, note: 'same reading order, new line breaks' },
  { name: 'x.reshape(-1)', shape: [6], vals: BASE, note: 'flattened: −1 means "work the size out"' },
  { name: 'x.sum(dim=0)', shape: [3], vals: [3, 5, 7], sum: true, note: 'axis 0 is summed away: one total per column' },
  { name: 'x.sum(dim=1)', shape: [2], vals: [3, 12], sum: true, note: 'axis 1 is summed away: one total per row' },
  { name: 'x.sum(dim=1, keepdim=True)', shape: [2, 1], vals: [3, 12], sum: true, note: 'the summed axis stays, with size 1' },
]
const shapeText = (s: number[]) => `(${s.join(', ')}${s.length === 1 ? ',' : ''})`

/** A grid of cells for a tensor of up to three axes. The first of three axes is drawn as separate blocks. */
function Cells({ x, y, shape, vals, sum }: { x: number; y: number; shape: number[]; vals: number[]; sum?: boolean }) {
  const [a, b, c] = [...Array(3 - shape.length).fill(1), ...shape] as number[]
  const [w, h, gap] = [38, 30, 12]
  return (
    <>
      {vals.map((v, i) => {
        const [block, row, col] = [Math.floor(i / (b * c)), Math.floor(i / c) % b, i % c]
        const color = sum ? 'var(--good)' : v < 3 ? 'var(--accent)' : 'var(--blue)'
        const [cx, cy] = [x + col * w, y + block * (b * h + gap) + row * h]
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={w - 2} height={h - 2} rx={4} fill={color} fillOpacity={0.22} stroke={color} />
            <text className="mark" x={cx + w / 2 - 1} y={cy + h / 2 + 3} textAnchor="middle" fill="var(--text)">{v}</text>
          </g>
        )
      })}
      {a > 1 && <text className="tick" x={x} y={y + a * (b * h + gap) + 2}>{a} blocks: the first axis</text>}
    </>
  )
}

/** Pick an operation and see the shape and the cells that come out. */
function Shapes() {
  const [i, setI] = useState(3)
  const op = OPS[i]
  return (
    <div className="widget">
      <div className="seg">
        {OPS.map((o, j) => <button key={o.name} className={j === i ? 'on' : ''} onClick={() => setI(j)}>{o.name}</button>)}
      </div>
      <svg className="plot" viewBox="0 0 440 150" role="img">
        <text className="label" x={8} y={14}>x, shape (2, 3)</text>
        <Cells x={8} y={24} shape={[2, 3]} vals={BASE} />
        <text className="label" x={170} y={14}>{op.name}, shape {shapeText(op.shape)}</text>
        <Cells x={170} y={24} shape={op.shape} vals={op.vals} sum={op.sum} />
      </svg>
      <Readout items={[['before', '(2, 3)'], ['after', shapeText(op.shape), 'accent'], ['numbers', String(op.vals.length)], ['what happened', op.note]]} />
      <p className="caption">
        The colours follow the two rows of <b>x</b>, so you can see where each number went. Compare <b>permute(1, 0)</b> with <b>reshape(3, 2)</b>: the same shape, different
        contents. Only permute moves numbers; reshape and unsqueeze re-read them in the same order. A sum removes its axis unless you keep it with keepdim. Before any of these in
        your own code, say the output shape out loud.
      </p>
    </div>
  )
}

const N = 8
const IMG = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ((r >= 2 && r <= 5 && c >= 3 && c <= 6) || (r === 6 && c === 1) ? 1 : 0)))
const KERNELS: Record<string, number[][]> = {
  Edge: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
  Blur: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]],
  Sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
}

/** A 3 by 3 kernel sliding over a small image, with stride and padding. */
function Conv() {
  const [name, setName] = useState('Edge')
  const [stride, setStride] = useState(1)
  const [pad, setPad] = useState(0)
  const [sel, setSel] = useState<[number, number]>([2, 1])
  const k = KERNELS[name]
  const n = N + 2 * pad
  const px = (r: number, c: number) => IMG[r - pad]?.[c - pad] ?? 0
  const size = Math.floor((n - 3) / stride) + 1
  const out = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => k.reduce((sum, row, a) => sum + row.reduce((s, w, b) => s + w * px(i * stride + a, j * stride + b), 0), 0)),
  )
  const top = Math.max(1e-9, ...out.map(row => Math.max(...row.map(Math.abs))))
  const [si, sj] = [Math.min(sel[0], size - 1), Math.min(sel[1], size - 1)]
  const [ci, co, x0, x1, y0] = [190 / n, 190 / size, 10, 240, 24]
  const cells = Array.from({ length: n * n }, (_, q) => [Math.floor(q / n), q % n])
  return (
    <div className="widget">
      <div className="seg">{Object.keys(KERNELS).map(key => <button key={key} className={key === name ? 'on' : ''} onClick={() => setName(key)}>{key}</button>)}</div>
      <div className="seg">
        {[1, 2].map(v => <button key={v} className={v === stride ? 'on' : ''} onClick={() => setStride(v)}>stride {v}</button>)}
        {[0, 1].map(v => <button key={v} className={v === pad ? 'on' : ''} onClick={() => setPad(v)}>padding {v}</button>)}
      </div>
      <svg className="plot" viewBox="0 0 440 222" role="img">
        <text className="label" x={x0} y={14}>input 8×8{pad ? ' with a ring of zeros' : ''}</text>
        <text className="label" x={x1} y={14}>output {size}×{size} (click a cell)</text>
        {cells.map(([r, c]) => {
          const inside = r >= pad && r < n - pad && c >= pad && c < n - pad
          return <rect key={`${r}-${c}`} x={x0 + c * ci} y={y0 + r * ci} width={ci - 1} height={ci - 1} fill="var(--text)" fillOpacity={inside ? 0.08 + 0.8 * px(r, c) : 0} stroke="var(--muted)" strokeOpacity={0.5} strokeDasharray={inside ? undefined : '2 2'} />
        })}
        <rect x={x0 + sj * stride * ci - 1} y={y0 + si * stride * ci - 1} width={3 * ci + 1} height={3 * ci + 1} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        {out.map((row, i) => row.map((v, j) => (
          <rect key={`${i}-${j}`} x={x1 + j * co} y={y0 + i * co} width={co - 1} height={co - 1} fill={v >= 0 ? 'var(--accent)' : 'var(--blue)'} fillOpacity={Math.abs(v) / top} stroke={i === si && j === sj ? 'var(--text)' : 'var(--muted)'} strokeOpacity={i === si && j === sj ? 1 : 0.5} strokeWidth={i === si && j === sj ? 2.5 : 1} style={{ cursor: 'pointer' }} onClick={() => setSel([i, j])} />
        )))}
      </svg>
      <table className="cells">
        <tbody>{k.map((row, a) => <tr key={a}>{a === 0 && <th rowSpan={3}>kernel</th>}{row.map((w, b) => <td key={b}>{fmt(w, name === 'Blur' ? 2 : 0)}</td>)}</tr>)}</tbody>
      </table>
      <Readout
        items={[
          ['output size', `⌊(8 + 2×${pad} − 3) ÷ ${stride}⌋ + 1 = ${size}`, 'accent'],
          ['selected cell', `patch × kernel, summed = ${fmt(out[si][sj])}`, out[si][sj] < 0 ? 'blue' : 'accent'],
        ]}
      />
      <p className="caption">
        Each output cell is the outlined 3×3 patch multiplied by the kernel and summed. Yellow is positive, blue negative. <b>Edge</b> is zero wherever the patch is flat and
        fires on the left and right sides of the square. <b>Blur</b> spreads the single bright pixel. Change stride and padding and check the size against the formula: padding 1
        keeps 8×8, stride 2 halves it.
      </p>
    </div>
  )
}

const EXAMPLES = 50000
const CARD = 8
const memory = (batch: number, half: boolean) => 1.2 + batch * 0.06 * (half ? 0.55 : 1)

/** Batch size against memory and steps per epoch, with accumulation and mixed precision. */
function Batch() {
  const [power, setPower] = useState(6)
  const [accum, setAccum] = useState(1)
  const [half, setHalf] = useState(false)
  const batch = 2 ** power
  const used = memory(batch, half)
  const fits = used <= CARD
  const passes = Math.ceil(EXAMPLES / batch)
  return (
    <div className="widget">
      <Plot x={[0, 270]} y={[0, 18]} height={240} xLabel="batch size" yLabel="GPU memory (GB)">
        {s => (
          <>
            <Curve s={s} f={b => memory(b, false)} color={half ? 'muted' : 'accent'} />
            <Curve s={s} f={b => memory(b, true)} color={half ? 'accent' : 'muted'} dash="5 4" />
            <Seg s={s} a={[0, CARD]} b={[270, CARD]} color="bad" dash="4 4" />
            <Label s={s} x={4} y={CARD} color="bad">the card holds {CARD} GB</Label>
            <Label s={s} x={266} y={memory(256, false)} anchor="end" dx={-4} dy={14} color="muted">float32</Label>
            <Label s={s} x={266} y={memory(256, true)} anchor="end" dx={-4} dy={14} color="muted">mixed precision</Label>
            <Dot s={s} x={batch} y={used} color={fits ? 'good' : 'bad'} r={6} />
          </>
        )}
      </Plot>
      <div className="seg">
        <button className={half ? '' : 'on'} onClick={() => setHalf(false)}>float32</button>
        <button className={half ? 'on' : ''} onClick={() => setHalf(true)}>mixed precision</button>
      </div>
      <Slider label="batch size" value={power} min={3} max={8} step={1} onChange={setPower} show={v => String(2 ** v)} />
      <Slider label="accumulate" value={accum} min={1} max={8} step={1} onChange={setAccum} show={v => `${v} batch${v > 1 ? 'es' : ''}`} />
      <Readout
        items={[
          ['memory', fits ? `${fmt(used, 1)} GB` : `${fmt(used, 1)} GB: out of memory`, fits ? 'good' : 'bad'],
          ['batches per epoch', String(passes)],
          ['weight updates per epoch', String(Math.ceil(passes / accum))],
          ['examples per update', String(batch * accum), 'accent'],
        ]}
      />
      <p className="caption">
        A made-up but typical model on {EXAMPLES.toLocaleString()} examples: a fixed cost for the weights, plus activations that grow in step with the <b>batch size</b>. Push
        the batch up until it no longer fits. Then get the same number of examples per update with a smaller batch and <b>accumulation</b>: the memory does not move. Mixed
        precision lowers the slope of the line. The numbers are for illustration; the shape of the trade is real.
      </p>
    </div>
  )
}

export const pytorchWidgets: Record<string, ComponentType> = {
  'pytorch-shapes': Shapes,
  'pytorch-conv': Conv,
  'pytorch-batch': Batch,
}
