import { dueTricks, learned, nextTrick } from '../lib'
import { href } from '../router'
import { streak } from '../srs'
import { useStore } from '../store'
import { CHAPTERS, TRICKS, type Chapter } from '../tricks'
import { Meter } from '../ui'

export function Home() {
  const s = useStore()
  const now = Date.now()
  const due = dueTricks(s, now)
  const days = streak(s.days, now)
  const done = TRICKS.filter(t => s.lessons[t.id]).length
  const next = nextTrick(s)
  let n = 0

  return (
    <main className="screen">
      <div className="hero">
        <h1>
          <span className="good">~/math</span> <span className="accent">$</span> mental-trainer
        </h1>
        <p>Mental arithmetic, one trick at a time: learn the shortcut, practise it with the method alongside, then drill it until it is automatic.</p>
      </div>

      <div className="card row">
        <b className="big">{due.length}</b>
        <div className="grow">
          <strong>{due.length === 1 ? 'trick due for review today' : 'tricks due for review today'}</strong>
          <br />
          <span className="note">
            {due.length ? 'Tricks you missed come back sooner. Tricks you know come back later.' : 'Nothing is due. Learn the next trick or try a sprint.'}
            {days > 0 && ` Practice streak: ${days} ${days === 1 ? 'day' : 'days'}.`}
          </span>
        </div>
        {due.length > 0 && <a className="btn primary" href={href('practise', 'due')}>Start review</a>}
        <a className="btn" href={href('learn', next.id)}>{done === 0 ? 'Start the first lesson' : done === TRICKS.length ? 'Revisit lessons' : 'Next lesson'}</a>
      </div>

      <div className="modes">
        <a className="mode" href={href('practise', 'mix')}>
          <b>Practise</b>
          <span>Mixed questions from {learned(s).length >= 3 ? 'the tricks you have learned' : 'every trick'}. You have to spot which trick fits.</span>
        </a>
        <a className="mode" href={href('sprint')}>
          <b>Sprint</b>
          <span>60 seconds, as many as you can. Best so far: {s.bestSprint}.</span>
        </a>
        <a className="mode" href={href('memorise')}>
          <b>Memorise</b>
          <span>Times tables, squares and fraction percentages on repeating cards.</span>
        </a>
        <a className="mode" href={href('progress')}>
          <b>Progress</b>
          <span>Accuracy and speed for every trick.</span>
        </a>
      </div>

      <div className="apphead tricks-head">
        <h2 className="crumb">The tricks</h2>
        <span className="spacer" />
        <Meter value={done / TRICKS.length} />
        <span className="count">{done} of {TRICKS.length} lessons done</span>
      </div>
      {(Object.keys(CHAPTERS) as Chapter[]).map(ch => (
        <div className="chapter" key={ch}>
          <h3>{CHAPTERS[ch]}</h3>
          <div className="lessons">
            {TRICKS.filter(t => t.chapter === ch).map(t => {
              n++
              const isDone = !!s.lessons[t.id]
              return (
                <a key={t.id} className={'lesson' + (isDone ? ' done' : '') + (t.id === next.id && !isDone ? ' now' : '')} href={href('learn', t.id)}>
                  <span className="dot">{isDone ? '✓' : n}</span>
                  <span className="t">
                    {t.title}
                    <small>{t.blurb}</small>
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </main>
  )
}

export function NotFound() {
  return (
    <main className="screen">
      <div className="card">
        <div className="eyebrow">Not found</div>
        <p>There is nothing at this address.</p>
        <div className="actions"><a className="btn primary" href={href()}>Back to home</a></div>
      </div>
    </main>
  )
}
