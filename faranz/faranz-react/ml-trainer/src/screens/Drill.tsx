import { useState } from 'react'
import { QuestionCard } from '../components/Quiz'
import { Meter, Shell } from '../components/ui'
import { MODULES } from '../content'
import { LESSONS, QUESTIONS, deal, drillPool, moduleById, moduleQuestions, rightIn } from '../lib'
import { href } from '../router'
import { getState, resetProgress, useStore } from '../store'
import { streak } from '../srs'

const ROUND = 10
const TITLE: Record<string, string> = { due: 'Review', mixed: 'Mixed drill', weak: 'Missed questions' }

/** A round of questions: what is due, a mix of what you have studied, what you missed, or one module. */
export function Drill({ kind }: { kind: string }) {
  const [round, setRound] = useState(0)
  return <Round key={round} kind={kind} again={() => setRound(round + 1)} />
}

function Round({ kind, again }: { kind: string; again: () => void }) {
  const title = TITLE[kind] ?? moduleById(kind)?.title ?? 'Drill'
  const [deck] = useState(() => deal(drillPool(kind, getState(), Date.now()), getState(), ROUND))
  const [at, setAt] = useState(0)
  const [score, setScore] = useState(0)

  if (!deck.length) {
    return (
      <Shell back={href()} backLabel="Home" title={title}>
        <div className="card">
          <p>{kind === 'due' ? 'Nothing is due for review right now.' : kind === 'weak' ? 'No missed questions waiting. Well done.' : 'There are no questions here yet.'}</p>
          <div className="actions">
            <a className="btn primary" href={href('drill', 'mixed')}>Mixed drill</a>
            <a className="btn" href={href()}>Back to home</a>
          </div>
        </div>
      </Shell>
    )
  }
  if (at >= deck.length) {
    return (
      <Shell back={href()} backLabel="Home" title={title}>
        <div className="card">
          <div className="eyebrow">Round over</div>
          <div className="move">{score} of {deck.length} right</div>
          <p>{score === deck.length ? 'Every one.' : 'The ones you missed are due again straight away, and their lessons are worth another look.'}</p>
          <div className="actions">
            <button className="btn primary" onClick={again}>Another round</button>
            <a className="btn" href={href()}>Back to home</a>
          </div>
        </div>
      </Shell>
    )
  }
  const { lesson, question } = deck[at]
  return (
    <Shell back={href()} backLabel="Home" title={title} right={<span className="count">Question {at + 1} of {deck.length} · {score} right</span>}>
      <QuestionCard
        key={at}
        q={question}
        eyebrow={lesson.title}
        nextLabel={at === deck.length - 1 ? 'Finish the round' : 'Next question'}
        onNext={correct => {
          setScore(score + (correct ? 1 : 0))
          setAt(at + 1)
        }}
      />
      <p className="note more">From the lesson <a href={href('l', lesson.id)}>{lesson.title}</a>.</p>
    </Shell>
  )
}

export function Progress() {
  const s = useStore()
  const now = Date.now()
  const answered = QUESTIONS.filter(q => s.questions[q.question.id])
  const right = QUESTIONS.filter(q => s.questions[q.question.id]?.last === 'right').length
  const days = streak(s.days, now)

  return (
    <Shell back={href()} backLabel="Home" title="Progress">
      <div className="card stats">
        <div className="stat"><b>{LESSONS.filter(l => s.lessons[l.lesson.id]).length} / {LESSONS.length}</b><span>lessons read</span></div>
        <div className="stat"><b>{answered.length} / {QUESTIONS.length}</b><span>questions tried</span></div>
        <div className="stat"><b>{right}</b><span>right at the last try</span></div>
        <div className="stat"><b>{days}</b><span>{days === 1 ? 'day streak' : 'days streak'}</span></div>
      </div>
      <div className="card tablewrap">
        <table>
          <thead>
            <tr><th>Module</th><th>Lessons read</th><th>Questions right</th><th>Progress</th><th /></tr>
          </thead>
          <tbody>
            {MODULES.map((m, i) => {
              const questions = moduleQuestions(m)
              const n = rightIn(questions, s)
              return (
                <tr key={m.id}>
                  <td><a href={href('m', m.id)}>{i + 1}. {m.title}</a></td>
                  <td>{m.lessons.filter(l => s.lessons[l.id]).length} of {m.lessons.length}</td>
                  <td>{n} of {questions.length}</td>
                  <td><Meter value={questions.length ? n / questions.length : 0} /></td>
                  <td><a className="btn" href={href('drill', m.id)}>Drill</a></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="actions end">
        <button className="btn" onClick={() => window.confirm('Erase your answers and review dates on this device? Your notes and drawings are kept.') && resetProgress()}>Reset progress</button>
        <span className="note">Progress, notes and drawings are saved in this browser only.</span>
      </div>
    </Shell>
  )
}
