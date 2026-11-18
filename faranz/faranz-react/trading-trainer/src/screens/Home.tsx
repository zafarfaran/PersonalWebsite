import { Meter, Shell } from '../components/ui'
import { MODULES } from '../content'
import { QUESTIONS, dueQuestions, moduleQuestions, nextLesson, rightIn } from '../lib'
import { href } from '../router'
import { streak } from '../srs'
import { useStore } from '../store'
import type { Module } from '../types'

export function Home() {
  const s = useStore()
  const now = Date.now()
  const due = dueQuestions(s, now)
  const days = streak(s.days, now)
  const weak = QUESTIONS.filter(q => s.questions[q.question.id]?.last === 'wrong').length

  return (
    <main className="screen">
      <div className="hero">
        <h1>
          <span className="good">~/trading</span> <span className="accent">$</span> trainer
        </h1>
        <p>
          Day trading options from the first share to a tested plan, one idea at a time: how markets work, reading price, options and the Greeks, volatility, spreads, risk
          and the intraday playbook. Every lesson has a page to read, a figure to play with and questions to answer: trades to judge, numbers to work out, code to read and
          write, and plans to design. It teaches how trading works. It is not financial advice.
        </p>
      </div>

      <div className="card row">
        <b className="big">{due.length}</b>
        <div className="grow">
          <strong>{due.length === 1 ? 'question due for review today' : 'questions due for review today'}</strong>
          <br />
          <span className="note">
            {due.length ? 'Questions you missed come back sooner. The ones you know come back later.' : 'Nothing is due. Start a lesson, or take a mixed drill.'}
            {days > 0 && ` Practice streak: ${days} ${days === 1 ? 'day' : 'days'}.`}
          </span>
        </div>
        {due.length > 0 && <a className="btn primary" href={href('drill', 'due')}>Start review</a>}
        <a className="btn" href={href('drill', 'mixed')}>Mixed drill</a>
        {weak > 0 && <a className="btn" href={href('drill', 'weak')}>Fix {weak} missed</a>}
      </div>

      <h2 className="sidehead">The course</h2>
      <div className="modules">
        {MODULES.map((m, i) => <ModuleCard key={m.id} m={m} n={i + 1} />)}
      </div>
    </main>
  )
}

function ModuleCard({ m, n }: { m: Module; n: number }) {
  const s = useStore()
  const questions = moduleQuestions(m)
  const right = rightIn(questions, s)
  const next = nextLesson(m, s)
  const started = questions.some(q => s.questions[q.id]) || m.lessons.some(l => s.lessons[l.id])
  return (
    <div className="card module">
      <div className="eyebrow">Module {n}</div>
      <h2><a href={href('m', m.id)}>{m.title}</a></h2>
      <p className="note">{m.summary}</p>
      <Meter value={questions.length ? right / questions.length : 0} />
      <div className="count">{m.lessons.length} lessons · {right} of {questions.length} questions right</div>
      <div className="actions">
        <a className="btn primary" href={href('l', next.id)}>{!started ? 'Start' : right === questions.length ? 'Revisit' : 'Continue'}</a>
        <a className="btn" href={href('m', m.id)}>Lessons</a>
      </div>
      <div className="note">Next: {next.title}</div>
    </div>
  )
}

export function NotFound({ what }: { what: string }) {
  return (
    <Shell back={href()} backLabel="Home" title="Not found">
      <div className="card">
        <p>There is no {what} at this address.</p>
        <div className="actions"><a className="btn primary" href={href()}>Back to home</a></div>
      </div>
    </Shell>
  )
}
