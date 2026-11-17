import { Meter, Shell } from '../components/ui'
import { GAMBITS_FACED, OPENINGS, SIDE_NAME, lessonById } from '../data'
import { href } from '../router'
import { useStore } from '../store'
import { OpeningCard } from './Home'

/** The gambits of the course in one place: the ones you play, and the lessons on the ones played against you. */
export function Gambits() {
  const s = useStore()
  const played = OPENINGS.filter(o => o.gambit)
  const faced = GAMBITS_FACED.map(id => lessonById(id)!)
  const lessons = [...played.flatMap(o => o.lessons), ...faced.map(f => f.lesson)]
  const done = lessons.filter(l => s.lessons[l.id]).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Gambits"
      right={
        <>
          <Meter value={done / lessons.length} />
          <span className="count">{done} of {lessons.length} studied</span>
        </>
      }
    >
      <section className="guide">
        <h2>Gambits you play</h2>
        <p className="muted">
          A gambit gives up material, usually a pawn, to get something else: faster development, open lines, or a trap the
          other side has to know. These are surprise weapons. Against an opponent who knows the answer you end up a little
          worse, so use them in quick games and keep your main openings for the rest. Each one has the same tools as an
          opening: lessons, drills, practice matches and full games.
        </p>
        <div className="openings">
          {played.map(o => <OpeningCard key={o.id} o={o} />)}
        </div>
      </section>

      <section className="guide">
        <h2>Gambits you will face</h2>
        <p className="muted">
          These are played against you in the openings you already have. The lessons belong to those openings: each one
          shows whether to take the pawn, and the one or two moves you have to know afterwards.
        </p>
        {OPENINGS.filter(o => faced.some(f => f.opening === o)).map(o => (
          <div className="card" key={o.id}>
            <div className="guidehead">
              <strong>{o.name} <span className="muted">· as {SIDE_NAME[o.side]}</span></strong>
              <a className="btn" href={href('o', o.id)}>All lessons</a>
            </div>
            <div className="trapgroup">
              {faced.filter(f => f.opening === o).map(({ lesson: l }) => (
                <a key={l.id} className={'lesson' + (s.lessons[l.id] ? ' done' : '')} href={href('learn', l.id)}>
                  <span className="dot">{s.lessons[l.id] ? '✓' : ''}</span>
                  <span className="t">
                    {l.title}
                    <small>{l.reply && l.reply !== l.title ? `${l.reply} · ${l.blurb}` : l.blurb}</small>
                  </span>
                  <span className="pill">{l.kind === 'demo' ? 'Watch' : 'Play'}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </Shell>
  )
}
