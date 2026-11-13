import { Board } from '../components/Board'
import { Meter } from '../components/ui'
import { replay } from '../chess'
import { OPENINGS, SIDE_NAME, chapterName, drillLines, lessonById, openingById, sans, type Opening, type Side } from '../data'
import { ENDGAME_DRILLS } from '../data/endgames'
import { dueLines, lessonsDone, nextLesson } from '../lib'
import { href } from '../router'
import { streak } from '../srs'
import { useStore } from '../store'

export function Home() {
  const s = useStore()
  const now = Date.now()
  const due = dueLines(s, now)
  const days = streak(s.days, now)

  return (
    <main className="screen">
      <div className="hero">
        <h1>
          <span className="good">~/chess</span> <span className="accent">$</span> opening-trainer
        </h1>
        <p>Two openings for White, an answer to every other defence to 1. e4, and three defences for Black, learned one idea at a time: lessons, drills, memory training and practice games.</p>
      </div>

      <div className="card row">
        <b className="big">{due.length}</b>
        <div className="grow">
          <strong>{due.length === 1 ? 'line due for review today' : 'lines due for review today'}</strong>
          <br />
          <span className="note">
            {due.length
              ? 'Lines you missed come back sooner. Lines you know come back later.'
              : 'Nothing is due. Learn a new lesson, or play a match to stay sharp.'}
            {days > 0 && ` Practice streak: ${days} ${days === 1 ? 'day' : 'days'}.`}
          </span>
        </div>
        {due.length > 0 && <a className="btn primary" href={href('practise', 'due')}>Start review</a>}
        <a className="btn" href={href('progress')}>See progress</a>
      </div>

      <a className="card row boardcard" href={href('random')}>
        <div className="grow">
          <strong>Random trainer</strong>
          <br />
          <span className="note">
            Lines from all your openings in random order, played from memory. You are told the opening, not the line. The London,
            Italian, Caro-Kann and Sicilian come up most, and so do the lines you get wrong.
          </span>
        </div>
        <span className="btn primary">Start</span>
      </a>

      <div className="tools">
        <a className="card row boardcard" href={href('board')}>
          <div className="grow">
            <strong>Board trainer</strong>
            <br />
            <span className="note">Learn to read and write chess notation and find any square instantly: five short drills.</span>
          </div>
          <span className="btn">Open</span>
        </a>

        <a className="card row boardcard" href={href('guide')}>
          <div className="grow">
            <strong>What to play against what</strong>
            <br />
            <span className="note">A lookup table: every opening and setup your opponent can choose, and the line that answers it.</span>
          </div>
          <span className="btn">Open</span>
        </a>

        <a className="card row boardcard" href={href('traps')}>
          <div className="grow">
            <strong>Traps</strong>
            <br />
            <span className="note">The traps in your openings, in two lists: the ones you can set, and the ones you have to see coming.</span>
          </div>
          <span className="btn">Open</span>
        </a>

        <a className="card row boardcard" href={href('calc')}>
          <div className="grow">
            <strong>Calculation trainer</strong>
            <br />
            <span className="note">Learn to see ahead: follow a few moves in your head without the board moving, and solve combinations you have to work out before you play.</span>
          </div>
          <span className="btn">Open</span>
        </a>

        <a className="card row boardcard" href={href('endgames')}>
          <div className="grow">
            <strong>Endgames</strong>
            <br />
            <span className="note">
              The endings every player has to know: the basic checkmates, king and pawn, rook endings. Short theory, then positions to play out against the computer.
              {Object.keys(s.endgames).length > 0 && ` ${Object.keys(s.endgames).length} of ${ENDGAME_DRILLS.length} positions solved.`}
            </span>
          </div>
          <span className="btn">Open</span>
        </a>

        <a className="card row boardcard" href={href('games')}>
          <div className="grow">
            <strong>My games</strong>
            <br />
            <span className="note">
              Load your games from Chess.com or Lichess, or play one here. The computer marks what went wrong and what to play instead; replay from any move and practise the positions you got wrong.
              {s.games.length > 0 && ` ${s.games.length} saved, ${Object.keys(s.fixes).length} mistakes to fix.`}
            </span>
          </div>
          <span className="btn">Open</span>
        </a>
      </div>

      {(['w', 'b'] as Side[]).map(side => (
        <section key={side}>
          <h2 className="sidehead">Play as {SIDE_NAME[side]}</h2>
          <div className="openings">
            {OPENINGS.filter(o => o.side === side).map(o => (
              <OpeningCard key={o.id} o={o} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}

function OpeningCard({ o }: { o: Opening }) {
  const s = useStore()
  const done = lessonsDone(o, s)
  const next = nextLesson(o, s)
  const fen = replay(sans(lessonById(o.cardLesson)!.lesson)).fen()
  return (
    <div className="card opening">
      <a href={href('o', o.id)} aria-label={`${o.name} lessons`}>
        <Board fen={fen} flip={o.side === 'b'} />
      </a>
      <div>
        <h2>{o.name}</h2>
        <div className="sub">{o.firstMoves}<br />{o.tagline}</div>
        <Meter value={done / o.lessons.length} />
        <div className="count">{done} of {o.lessons.length} lessons · {drillLines(o).length} lines to drill</div>
        <div className="actions">
          <a className="btn primary" href={href('learn', next.id)}>{done === 0 ? 'Start' : done === o.lessons.length ? 'Revisit' : 'Continue'}</a>
          <a className="btn" href={href('o', o.id)}>Lessons</a>
        </div>
        <div className="note">Next: {chapterName(next.chapter, o)} · {next.title}</div>
      </div>
      <div className="modes">
        <a className="mode" href={href('practise', 'o', o.id)}><b>Practise</b><span>Drill the lines from memory</span></a>
        <a className="mode" href={href('match', o.id)}><b>Match</b><span>Opening only: {SIDE_NAME[o.side === 'w' ? 'b' : 'w']} picks a different line each time</span></a>
        <a className="mode" href={href('game', o.id)}><b>Full game</b><span>Play to the end against common lines, with every move rated</span></a>
        <a className="mode" href={href('memorise', o.id)}><b>Memorise</b><span>Quick-fire positions and the setup</span></a>
      </div>
    </div>
  )
}

export function NotFound({ what }: { what: string }) {
  return (
    <main className="screen">
      <div className="card">
        <div className="eyebrow">Not found</div>
        <p>There is no {what} at this address.</p>
        <div className="actions"><a className="btn primary" href={href()}>Back to home</a></div>
      </div>
    </main>
  )
}

export const openingOr404 = (id: string | undefined) => (id ? openingById(id) : undefined)
