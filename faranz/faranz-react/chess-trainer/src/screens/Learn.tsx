import { Demo, Drill } from '../components/Drill'
import { Shell } from '../components/ui'
import type { Lesson, Opening } from '../data'
import { href } from '../router'
import { completeLesson } from '../store'

export function Learn({ opening, lesson }: { opening: Opening; lesson: Lesson }) {
  const i = opening.lessons.indexOf(lesson)
  const next = opening.lessons[i + 1]
  const done = () => completeLesson(lesson.id, lesson.drill)

  const after = (
    <>
      {lesson.drill && <a className="btn primary" href={href('practise', 'line', lesson.id)}>Practise this line</a>}
      {next && <a className={'btn' + (lesson.drill ? '' : ' primary')} href={href('learn', next.id)}>Next lesson ▶</a>}
      <a className="btn" href={href('o', opening.id)}>All lessons</a>
    </>
  )

  return (
    <Shell
      back={href('o', opening.id)}
      backLabel={opening.name}
      title={lesson.title}
      mode={lesson.kind === 'demo' ? 'Watch' : 'Learn'}
      right={<span className="count">Lesson {i + 1} of {opening.lessons.length}</span>}
    >
      {lesson.kind === 'demo' ? (
        <Demo key={lesson.id} lesson={lesson} side={opening.side} onDone={done} after={after} />
      ) : (
        <Drill key={lesson.id} lesson={lesson} side={opening.side} mode="learn" onDone={done} after={after} />
      )}
    </Shell>
  )
}
