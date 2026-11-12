import { Board } from '../components/Board'
import { Meter } from '../components/ui'
import { replay } from '../chess'
import { OPENINGS, SIDE_NAME, chapterName, drillLines, lessonById, openingById, sans, type Opening, type Side } from '../data'
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
        <p>Two openings for White and two defences for Black, learned one idea at a time: lessons, drills, memory training and practice games.</p>
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
        <div className="note">Next: {chapterName(next.chapter, o.side)} · {next.title}</div>
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
