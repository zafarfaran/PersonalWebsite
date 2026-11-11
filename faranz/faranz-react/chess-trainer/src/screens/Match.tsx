import { useState } from 'react'
import { Drill } from '../components/Drill'
import { Shell } from '../components/ui'
import { drillLines, type Lesson, type Opening } from '../data'
import { learnedLines } from '../lib'
import { href } from '../router'
import { getState, recordLine, useStore } from '../store'

type Scope = 'learned' | 'all'

const pick = (pool: Lesson[], avoid?: Lesson) => {
  const options = pool.length > 1 ? pool.filter(l => l !== avoid) : pool
  return options[Math.floor(Math.random() * options.length)]
}

/** A practice game: Black chooses one of the replies at random and you only find out which as it is played. */
export function Match({ o }: { o: Opening }) {
  const s = useStore()
  const learned = learnedLines(o, s)
  const [scope, setScope] = useState<Scope>(() => (learnedLines(o, getState()).length >= 2 ? 'learned' : 'all'))
  const pool = scope === 'learned' && learned.length ? learned : drillLines(o)
  const [lesson, setLesson] = useState(() => pick(pool))
  const [game, setGame] = useState(1)

  const newMatch = (from = pool) => {
    setLesson(pick(from, lesson))
    setGame(g => g + 1)
  }
  const changeScope = (next: Scope) => {
    setScope(next)
    newMatch(next === 'learned' && learned.length ? learned : drillLines(o))
  }

  return (
    <Shell back={href('o', o.id)} backLabel={o.name} title={o.name} mode="Practice match" right={<span className="count">Match {game}</span>}>
      <Drill
        key={game}
        lesson={lesson}
        mode="match"
        pool={pool}
        onDone={cleanRun => recordLine(lesson.id, cleanRun, 'match')}
        after={
          <>
            <button className="btn primary" onClick={() => newMatch()}>New match</button>
            {lesson.plan && <a className="btn" href={href('play', lesson.id)}>Play on against the computer</a>}
          </>
        }
      />

      <div className="below">
        <div className="card">
          <div className="eyebrow">Replies Black can choose from</div>
          {pool.map(l => {
            const st = s.lines[l.id]
            return (
              <div className="reply" key={l.id}>
                <div className="t">
                  <b>{l.reply}</b>
                  <small>
                    {st?.matches
                      ? `Faced ${st.matches} ${st.matches === 1 ? 'time' : 'times'} · ${st.matchClean} clean`
                      : 'Not faced in a match yet'}
                  </small>
                </div>
                <span className="pill">{!st ? 'New' : st.last === 'clean' ? 'Solid' : 'Shaky'}</span>
              </div>
            )
          })}
        </div>
        <div className="card">
          <div className="eyebrow">Match settings</div>
          <div className="setting">
            <span>Black plays</span>
            <div className="seg">
              <button className={scope === 'learned' ? 'on' : ''} onClick={() => changeScope('learned')} disabled={!learned.length}>
                Lines I've learned ({learned.length})
              </button>
              <button className={scope === 'all' ? 'on' : ''} onClick={() => changeScope('all')}>
                Every reply ({drillLines(o).length})
              </button>
            </div>
          </div>
          <p className="note">Changing this starts a new match. A wrong move is corrected on the spot, and the result feeds the same review schedule as Practise.</p>
          <div className="actions"><button className="btn" onClick={() => newMatch()}>New match</button></div>
        </div>
      </div>
    </Shell>
  )
}
