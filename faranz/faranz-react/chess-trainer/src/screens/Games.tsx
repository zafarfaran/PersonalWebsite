import { useEffect, useMemo, useRef, useState } from 'react'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Shell } from '../components/ui'
import { fenKey, lastMoveOf, moveLabel, replay, sanOf, squaresOf } from '../chess'
import { SIDE_NAME, openingById, other } from '../data'
import { Engine } from '../engine'
import { href } from '../router'
import { isDue } from '../srs'
import { addFix, deleteGame, saveGame, useStore, type MoveNote, type SavedGame, type Verdict } from '../store'

const ANALYSE_MS = 300
const cap = (cp: number) => Math.max(-1000, Math.min(1000, cp))

export const VERDICTS: Record<Verdict, { label: string; tone: 'good' | 'accent' | 'bad' }> = {
  course: { label: 'Course move', tone: 'good' },
  best: { label: 'Best move', tone: 'good' },
  good: { label: 'Good move', tone: 'good' },
  inaccuracy: { label: 'Inaccuracy', tone: 'accent' },
  mistake: { label: 'Mistake', tone: 'bad' },
  blunder: { label: 'Blunder', tone: 'bad' },
}

/** How a move compares with the engine's choice, from the scores before and after it. */
export function verdictFor(bestCp: number, afterCp: number, playedBest: boolean): Verdict {
  const loss = cap(bestCp) - cap(afterCp)
  return playedBest ? 'best' : loss < 60 ? 'good' : loss < 120 ? 'inaccuracy' : loss < 300 ? 'mistake' : 'blunder'
}

const standing = (cp: number) =>
  Math.abs(cp) < 80 ? 'about equal'
  : cp > 0 ? (cp < 200 ? 'slightly better for you' : cp < 500 ? 'clearly better for you' : 'winning for you')
  : cp > -200 ? 'slightly worse for you' : cp > -500 ? 'clearly worse for you' : 'losing for you'

const slipsOf = (g: SavedGame) => Object.values(g.notes).filter(n => n.verdict === 'mistake' || n.verdict === 'blunder').length
const when = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ', ' + new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

/** Every full game you have played, newest first. */
export function Games() {
  const s = useStore()
  const due = Object.values(s.fixes).filter(f => isDue(f, Date.now())).length
  const total = Object.keys(s.fixes).length

  return (
    <Shell back={href()} backLabel="Home" title="My games">
      <div className="card row">
        <b className="big">{total}</b>
        <div className="grow">
          <strong>{total === 1 ? 'mistake to fix' : 'mistakes to fix'}</strong>
          <br />
          <span className="note">
            Every mistake and blunder from your full games becomes a practice position: you get the position again and have to find a better move.
            {total > 0 && ` ${due} due now.`}
          </span>
        </div>
        {total > 0 && <a className="btn primary" href={href('fix')}>Practise my mistakes</a>}
      </div>

      {s.games.length === 0 ? (
        <div className="card">
          <div className="eyebrow">No games yet</div>
          <p>Play a full game with any opening and it is saved here automatically, ready to review with the computer.</p>
          <div className="actions"><a className="btn primary" href={href()}>Choose an opening</a></div>
        </div>
      ) : (
        <div className="card">
          <div className="eyebrow">Saved games · the most recent {s.games.length}</div>
          {s.games.map(g => {
            const slips = slipsOf(g)
            return (
              <div className="reply" key={g.id}>
                <div className="t">
                  <b>{openingById(g.opening)?.name ?? 'Game'} · {Math.ceil(g.moves.length / 2)} moves</b>
                  <small>{when(g.at)} · {g.result} · {slips} {slips === 1 ? 'mistake' : 'mistakes'} found so far</small>
                </div>
                <a className="btn primary" href={href('review', g.id)}>Review</a>
                <button className="btn" onClick={() => { if (window.confirm('Delete this game and the practice positions that came from it?')) deleteGame(g.id) }}>Delete</button>
              </div>
            )
          })}
        </div>
      )}
    </Shell>
  )
}

/** Step through one of your games with the computer's verdict on each of your moves. */
export function Review({ game }: { game: SavedGame }) {
  const opening = openingById(game.opening)
  const mine = game.side === 'w' ? 0 : 1 // parity of your plies
  const them = SIDE_NAME[other(game.side)]
  const [ply, setPly] = useState(game.moves.length)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const engine = useRef<Engine | null>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    return () => {
      cancelled.current = true
      engine.current?.quit()
      engine.current = null
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPly(p => Math.min(game.moves.length, p + 1))
      if (e.key === 'ArrowLeft') setPly(p => Math.max(0, p - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [game.moves.length])

  const yourPlies = game.moves.map((_, i) => i).filter(i => i % 2 === mine)
  const unrated = yourPlies.filter(i => !game.notes[i] || (game.notes[i].verdict !== 'course' && game.notes[i].cp === undefined))
  const counts = (v: Verdict) => yourPlies.filter(i => game.notes[i]?.verdict === v).length

  /** Have the engine look at every position of the game and fill in the verdicts that are missing. */
  const analyse = async () => {
    const eng = (engine.current ??= new Engine())
    setError('')
    setProgress(0)
    try {
      // best move and score (for the side to move) in every position of the game
      const seen: ({ cp: number; from: string; to: string } | null)[] = []
      for (let i = 0; i <= game.moves.length; i++) {
        const c = replay(game.moves, i)
        seen.push(c.isGameOver() ? null : (await eng.analyse(c.fen(), 1, ANALYSE_MS))[0] ?? null)
        if (cancelled.current) return
        setProgress(i / game.moves.length)
      }
      const notes: Record<number, MoveNote> = { ...game.notes }
      for (const i of yourPlies) {
        const before = seen[i]
        if (!before) continue
        const fen = replay(game.moves, i).fen()
        const best = sanOf(fen, before.from, before.to)
        const after = seen[i + 1]
        // no score after the move means the game ended there: mate is as good as it gets, a draw is level
        const afterCp = after ? -after.cp : replay(game.moves, i + 1).isCheckmate() ? 10000 : 0
        const playedBest = best === game.moves[i]
        const course = notes[i]?.verdict === 'course'
        const verdict = course ? 'course' : verdictFor(before.cp, afterCp, playedBest)
        notes[i] = { verdict, best: playedBest ? undefined : best ?? undefined, loss: Math.max(0, cap(before.cp) - cap(afterCp)), cp: afterCp }
        if (best && (verdict === 'mistake' || verdict === 'blunder')) {
          addFix(fenKey(fen), { fen, played: game.moves[i], best, bestCp: cap(before.cp), game: game.id, side: game.side })
        }
      }
      saveGame({ ...game, notes })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The chess engine stopped.')
    } finally {
      if (!cancelled.current) setProgress(null)
    }
  }

  const position = useMemo(() => replay(game.moves, ply), [game.moves, ply])
  const fen = position.fen()
  const shown = ply - 1 // the move that led to the position on the board
  const yours = shown >= 0 && shown % 2 === mine
  const note = yours ? game.notes[shown] : undefined
  const info = note ? VERDICTS[note.verdict] : null
  const last = lastMoveOf(position)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const arrows: Arrow[] = []
  if (note?.best && info?.tone !== 'good') {
    const better = squaresOf(replay(game.moves, shown).fen(), note.best)
    if (better) arrows.push({ ...better, color: 'good' })
  }
  const fixes = Object.values(useStore().fixes).filter(f => f.game === game.id).length

  return (
    <Shell
      back={href('games')}
      backLabel="My games"
      title={opening?.name ?? 'Game'}
      mode="Review"
      right={<span className="count">{when(game.at)} · {game.result}</span>}
    >
      <div className="trainer">
        <Board fen={fen} coords flip={game.side === 'b'} highlights={highlights} arrows={arrows} />
        <div className="panel">
          <div className="card">
            {shown < 0 ? (
              <>
                <div className="eyebrow">Start of the game</div>
                <p>Step through with the buttons or the arrow keys, or click any move in the list.</p>
              </>
            ) : !yours ? (
              <>
                <div className="eyebrow">{them}</div>
                <div className="move">{moveLabel(shown)} {game.moves[shown]}</div>
              </>
            ) : (
              <>
                <div className={'eyebrow ' + (info?.tone ?? '')}>Your move{info ? ` · ${info.label}` : ''}</div>
                <div className={'move ' + (info && info.tone !== 'accent' ? info.tone : '')}>{moveLabel(shown)} {game.moves[shown]}</div>
                {!note && <p className="muted">Not looked at yet. Press “Analyse with the computer” below.</p>}
                {note?.verdict === 'course' && <p>This is the move the lessons teach here.</p>}
                {note && note.verdict !== 'course' && (
                  <p>
                    {note.best && info?.tone !== 'good'
                      ? `${note.best} was better (green arrow). Your move gave away about ${((note.loss ?? 0) / 100).toFixed(1)} pawns' worth.`
                      : note.best
                      ? `Fine. The engine slightly prefers ${note.best}.`
                      : 'The engine would have played the same move.'}
                    {note.cp !== undefined && ` After it the position is ${standing(note.cp)}.`}
                  </p>
                )}
                {opening && (
                  <div className="actions">
                    <a className={'btn' + (info?.tone === 'bad' ? ' primary' : '')} href={href('replay', game.id, String(shown))}>
                      Play on from before this move
                    </a>
                  </div>
                )}
              </>
            )}
            <div className="actions">
              <button className="btn" onClick={() => setPly(0)} disabled={ply === 0}>⏮</button>
              <button className="btn" onClick={() => setPly(ply - 1)} disabled={ply === 0}>◀ Back</button>
              <button className="btn primary grow" onClick={() => setPly(ply + 1)} disabled={ply >= game.moves.length}>Next ▶</button>
              <button className="btn" onClick={() => setPly(game.moves.length)} disabled={ply >= game.moves.length}>⏭</button>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Your moves</div>
            <p>
              {counts('course')} from the course, {counts('best') + counts('good')} good, {counts('inaccuracy')} {counts('inaccuracy') === 1 ? 'inaccuracy' : 'inaccuracies'},{' '}
              {counts('mistake')} {counts('mistake') === 1 ? 'mistake' : 'mistakes'}, {counts('blunder')} {counts('blunder') === 1 ? 'blunder' : 'blunders'}
              {unrated.length > 0 && `, ${unrated.length} not checked yet`}.
            </p>
            {progress !== null ? (
              <>
                <div className="meter" role="progressbar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>
                <p className="note">The computer is going through the game…</p>
              </>
            ) : (
              <div className="actions">
                <button className={'btn' + (unrated.length ? ' primary' : '')} onClick={analyse}>
                  {unrated.length ? 'Analyse with the computer' : 'Analyse again'}
                </button>
                {fixes > 0 && <a className="btn" href={href('fix', game.id)}>Practise the {fixes} {fixes === 1 ? 'mistake' : 'mistakes'} from this game</a>}
              </div>
            )}
            {error && <p className="bad">{error}</p>}
          </div>

          <div className="card">
            <div className="eyebrow">Game</div>
            <div className="moves review">
              {game.moves.map((san, i) => {
                const tone = i % 2 === mine && game.notes[i] ? VERDICTS[game.notes[i].verdict].tone : ''
                const flagged = tone === 'bad' || tone === 'accent'
                return (
                  <span key={i} className="mv">
                    {i % 2 === 0 && <span className="num">{i / 2 + 1}.</span>}
                    <button className={(i === shown ? 'cur ' : '') + (flagged ? tone : '')} onClick={() => setPly(i + 1)}>{san}</button>
                  </span>
                )
              })}
            </div>
            <p className="note">Red: mistake or blunder. Amber: inaccuracy.</p>
          </div>
        </div>
      </div>
    </Shell>
  )
}
