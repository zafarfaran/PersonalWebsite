import { useEffect, useRef } from 'react'
import { Shell } from '../components/ui'
import { OPENINGS, type Lesson, type Opening } from '../data'
import { childrenOf, linksFor, parentOf, rootsOf, seeAlso } from '../links'
import { go, href } from '../router'
import { useStore } from '../store'

const KIND = { from: 'Comes from', see: 'See also', to: 'Goes on to' } as const

/** The lessons one lesson connects to, as a list. Shown under every lesson. */
export function Connected({ opening, lesson }: { opening: Opening; lesson: Lesson }) {
  const s = useStore()
  const links = linksFor(lesson.id)
  if (!links.length) return null
  return (
    <div className="card connected">
      <div className="guidehead">
        <div className="eyebrow">Connected lessons</div>
        <a className="btn" href={href('map', opening.id, lesson.id)}>Show on the lesson map</a>
      </div>
      {links.map(link => (
        <a key={link.kind + link.lesson.id} className={'lesson' + (s.lessons[link.lesson.id] ? ' done' : '')} href={href('learn', link.lesson.id)}>
          <span className="dot">{s.lessons[link.lesson.id] ? '✓' : ''}</span>
          <span className="t">
            {link.lesson.title}
            <small>
              {link.kind === 'see'
                ? (link.opening === opening ? '' : link.opening.name + ' · ') + link.lesson.blurb
                : link.kind === 'from' ? `This lesson leaves it with ${link.at}` : `Leaves this lesson with ${link.at}`}
            </small>
          </span>
          <span className={'pill ' + link.kind}>{KIND[link.kind]}</span>
        </a>
      ))}
    </div>
  )
}

/** Every lesson of one opening as a tree: each line hangs off the line it branches from. */
export function LessonMap({ o, current }: { o: Opening; current?: string }) {
  const here = useRef<HTMLLIElement>(null)
  useEffect(() => {
    here.current?.scrollIntoView({ block: 'center' })
  }, [current, o])

  return (
    <Shell back={href('o', o.id)} backLabel={o.name} title="Lesson map">
      <div className="seg tabs">
        {OPENINGS.map(x => (
          <button key={x.id} className={x === o ? 'on' : ''} onClick={() => go('map', x.id)}>{x.name}</button>
        ))}
      </div>
      <p className="muted mapnote">
        Each lesson hangs off the line it branches from, with the move where the two part. The small links under a lesson are
        other lessons its text refers to, in this opening or another one.
      </p>
      <div className="card tree">
        <ul>
          {rootsOf(o).map(l => <Node key={l.id} lesson={l} current={current} here={here} />)}
        </ul>
      </div>
    </Shell>
  )
}

function Node({ lesson, current, here }: { lesson: Lesson; current?: string; here: React.RefObject<HTMLLIElement> }) {
  const s = useStore()
  const kids = childrenOf(lesson.id)
  const isCurrent = lesson.id === current
  return (
    <li ref={isCurrent ? here : undefined}>
      <a className={'node' + (s.lessons[lesson.id] ? ' done' : '') + (isCurrent ? ' now' : '')} href={href('learn', lesson.id)}>
        <span className="at">{parentOf(lesson.id)?.at ?? 'Start'}</span>
        <span className="t">{lesson.title}</span>
        {s.lessons[lesson.id] && <span className="good">✓</span>}
        {lesson.trap && <span className={'pill ' + lesson.trap}>Trap</span>}
      </a>
      {seeAlso(lesson.id).length > 0 && (
        <div className="seealso">
          {seeAlso(lesson.id).map(link => (
            <a key={link.lesson.id} href={href('learn', link.lesson.id)}>
              ↔ {link.opening.lessons.includes(lesson) ? '' : link.opening.name + ': '}{link.lesson.title}
            </a>
          ))}
        </div>
      )}
      {kids.length > 0 && <ul>{kids.map(l => <Node key={l.id} lesson={l} current={current} here={here} />)}</ul>}
    </li>
  )
}
