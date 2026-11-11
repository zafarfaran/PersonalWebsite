import { useState } from 'react'
import { shuffle } from '../lib'
import { href } from '../router'
import { isDue, strength } from '../srs'
import { getState, recordCard, useStore } from '../store'
import { DECKS, fmt, isRight, type Fact } from '../tricks'
import { AnswerBox, Meter, Shell } from '../ui'

const SESSION = 15

/** Pick a session: facts that are due first, then ones never seen, then the weakest. */
function deal(facts: Fact[]): Fact[] {
  const mem = getState().cards
  const now = Date.now()
  const due = shuffle(facts.filter(f => isDue(mem[f.key], now)))
  const fresh = shuffle(facts.filter(f => !mem[f.key]))
  const rest = shuffle(facts.filter(f => mem[f.key] && !isDue(mem[f.key], now))).sort((a, b) => mem[a.key].box - mem[b.key].box)
  return [...due, ...fresh, ...rest].slice(0, SESSION)
}

export function Memorise() {
  const [deckId, setDeckId] = useState('tables')
  const mem = useStore().cards
  const deck = DECKS[deckId]
  const known = deck.facts.filter(f => (mem[f.key]?.box ?? 0) >= 2).length

  return (
    <Shell back={href()} backLabel="Home" title="Memorise" mode="Repetition cards" right={<span className="count">{known} of {deck.facts.length} known</span>}>
      <div className="seg tabs">
        {Object.entries(DECKS).map(([id, d]) => (
          <button key={id} className={id === deckId ? 'on' : ''} onClick={() => setDeckId(id)}>{d.name}</button>
        ))}
      </div>
      <Cards key={deckId} facts={deck.facts} blurb={deck.blurb} />
    </Shell>
  )
}

function Cards({ facts, blurb }: { facts: Fact[]; blurb: string }) {
  const [hand, setHand] = useState(() => deal(facts))
  const [i, setI] = useState(0)
  const [state, setState] = useState<'ask' | 'right' | 'retry'>('ask')
  const [tries, setTries] = useState(0)
  const [score, setScore] = useState(0)
  const mem = useStore().cards
  const fact = hand[i]

  if (!fact) {
    return (
      <div className="card result">
        <div className="eyebrow good">Round finished</div>
        <div className="move">{score} of {hand.length} right first time</div>
        <p>Facts you missed are due again straight away. The ones you knew come back after a longer gap each time.</p>
        <div className="actions">
          <button className="btn primary" onClick={() => { setHand(deal(facts)); setI(0); setScore(0); setState('ask') }}>Another round</button>
          <a className="btn" href={href()}>Home</a>
        </div>
      </div>
    )
  }

  const next = () => {
    setI(n => n + 1)
    setState('ask')
  }
  const submit = (value: number) => {
    const correct = isRight(value, fact.answer)
    if (state === 'ask') {
      recordCard(fact.key, correct)
      if (correct) setScore(n => n + 1)
    }
    if (correct) {
      setState('right')
      setTimeout(next, 450)
    } else {
      setState('retry')
      setTries(n => n + 1)
    }
  }

  return (
    <div className="trainer">
      <div className="card problem">
        <div className="eyebrow">Card {i + 1} of {hand.length}</div>
        {/* after a miss you type the right answer once before moving on */}
        <AnswerBox key={`${i}-${tries}`} q={fact.q} unit={fact.unit} disabled={state === 'right'} onSubmit={submit} />
        {state === 'right' && <p className="verdict good">Correct</p>}
        {state === 'retry' && (
          <p className="verdict bad">
            The answer is {fmt(fact.answer)}{fact.unit ?? ''}. Type it in to continue.
          </p>
        )}
      </div>
      <div className="panel">
        <div className="card">
          <div className="eyebrow">How well you know this one</div>
          <Meter value={strength(mem[fact.key])} />
          <p className="note">{blurb}. Each correct answer pushes the next review further away: 1 day, then 3, 7, 14 and 30. No tricks here, these are worth knowing by heart.</p>
        </div>
        <div className="note">{score} right first time so far</div>
      </div>
    </div>
  )
}
