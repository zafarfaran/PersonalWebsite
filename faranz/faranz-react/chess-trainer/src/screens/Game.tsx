import { useEffect, useMemo, useRef, useState } from 'react'
import { bookFor, bookReply } from '../book'
import { Board, type Arrow } from '../components/Board'
import { MoveList, Shell } from '../components/ui'
import { clean, fenKey, lastMoveOf, legalDests, replay, sanOf, type Square } from '../chess'
import { drillLines, sans, type Lesson, type Opening } from '../data'
import { Engine, LEVELS, chooseMove, type Line } from '../engine'
import { href } from '../router'
import { updateSettings, useStore } from '../store'

interface Feedback {
  tone: 'good' | 'accent' | 'bad'
  title: string
  text: string
}
interface Pending {
  san: string
  from: Square
  to: Square
  fenBefore: string
  fenAfter: string
  /** Text to put in front of the verdict, e.g. a reminder of the course move. */
  lead: string
  pre: Promise<{ fen: string; line: Line } | null>
}
type Slip = 'inaccuracy' | 'mistake' | 'blunder'

const PRE_MS = 500
const REPLY_MS = 600
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const cap = (cp: number) => Math.max(-1000, Math.min(1000, cp))

const standing = (cp: number) =>
  Math.abs(cp) < 80 ? 'about equal'
  : cp > 0 ? (cp < 200 ? 'slightly better for you' : cp < 500 ? 'clearly better for you' : 'winning for you')
  : cp > -200 ? 'slightly worse for you' : cp > -500 ? 'clearly worse for you' : 'losing'

/**
 * A full game as White. From move one, Black answers from a book of common
 * replies and then a human-like engine opponent takes over until the game
 * ends. With `lesson`, the game starts from the end of that line instead.
 * Every move of yours outside the course lines is rated by the engine.
 */
export function Game({ opening, lesson }: { opening: Opening; lesson?: Lesson }) {
  const base = useMemo(() => (lesson ? sans(lesson) : []), [lesson])
  const book = useMemo(() => bookFor(opening), [opening])
  const game = useRef(replay(base))
  const engine = useRef<Engine | null>(null)
  const turnId = useRef(0) // invalidates engine work that finishes after a take-back or a new game
  const pre = useRef<Pending['pre']>(Promise.resolve(null))
  const pending = useRef<Pending | null>(null)
  const [, setVersion] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [best, setBest] = useState<{ fen: string; line: Line } | null>(null)
  const [hint, setHint] = useState(false)
  const [evalCp, setEvalCp] = useState<number | null>(null)
  const [slips, setSlips] = useState<Record<Slip, number>>({ inaccuracy: 0, mistake: 0, blunder: 0 })
  const [resigned, setResigned] = useState(false)
  const level = useStore().settings.level
  const redraw = () => setVersion(v => v + 1)

  useEffect(() => {
    const e = new Engine()
    engine.current = e
    e.ready.catch(err => setError(err.message))
    return () => e.quit()
  }, [])

  const g = game.current
  const fen = g.fen()
  const over = g.isGameOver() || resigned
  const blackToMove = g.turn() === 'b'

  useEffect(() => {
    if (over || error) return
    const id = ++turnId.current
    const eng = engine.current!

    if (!blackToMove) {
      // work out the best move while you think: it powers the hint and the rating of your move
      pre.current = eng.analyse(fen, 1, PRE_MS).then(
        lines => (lines[0] ? { fen, line: lines[0] } : null),
        () => null,
      )
      pre.current.then(found => {
        if (id === turnId.current) setBest(found)
      })
      return
    }

    const mine = pending.current?.fenAfter === fen ? pending.current : null
    const started = Date.now()
    setThinking(true)
    ;(async () => {
      const bookSan = bookReply(opening, fen)
      let reply: string | { from: string; to: string; promotion?: string } | null = bookSan
      if (mine || !bookSan) {
        const cfg = LEVELS[level - 1]
        const lines = await eng.analyse(fen, cfg.spread, REPLY_MS)
        if (id !== turnId.current) return
        if (!lines.length) throw new Error('The chess engine did not return a move.')
        const whiteCp = -lines[0].cp
        setEvalCp(whiteCp)
        if (mine) {
          const before = await mine.pre
          if (id !== turnId.current) return
          if (before?.fen === mine.fenBefore) rate(mine, before.line, whiteCp, sanOf(fen, lines[0].from, lines[0].to))
          else setFeedback({ tone: 'accent', title: mine.san, text: mine.lead + 'You moved before the engine finished looking, so this move was not rated.' })
        }
        if (!reply) {
          const legal = game.current.moves({ verbose: true })
          reply = Math.random() < cfg.blunder ? legal[Math.floor(Math.random() * legal.length)].san : chooseMove(lines, level)
        }
      }
      await new Promise(r => setTimeout(r, Math.max(0, 550 - (Date.now() - started))))
      if (id !== turnId.current) return
      game.current.move(reply!)
    })()
      .catch(err => setError(err.message))
      .finally(() => {
        if (id !== turnId.current) return
        setThinking(false)
        redraw()
      })
  }, [fen, over]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Compare your move with the engine's choice and say how much it cost. */
  function rate(mine: Pending, bestLine: Line, whiteCp: number, refutation: string | null) {
    const loss = cap(bestLine.cp) - cap(whiteCp)
    const bestSan = sanOf(mine.fenBefore, bestLine.from, bestLine.to)
    const pawns = (loss / 100).toFixed(1)
    const reply = refutation ? ` Black's strongest reply is ${refutation}.` : ''
    let fb: Feedback
    if (mine.from === bestLine.from && mine.to === bestLine.to) {
      fb = { tone: 'good', title: `Best move · ${mine.san}`, text: 'That is the engine\'s first choice too.' }
    } else if (loss < 60) {
      fb = { tone: 'good', title: `Good move · ${mine.san}`, text: loss >= 25 && bestSan ? `Solid. The engine slightly prefers ${bestSan}.` : 'Solid. Nothing was given away.' }
    } else {
      const kind: Slip = loss < 120 ? 'inaccuracy' : loss < 300 ? 'mistake' : 'blunder'
      setSlips(s => ({ ...s, [kind]: s[kind] + 1 }))
      fb = {
        inaccuracy: { tone: 'accent' as const, title: `Inaccuracy · ${mine.san}`, text: `Playable, but ${bestSan} was stronger.` },
        mistake: { tone: 'bad' as const, title: `Mistake · ${mine.san}`, text: `That gives away about ${pawns} pawns' worth. ${bestSan} was better.${reply}` },
        blunder: { tone: 'bad' as const, title: `Blunder · ${mine.san}`, text: `${loss >= 500 ? 'That throws away a great deal' : `That loses about ${pawns} pawns' worth`}. ${bestSan} was much better.${reply}` },
      }[kind]
    }
    setFeedback({ ...fb, text: mine.lead + fb.text })
  }

  const play = (from: Square, to: Square) => {
    const course = book.repertoire.get(fenKey(fen))
    let san: string
    try {
      san = g.move({ from, to, promotion: 'q' }).san
    } catch {
      return // not a legal move
    }
    setHint(false)
    if (course && clean(san) === clean(course.step.san)) {
      // a move straight from the lessons needs no engine check
      setFeedback({ tone: 'good', title: `Course move · ${san}`, text: course.step.note ?? '' })
    } else {
      pending.current = {
        san,
        from,
        to,
        fenBefore: fen,
        fenAfter: g.fen(),
        pre: pre.current,
        lead: course ? `The course move here is ${course.step.san} (${course.lesson.title}). ` : '',
      }
      setFeedback({ tone: 'accent', title: `Checking ${san}…`, text: pending.current.lead })
    }
    redraw()
  }

  const history = g.history()
  const canTakeBack = !thinking && !blackToMove && history.length >= base.length + 2
  const takeBack = () => {
    turnId.current++
    g.undo()
    g.undo()
    pending.current = null
    setFeedback(null)
    setHint(false)
    setResigned(false)
    redraw()
  }
  const newGame = () => {
    turnId.current++
    game.current = replay(base)
    pending.current = null
    setThinking(false)
    setFeedback(null)
    setBest(null)
    setHint(false)
    setEvalCp(null)
    setSlips({ inaccuracy: 0, mistake: 0, blunder: 0 })
    setResigned(false)
    redraw()
  }

  // which taught line this game most resembles, for the plan reminder
  const closest = useMemo(() => {
    let found: { lesson: Lesson; shared: number } | null = null
    for (const l of drillLines(opening)) {
      const line = sans(l)
      let shared = 0
      while (shared < line.length && shared < history.length && clean(line[shared]) === clean(history[shared])) shared++
      if (!found || shared > found.shared) found = { lesson: l, shared }
    }
    return found && found.shared >= 3 ? found.lesson : null
  }, [opening, history.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const last = lastMoveOf(g)
  const bestHere = best?.fen === fen ? best.line : null
  const arrows: Arrow[] = hint && bestHere ? [{ from: bestHere.from, to: bestHere.to, color: 'accent' }] : []
  const result = resigned ? 'You resigned.'
    : g.isCheckmate() ? (blackToMove ? 'Checkmate. You won.' : 'Checkmate. Black won.')
    : g.isStalemate() ? 'Stalemate. The game is a draw.'
    : g.isDraw() ? 'The game is a draw.'
    : ''
  const status = result || (thinking ? 'Black is thinking…' : g.inCheck() ? 'You are in check.' : 'Your move')
  const won = g.isCheckmate() && blackToMove
  const tally = [count(slips.inaccuracy, 'inaccuracy', 'inaccuracies'), count(slips.mistake, 'mistake', 'mistakes'), count(slips.blunder, 'blunder', 'blunders')].join(', ')

  return (
    <Shell
      back={href('o', opening.id)}
      backLabel={opening.name}
      title={lesson ? `${opening.name} · ${lesson.title}` : opening.name}
      mode={lesson ? 'Play on' : 'Full game'}
      right={<span className="count">{status}</span>}
    >
      <div className="trainer">
        <Board
          fen={fen}
          coords
          dests={!blackToMove && !over ? legalDests(fen) : undefined}
          onMove={play}
          highlights={last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []}
          arrows={arrows}
        />
        <div className="panel">
          <div className="card">
            {over ? (
              <>
                <div className={'eyebrow ' + (won ? 'good' : '')}>Game over</div>
                <div className={'move ' + (won ? 'good' : '')}>{result}</div>
                <p>
                  Your slips this game: {tally}.
                </p>
                <div className="actions">
                  <button className="btn primary" onClick={newGame}>New game</button>
                  <a className="btn" href={href('o', opening.id)}>Back to {opening.name}</a>
                </div>
              </>
            ) : feedback ? (
              <>
                <div className={'eyebrow ' + feedback.tone}>Coach</div>
                <div className={'move ' + (feedback.tone === 'accent' ? '' : feedback.tone)}>{feedback.title}</div>
                <p>{feedback.text}</p>
              </>
            ) : (
              <>
                <div className="eyebrow">Coach</div>
                <p>
                  {lesson
                    ? 'The opening is over. From here there is no single right move, so play the position. I will rate each move you make.'
                    : `Play a whole game with the ${opening.name}. Black answers the way real opponents commonly do, so each game goes a different way. I will rate each move once you leave the course lines.`}
                </p>
              </>
            )}
            {!over && (closest?.plan || !closest) && (
              <p className="key">
                {closest?.plan ? (
                  <>
                    <b>Black's setup:</b> {closest.reply}. <b>Your plan:</b> {closest.plan}
                  </>
                ) : (
                  <>
                    <b>Aim for:</b> {opening.setupNote}
                  </>
                )}
              </p>
            )}
            {hint && bestHere && <p className="accent">Hint: the engine would play {sanOf(fen, bestHere.from, bestHere.to)}.</p>}
            {error && <p className="bad">{error} Reload the page to try again.</p>}
          </div>

          <div className="card">
            <div className="eyebrow">Position after your last move</div>
            <p>{evalCp === null ? 'Not rated yet: the opening so far is all from the book.' : `The engine rates it ${standing(evalCp)}.`}</p>
            <p className="note">
              Slips so far: {tally}
            </p>
          </div>

          <div className="card">
            <div className="eyebrow">Opponent strength · {LEVELS[level - 1].name}</div>
            <input
              type="range"
              min={1}
              max={LEVELS.length}
              value={level}
              onChange={e => updateSettings({ level: +e.target.value })}
              aria-label="Opponent strength"
            />
            <div className="scale"><span>Beginner</span><span>Club player</span><span>Full strength</span></div>
            <p className="note">Weaker opponents pick plausible second-best moves and sometimes blunder, like a person. Pawns promote to a queen automatically.</p>
          </div>

          <div className="card">
            <div className="eyebrow">Game</div>
            <MoveList moves={history} upto={history.length} />
          </div>

          <div className="actions">
            <button className="btn" onClick={() => setHint(true)} disabled={over || blackToMove || !bestHere || hint}>Hint</button>
            <button className="btn" onClick={takeBack} disabled={!canTakeBack}>Take back</button>
            <button className="btn" onClick={newGame}>New game</button>
            {!over && <button className="btn" onClick={() => setResigned(true)}>Resign</button>}
          </div>
        </div>
      </div>
    </Shell>
  )
}
