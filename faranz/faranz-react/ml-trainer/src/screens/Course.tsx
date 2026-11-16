import { useEffect, useState } from 'react'
import { Blocks, Prose } from '../components/Code'
import { QuestionCard } from '../components/Quiz'
import { Meter, Shell } from '../components/ui'
import { MODULES } from '../content'
import { LESSON_VIDEOS, MODULE_VIDEOS, watchUrl, type Video } from '../content/videos'
import { moduleQuestions, rightIn } from '../lib'
import { href } from '../router'
import { markRead, useStore } from '../store'
import type { Lesson, Module, Question } from '../types'
import { WIDGETS } from '../widgets'
import { NotePad } from './Notebook'

const KIND_NAME: Record<Question['kind'], string> = { choice: 'Pick one', output: 'Read the code', bug: 'Find the bug', number: 'Work it out', write: 'Write the code', design: 'Design it' }
const KINDS: [Question['kind'], string][] = [['choice', 'to pick'], ['output', 'code to read'], ['bug', 'bugs to find'], ['number', 'to work out'], ['write', 'to write'], ['design', 'to design']]

/** What a lesson's questions are, in a few words: "3 to pick · 2 code to read". */
const mix = (questions: Question[]) =>
  KINDS.map(([kind, label]) => [questions.filter(q => q.kind === kind).length, label] as const)
    .filter(([n]) => n)
    .map(([n, label]) => `${n} ${label}`)
    .join(' · ')

/** Links to videos on the same idea. They open on YouTube in a new tab. */
function Videos({ videos, title }: { videos: Video[]; title: string }) {
  return (
    <div className="card">
      <div className="eyebrow">{title}</div>
      {videos.map(video => (
        <a className="topic video" key={video.id} href={watchUrl(video)} target="_blank" rel="noreferrer">
          <b>▶ {video.title}</b>
          <small>{video.by} · YouTube ↗</small>
        </a>
      ))}
    </div>
  )
}

/** One module: its lessons, and how far you are in each. */
export function ModulePage({ m }: { m: Module }) {
  const s = useStore()
  const questions = moduleQuestions(m)
  const right = rightIn(questions, s)
  const at = MODULES.indexOf(m)

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title={m.title}
      mode={`Module ${at + 1}`}
      right={
        <>
          <Meter value={questions.length ? right / questions.length : 0} />
          <span className="count">{right} of {questions.length} questions right</span>
        </>
      }
    >
      <p className="muted">{m.summary}</p>
      <div className="card">
        {m.lessons.map((l, i) => {
          const n = rightIn(l.questions, s)
          return (
            <a className="topic" key={l.id} href={href('l', l.id)}>
              <span className={'pill' + (n === l.questions.length ? ' set' : '')}>{n} of {l.questions.length}</span>
              <b>{i + 1}. {l.title}{l.widget && <span className="tag">live figure</span>}</b>
              <small>{l.summary}</small>
              <small className="note">{mix(l.questions)}</small>
            </a>
          )
        })}
      </div>
      {MODULE_VIDEOS[m.id] && (
        <>
          <h2 className="sidehead">Worth watching alongside</h2>
          <Videos videos={MODULE_VIDEOS[m.id]} title="Courses and talks" />
        </>
      )}
      <div className="actions end">
        <a className="btn primary" href={href('drill', m.id)}>Drill this module</a>
        {MODULES[at + 1] && <a className="btn" href={href('m', MODULES[at + 1].id)}>Next module: {MODULES[at + 1].title}</a>}
      </div>
    </Shell>
  )
}

/** One lesson: the idea, the rules, a figure to play with, then the questions one at a time. */
export function LessonPage({ m, lesson }: { m: Module; lesson: Lesson }) {
  const Widget = lesson.widget ? WIDGETS[lesson.widget] : undefined
  const next = m.lessons[m.lessons.indexOf(lesson) + 1]
  useEffect(() => markRead(lesson.id), [lesson.id])

  return (
    <Shell back={href('m', m.id)} backLabel={m.title} title={lesson.title}>
      <div className={Widget ? 'theory' : 'theory single'}>
        <div className="panel text">
          <div className="card">
            <div className="eyebrow">The idea</div>
            <Blocks blocks={lesson.text} />
          </div>
          <div className="card">
            <div className="eyebrow">Remember</div>
            <ul className="rules">{lesson.rules.map((r, i) => <li key={i}><Prose text={r} /></li>)}</ul>
          </div>
          {LESSON_VIDEOS[lesson.id] && <Videos videos={LESSON_VIDEOS[lesson.id]} title="Watch: the same idea, explained by someone else" />}
        </div>
        {Widget && (
          <div className="panel sticky">
            <div className="card">
              <div className="eyebrow">Try it</div>
              <Widget />
            </div>
          </div>
        )}
      </div>

      <h2 className="sidehead">Your turn</h2>
      <LessonQuiz key={lesson.id} lesson={lesson} next={next} m={m} />

      <h2 className="sidehead">Your notebook for this lesson</h2>
      <div className="card">
        <NotePad page={`lesson:${lesson.id}`} open={false} />
      </div>
    </Shell>
  )
}

function LessonQuiz({ lesson, next, m }: { lesson: Lesson; next?: Lesson; m: Module }) {
  const stats = useStore().questions
  const total = lesson.questions.length
  // start at the first question you have not got right yet
  const [at, setAt] = useState(() => Math.max(0, lesson.questions.findIndex(q => stats[q.id]?.last !== 'right')))
  /** Bumped to show a question afresh when you come back to it. */
  const [visit, setVisit] = useState(0)
  const right = rightIn(lesson.questions, { questions: stats })
  const jump = (i: number) => {
    setAt(i)
    setVisit(visit + 1)
  }

  const steps = (
    <div className="steps" role="tablist" aria-label="Questions">
      {lesson.questions.map((q, i) => (
        <button key={q.id} role="tab" aria-selected={i === at} title={KIND_NAME[q.kind]} className={(stats[q.id]?.last ?? '') + (i === at ? ' on' : '')} onClick={() => jump(i)}>{i + 1}</button>
      ))}
      <span className="count">{right} of {total} right</span>
    </div>
  )

  if (at >= total) {
    return (
      <>
        {steps}
        <div className="card">
          <div className="eyebrow">End of the lesson</div>
          <div className="move">{right} of {total} right</div>
          <p>{right === total ? 'Every one. They will come back in the review, further apart each time.' : 'The ones you missed are marked red above: click one to try it again. They also come back first in the review.'}</p>
          <div className="actions">
            {next && <a className="btn primary" href={href('l', next.id)}>Next lesson: {next.title}</a>}
            <button className="btn" onClick={() => jump(0)}>Go through the questions again</button>
            <a className="btn" href={href('m', m.id)}>Back to {m.title}</a>
          </div>
        </div>
      </>
    )
  }
  return (
    <>
      {steps}
      <QuestionCard
        key={`${visit}-${at}`}
        q={lesson.questions[at]}
        eyebrow={`Question ${at + 1} of ${total}`}
        nextLabel={at === total - 1 ? 'Finish the lesson' : 'Next question'}
        onNext={() => jump(at + 1)}
      />
    </>
  )
}
