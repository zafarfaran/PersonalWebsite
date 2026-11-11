import { useEffect, useMemo, useRef, useState } from 'react'
import { Board } from '../components/Board'
import { MoveList, Shell } from '../components/ui'
import { lastMoveOf, legalDests, replay, type Square } from '../chess'
import { sans, type Lesson, type Opening } from '../data'
import { Engine, LEVELS } from '../engine'
import { href } from '../router'
import { updateSettings, useStore } from '../store'

/** Continue a finished line as a real game against the engine. You stay White. */
export function PlayOn({ opening, lesson }: { opening: Opening; lesson: Lesson }) {
  const base = useMemo(() => sans(lesson), [lesson])
  const game = useRef(replay(base))
  const engine = useRef<Engine | null>(null)
  const turnId = useRef(0) // invalidates an engine reply that arrives after a take-back or restart
  const [, setVersion] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
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
  const over = g.isGameOver()
  const blackToMove = g.turn() === 'b'

  useEffect(() => {
    if (!blackToMove || over || error) return
    const id = ++turnId.current
    const cfg = LEVELS[level - 1]
    setThinking(true)
    const started = Date.now()
    const choose =
      Math.random() < cfg.blunder
        ? Promise.resolve(randomMove())
        : engine.current!.bestMove(fen, level)
    choose
      .then(async mv => {
        await new Promise(r => setTimeout(r, Math.max(0, 500 - (Date.now() - started))))
        if (id !== turnId.current) return
        game.current.move(mv)
      })
      .catch(err => setError(err.message))
      .finally(() => {
        if (id !== turnId.current) return
        setThinking(false)
        redraw()
      })
  }, [fen]) // eslint-disable-line react-hooks/exhaustive-deps

  function randomMove() {
    const moves = game.current.moves({ verbose: true })
    const mv = moves[Math.floor(Math.random() * moves.length)]
    return { from: mv.from as string, to: mv.to as string, promotion: mv.promotion as string | undefined }
  }

  const play = (from: Square, to: Square) => {
    try {
      g.move({ from, to, promotion: 'q' })
      redraw()
    } catch {
      // not a legal move: ignore
    }
  }
  const history = g.history()
  const canTakeBack = !thinking && !blackToMove && history.length >= base.length + 2
  const takeBack = () => {
    turnId.current++
    g.undo()
    g.undo()
    redraw()
  }
  const restart = () => {
    turnId.current++
    game.current = replay(base)
    setThinking(false)
    redraw()
  }

  const last = lastMoveOf(g)
  const status = g.isCheckmate()
    ? blackToMove ? 'Checkmate. You won.' : 'Checkmate. Black won.'
    : g.isStalemate() ? 'Stalemate. The game is a draw.'
    : g.isDraw() ? 'The game is a draw.'
    : thinking ? 'Black is thinking…'
    : g.inCheck() ? 'You are in check.'
    : 'Your move'

  return (
    <Shell back={href('o', opening.id)} backLabel={opening.name} title={`${opening.name} · ${lesson.title}`} mode="Play on" right={<span className="count">{status}</span>}>
      <div className="trainer">
        <Board
          fen={fen}
          coords
          dests={!blackToMove && !over ? legalDests(fen) : undefined}
          onMove={play}
          highlights={last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []}
        />
        <div className="panel">
          <div className="card">
            <div className="eyebrow">Coach</div>
            {over ? (
              <div className={'move ' + (g.isCheckmate() && blackToMove ? 'good' : '')}>{status}</div>
            ) : (
              <p><strong>The opening is over.</strong> From here there is no single right move, so play the position.</p>
            )}
            <p className="key"><b>Your plan:</b> {lesson.plan}</p>
            {error && <p className="bad">{error} Reload the page to try again.</p>}
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
            <p className="note">Pawns promote to a queen automatically.</p>
          </div>
          <div className="card">
            <div className="eyebrow">Game</div>
            <MoveList moves={history} upto={history.length} />
          </div>
          <div className="actions">
            <button className="btn" onClick={takeBack} disabled={!canTakeBack}>Take back</button>
            <button className="btn" onClick={restart}>Restart from the opening</button>
            <a className="btn" href={href('practise', 'o', opening.id)}>Back to drills</a>
          </div>
        </div>
      </div>
    </Shell>
  )
}
