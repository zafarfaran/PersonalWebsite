import { useState, type ComponentType } from 'react'
import { Dot, Label, Plot, Readout, Seg, Slider, fmt } from '../components/Plot'

type Pt = [number, number]

const DOCS: [string, number, number][] = [
  ['refunds: short answer', 2, 0.5],
  ['refunds: full policy', 8, 2.4],
  ['returns form', 5, 3.5],
  ['billing address', 4, 5],
  ['delivery times', 2.5, 6],
  ['track a parcel', 1, 4],
  ['reset password', 1, 1],
  ['opening hours', 7, 6.5],
]
const snap = (v: number) => Math.max(0.25, Math.round(v * 4) / 4)

/** Documents as points, a query you drag, and the k nearest by cosine or by distance. */
function Retrieval() {
  const [q, setQ] = useState<Pt>([6, 1.5])
  const [k, setK] = useState(3)
  const [cosine, setCosine] = useState(true)
  const ql = Math.hypot(...q)
  const scored = DOCS.map(([name, x, y]) => ({ name, x, y, cos: (x * q[0] + y * q[1]) / (Math.hypot(x, y) * ql), dist: Math.hypot(x - q[0], y - q[1]) }))
  const top = [...scored].sort((a, b) => (cosine ? b.cos - a.cos : a.dist - b.dist)).slice(0, k)
  const reach = top[top.length - 1].dist
  return (
    <div className="widget">
      <div className="seg">
        <button className={cosine ? 'on' : ''} onClick={() => setCosine(true)}>Cosine similarity</button>
        <button className={cosine ? '' : 'on'} onClick={() => setCosine(false)}>Euclidean distance</button>
      </div>
      <Plot x={[0, 10]} y={[0, 8]} height={352} onDrag={(x, y) => setQ([snap(x), snap(y)])}>
        {s => (
          <>
            {!cosine && <ellipse cx={s.x(q[0])} cy={s.y(q[1])} rx={s.w(reach)} ry={s.h(reach)} fill="none" stroke="var(--accent)" strokeDasharray="4 4" opacity={0.7} />}
            {scored.map(d => {
              const hit = top.includes(d)
              return (
                <g key={d.name}>
                  {cosine && <Seg s={s} a={[0, 0]} b={[d.x, d.y]} color={hit ? 'good' : 'muted'} width={1} opacity={hit ? 0.9 : 0.3} />}
                  <Dot s={s} x={d.x} y={d.y} color={hit ? 'good' : 'muted'} />
                  <Label s={s} x={d.x} y={d.y} color={hit ? 'good' : 'muted'} dx={d.x > 6 ? -6 : 6} anchor={d.x > 6 ? 'end' : 'start'}>{d.name}</Label>
                </g>
              )
            })}
            <Seg s={s} a={[0, 0]} b={q} color="accent" width={2.5} arrow />
            <Label s={s} x={q[0]} y={q[1]} color="accent" dy={14}>query</Label>
          </>
        )}
      </Plot>
      <Slider label="k (how many)" value={k} min={1} max={6} step={1} onChange={setK} show={v => String(v)} />
      <Readout
        items={[
          ['query', `(${q[0]}, ${q[1]})`, 'accent'],
          ...top.map((d, i): [string, string, 'good'] => [`${i + 1}.`, `${d.name} (${cosine ? 'cos ' + fmt(d.cos) : 'distance ' + fmt(d.dist)})`, 'good']),
        ]}
      />
      <p className="caption">
        Each point is a document, placed by a pretend two-number embedding. Drag the <b>query</b> and the green points are what retrieval would hand to the model. Cosine
        similarity compares direction only, so a long vector far away can win. Euclidean distance favours whatever is close on the page. Real embeddings are usually scaled to
        length 1, and then the two always agree.
      </p>
    </div>
  )
}

const TEXT =
  'Our standard plan includes five seats and ten projects. Extra seats can be added at any time from the billing page. Refunds are available within 30 days of purchase if you paid by card. After that period we can only offer account credit. To cancel, open settings and choose close account. Data is kept for 60 days after cancellation and then deleted. Annual plans renew automatically unless you switch renewal off first. Invoices are emailed on the first day of each month.'
const ANSWER = 'Refunds are available within 30 days of purchase if you paid by card.'
const WORDS = TEXT.split(' ')
const A0 = TEXT.slice(0, TEXT.indexOf(ANSWER)).trim().split(' ').length
const A1 = A0 + ANSWER.split(' ').length

/** A help page cut into chunks: size, overlap, and whether the sentence that answers the question survives. */
function Chunks() {
  const [size, setSize] = useState(30)
  const [overlap, setOverlap] = useState(0)
  const starts: number[] = []
  for (let at = 0; ; at += size - overlap) {
    starts.push(at)
    if (at + size >= WORDS.length) break
  }
  // how many words of the answer sentence each chunk holds
  const held = starts.map(at => Math.max(0, Math.min(at + size, A1) - Math.max(at, A0)))
  const best = held.indexOf(Math.max(...held))
  const whole = held[best] === A1 - A0
  const stored = starts.reduce((sum, at) => sum + Math.min(size, WORDS.length - at), 0)
  const rows = Math.max(starts.length, 6)
  const from = starts[best]
  const to = Math.min(from + size, WORDS.length)
  const part = (a: number, b: number) => WORDS.slice(Math.max(a, from), Math.min(b, to)).join(' ')
  return (
    <div className="widget">
      <Plot x={[0, WORDS.length]} y={[0, rows]} height={240} xLabel="the page, word by word (the answer sentence is shaded)" bare>
        {s => (
          <>
            <rect x={s.x(A0)} y={s.y(rows)} width={s.w(A1 - A0)} height={s.h(rows)} fill="var(--accent)" opacity={0.22} />
            {starts.map((at, i) => (
              <rect
                key={at}
                x={s.x(at) + 1}
                y={s.y(rows - i) + 2}
                width={s.w(Math.min(size, WORDS.length - at)) - 2}
                height={Math.max(2, s.h(1) - 4)}
                rx={2}
                fill={held[i] === A1 - A0 ? 'var(--good)' : held[i] ? 'var(--amber)' : 'var(--blue)'}
                opacity={0.85}
              />
            ))}
          </>
        )}
      </Plot>
      <Slider label="chunk size (words)" value={size} min={16} max={40} step={1} onChange={setSize} show={v => String(v)} />
      <Slider label="overlap (words)" value={overlap} min={0} max={12} step={1} onChange={setOverlap} show={v => String(v)} />
      <Readout
        items={[
          ['chunks', String(starts.length)],
          ['words stored', `${stored} (the page has ${WORDS.length})`],
          ['answer sentence', whole ? `whole in chunk ${best + 1}` : `cut in two: at most ${held[best]} of its ${A1 - A0} words in one chunk`, whole ? 'good' : 'bad'],
        ]}
      />
      <p style={{ margin: 0, fontSize: 12.5 }}>
        <span className="muted">Best chunk for "Can I get a refund?" (chunk {best + 1}): </span>
        {part(from, A0)} <b className="accent">{part(A0, A1)}</b> {part(A1, to)}
      </p>
      <p className="caption">
        Each bar is one chunk of a help page. Green holds the whole answer sentence, amber holds a piece of it. Start with size 30 and no overlap: the sentence is cut, and
        neither half answers the question well. Raise the <b>overlap</b> until one chunk turns green, and watch the chunk count and the stored words go up. Splitting on
        sentence boundaries avoids the cut without the extra copies.
      </p>
    </div>
  )
}

// made-up prices in dollars per million tokens, and made-up speeds
const LARGE = { tokenIn: 2, tokenOut: 10, first: 0.6, perSecond: 60 }
const SMALL = { tokenIn: 0.2, tokenOut: 1, first: 0.3, perSecond: 150 }
const usd = (v: number) => '$' + (v < 100 ? v.toFixed(2) : Math.round(v).toLocaleString('en-GB'))

/** What a day of traffic costs, and what caching and routing do to the bill and the wait. */
function Cost() {
  const [requests, setRequests] = useState(20000)
  const [tokensIn, setTokensIn] = useState(4000)
  const [tokensOut, setTokensOut] = useState(300)
  const [cache, setCache] = useState(0)
  const [small, setSmall] = useState(0)
  const per = (m: typeof LARGE, n: number) => ({ in: (n * tokensIn * m.tokenIn) / 1e6, out: (n * tokensOut * m.tokenOut) / 1e6 })
  const wait = (m: typeof LARGE) => m.first + tokensOut / m.perSecond
  const base = per(LARGE, requests)
  const calls = requests * (1 - cache)
  const large = per(LARGE, calls * (1 - small))
  const little = per(SMALL, calls * small)
  const total = large.in + large.out + little.in + little.out
  const baseTotal = base.in + base.out
  const meanWait = cache * 0.05 + (1 - cache) * ((1 - small) * wait(LARGE) + small * wait(SMALL))
  const bar = (y: number, parts: [number, string][]) => {
    let x = 0
    return parts.map(([value, color], i) => {
      const w = (value / baseTotal) * 440
      const rect = <rect key={i} x={x} y={y} width={Math.max(w, 0)} height={22} fill={color} />
      x += w
      return rect
    })
  }
  return (
    <div className="widget">
      <svg className="plot" viewBox="0 0 440 92" role="img">
        {bar(0, [[base.in, 'var(--blue)'], [base.out, 'var(--amber)']])}
        <text className="tick" x={0} y={35}>every request to the large model: {usd(baseTotal)} a day</text>
        {bar(46, [[large.in, 'var(--blue)'], [large.out, 'var(--amber)'], [little.in + little.out, 'var(--purple)']])}
        <text className="tick" x={0} y={81}>with the cache and the routing below: {usd(total)} a day</text>
      </svg>
      <Slider label="requests a day" value={requests} min={1000} max={100000} step={1000} onChange={setRequests} show={v => v.toLocaleString('en-GB')} />
      <Slider label="input tokens each" value={tokensIn} min={500} max={8000} step={100} onChange={setTokensIn} show={v => v.toLocaleString('en-GB')} />
      <Slider label="output tokens each" value={tokensOut} min={50} max={1000} step={50} onChange={setTokensOut} show={v => String(v)} />
      <Slider label="cache hit rate" value={cache} min={0} max={0.9} step={0.05} onChange={setCache} show={v => `${fmt(v * 100, 0)}%`} />
      <Slider label="share sent to the small model" value={small} min={0} max={1} step={0.05} onChange={setSmall} show={v => `${fmt(v * 100, 0)}%`} />
      <Readout
        items={[
          ['large model, input', usd(large.in), 'blue'],
          ['large model, output', usd(large.out), 'amber'],
          ['small model', usd(little.in + little.out), 'purple'],
          ['a 30-day month', usd(total * 30), 'accent'],
          ['saved', `${fmt((1 - total / baseTotal) * 100, 0)}%`, 'good'],
          ['mean wait for a full answer', `${fmt(meanWait, 1)} s`],
        ]}
      />
      <p className="caption">
        The prices are invented: the large model costs $2 per million input tokens and $10 per million output tokens, the small one a tenth of that, and a cache hit costs
        nothing. Output tokens cost more each, but a long prompt still makes input the larger part of the bill. The wait is driven by the <b>output</b> length. Caching and
        routing cut both, as long as your evaluation shows that the small model answers its share well.
      </p>
    </div>
  )
}

export const aiengWidgets: Record<string, ComponentType> = {
  'aieng-retrieval': Retrieval,
  'aieng-chunks': Chunks,
  'aieng-cost': Cost,
}
