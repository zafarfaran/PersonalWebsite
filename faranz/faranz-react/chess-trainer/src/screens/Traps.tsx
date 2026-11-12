import { Meter, Shell } from '../components/ui'
import { OPENINGS, SIDE_NAME, trapLessons, type Lesson } from '../data'
import { href } from '../router'
import { useStore } from '../store'

const GROUPS: { trap: NonNullable<Lesson['trap']>; title: string }[] = [
  { trap: 'set', title: 'Traps you set' },
  { trap: 'avoid', title: 'Traps to avoid' },
]

/** Every trap lesson in the course, grouped by opening and by who falls into it. */
export function Traps() {
  const s = useStore()
  const all = OPENINGS.flatMap(trapLessons)
  const done = all.filter(l => s.lessons[l.id]).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Traps"
      right={
        <>
          <Meter value={done / all.length} />
          <span className="count">{done} of {all.length} studied</span>
        </>
      }
    >
      <section className="guide">
        <p className="muted">
          A trap is a position where the obvious move loses. Each one here belongs to an opening you play. In the traps you set,
          your opponent makes a natural-looking mistake and you punish it. In the traps to avoid, your opponent is hoping for one
          particular move from you: know it, and play something else. The traps you set are all good moves in their own right, so
          if your opponent does not fall for one you have lost nothing.
        </p>
        {OPENINGS.filter(o => trapLessons(o).length).map(o => (
          <div className="card" key={o.id}>
            <div className="guidehead">
              <strong>{o.name} <span className="muted">· as {SIDE_NAME[o.side]}</span></strong>
              <a className="btn" href={href('o', o.id)}>All lessons</a>
            </div>
            {GROUPS.filter(g => trapLessons(o).some(l => l.trap === g.trap)).map(g => (
              <div className="trapgroup" key={g.trap}>
                <div className={'eyebrow ' + (g.trap === 'set' ? 'good' : 'bad')}>{g.title}</div>
                {trapLessons(o).filter(l => l.trap === g.trap).map(l => (
                  <a key={l.id} className={'lesson' + (s.lessons[l.id] ? ' done' : '')} href={href('learn', l.id)}>
                    <span className="dot">{s.lessons[l.id] ? '✓' : ''}</span>
                    <span className="t">
                      {l.title}
                      <small>{l.blurb}</small>
                    </span>
                    <span className="pill">{l.kind === 'demo' ? 'Watch' : 'Play'}</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        ))}
      </section>
    </Shell>
  )
}
