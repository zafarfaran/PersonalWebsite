import { useMemo, useState } from 'react'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { clean, legalDests, moveLabel, placementFen, placementOf, sanOf, squaresOf, type Square } from '../chess'
import { SIDE_NAME, type Opening } from '../data'
import { cardsFor, shuffle, type Card } from '../lib'
import { href } from '../router'
import { isDue, strength } from '../srs'
import { getState, recordCard, recordSetup, useStore } from '../store'

const SESSION = 12

export function Memorise({ o }: { o: Opening }) {
  const [tab, setTab] = useState<'moves' | 'setup'>('moves')
  const s = useStore()
  const cards = useMemo(() => cardsFor(o), [o])
  const known = cards.filter(c => (s.cards[c.key]?.box ?? 0) >= 2).length

  return (
    <Shell
      back={href('o', o.id)}
      backLabel={o.name}
      title={o.name}
      mode="Memory trainer"
      right={<span className="count">{known} of {cards.length} positions known</span>}
    >
      <div className="seg tabs">
        <button className={tab === 'moves' ? 'on' : ''} onClick={() => setTab('moves')}>Moves: what do you play here?</button>
        <button className={tab === 'setup' ? 'on' : ''} onClick={() => setTab('setup')}>Setup: build it from memory</button>
      </div>
      {tab === 'moves' ? <MoveCards key={o.id} o={o} cards={cards} /> : <SetupBuilder key={o.id} o={o} />}
    </Shell>
  )
}

/** Pick a session: positions that are due first, then ones never seen, then the weakest. */
function deal(cards: Card[]): Card[] {
  const mem = getState().cards
  const now = Date.now()
  const due = shuffle(cards.filter(c => isDue(mem[c.key], now)))
  const fresh = cards.filter(c => !mem[c.key]) // kept in line order so new positions arrive in a sensible sequence
  const rest = shuffle(cards.filter(c => mem[c.key] && !isDue(mem[c.key], now))).sort((a, b) => mem[a.key].box - mem[b.key].box)
  return [...due, ...fresh, ...rest].slice(0, SESSION)
}

function MoveCards({ o, cards }: { o: Opening; cards: Card[] }) {
  const [deck, setDeck] = useState(() => deal(cards))
  const [i, setI] = useState(0)
  const [state, setState] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [tried, setTried] = useState<{ from: Square; to: Square } | null>(null)
  const [score, setScore] = useState(0)
  const mem = useStore().cards
  const card = deck[i]

  if (!card) {
    return (
      <div className="card">
        <div className="eyebrow good">Session finished</div>
        <div className="move">{score} of {deck.length} right first time</div>
        <p>Positions you missed are due again straight away. The ones you knew come back after a longer gap each time.</p>
        <div className="actions">
          <button className="btn primary" onClick={() => { setDeck(deal(cards)); setI(0); setScore(0); setState('ask') }}>Another round</button>
          <a className="btn" href={href('o', o.id)}>Back to {o.name}</a>
        </div>
      </div>
    )
  }

  const answer = squaresOf(card.fen, card.san)!
  const next = () => {
    setI(i + 1)
    setState('ask')
    setTried(null)
  }
  const play = (from: Square, to: Square) => {
    const san = sanOf(card.fen, from, to)
    if (!san) return
    const correct = clean(san) === clean(card.san)
    if (state === 'ask') {
      recordCard(card.key, correct)
      if (correct) setScore(n => n + 1)
    }
    if (correct) {
      // after a miss you still have to play the right move once before moving on
      const wasAsk = state === 'ask'
      setState('right')
      setTried(null)
      setTimeout(next, wasAsk ? 700 : 400)
    } else {
      setState('wrong')
      setTried({ from, to })
    }
  }

  const highlights: Highlight[] = card.last ? [{ sq: card.last.from, kind: 'last' }, { sq: card.last.to, kind: 'last' }] : []
  const arrows: Arrow[] = []
  if (state === 'wrong') {
    arrows.push({ ...answer, color: 'accent' })
    if (tried) arrows.push({ ...tried, color: 'bad' })
  }
  if (state === 'right') highlights.push({ sq: answer.from, kind: 'good' }, { sq: answer.to, kind: 'good' })

  return (
    <div className="trainer">
      <Board key={card.key} fen={card.fen} coords flip={o.side === 'b'} dests={state === 'right' ? undefined : legalDests(card.fen)} onMove={play} highlights={highlights} arrows={arrows} />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">Position {i + 1} of {deck.length}</div>
          {state === 'ask' && (
            <>
              <div className="move">{SIDE_NAME[o.side]} to play</div>
              <p>What is your move here? Play it on the board. No hints: this is a memory test.</p>
            </>
          )}
          {state === 'right' && <div className="move good">Correct · {moveLabel(card.ply)} {card.san}</div>}
          {state === 'wrong' && (
            <>
              <div className="move bad">The move is {moveLabel(card.ply)} {card.san}</div>
              <p>{card.note}</p>
              <p className="accent">Play it on the board to continue.</p>
            </>
          )}
          <p className="note">From: {card.lesson.title}</p>
        </div>
        <div className="card">
          <div className="eyebrow">How well you know this position</div>
          <Meter value={strength(mem[card.key])} />
          <p className="note">Each correct answer pushes the next review further away: 1 day, then 3, 7, 14 and 30.</p>
        </div>
        <div className="actions">
          <span className="note">{score} right so far</span>
        </div>
      </div>
    </div>
  )
}

const START_ROWS = { w: '8/8/8/8/8/8/PPPPPPPP/RNBQKBNR', b: 'rnbqkbnr/pppppppp/8/8/8/8/8/8' }

function SetupBuilder({ o }: { o: Opening }) {
  const target = useMemo(() => placementOf(o.setupFen), [o])
  const [pieces, setPieces] = useState(() => placementOf(START_ROWS[o.side]))
  const [result, setResult] = useState<'building' | 'checked' | 'solved' | 'shown'>('building')
  const built = useStore().setups[o.id] ?? 0

  const wrong = Object.keys(pieces).filter(sq => pieces[sq] !== target[sq])
  const total = Object.keys(target).length
  const move = (from: Square, to: Square) => {
    const next = { ...pieces, [to]: pieces[from] }
    delete next[from]
    setPieces(next)
    if (result !== 'building') setResult('building')
  }
  const check = () => {
    if (wrong.length === 0) {
      setResult('solved')
      recordSetup(o.id)
    } else setResult('checked')
  }
  const reset = () => {
    setPieces(placementOf(START_ROWS[o.side]))
    setResult('building')
  }

  const shown = result === 'shown'
  const highlights: Highlight[] =
    result === 'checked' ? wrong.map(sq => ({ sq, kind: 'bad' as const })) : result === 'solved' ? Object.keys(target).map(sq => ({ sq, kind: 'good' as const })) : []

  return (
    <div className="trainer">
      <Board
        fen={(shown ? o.setupFen : placementFen(pieces)) + ' w - - 0 1'}
        coords
        flip={o.side === 'b'}
        free={!shown && result !== 'solved'}
        onMove={move}
        highlights={highlights}
      />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">Build the {o.name} setup</div>
          {result === 'building' && (
            <>
              <div className="move">Where does everything go?</div>
              <p>Your pieces start at home. Drag each one to the square it ends up on once the opening is complete, then press Check. Pieces can go to any empty square here, the rules are switched off.</p>
            </>
          )}
          {result === 'checked' && (
            <>
              <div className="move bad">{total - wrong.length} of {total} in place</div>
              <p>The pieces marked in red are on the wrong square. Move them and check again.</p>
            </>
          )}
          {result === 'solved' && (
            <>
              <div className="move good">Perfect setup</div>
              <p>{o.setupNote}</p>
            </>
          )}
          {shown && (
            <>
              <div className="move">This is the setup</div>
              <p>{o.setupNote}</p>
              <p className="accent">Study it, then press Start again and build it yourself.</p>
            </>
          )}
        </div>
        <div className="actions">
          {result !== 'solved' && !shown && <button className="btn primary" onClick={check}>Check</button>}
          <button className={'btn' + (result === 'solved' || shown ? ' primary' : '')} onClick={reset}>Start again</button>
          {result !== 'solved' && !shown && <button className="btn" onClick={() => setResult('shown')}>Show me the answer</button>}
        </div>
        <div className="note">Built perfectly {built} {built === 1 ? 'time' : 'times'}.</div>
      </div>
    </div>
  )
}
