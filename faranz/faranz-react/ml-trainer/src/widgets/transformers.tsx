import { useState, type ComponentType } from 'react'
import { Label, Plot, Readout, Slider, fmt } from '../components/Plot'

const softmax = (zs: number[]) => {
  const top = Math.max(...zs)
  const es = zs.map(z => Math.exp(z - top))
  const total = es.reduce((a, b) => a + b, 0)
  return es.map(e => e / total)
}

const WORDS = 'low lower lowest slow slower slowest'.split(' ')
const SEP = '\u0000'

/** The most frequent adjacent pair inside the words. Ties go to the pair seen first. */
function bestPair(words: string[][]): [string, string, number] | null {
  const counts = new Map<string, number>()
  for (const w of words) for (let i = 0; i + 1 < w.length; i++) counts.set(w[i] + SEP + w[i + 1], (counts.get(w[i] + SEP + w[i + 1]) ?? 0) + 1)
  let best: [string, string, number] | null = null
  for (const [key, n] of counts) if (!best || n > best[2]) best = [key.split(SEP)[0], key.split(SEP)[1], n]
  return best
}

function mergePair(word: string[], a: string, b: string): string[] {
  const out: string[] = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] === a && word[i + 1] === b) {
      out.push(a + b)
      i++
    } else out.push(word[i])
  }
  return out
}

/** Byte-pair encoding, one merge at a time, on six words. */
function Bpe() {
  const [steps, setSteps] = useState(0)
  let words = WORDS.map(w => w.split(''))
  const merges: [string, string, number][] = []
  for (let i = 0; i < steps; i++) {
    const pair = bestPair(words)!
    merges.push(pair)
    words = words.map(w => mergePair(w, pair[0], pair[1]))
  }
  const next = bestPair(words)
  const newest = merges.length ? merges[merges.length - 1][0] + merges[merges.length - 1][1] : ''
  const count = words.reduce((a, w) => a + w.length, 0)
  const chars = WORDS.join('').length
  return (
    <div className="widget">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: 'inline-flex', gap: 2 }}>
            {w.map((t, j) => (
              <span key={j} style={{ border: `1px solid var(${t === newest ? '--accent' : '--line'})`, borderRadius: 4, padding: '1px 5px', background: 'var(--raised)' }}>{t}</span>
            ))}
          </span>
        ))}
      </div>
      <div className="actions">
        <button className="btn primary" disabled={!next} onClick={() => setSteps(steps + 1)}>{next ? `Merge ${next[0]} + ${next[1]} (seen ${next[2]}×)` : 'Nothing left to merge'}</button>
        <button className="btn" onClick={() => setSteps(0)}>Reset</button>
      </div>
      <Readout
        items={[
          ['merges', String(steps)],
          ['vocabulary', String(new Set(WORDS.join('')).size + steps), 'blue'],
          ['tokens', String(count), 'accent'],
          ['characters per token', fmt(chars / count)],
        ]}
      />
      <div className="readout">
        <div><span>new tokens, in order</span><b>{merges.length ? merges.map(m => m[0] + m[1]).join('  ') : 'none yet'}</b></div>
      </div>
      <p className="caption">
        The text starts as {chars} single characters from a vocabulary of 7. Each press finds the <b>most frequent adjacent pair</b> (ties go to the pair seen first), adds it
        to the vocabulary as one new token and rewrites the text. Pairs never cross a space. The token count falls as the vocabulary grows: that is the trade a tokeniser
        makes. Keep going to the end and every word is one token, which is a word-level vocabulary again. Real tokenisers stop long before that, at a vocabulary size chosen in advance.
      </p>
    </div>
  )
}

const SENTENCE = ['the', 'cat', 'sat', 'on', 'the', 'mat']
// four made-up features: noun, verb, determiner, preposition
const KEYS = [[0, 0, 2, 0], [2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 0, 2], [0, 0, 2, 0], [2, 0, 0, 0]]
const QUERIES = [[1, 0, 0, 0], [0, 2, 1, 0], [2, 0, 0, 0.5], [0, 2, 0, 0], [1, 0, 0, 1], [0, 1, 1, 2]]
const dot = (a: number[], b: number[]) => a.reduce((sum, v, i) => sum + v * b[i], 0)

/** Scaled dot-product attention on six tokens with four-number queries and keys. */
function Attention() {
  const [q, setQ] = useState(2)
  const [causal, setCausal] = useState(false)
  const [scale, setScale] = useState(1)
  const n = SENTENCE.length
  const seen = (i: number, j: number) => !causal || j <= i
  const scores = QUERIES.map(qv => KEYS.map(kv => (scale * dot(qv, kv)) / Math.sqrt(kv.length)))
  // softmax over the positions each query is allowed to see
  const weights = scores.map((row, i) => {
    const p = softmax(row.filter((_, j) => seen(i, j)))
    let at = 0
    return row.map((_, j) => (seen(i, j) ? p[at++] : 0))
  })
  return (
    <div className="widget">
      <div className="seg">
        {SENTENCE.map((t, i) => <button key={i} className={i === q ? 'on' : ''} onClick={() => setQ(i)}>{t}</button>)}
      </div>
      <Plot x={[0, n]} y={[0, 1.25]} height={230} bare>
        {s => (
          <>
            {SENTENCE.map((t, j) => (
              <g key={j}>
                <rect x={s.x(j + 0.15)} y={s.y(weights[q][j])} width={s.w(0.7)} height={s.h(weights[q][j])} fill={j === q ? 'var(--blue)' : 'var(--accent)'} />
                <Label s={s} x={j + 0.5} y={1.14} dx={0} dy={0} anchor="middle" color={seen(q, j) ? 'text' : 'muted'}>{t}</Label>
                <Label s={s} x={j + 0.5} y={weights[q][j]} dx={0} anchor="middle" color={seen(q, j) ? 'accent' : 'muted'}>{seen(q, j) ? fmt(weights[q][j]) : 'masked'}</Label>
              </g>
            ))}
          </>
        )}
      </Plot>
      <div className="seg">
        <button className={causal ? '' : 'on'} onClick={() => setCausal(false)}>No mask</button>
        <button className={causal ? 'on' : ''} onClick={() => setCausal(true)}>Causal mask</button>
      </div>
      <Slider label="scale" value={scale} min={0} max={4} step={0.25} onChange={setScale} show={v => `${v}×`} />
      <table className="cells">
        <thead>
          <tr><th>query ↓ key →</th>{SENTENCE.map((t, j) => <th key={j}>{t}</th>)}</tr>
        </thead>
        <tbody>
          {SENTENCE.map((t, i) => (
            <tr key={i} onClick={() => setQ(i)} style={{ cursor: 'pointer' }}>
              <th style={{ textAlign: 'left', color: i === q ? 'var(--text)' : undefined }}>{t}</th>
              {weights[i].map((w, j) => (
                <td key={j} style={{ padding: '4px 5px', background: `color-mix(in srgb, var(--accent) ${Math.round(w * 70)}%, transparent)` }}>{seen(i, j) ? fmt(w) : '·'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Readout items={[['scores q·k ÷ √4 for this query', scores[q].map((v, j) => (seen(q, j) ? fmt(v, 1) : '−∞')).join('  ')]]} />
      <p className="caption">
        Pick a <b>query</b> token. The bars are its attention weights: the softmax of its query dotted with every key, divided by √4. The table holds every row, and each row
        adds up to 1. Turn on the <b>causal mask</b> and each token sees only itself and what came before, with the weight shared out again among those. Slide <b>scale</b>{' '}
        to 0 and every token gets the same weight; raise it and one token takes everything, which is why real models divide by √d. The two <b>the</b> tokens always
        match, because these vectors carry no position.
      </p>
    </div>
  )
}

const NEXT = ['mat', 'floor', 'sofa', 'bed', 'chair', 'roof', 'table', 'moon']
const LOGITS = [0.4, 0.2, 0.15, 0.1, 0.06, 0.04, 0.03, 0.02].map(Math.log)
const BASE = softmax(LOGITS)

/** One next-token distribution reshaped by temperature, top-k and top-p. */
function Sampling() {
  const [temp, setTemp] = useState(1)
  const [k, setK] = useState(8)
  const [p, setP] = useState(1)
  // the tokens are listed from most to least likely, so the index is the rank
  const warm = softmax(LOGITS.map(l => l / temp))
  let before = 0
  const keep = warm.map((w, i) => {
    const ok = i < k && before < p - 1e-9
    before += w
    return ok
  })
  const mass = warm.reduce((a, w, i) => a + (keep[i] ? w : 0), 0)
  const final = warm.map((w, i) => (keep[i] ? w / mass : 0))
  return (
    <div className="widget">
      <Plot x={[0, NEXT.length]} y={[0, 1.25]} height={250} bare>
        {s => (
          <>
            {NEXT.map((t, i) => (
              <g key={t}>
                <rect x={s.x(i + 0.12)} y={s.y(BASE[i])} width={s.w(0.76)} height={s.h(BASE[i])} fill="none" stroke="var(--muted)" strokeDasharray="3 3" />
                <rect x={s.x(i + 0.12)} y={s.y(final[i])} width={s.w(0.76)} height={s.h(final[i])} fill="var(--accent)" opacity={0.85} />
                <Label s={s} x={i + 0.5} y={1.14} dx={0} dy={0} anchor="middle" color={keep[i] ? 'text' : 'muted'}>{t}</Label>
                <Label s={s} x={i + 0.5} y={Math.max(final[i], BASE[i])} dx={0} anchor="middle" color={keep[i] ? 'accent' : 'bad'}>{keep[i] ? fmt(final[i]) : 'cut'}</Label>
              </g>
            ))}
          </>
        )}
      </Plot>
      <Slider label="temperature" value={temp} min={0.1} max={2} step={0.1} onChange={setTemp} />
      <Slider label="top-k" value={k} min={1} max={NEXT.length} step={1} onChange={setK} show={v => String(v)} />
      <Slider label="top-p" value={p} min={0.1} max={1} step={0.05} onChange={setP} />
      <Readout items={[['tokens that survive', String(keep.filter(Boolean).length), 'accent'], ['P(mat)', fmt(final[0], 3)], ['probability cut off', fmt(1 - mass, 3), 'bad']]} />
      <p className="caption">
        The next token after "the cat sat on the". Dashed outlines are the model's own probabilities; solid bars are what you sample from. <b>Temperature</b> is applied
        first: below 1 it piles probability onto the favourite, above 1 it spreads it out. Then <b>top-k</b> keeps the k most likely tokens and <b>top-p</b> keeps the
        shortest list whose probabilities reach p. What survives is scaled back up to add to 1. Notice how a high temperature with no cut gives the tail a real chance.
      </p>
    </div>
  )
}

export const transformersWidgets: Record<string, ComponentType> = {
  'transformers-bpe': Bpe,
  'transformers-attention': Attention,
  'transformers-sampling': Sampling,
}
