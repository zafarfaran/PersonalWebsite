import { useState } from 'react'
import { href } from '../router'
import { Session } from '../Session'
import { completeLesson } from '../store'
import { CHAPTERS, TRICKS, exampleOf, fmt, type Trick } from '../tricks'
import { Shell, Steps } from '../ui'

const GUIDED = 4

/** A lesson: the rule, why it works and a worked example, then a few questions with the method alongside. */
export function Learn({ trick }: { trick: Trick }) {
  const [stage, setStage] = useState<'read' | 'try'>('read')
  const i = TRICKS.indexOf(trick)
  const next = TRICKS[i + 1]
  const example = exampleOf(trick)

  return (
    <Shell
      back={href()}
      backLabel="All tricks"
      title={trick.title}
      mode={stage === 'read' ? 'Learn' : 'Try it'}
      right={<span className="count">{CHAPTERS[trick.chapter]} · lesson {i + 1} of {TRICKS.length}</span>}
    >
      {stage === 'read' ? (
        <div className="trainer">
          <div className="card">
            <div className="eyebrow">The trick</div>
            <div className="move">{trick.rule}</div>
            <div className="eyebrow sub">Method</div>
            <Steps steps={trick.how} />
            <div className="eyebrow sub">Why it works</div>
            <p>{trick.why}</p>
          </div>
          <div className="panel">
            <div className="card">
              <div className="eyebrow">Worked example</div>
              <div className="question small">{example.q}</div>
              <Steps steps={example.steps} />
              <p className="key"><b>{example.q} = {fmt(example.answer)}</b></p>
            </div>
            <div className="actions">
              <button className="btn primary grow" onClick={() => setStage('try')}>Try {GUIDED} questions with the method alongside</button>
            </div>
          </div>
        </div>
      ) : (
        <Session
          plan={Array(GUIDED).fill(trick)}
          mode="guided"
          onDone={() => completeLesson(trick.id)}
          after={
            <>
              <a className="btn primary" href={href('practise', 't', trick.id)}>Practise this trick from memory</a>
              {next && <a className="btn" href={href('learn', next.id)}>Next lesson</a>}
              <a className="btn" href={href()}>All tricks</a>
            </>
          }
        />
      )}
    </Shell>
  )
}
