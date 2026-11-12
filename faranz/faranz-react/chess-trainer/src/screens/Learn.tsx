import { Demo, Drill } from '../components/Drill'
import { Shell } from '../components/ui'
import { fixLesson, type Lesson, type Opening } from '../data'
import { seeAlso } from '../links'
import { href } from '../router'
import { completeLesson } from '../store'
import { Connected } from './LessonMap'

export function Learn({ opening, lesson, fixing }: { opening: Opening; lesson: Lesson; fixing?: boolean }) {
  const i = opening.lessons.indexOf(lesson)
  const next = opening.lessons[i + 1]
  const done = () => completeLesson(lesson.id, lesson.drill)
  // traps to avoid: the same line again, with you playing the right move
  const fix = fixLesson(lesson)
  const playFix = (primary: boolean) =>
    fix && <a className={'btn' + (primary ? ' primary' : '')} href={href('learn', lesson.id, 'fix')}>Play the right move</a>

  const after = (
    <>
      {fixing ? <a className="btn" href={href('learn', lesson.id)}>Watch the trap again</a> : playFix(true)}
      {lesson.drill && <a className="btn primary" href={href('practise', 'line', lesson.id)}>Practise this line</a>}
      {next && <a className={'btn' + (lesson.drill || (fix && !fixing) ? '' : ' primary')} href={href('learn', next.id)}>Next lesson ▶</a>}
      {seeAlso(lesson.id).slice(0, 3).map(link => (
        <a key={link.lesson.id} className="btn" href={href('learn', link.lesson.id)}>See also: {link.lesson.title}</a>
      ))}
      <a className="btn" href={href('o', opening.id)}>All lessons</a>
    </>
  )

  return (
    <Shell
      back={href('o', opening.id)}
      backLabel={opening.name}
      title={lesson.title}
      mode={fix && fixing ? 'The fix' : lesson.kind === 'demo' ? 'Watch' : 'Learn'}
      right={<span className="count">Lesson {i + 1} of {opening.lessons.length}</span>}
    >
      {fix && fixing ? (
        <Drill key={fix.id} lesson={fix} side={opening.side} mode="learn" start={lesson.fix!.at} onDone={() => {}} after={after} />
      ) : lesson.kind === 'demo' ? (
        <Demo key={lesson.id} lesson={lesson} side={opening.side} onDone={done} after={after} skip={playFix(false)} />
      ) : (
        <Drill key={lesson.id} lesson={lesson} side={opening.side} mode="learn" onDone={done} after={after} />
      )}
      <Connected opening={opening} lesson={lesson} />
    </Shell>
  )
}
