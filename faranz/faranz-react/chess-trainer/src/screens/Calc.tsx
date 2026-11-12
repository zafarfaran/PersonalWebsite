import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Shell } from '../components/ui'
import { COMBOS, followRound, pieceName, type Combo } from '../calc'
import { clean, lastMoveOf, legalDests, moveLabel, sanOf, squaresOf, turnOf, type Square } from '../chess'
import { SIDE_NAME } from '../data'
import { href } from '../router'
import { recordCalc, useStore } from '../store'

const DEPTHS = [2, 4, 6, 8]

/** Exercises for seeing a few moves ahead without moving the pieces. */
export function Calc() {
  const [tab, setTab] = useState<'follow' | 'combo'>('follow')
  return (
    <Shell back={href()} backLabel="Home" title="Calculation trainer">
      <div className="seg tabs">
        <button className={tab === 'follow' ? 'on' : ''} onClick={() => setTab('follow')}>Follow the moves in your head</button>
        <button className={tab === 'combo' ? 'on' : ''} onClick={() => setTab('combo')}>Combinations: work it out, then play it</button>
      </div>
      {tab === 'follow' ? <Follow /> : <Combos />}
    </Shell>
  )
}

function Follow() {
  const best = useStore().calc
  const [plies, setPlies] = useState(2)
  const [round, setRound] = useState(() => followRound(2))
  const [picked, setPicked] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const q = round.question
  const answered = picked !== null
  const right = picked === q.answer

  const next = (depth = plies) => {
    setRound(followRound(depth))
    setPicked(null)
  }
  const answer = (option: string) => {
    if (answered) return
    setPicked(option)
    const now = option === q.answer ? streak + 1 : 0
    setStreak(now)
    if (now) recordCalc(`follow:${plies}`, now)
  }
  const changeDepth = (depth: number) => {
    setPlies(depth)
    setStreak(0)
    next(depth)
  }

  const label = (option: string) => (q.kind === 'square' ? pieceName(option) : option)
  const highlights: Highlight[] = answered && q.kind === 'square' ? [{ sq: q.sq, kind: right ? 'good' : 'bad' }] : []
  const arrows: Arrow[] = []
  if (answered && q.kind === 'legal') {
    const mv = squaresOf(round.finalFen, q.answer)
    if (mv) arrows.push({ ...mv, color: 'good' })
  }

  return (
    <div className="trainer">
      <Board fen={answered ? round.finalFen : round.startFen} coords flip={round.side === 'b'} highlights={highlights} arrows={arrows} />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">How far ahead</div>
          <div className="seg">
            {DEPTHS.map(d => (
              <button key={d} className={plies === d ? 'on' : ''} onClick={() => changeDepth(d)}>
                {d / 2} {d === 2 ? 'move' : 'moves'} each
              </button>
            ))}
          </div>
          <p className="note">Streak: {streak}. Best at this depth: {best[`follow:${plies}`] ?? 0}.</p>
        </div>

        <div className="card">
          <div className="eyebrow">{answered ? 'The position after the moves' : 'From this position, picture these moves'}</div>
          <div className="moves big">
            {round.moves.map((san, i) => (
              <span key={i} className="mv">
                {(i === 0 || (round.startPly + i) % 2 === 0) && <span className="num">{moveLabel(round.startPly + i)}</span>}
                <b>{san}</b>
              </span>
            ))}
          </div>
          {!answered && <p className="note">The board does not move. Play the moves through in your head, then answer.</p>}
        </div>

        <div className="card">
          <div className="move">
            {q.kind === 'square' ? `What stands on ${q.sq} after these moves?` : `Which of these moves can ${SIDE_NAME[q.side]} play in the position you reach?`}
          </div>
          <div className="keys">
            {q.options.map(option => (
              <button
                key={option}
                className={'btn' + (answered && option === q.answer ? ' primary' : '')}
                onClick={() => answer(option)}
                disabled={answered && option !== q.answer && option !== picked}
              >
                {label(option)}
              </button>
            ))}
          </div>
          {answered && (
            <>
              <p className={right ? 'good' : 'bad'}>
                {right ? 'Correct.' : `Not quite: you chose ${label(picked!)}. The answer is ${label(q.answer)}.`}{' '}
                {q.kind === 'legal' && 'The other moves were possible earlier, but not in the final position.'}
              </p>
              <div className="actions"><button className="btn primary" onClick={() => next()}>Next position</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Combos() {
  const solved = useStore().calc
  const firstOpen = COMBOS.find(c => !solved[`combo:${c.id}`]) ?? COMBOS[0]
  const [combo, setCombo] = useState<Combo>(firstOpen)
  const [run, setRun] = useState(0)
  const done = COMBOS.filter(c => solved[`combo:${c.id}`]).length

  return (
    <>
      <Solve
        key={combo.id + run}
        combo={combo}
        onRetry={() => setRun(r => r + 1)}
        onNext={() => {
          const i = COMBOS.indexOf(combo)
          setCombo(COMBOS[(i + 1) % COMBOS.length])
          setRun(r => r + 1)
        }}
      />
      <div className="below">
        <div className="card">
          <div className="eyebrow">Combinations · {done} of {COMBOS.length} solved</div>
          {COMBOS.map((c, i) => (
            <div className="reply" key={c.id}>
              <div className="t">
                <b>{i + 1}. {SIDE_NAME[c.side]} to play, {Math.ceil(c.moves.length / 2)} moves</b>
                <small>{solved[`combo:${c.id}`] ? `From: ${c.title}` : 'Not solved yet'}</small>
              </div>
              {solved[`combo:${c.id}`] ? <span className="pill">Solved</span> : null}
              <button className="btn" onClick={() => { setCombo(c); setRun(r => r + 1) }}>{c === combo ? 'Restart' : 'Try'}</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/** One attempt at a combination. A single wrong move ends it, so the line has to be worked out first. */
function Solve({ combo, onRetry, onNext }: { combo: Combo; onRetry: () => void; onNext: () => void }) {
  const [ply, setPly] = useState(0)
  const [failed, setFailed] = useState<{ san: string; from: Square; to: Square } | null>(null)
  const game = useMemo(() => {
    const c = new Chess(combo.fen)
    for (const san of combo.moves.slice(0, ply)) c.move(san)
    return c
  }, [combo, ply])
  const fen = game.fen()
  const solvedNow = !failed && ply >= combo.moves.length
  const yourMove = !failed && !solvedNow && ply % 2 === 0
  const total = Math.ceil(combo.moves.length / 2)

  // the reply to your move, or the rest of the solution after a miss, plays itself
  useEffect(() => {
    if (ply >= combo.moves.length || (!failed && ply % 2 === 0)) return
    const t = setTimeout(() => setPly(p => p + 1), failed ? 900 : 600)
    return () => clearTimeout(t)
  }, [ply, failed, combo])

  useEffect(() => {
    if (solvedNow) recordCalc(`combo:${combo.id}`, 1)
  }, [solvedNow, combo.id])

  const play = (from: Square, to: Square) => {
    const san = sanOf(fen, from, to)
    if (!san || !yourMove) return
    if (clean(san) === clean(combo.moves[ply])) setPly(ply + 1)
    else setFailed({ san, from, to })
  }

  const last = lastMoveOf(game)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const showing = failed && ply < combo.moves.length

  return (
    <div className="trainer">
      <Board fen={fen} coords flip={combo.side === 'b'} dests={yourMove ? legalDests(fen) : undefined} onMove={play} highlights={highlights} />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">{SIDE_NAME[combo.side]} to play · {total} moves</div>
          {solvedNow ? (
            <>
              <div className="move good">Solved</div>
              <p>You found the whole line without a slip. It comes from the lesson “{combo.title}”.</p>
            </>
          ) : failed ? (
            <>
              <div className="move bad">{failed.san} is not it</div>
              <p>{showing ? 'Watch the solution play out, then try again from the start.' : 'That was the solution. Try again from the start and play it from memory.'}</p>
            </>
          ) : (
            <>
              <div className="move">{ply === 0 ? 'Work out the whole line first' : turnOf(fen) === combo.side ? 'Your move' : 'The reply…'}</div>
              <p>{combo.goal}</p>
              <p className="note">One wrong move ends the attempt, so see the line through to the end in your head before you touch a piece.</p>
            </>
          )}
          <div className="actions">
            {solvedNow && <button className="btn primary" onClick={onNext}>Next combination</button>}
            {(failed || solvedNow) && !showing && <button className={'btn' + (failed ? ' primary' : '')} onClick={onRetry}>Try again</button>}
            {failed && !showing && <button className="btn" onClick={onNext}>Skip</button>}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Moves played</div>
          {ply === 0 ? (
            <div className="moves muted">No moves yet.</div>
          ) : (
            <div className="moves">
              {combo.moves.slice(0, ply).map((san, i) => (
                <span key={i} className="mv"><b className={i === ply - 1 ? 'cur' : ''}>{san}</b></span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
