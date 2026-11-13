import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Meter, MoveList, Shell } from '../components/ui'
import { lastMoveOf, legalDests, turnOf, type Square } from '../chess'
import { SIDE_NAME, other } from '../data'
import { ENDGAMES, ENDGAME_DRILLS, ENDGAME_GROUPS, type EndgameDemo, type EndgameDrill as Drill, type EndgameTopic as Topic, type Goal } from '../data/endgames'
import { HOLD, mateIn, reached, slipped } from '../endgame'
import { Engine } from '../engine'
import { href } from '../router'
import { recordEndgame, useStore } from '../store'

const THINK_MS = 400
const GOAL: Record<Goal, string> = { mate: 'Checkmate', win: 'Win', draw: 'Draw' }

const Status = ({ level }: { level?: number }) =>
  level === 2 ? <span className="pill set">Solved cleanly</span> : level === 1 ? <span className="pill see">Solved</span> : <span className="pill">Not solved yet</span>

/** Every endgame lesson, with how many of its training positions you have solved. */
export function Endgames() {
  const solved = useStore().endgames
  const done = ENDGAME_DRILLS.filter(d => solved[d.drill.id]).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Endgames"
      right={
        <>
          <Meter value={done / ENDGAME_DRILLS.length} />
          <span className="count">{done} of {ENDGAME_DRILLS.length} positions solved</span>
        </>
      }
    >
      <p className="muted">
        Each lesson is a page of theory with an example to step through, followed by positions you play out against the computer at full strength.
        A move that throws away the win or the draw is taken back and you are told why, so you can try again. Start at the top: the later lessons use the earlier ones.
      </p>
      {ENDGAME_GROUPS.map(group => (
        <section key={group}>
          <h2 className="sidehead">{group}</h2>
          <div className="card">
            {ENDGAMES.filter(t => t.group === group).map(t => {
              const n = t.drills.filter(d => solved[d.id]).length
              return (
                <a className="topic" key={t.id} href={href('endgame', t.id)}>
                  {t.drills.length > 0 && <span className={'pill' + (n === t.drills.length ? ' set' : '')}>{n} of {t.drills.length} solved</span>}
                  <b>{t.title}</b>
                  <small>{t.summary}</small>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </Shell>
  )
}

/** An example line to step through, with a note on the moves that matter. */
function Demo({ demo }: { demo: EndgameDemo }) {
  const [ply, setPly] = useState(0)
  const sans = demo.moves.map(m => m.san)
  const position = useMemo(() => {
    const c = new Chess(demo.fen)
    for (let i = 0; i < ply; i++) c.move(sans[i])
    return c
  }, [demo, ply]) // eslint-disable-line react-hooks/exhaustive-deps
  const last = lastMoveOf(position)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  // the last note at or before this move, so that a reply without a note keeps the explanation on screen
  const note = ply === 0 ? demo.intro : [...demo.moves.slice(0, ply)].reverse().find(m => m.note)?.note ?? demo.intro
  const blackFirst = turnOf(demo.fen) === 'b'

  return (
    <div className="panel">
      <Board fen={position.fen()} coords flip={demo.flip} highlights={highlights} />
      <div className="card">
        <div className="eyebrow">Example{ply > 0 && ` · move ${ply} of ${sans.length}`}</div>
        {ply > 0 && <div className="move">{sans[ply - 1]}</div>}
        <p>{note}</p>
        <div className="actions">
          <button className="btn" onClick={() => setPly(0)} disabled={ply === 0}>⏮</button>
          <button className="btn" onClick={() => setPly(ply - 1)} disabled={ply === 0}>◀ Back</button>
          <button className="btn primary grow" onClick={() => setPly(ply + 1)} disabled={ply >= sans.length}>Next ▶</button>
        </div>
        {/* a line that starts with Black is shown with a leading "…" so the move numbers stay right */}
        <MoveList moves={blackFirst ? ['…', ...sans] : sans} upto={blackFirst ? ply + 1 : ply} />
      </div>
    </div>
  )
}

/** One lesson: the theory, the rules to remember, an example and the training positions. */
export function EndgameTopic({ topic }: { topic: Topic }) {
  const solved = useStore().endgames
  const at = ENDGAMES.indexOf(topic)
  const next = ENDGAMES[at + 1]

  return (
    <Shell back={href('endgames')} backLabel="Endgames" title={topic.title} mode={topic.group}>
      <div className="theory">
        <div className="panel text">
          <div className="card">
            <div className="eyebrow">The idea</div>
            {topic.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="card">
            <div className="eyebrow">Remember</div>
            <ul className="rules">{topic.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          <div className="card">
            <div className="eyebrow">{topic.drills.length ? 'Now play it out' : 'Nothing to play here'}</div>
            {topic.drills.length === 0 && <p>This lesson is rules to keep in mind. They come up in every ending you play.</p>}
            {topic.drills.map(d => (
              <div className="reply" key={d.id}>
                <div className="t">
                  <b>{d.title}</b>
                  <small>{GOAL[d.goal]} as {SIDE_NAME[turnOf(d.fen)]} · <Status level={solved[d.id]} /></small>
                </div>
                <a className={'btn' + (solved[d.id] ? '' : ' primary')} href={href('endgame', topic.id, d.id)}>{solved[d.id] ? 'Again' : 'Play'}</a>
              </div>
            ))}
            {next && <div className="actions"><a className="btn" href={href('endgame', next.id)}>Next lesson: {next.title}</a></div>}
          </div>
        </div>
        {topic.demo && <Demo demo={topic.demo} />}
      </div>
    </Shell>
  )
}

type Note = { tone: 'good' | 'bad' | 'accent'; title: string; text: string }

const drawnBy = (c: Chess) =>
  c.isStalemate() ? 'stalemate' : c.isInsufficientMaterial() ? 'a draw: there is not enough left to mate with' : c.isThreefoldRepetition() ? 'a draw by repetition' : 'a draw'

/**
 * A training position played out against the engine at full strength. The
 * engine looks at the position after each of your moves: a move that gives
 * away the win (or the draw) is taken back, and otherwise it plays its reply.
 */
export function EndgameDrill({ topic, drill }: { topic: Topic; drill: Drill }) {
  const you = turnOf(drill.fen)
  const them = SIDE_NAME[other(you)]
  const game = useRef(new Chess(drill.fen))
  const [, redraw] = useReducer((n: number) => n + 1, 0)
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'play' | 'solved' | 'failed'>('play')
  const [note, setNote] = useState<Note | null>(null)
  const [hint, setHint] = useState<{ from: Square; to: Square } | null>(null)
  const [error, setError] = useState('')
  const slips = useRef(0)
  const hinted = useRef(false)
  const engine = useRef<Engine | null>(null)
  const level = useStore().endgames[drill.id]

  useEffect(() => {
    const e = new Engine()
    engine.current = e
    e.ready.catch(err => engine.current === e && setError(err.message))
    return () => {
      e.quit()
      if (engine.current === e) engine.current = null
    }
  }, [])

  const g = game.current
  const fen = g.fen()
  const at = ENDGAME_DRILLS.findIndex(d => d.drill.id === drill.id)
  const next = ENDGAME_DRILLS[at + 1]

  const finish = (solved: boolean, title: string, text: string) => {
    if (solved) recordEndgame(drill.id, slips.current === 0 && !hinted.current)
    setState(solved ? 'solved' : 'failed')
    setNote({ tone: solved ? 'good' : 'bad', title, text })
  }

  /** Take the move back and say what it gave away. */
  const slip = (title: string, text: string) => {
    g.undo()
    slips.current++
    setNote({ tone: 'bad', title, text: text + ' The move has been taken back: try something else.' })
  }

  const restart = () => {
    game.current = new Chess(drill.fen)
    slips.current = 0
    hinted.current = false
    setState('play')
    setNote(null)
    setHint(null)
    redraw()
  }

  const play = async (from: Square, to: Square) => {
    if (busy || state !== 'play' || !engine.current) return
    let san: string
    try {
      san = g.move({ from, to, promotion: 'q' }).san
    } catch {
      return // not a legal move
    }
    setHint(null)
    if (g.isCheckmate()) return finish(true, `${san} · checkmate`, slips.current ? 'Mate. Play it again some time and see whether you can do it without a slip.' : 'Mate, without a single slip.')
    if (g.isGameOver()) {
      if (drill.goal === 'draw') return finish(true, `${san} · drawn`, `The game is ${drawnBy(g)}. Half a point saved.`)
      const why = drawnBy(g)
      return slip(`${san} is ${why}`, 'The win is gone in one move.')
    }
    setBusy(true)
    try {
      const [line] = await engine.current.analyse(g.fen(), 1, THINK_MS)
      if (game.current !== g || !engine.current) return
      const score = -line.cp
      if (slipped(drill.goal, score)) {
        const reply = new Chess(g.fen()).move({ from: line.from, to: line.to, promotion: line.promotion ?? 'q' }).san
        return slip(
          drill.goal === 'draw' ? `${san} loses` : score < -200 ? `${san} loses` : `${san} throws the win away`,
          drill.goal === 'draw'
            ? `After ${reply} ${them} wins by force.`
            : score < -200
            ? `After ${reply} you are the one who is losing.`
            : `After ${reply} it is only a draw with best play.`,
        )
      }
      if (reached(drill.goal, drill.fen, g.fen(), score)) {
        return finish(true, `${san} · that is the win`, 'What is left is a basic checkmate, which you know how to finish.')
      }
      const reply = g.move({ from: line.from, to: line.to, promotion: line.promotion ?? 'q' }).san
      const yours = Math.ceil(g.history().length / 2)
      if (g.isCheckmate()) return finish(false, `${reply} is checkmate`, 'Start again and look for where it went wrong.')
      if (g.isGameOver()) {
        return drill.goal === 'draw'
          ? finish(true, `${reply} · drawn`, `The game is ${drawnBy(g)}. Half a point saved.`)
          : finish(false, `${reply} · drawn`, `The game is ${drawnBy(g)}. Start again: there was a way to make progress.`)
      }
      if (drill.goal === 'draw' && yours >= HOLD) {
        return finish(true, 'Held', `${HOLD} moves and ${them} has made no progress. The position is still a draw.`)
      }
      const mate = mateIn(score)
      setNote({
        tone: 'good',
        title: `${san} · ${them} replied ${reply}`,
        text:
          drill.goal === 'draw'
            ? `Still a draw. Hold on for ${HOLD - yours} more ${HOLD - yours === 1 ? 'move' : 'moves'}, or until the game is drawn.`
            : mate
            ? `Still winning: with best play it is mate in ${mate}.`
            : 'Still winning.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The chess engine stopped.')
    } finally {
      setBusy(false)
      redraw()
    }
  }

  const showHint = async () => {
    if (busy || !engine.current) return
    setBusy(true)
    try {
      const [line] = await engine.current.analyse(fen, 1, THINK_MS)
      if (game.current !== g) return
      hinted.current = true
      setHint({ from: line.from, to: line.to })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The chess engine stopped.')
    } finally {
      setBusy(false)
    }
  }

  const last = lastMoveOf(g)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const arrows: Arrow[] = hint ? [{ ...hint, color: 'accent' }] : []
  const history = g.history()
  const blackFirst = you === 'b'

  return (
    <Shell
      back={href('endgame', topic.id)}
      backLabel={topic.title}
      title={drill.title}
      mode={`${GOAL[drill.goal]} as ${SIDE_NAME[you]}`}
      right={<span className="count">Position {at + 1} of {ENDGAME_DRILLS.length}</span>}
    >
      <div className="trainer">
        <Board
          fen={fen}
          coords
          flip={you === 'b'}
          dests={state === 'play' && !busy ? legalDests(fen) : undefined}
          onMove={play}
          highlights={highlights}
          arrows={arrows}
        />
        <div className="panel">
          <div className="card">
            <div className={'eyebrow ' + (note?.tone ?? '')}>
              {state === 'solved' ? 'Solved' : state === 'failed' ? 'Not this time' : busy ? `${them} is thinking…` : `Your move · you are ${SIDE_NAME[you]}`}
            </div>
            {note ? (
              <>
                <div className={'move ' + (note.tone === 'accent' ? '' : note.tone)}>{note.title}</div>
                <p>{note.text}</p>
              </>
            ) : (
              <>
                <div className="move">{drill.goal === 'mate' ? 'Checkmate the king' : drill.goal === 'win' ? 'Win this position' : 'Hold the draw'}</div>
                <p>{drill.task}</p>
              </>
            )}
            {hint && state === 'play' && <p className="accent">The arrow shows the computer's move. Work out why before you play it.</p>}
            <div className="actions">
              {state === 'play' ? (
                <>
                  <button className="btn" onClick={showHint} disabled={busy || !!hint}>Hint</button>
                  <button className="btn" onClick={restart} disabled={busy || history.length === 0}>Start again</button>
                </>
              ) : (
                <>
                  {state === 'solved' && next && <a className="btn primary" href={href('endgame', next.topic.id, next.drill.id)}>Next position</a>}
                  <button className={'btn' + (state === 'failed' ? ' primary' : '')} onClick={restart}>Play it again</button>
                  <a className="btn" href={href('endgame', topic.id)}>Back to the lesson</a>
                </>
              )}
            </div>
            {error && <p className="bad">{error}</p>}
          </div>

          <div className="card">
            <div className="eyebrow">The task</div>
            <p>{drill.task}</p>
            <ul className="rules">{topic.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>

          <div className="card">
            <div className="eyebrow">Moves · <Status level={level} /></div>
            <MoveList moves={blackFirst ? ['…', ...history] : history} upto={blackFirst ? history.length + 1 : history.length} />
            {slips.current > 0 && <p className="note">{slips.current} {slips.current === 1 ? 'move' : 'moves'} taken back so far.</p>}
          </div>
        </div>
      </div>
    </Shell>
  )
}
