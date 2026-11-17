import { useState, type ReactNode } from 'react'
import { Chess } from 'chess.js'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { clean, legalDests, moveLabel, sanOf, squaresOf, turnOf, type Square } from '../chess'
import { SIDE_NAME, lessonById } from '../data'
import { STRATEGY, STRATEGY_GROUPS, STRATEGY_TASKS, taskStart, type StrategyLesson, type StrategyTask } from '../data/strategy'
import { shuffle } from '../lib'
import { href } from '../router'
import { getState, recordStrategy, useStore } from '../store'
import { Demo } from './Endgames'

const ROUND = 8
const STATUS = ['not solved yet', 'solved with help', 'solved']

/** The strategy lessons, and the drill that mixes their positions. */
export function Strategy() {
  const solved = useStore().strategy
  const done = STRATEGY_TASKS.filter(t => solved[t.task.id]).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Strategy"
      right={
        <>
          <Meter value={done / STRATEGY_TASKS.length} />
          <span className="count">{done} of {STRATEGY_TASKS.length} positions solved</span>
        </>
      }
    >
      <p className="muted">
        Tactics win what is hanging. Strategy is everything else: what the pawns in the centre are doing, which side of the board to play on, where each piece belongs, and when
        a pawn is worth less than a move. Each lesson explains one idea, shows it in a game you can step through, most of them from your own openings, and then gives you a
        position in which you have to find the move yourself.
      </p>
      <h2 className="sidehead">Drill</h2>
      <div className="card">
        <div className="reply">
          <div className="t">
            <b>Find the plan</b>
            <small>Positions from all the lessons in random order. You are told what to aim for; you find the move. {done} of {STRATEGY_TASKS.length} solved so far.</small>
          </div>
          <a className="btn primary" href={href('strategy', 'drill')}>Start</a>
        </div>
      </div>
      {STRATEGY_GROUPS.map(group => (
        <section key={group}>
          <h2 className="sidehead">{group}</h2>
          <div className="card">
            {STRATEGY.filter(l => l.group === group).map(l => {
              const n = l.tasks.filter(t => solved[t.id]).length
              return (
                <a className="topic" key={l.id} href={href('strategy', l.id)}>
                  {l.tasks.length > 0 && <span className="pill">{n === l.tasks.length ? '✓ ' : ''}{n} of {l.tasks.length}</span>}
                  <b>{l.title}</b>
                  <small>{l.summary}</small>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </Shell>
  )
}

/** One lesson: the idea, the rules to remember, an example to step through and the positions to solve. */
export function StrategyLessonPage({ lesson }: { lesson: StrategyLesson }) {
  const solved = useStore().strategy
  const next = STRATEGY[STRATEGY.indexOf(lesson) + 1]
  const see = (lesson.see ?? []).map(id => lessonById(id)!)

  return (
    <Shell back={href('strategy')} backLabel="Strategy" title={lesson.title} mode={lesson.group}>
      <div className="theory">
        <div className="panel text">
          <div className="card">
            <div className="eyebrow">The idea</div>
            {lesson.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="card">
            <div className="eyebrow">Remember</div>
            <ul className="rules">{lesson.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
          <div className="card">
            <div className="eyebrow">{lesson.tasks.length ? 'Your turn' : 'Nothing to solve here'}</div>
            {lesson.tasks.length === 0 && <p>This lesson is a checklist. Use it in the drill, and in your own games.</p>}
            {lesson.tasks.map((t, i) => (
              <div className="reply" key={t.id}>
                <div className="t">
                  <b>Position {i + 1}</b>
                  <small>Find the move as {SIDE_NAME[turnOf(taskStart(t).fen)]} · {STATUS[solved[t.id] ?? 0]}</small>
                </div>
                <a className={'btn' + (solved[t.id] ? '' : ' primary')} href={href('strategy', lesson.id, t.id)}>{solved[t.id] ? 'Again' : 'Solve'}</a>
              </div>
            ))}
            <div className="actions">
              {lesson.link && <a className="btn" href={href(...lesson.link.to)}>{lesson.link.label}</a>}
              {next && <a className="btn" href={href('strategy', next.id)}>Next lesson: {next.title}</a>}
            </div>
          </div>
          {see.length > 0 && (
            <div className="card">
              <div className="eyebrow">In your openings</div>
              {see.map(({ opening, lesson: l }) => (
                <a className="topic" key={l.id} href={href('learn', l.id)}>
                  <b>{l.title}</b>
                  <small>{opening.name} · {l.blurb}</small>
                </a>
              ))}
            </div>
          )}
        </div>
        {lesson.demo && <Demo demo={lesson.demo} />}
      </div>
    </Shell>
  )
}

/** One position of a lesson, on its own page. */
export function StrategyTaskPage({ lesson, task }: { lesson: StrategyLesson; task: StrategyTask }) {
  const at = STRATEGY_TASKS.findIndex(t => t.task === task)
  const next = STRATEGY_TASKS[at + 1]

  return (
    <Shell back={href('strategy', lesson.id)} backLabel={lesson.title} title="Your turn" mode={lesson.title}>
      <TaskBoard
        lesson={lesson}
        task={task}
        after={
          <>
            {next && <a className="btn primary" href={href('strategy', next.lesson.id, next.task.id)}>Next position</a>}
            <a className={'btn' + (next ? '' : ' primary')} href={href('strategy', lesson.id)}>Back to the lesson</a>
          </>
        }
      />
    </Shell>
  )
}

/** A round of positions from all the lessons. */
export function StrategyDrill() {
  const [round, setRound] = useState(0)
  return <DrillRound key={round} again={() => setRound(round + 1)} />
}

function DrillRound({ again }: { again: () => void }) {
  const [deck] = useState(() => {
    // positions you have not solved come first, then the ones you needed help with
    const seen = getState().strategy
    return shuffle(STRATEGY_TASKS).sort((a, b) => (seen[a.task.id] ?? 0) - (seen[b.task.id] ?? 0)).slice(0, ROUND)
  })
  const [at, setAt] = useState(0)
  const [score, setScore] = useState(0)

  if (at >= deck.length) {
    return (
      <Shell back={href('strategy')} backLabel="Strategy" title="Find the plan">
        <div className="card">
          <div className="eyebrow">Round over</div>
          <div className="move">{score} of {deck.length} at the first try</div>
          <p>
            {score === deck.length
              ? 'Every one. The positions you have not had yet come first in the next round.'
              : 'The ones you needed help with come back in a later round. The lesson behind each position explains the idea.'}
          </p>
          <div className="actions">
            <button className="btn primary" onClick={again}>Another round</button>
            <a className="btn" href={href('strategy', 'plan')}>How to find a plan</a>
            <a className="btn" href={href('strategy')}>Back to Strategy</a>
          </div>
        </div>
      </Shell>
    )
  }

  const { lesson, task } = deck[at]
  return (
    <Shell back={href('strategy')} backLabel="Strategy" title="Find the plan" right={<span className="count">Position {at + 1} of {deck.length} · {score} at the first try</span>}>
      <TaskBoard
        key={task.id}
        lesson={lesson}
        task={task}
        after={first => (
          <>
            <button className="btn primary" onClick={() => { setScore(score + (first ? 1 : 0)); setAt(at + 1) }}>
              {at === deck.length - 1 ? 'Finish the round' : 'Next position'}
            </button>
            <a className="btn" href={href('strategy', lesson.id)}>The lesson: {lesson.title}</a>
          </>
        )}
      />
    </Shell>
  )
}

/**
 * The board for one position. A wrong move is taken back with a hint; after
 * that you can try again or ask for the answer. `after` is shown once the move
 * is on the board, and is told whether you found it at the first try.
 */
function TaskBoard({ lesson, task, after }: { lesson: StrategyLesson; task: StrategyTask; after: ReactNode | ((clean: boolean) => ReactNode) }) {
  const [start] = useState(() => taskStart(task))
  const [wrong, setWrong] = useState<string[]>([])
  const [played, setPlayed] = useState<string | null>(null)
  const [shown, setShown] = useState(false)
  const you = turnOf(start.fen)
  const firstTry = wrong.length === 0 && !shown

  const play = (from: Square, to: Square) => {
    const san = sanOf(start.fen, from, to)
    if (!san) return
    if (task.good.includes(clean(san))) {
      setPlayed(san)
      recordStrategy(task.id, firstTry)
    } else setWrong([...wrong, san])
  }
  const reveal = () => {
    setShown(true)
    setPlayed(new Chess(start.fen).move(task.good[0]).san)
    recordStrategy(task.id, false)
  }

  const at = squaresOf(start.fen, played ?? task.good[0])
  const last = played ? at : start.last
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const arrows: Arrow[] = played && at ? [{ ...at, color: 'good' }] : []
  const miss = wrong[wrong.length - 1]

  return (
    <div className="trainer">
      <Board
        fen={played ? new Chess(start.fen).move(played).after : start.fen}
        coords
        markable
        flip={you === 'b'}
        dests={played ? undefined : legalDests(start.fen)}
        onMove={play}
        highlights={highlights}
        arrows={arrows}
      />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">{lesson.title} · you are {SIDE_NAME[you]}</div>
          {start.moves.length > 0 && <p className="note">After {start.moves.map((san, i) => (i % 2 === 0 ? `${moveLabel(i)} ${san}` : san)).join(' ')}</p>}
          <p><b>{task.ask}</b></p>

          {!played && miss && (
            <>
              <p className="bad">{miss} is not the move.</p>
              <p>{task.hint}</p>
              <div className="actions">
                <button className="btn" onClick={reveal}>Show the answer</button>
              </div>
            </>
          )}

          {played && (
            <>
              <p className={shown ? 'accent' : 'good'}>{shown ? `The move is ${played}.` : `${played} is the move.`}</p>
              <p>{task.why}</p>
              {task.good.length > 1 && <p className="note">Moves that count here: {task.good.join(', ')}.</p>}
              <div className="actions">{typeof after === 'function' ? after(firstTry) : after}</div>
            </>
          )}
        </div>

        <div className="card">
          <div className="eyebrow">Remember</div>
          <ul className="rules">{lesson.rules.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}
