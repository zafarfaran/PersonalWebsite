import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { clean, legalDests, sanOf, squaresOf, type Square } from '../chess'
import { SIDE_NAME } from '../data'
import { Engine } from '../engine'
import { shuffle } from '../lib'
import { href } from '../router'
import { isDue, strength } from '../srs'
import { getState, recordFix, useStore, type Fix as FixCard } from '../store'

const SESSION = 10
const CHECK_MS = 500
/** A move this close to the engine's best counts as a fix. */
const CLOSE_ENOUGH = 60
const cap = (cp: number) => Math.max(-1000, Math.min(1000, cp))

type Card = FixCard & { key: string }

/** Positions that are due first, then the ones you know least well. */
function deal(game?: string): Card[] {
  const all = Object.entries(getState().fixes)
    .map(([key, f]) => ({ ...f, key }))
    .filter(f => !game || f.game === game)
  const now = Date.now()
  const due = shuffle(all.filter(f => isDue(f, now)))
  const rest = shuffle(all.filter(f => !isDue(f, now))).sort((a, b) => a.box - b.box)
  return [...due, ...rest].slice(0, SESSION)
}

/**
 * The mistake drill: positions from your own games in which you went wrong.
 * You have to find a better move. The engine's choice always counts, and so
 * does any other move the engine rates as nearly as good.
 */
export function Fix({ game }: { game?: string }) {
  const [deck, setDeck] = useState(() => deal(game))
  const [i, setI] = useState(0)
  const [state, setState] = useState<'ask' | 'checking' | 'right' | 'wrong'>('ask')
  const [tried, setTried] = useState<{ san: string; from: Square; to: Square } | null>(null)
  const [first, setFirst] = useState(true) // only the first attempt at a position is scored
  const [score, setScore] = useState(0)
  const engine = useRef<Engine | null>(null)
  const [engineOk, setEngineOk] = useState(true)
  const mem = useStore().fixes
  const card = deck[i]
  const back = game ? href('review', game) : href('games')

  useEffect(() => {
    const e = new Engine()
    engine.current = e
    e.ready.catch(() => setEngineOk(false))
    return () => e.quit()
  }, [])

  if (!card) {
    return (
      <Shell back={back} backLabel={game ? 'Review' : 'My games'} title="Practise my mistakes">
        <div className="card">
          {deck.length ? (
            <>
              <div className="eyebrow good">Session finished</div>
              <div className="move">{score} of {deck.length} fixed first time</div>
              <p>Positions you missed are due again straight away. The ones you fixed come back after a longer gap each time.</p>
            </>
          ) : (
            <>
              <div className="eyebrow">Nothing to fix yet</div>
              <p>Play a full game, or analyse a saved one with the computer. Every mistake and blunder it finds turns up here as a position to practise.</p>
            </>
          )}
          <div className="actions">
            {deck.length > 0 && <button className="btn primary" onClick={() => { setDeck(deal(game)); setI(0); setScore(0); setState('ask'); setFirst(true) }}>Another round</button>}
            <a className="btn" href={back}>Back</a>
          </div>
        </div>
      </Shell>
    )
  }

  const settle = (correct: boolean) => {
    if (first) {
      recordFix(card.key, correct)
      if (correct) setScore(n => n + 1)
    }
    setFirst(false)
    setState(correct ? 'right' : 'wrong')
  }

  const play = async (from: Square, to: Square) => {
    const san = sanOf(card.fen, from, to)
    if (!san || state === 'checking' || state === 'right') return
    setTried({ san, from, to })
    if (clean(san) === clean(card.best)) return settle(true)
    if (clean(san) === clean(card.played) || !engineOk) return settle(false)
    // another move: ask the engine whether it is nearly as good as its own choice
    setState('checking')
    try {
      const after = new Chess(card.fen)
      after.move({ from, to, promotion: 'q' })
      const reply = after.isGameOver() ? null : (await engine.current!.analyse(after.fen(), 1, CHECK_MS))[0]
      const cp = reply ? -reply.cp : after.isCheckmate() ? 10000 : 0
      settle(card.bestCp - cap(cp) < CLOSE_ENOUGH)
    } catch {
      setEngineOk(false)
      settle(false)
    }
  }

  const next = () => {
    setI(i + 1)
    setState('ask')
    setTried(null)
    setFirst(true)
  }

  const best = squaresOf(card.fen, card.best)
  const highlights: Highlight[] = []
  const arrows: Arrow[] = []
  if (state === 'wrong') {
    if (best) arrows.push({ ...best, color: 'good' })
    if (tried) arrows.push({ from: tried.from, to: tried.to, color: 'bad' })
  }
  if (state === 'right' && tried) highlights.push({ sq: tried.from, kind: 'good' }, { sq: tried.to, kind: 'good' })

  return (
    <Shell back={back} backLabel={game ? 'Review' : 'My games'} title="Practise my mistakes" right={<span className="count">Position {i + 1} of {deck.length}</span>}>
      <div className="trainer">
        <Board
          key={card.key}
          fen={card.fen}
          coords
          flip={card.side === 'b'}
          dests={state === 'right' || state === 'checking' ? undefined : legalDests(card.fen)}
          onMove={play}
          highlights={highlights}
          arrows={arrows}
        />
        <div className="panel">
          <div className="card">
            <div className="eyebrow">From one of your games · {SIDE_NAME[card.side]} to play</div>
            {state === 'ask' && (
              <>
                <div className="move">Find a better move than {card.played}</div>
                <p>You played {card.played} here and it cost you. Take your time, work out what the position needs, then play your move on the board.</p>
              </>
            )}
            {state === 'checking' && <div className="move">Checking {tried?.san}…</div>}
            {state === 'right' && (
              <>
                <div className="move good">{clean(tried!.san) === clean(card.best) ? `Yes · ${tried!.san}` : `${tried!.san} works too`}</div>
                <p>
                  {clean(tried!.san) === clean(card.best)
                    ? 'That is the move the engine wanted.'
                    : `The engine's first choice was ${card.best}, but your move is nearly as good.`}
                </p>
              </>
            )}
            {state === 'wrong' && (
              <>
                <div className="move bad">{tried && clean(tried.san) === clean(card.played) ? 'That is the move from the game' : `${tried?.san} is not good enough`}</div>
                <p>The engine's move is {card.best} (green arrow). Look at what it does that your move did not, then play it on the board or go on to the next position.</p>
              </>
            )}
            <div className="actions">
              {(state === 'right' || state === 'wrong') && <button className="btn primary" onClick={next}>Next position</button>}
            </div>
            {!engineOk && <p className="note">The chess engine did not load, so only the engine's exact move is accepted.</p>}
          </div>
          <div className="card">
            <div className="eyebrow">How well you have fixed this one</div>
            <Meter value={strength(mem[card.key])} />
            <p className="note">Each time you get it right first try, the position comes back later: after 1 day, then 3, 7, 14 and 30.</p>
          </div>
          <div className="actions">
            <span className="note">{score} fixed first time so far</span>
          </div>
        </div>
      </div>
    </Shell>
  )
}
