import { useState } from 'react'
import { Drill } from '../components/Drill'
import { Shell } from '../components/ui'
import { drillLines, lessonById, openingById, type Lesson } from '../data'
import { dueLines, learnedLines, shuffle } from '../lib'
import { href } from '../router'
import { getState, recordLine } from '../store'

/** Which lines to drill, from the route: due | o/<opening> | line/<lesson>. */
function buildQueue(kind: string, id: string | undefined): Lesson[] {
  const s = getState()
  if (kind === 'due') return dueLines(s, Date.now())
  if (kind === 'line') return id && lessonById(id)?.lesson.drill ? [lessonById(id)!.lesson] : []
  const o = id ? openingById(id) : undefined
  if (!o) return []
  const learned = learnedLines(o, s)
  return shuffle(learned.length ? learned : drillLines(o))
}

export function Practise({ kind, id }: { kind: string; id?: string }) {
  const [queue, setQueue] = useState(() => buildQueue(kind, id))
  const [i, setI] = useState(0)
  const [run, setRun] = useState(0)
  const lesson = queue[i]
  const back = kind === 'due' ? href() : href('o', kind === 'line' ? lessonById(id ?? '')?.opening.id ?? '' : id ?? '')

  if (!lesson) {
    return (
      <Shell back={href()} backLabel="Home" title="Practise">
        <div className="card">
          <div className="eyebrow good">All caught up</div>
          <p>No lines are due for review right now. Learn a new lesson, or pick an opening and practise its lines anyway.</p>
          <div className="actions"><a className="btn primary" href={href()}>Back to home</a></div>
        </div>
      </Shell>
    )
  }

  const opening = lessonById(lesson.id)!.opening
  const onDone = (cleanRun: boolean) => {
    recordLine(lesson.id, cleanRun, 'practise')
    // a missed line comes back at the end of this session
    if (!cleanRun && kind !== 'line') setQueue(q => [...q, lesson])
  }
  const last = i + 1 >= queue.length

  return (
    <Shell
      back={back}
      backLabel={kind === 'due' ? 'Home' : opening.name}
      title={`${opening.name} · ${lesson.title}`}
      mode="Practise"
      right={<span className="count">Line {i + 1} of {queue.length}</span>}
    >
      <Drill
        key={`${i}-${run}`}
        lesson={lesson}
        side={opening.side}
        mode="practise"
        onDone={onDone}
        after={
          <>
            {!last && <button className="btn primary" onClick={() => setI(i + 1)}>Next line ▶</button>}
            {lesson.plan && <a className={'btn' + (last ? ' primary' : '')} href={href('play', lesson.id)}>Play on against the computer</a>}
            <button className="btn" onClick={() => setRun(run + 1)}>Repeat this line</button>
            {last && <a className="btn" href={back}>Finish</a>}
          </>
        }
      />
    </Shell>
  )
}
