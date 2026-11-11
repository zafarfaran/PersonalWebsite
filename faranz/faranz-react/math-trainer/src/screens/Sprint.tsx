import { useEffect, useRef, useState } from 'react'
import { learned, mixPool, sample } from '../lib'
import { href } from '../router'
import { getState, recordSprint, useStore } from '../store'
import { fmt, isRight, newProblem, type Problem, type Trick } from '../tricks'
import { AnswerBox, Meter, Shell, Steps } from '../ui'

const SECONDS = 60

interface Miss {
  trick: Trick
  problem: Problem
  given: number
}

const deal = (pool: Trick[]) => {
  const trick = sample(pool)
  return { trick, problem: newProblem(trick) }
}

/** 60 seconds of mixed questions. No help, no pauses: a wrong answer just moves on. */
export function Sprint() {
  const best = useStore().bestSprint
  const [pool] = useState(() => mixPool(getState()))
  const [phase, setPhase] = useState<'ready' | 'run' | 'over'>('ready')
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [asked, setAsked] = useState(0)
  const [misses, setMisses] = useState<Miss[]>([])
  // the most recent answer, if it was wrong
  const [lastMiss, setLastMiss] = useState<Miss | null>(null)
  const [current, setCurrent] = useState(() => deal(pool))
  const end = useRef(0)
  const bestBefore = useRef(best)

  useEffect(() => {
    if (phase !== 'run') return
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end.current - Date.now()) / 1000))
      setLeft(remaining)
      if (remaining === 0) setPhase('over')
    }, 200)
    return () => clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (phase === 'over') recordSprint(score)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    bestBefore.current = getState().bestSprint
    end.current = Date.now() + SECONDS * 1000
    setLeft(SECONDS)
    setScore(0)
    setAsked(0)
    setMisses([])
    setLastMiss(null)
    setCurrent(deal(pool))
    setPhase('run')
  }

  const submit = (value: number) => {
    const miss = isRight(value, current.problem.answer) ? null : { ...current, given: value }
    if (miss) setMisses(m => [...m, miss])
    else setScore(n => n + 1)
    setLastMiss(miss)
    setAsked(n => n + 1)
    setCurrent(deal(pool))
  }

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Sprint"
      mode="60 seconds"
      right={phase === 'run' ? <span className="count">{left}s left · {score} right</span> : <span className="count">Best: {best}</span>}
    >
      {phase === 'ready' && (
        <div className="card result">
          <div className="eyebrow">Ready?</div>
          <div className="move">As many as you can in 60 seconds</div>
          <p>
            Questions come from {learned(getState()).length >= 3 ? `the ${pool.length} tricks you have learned` : `all ${pool.length} tricks`}, in random order.
            There are no hints here. A wrong answer is shown briefly and the next question arrives straight away.
          </p>
          <div className="actions"><button className="btn primary" onClick={start} autoFocus>Start</button></div>
        </div>
      )}

      {phase === 'run' && (
        <div className="trainer">
          <div className="card problem">
            <Meter value={left / SECONDS} />
            <AnswerBox key={asked} q={current.problem.q} onSubmit={submit} />
          </div>
          <div className="panel">
            <div className="card">
              <div className="eyebrow">Score</div>
              <div className="move">{score} right of {asked}</div>
              {lastMiss && (
                <p className="bad">
                  Last miss: {lastMiss.problem.q} = {fmt(lastMiss.problem.answer)} ({lastMiss.trick.title})
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'over' && (
        <>
          <div className="card result">
            <div className={'eyebrow ' + (score > bestBefore.current ? 'good' : '')}>{score > bestBefore.current ? 'New best' : "Time's up"}</div>
            <div className="move">{score} right in 60 seconds</div>
            <p className="muted">{asked} answered, {misses.length} wrong. Previous best: {bestBefore.current}.</p>
            <div className="actions">
              <button className="btn primary" onClick={start}>Go again</button>
              <a className="btn" href={href()}>Home</a>
            </div>
          </div>
          {misses.length > 0 && (
            <div className="below">
              {misses.map((m, i) => (
                <div className="card" key={i}>
                  <div className="eyebrow bad">You answered {fmt(m.given)}</div>
                  <div className="question small">{m.problem.q} = {fmt(m.problem.answer)}</div>
                  <Steps steps={m.problem.steps} />
                  <p className="note"><a href={href('learn', m.trick.id)}>{m.trick.title}</a></p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Shell>
  )
}
