import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Chess } from 'chess.js'
import { Board, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { clean, lastMoveOf, legalDests, sanOf, squaresOf, turnOf, type Square } from '../chess'
import { OPENINGS, SIDE_NAME, lessonById, openingById, other, type Opening } from '../data'
import { MIDDLEGAME, MIDDLEGAME_GROUPS, PUZZLE_SETS, THEMES, askFor, lineText, puzzlesIn, type MiddlegameLesson, type PuzzleSet } from '../data/middlegame'
import { PUZZLES, type Puzzle } from '../data/puzzles'
import { shuffle } from '../lib'
import { href } from '../router'
import { getState, recordPuzzle, useStore } from '../store'
import { Demo } from './Endgames'

const ROUND = 10
const REPLY_MS = 450
const SHOW_MS = 900
const SETS = Object.keys(PUZZLE_SETS) as PuzzleSet[]

/** The middlegame page: puzzles by pattern, the lessons, and positions to play out. */
export function Middlegame() {
  const solved = useStore().puzzles
  const done = PUZZLES.filter(p => solved[p.id]).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Middlegame"
      right={
        <>
          <Meter value={done / PUZZLES.length} />
          <span className="count">{done} of {PUZZLES.length} puzzles solved</span>
        </>
      }
    >
      <p className="muted">
        The opening ends, nobody tells you the next move, and somewhere in the next twenty moves a piece is left hanging or a fork is missed. That is how most games at club
        level are decided. The puzzles here come from games played out of the openings in this course, so the positions look like the ones you get. In every one the other side
        has just made a mistake, and one move punishes it. The computer has checked each solution.
      </p>

      <h2 className="sidehead">Puzzles</h2>
      <div className="card">
        {SETS.map(set => {
          const all = puzzlesIn(set)
          const n = all.filter(p => solved[p.id]).length
          const lesson = PUZZLE_SETS[set].lessons[0]
          return (
            <div className="reply" key={set}>
              <div className="t">
                <b>{PUZZLE_SETS[set].title}</b>
                <small>{PUZZLE_SETS[set].summary} {n} of {all.length} solved.</small>
              </div>
              {lesson && <a className="btn" href={href(...lesson)}>Lesson</a>}
              <a className={'btn' + (set === 'mixed' ? ' primary' : '')} href={href('puzzles', set)}>Start</a>
            </div>
          )
        })}
      </div>

      {MIDDLEGAME_GROUPS.map(group => (
        <section key={group}>
          <h2 className="sidehead">{group}</h2>
          <div className="card">
            {MIDDLEGAME.filter(l => l.group === group).map(l => (
              <a className="topic" key={l.id} href={href('middlegame', l.id)}>
                <b>{l.title}</b>
                <small>{l.summary}</small>
              </a>
            ))}
          </div>
        </section>
      ))}

      <h2 className="sidehead">Play a middlegame</h2>
      <div className="card">
        <p className="note">
          Skip the opening: start from the end of one of your lines, with the plan in front of you, and play the game out against the computer. Every move you make is rated.
        </p>
        {OPENINGS.map(o => <PlayOn key={o.id} o={o} />)}
      </div>

      <h2 className="sidehead">The rest of the middlegame</h2>
      <div className="card">
        <a className="topic" href={href('tactics')}>
          <b>Tactics: reading the other side’s move</b>
          <small>The same patterns from the other end: is the move you have just been shown a mistake, a threat, or nothing special?</small>
        </a>
        <a className="topic" href={href('strategy')}>
          <b>Strategy: what to do when nothing is hanging</b>
          <small>The centre, pawn chains and pawn breaks, weak pawns, outposts, and how to find a plan.</small>
        </a>
        <a className="topic" href={href('calc')}>
          <b>Calculation: seeing a few moves ahead</b>
          <small>Follow moves in your head without the board changing.</small>
        </a>
      </div>
    </Shell>
  )
}

/** One opening's row: a position after the opening, picked at random each time the page is opened. */
function PlayOn({ o }: { o: Opening }) {
  const lines = o.lessons.filter(l => l.plan && l.kind === 'guided')
  const [pick] = useState(() => lines[Math.floor(Math.random() * lines.length)])
  if (!pick) return null
  return (
    <div className="reply">
      <div className="t">
        <b>{o.name} <span className="muted">· as {SIDE_NAME[o.side]}</span></b>
        <small>{lines.length} positions. This time: {pick.title}.</small>
      </div>
      <a className="btn" href={href('play', pick.id)}>Play</a>
    </div>
  )
}

/** One lesson: the idea, the rules to remember and an example to step through. */
export function MiddlegameLessonPage({ lesson }: { lesson: MiddlegameLesson }) {
  const next = MIDDLEGAME[MIDDLEGAME.indexOf(lesson) + 1]
  const see = (lesson.see ?? []).map(id => lessonById(id)!)

  return (
    <Shell back={href('middlegame')} backLabel="Middlegame" title={lesson.title} mode={lesson.group}>
      <div className="theory">
        <div className="panel text">
          <div className="card">
            <div className="eyebrow">The idea</div>
            {lesson.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="card">
            <div className="eyebrow">Remember</div>
            <ul className="rules">{lesson.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
            <div className="actions">
              <a className="btn primary" href={href('puzzles', lesson.set)}>Practise: {PUZZLE_SETS[lesson.set].title.toLowerCase()}</a>
              {lesson.link && <a className="btn" href={href(...lesson.link.to)}>{lesson.link.label}</a>}
              {next && <a className="btn" href={href('middlegame', next.id)}>Next lesson: {next.title}</a>}
            </div>
          </div>
          {see.length > 0 && (
            <div className="card">
              <div className="eyebrow">In your openings</div>
              {see.map(({ opening, lesson: l }) => (
                <a className="topic" key={l.id} href={href('learn', l.id)}>
                  <b>{l.title}</b>
                  <small>{opening.name} · {l.blurb}</small>
                </a>
              ))}
            </div>
          )}
        </div>
        {lesson.demo && <Demo demo={lesson.demo} />}
      </div>
    </Shell>
  )
}

/** A round of puzzles from one set. */
export function PuzzleDrill({ set }: { set: PuzzleSet }) {
  const [round, setRound] = useState(0)
  return <PuzzleRound key={round} set={set} again={() => setRound(round + 1)} />
}

function PuzzleRound({ set, again }: { set: PuzzleSet; again: () => void }) {
  const [deck] = useState(() => {
    // puzzles you have not solved come first, then the ones you needed help with
    const seen = getState().puzzles
    return shuffle(puzzlesIn(set)).sort((a, b) => (seen[a.id] ?? 0) - (seen[b.id] ?? 0)).slice(0, ROUND)
  })
  const [at, setAt] = useState(0)
  const [score, setScore] = useState(0)
  const title = PUZZLE_SETS[set].title
  const lesson = PUZZLE_SETS[set].lessons[0]

  if (at >= deck.length) {
    return (
      <Shell back={href('middlegame')} backLabel="Middlegame" title={title}>
        <div className="card">
          <div className="eyebrow">Round over</div>
          <div className="move">{score} of {deck.length} without help</div>
          <p>
            {score === deck.length
              ? 'Every one. The puzzles you have not had yet come first in the next round.'
              : 'The ones you needed help with come back in a later round. In your own games, look for the same thing on every move: checks, captures, threats.'}
          </p>
          <div className="actions">
            <button className="btn primary" onClick={again}>Another round</button>
            {lesson && <a className="btn" href={href(...lesson)}>The lesson</a>}
            <a className="btn" href={href('middlegame')}>Back to Middlegame</a>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell back={href('middlegame')} backLabel="Middlegame" title={title} right={<span className="count">Puzzle {at + 1} of {deck.length} · {score} without help</span>}>
      <PuzzleBoard
        key={deck[at].id}
        puzzle={deck[at]}
        blind={set === 'mixed'}
        after={ok => (
          <button className="btn primary" onClick={() => { setScore(score + (ok ? 1 : 0)); setAt(at + 1) }}>
            {at === deck.length - 1 ? 'Finish the round' : 'Next puzzle'}
          </button>
        )}
      />
    </Shell>
  )
}

/**
 * The board for one puzzle. You play your side's moves and the replies play
 * themselves. A wrong move is not made; you can ask which piece moves, or for
 * the whole answer. `after` is shown at the end and is told whether you needed help.
 */
function PuzzleBoard({ puzzle, blind, after }: { puzzle: Puzzle; blind: boolean; after: (clean: boolean) => ReactNode }) {
  const [at, setAt] = useState(0)
  const [slips, setSlips] = useState(0)
  // the wrong move you last tried in the position on the board
  const [miss, setMiss] = useState<string | null>(null)
  const [hinted, setHinted] = useState(false)
  const [shown, setShown] = useState(false)
  // a winning move of yours that is not the one in the line: another mate, or another move that wins as much
  const [alt, setAlt] = useState<string | null>(null)

  const you = turnOf(puzzle.fen)
  const them = SIDE_NAME[other(you)]
  const theme = THEMES[puzzle.theme]
  const position = useMemo(() => {
    const c = new Chess(puzzle.fen)
    for (let i = 0; i < at; i++) c.move(puzzle.moves[i])
    if (alt) c.move(alt)
    return c
  }, [puzzle, at, alt])
  const done = alt !== null || at >= puzzle.moves.length
  const yourTurn = !done && at % 2 === 0
  const unaided = slips === 0 && !hinted && !shown

  // the reply plays itself, and so does the rest of the line once you have asked for the answer
  useEffect(() => {
    if (done || (yourTurn && !shown)) return
    const timer = setTimeout(() => setAt(at + 1), shown ? SHOW_MS : REPLY_MS)
    return () => clearTimeout(timer)
  }, [at, done, yourTurn, shown])

  useEffect(() => {
    if (done) recordPuzzle(puzzle.id, unaided)
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const play = (from: Square, to: Square) => {
    if (!yourTurn || shown) return
    const san = sanOf(position.fen(), from, to)
    if (!san) return
    if (clean(san) === clean(puzzle.moves[at])) {
      setMiss(null)
      return setAt(at + 1)
    }
    const after = new Chess(position.fen())
    after.move(san)
    if (after.isCheckmate() || puzzle.also?.[at / 2]?.includes(clean(san))) return setAlt(san)
    setSlips(slips + 1)
    setMiss(san)
  }

  const last = at === 0 && !alt ? { from: puzzle.from, to: puzzle.to } : lastMoveOf(position)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const piece = yourTurn && hinted ? squaresOf(position.fen(), puzzle.moves[at]) : null
  if (piece) highlights.push({ sq: piece.from, kind: 'hint' })

  const full = +puzzle.fen.split(' ')[5]
  const label = you === 'w' ? `${full - 1}…` : `${full}.`
  const opening = openingById(puzzle.opening)
  const played = alt ? [...puzzle.moves.slice(0, at), alt] : puzzle.moves.slice(0, at)

  return (
    <div className="trainer">
      <Board
        fen={position.fen()}
        coords
        markable
        flip={you === 'b'}
        dests={yourTurn && !shown ? legalDests(position.fen()) : undefined}
        onMove={play}
        highlights={highlights}
      />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">{opening ? `From a game in the ${opening.name}` : 'Puzzle'} · you are {SIDE_NAME[you]}</div>
          <div className="move">{label} {puzzle.last}</div>
          <p><b>{blind ? `${them} has just made a mistake. Find the move that punishes it.` : askFor(puzzle)}</b></p>

          {played.length > 0 && <p className="note">{lineText(puzzle.fen, played)}</p>}

          {!done && !shown && (
            <>
              {at > 0 && yourTurn && !miss && <p className="good">Right. Keep going.</p>}
              {miss && <p className="bad">{miss} is not it.</p>}
              {(miss || hinted) && <p>{theme.hint}</p>}
              <div className="actions">
                {!hinted && <button className="btn" onClick={() => setHinted(true)}>Hint</button>}
                <button className="btn" onClick={() => setShown(true)}>Show the answer</button>
              </div>
            </>
          )}

          {done && (
            <>
              <p className={shown ? 'accent' : 'good'}>
                {shown ? 'That was the answer.' : alt ? `${alt} ${position.isCheckmate() ? 'is checkmate' : 'wins'} as well.` : unaided ? 'Solved.' : 'Solved, with some help.'}
              </p>
              <p>{puzzle.why}</p>
              {alt && at < puzzle.moves.length && <p className="note">The line the computer had in mind: {lineText(puzzle.fen, puzzle.moves)}</p>}
              <div className="actions">
                {after(unaided)}
                <a className="btn" href={href(...theme.lesson)}>{blind ? `The pattern: ${theme.name}` : 'The lesson'}</a>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="eyebrow">Before every move</div>
          <ul className="rules">
            <li>Checks: which can you give, and what is the reply to each?</li>
            <li>Captures: count the attackers and the guards.</li>
            <li>Threats: which piece of theirs is loose, pinned or short of squares?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
