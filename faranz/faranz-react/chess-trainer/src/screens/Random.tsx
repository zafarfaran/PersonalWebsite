import { useState } from 'react'
import { Drill } from '../components/Drill'
import { Shell } from '../components/ui'
import { OPENINGS, SIDE_NAME, type Lesson, type Opening } from '../data'
import { FOCUS, FOCUS_WEIGHT, drawLine, randomPool, type Scope } from '../random'
import { href } from '../router'
import { getState, recordLine, updateSettings, useStore } from '../store'

interface Round {
  opening: Opening
  lesson: Lesson
}

/** How many other lines are played before a missed line comes back. */
const RETRY_AFTER = 2

const learnedCount = (off: string[]) =>
  OPENINGS.filter(o => !off.includes(o.id)).reduce((n, o) => n + randomPool(o, getState(), 'learned').length, 0)

/** Lines from every opening in random order, played from memory. Weak lines and the main openings come up more often. */
export function Random() {
  const s = useStore()
  const off = s.settings.randomOff
  const [scope, setScope] = useState<Scope>(() => (learnedCount(getState().settings.randomOff) >= 4 ? 'learned' : 'all'))
  const [round, setRound] = useState<Round | undefined>(() => drawLine(getState(), scope, getState().settings.randomOff))
  const [n, setN] = useState(1)
  const [run, setRun] = useState(0)
  const [tally, setTally] = useState<Record<string, { played: number; clean: number }>>({})
  const [streak, setStreak] = useState(0)
  // missed lines, each with the round number at which it comes back
  const [retry, setRetry] = useState<(Round & { at: number })[]>([])

  const played = Object.values(tally).reduce((sum, t) => sum + t.played, 0)
  const clean = Object.values(tally).reduce((sum, t) => sum + t.clean, 0)
  const total = (sc: Scope, without = off) =>
    OPENINGS.filter(o => !without.includes(o.id)).reduce((sum, o) => sum + randomPool(o, s, sc).length, 0)

  const next = (sc = scope, without = off) => {
    const back = retry.find(r => r.at <= n + 1 && !without.includes(r.opening.id))
    if (back) setRetry(retry.filter(r => r !== back))
    setRound(back ?? drawLine(getState(), sc, without, round?.lesson.id))
    setN(n + 1)
  }

  const onDone = (cleanRun: boolean) => {
    if (!round) return
    recordLine(round.lesson.id, cleanRun, 'match')
    const id = round.opening.id
    setTally(t => ({ ...t, [id]: { played: (t[id]?.played ?? 0) + 1, clean: (t[id]?.clean ?? 0) + (cleanRun ? 1 : 0) } }))
    setStreak(cleanRun ? streak + 1 : 0)
    if (!cleanRun && !retry.some(r => r.lesson === round.lesson)) setRetry([...retry, { ...round, at: n + 1 + RETRY_AFTER }])
  }

  const changeScope = (sc: Scope) => {
    setScope(sc)
    next(sc)
  }
  const toggle = (id: string) => {
    const without = off.includes(id) ? off.filter(x => x !== id) : [...off, id]
    updateSettings({ randomOff: without })
    // the line on the board stays unless its opening was just switched off
    if (!round || without.includes(round.opening.id)) next(scope, without)
  }

  const settings = (
    <div className="card">
      <div className="eyebrow">What comes up</div>
      {OPENINGS.map(o => {
        const on = !off.includes(o.id)
        const t = tally[o.id]
        return (
          <label className="reply pickrow" key={o.id}>
            <input type="checkbox" checked={on} onChange={() => toggle(o.id)} />
            <div className="t">
              <b>{o.name}</b>
              <small>
                as {SIDE_NAME[o.side]} · {randomPool(o, s, scope).length} lines
                {t ? ` · this session ${t.clean} clean of ${t.played}` : ''}
              </small>
            </div>
            {FOCUS.includes(o.id) && <span className="pill see">{FOCUS_WEIGHT}× as often</span>}
          </label>
        )
      })}
      <div className="setting">
        <span>Draw from</span>
        <div className="seg">
          <button className={scope === 'learned' ? 'on' : ''} onClick={() => changeScope('learned')} disabled={!total('learned')}>
            Lines I've learned ({total('learned')})
          </button>
          <button className={scope === 'all' ? 'on' : ''} onClick={() => changeScope('all')}>
            Every line ({total('all')})
          </button>
        </div>
      </div>
      <p className="note">
        Within an opening, lines you have missed or not played yet come up more often than the ones you know. A line you miss comes
        back after {RETRY_AFTER} others. Results feed the same review schedule as Practise.
      </p>
    </div>
  )

  if (!round) {
    return (
      <Shell back={href()} backLabel="Home" title="Random trainer">
        <div className="card">
          <div className="eyebrow">Nothing to draw from</div>
          <p>Tick at least one opening below, or switch to every line.</p>
        </div>
        <div className="below">{settings}</div>
      </Shell>
    )
  }

  const { opening, lesson } = round
  return (
    <Shell
      back={href()}
      backLabel="Home"
      title={`${opening.name} · you are ${SIDE_NAME[opening.side]}`}
      mode="Random trainer"
      right={<span className="count">Line {n}{played > 0 && ` · ${clean} clean of ${played} · streak ${streak}`}</span>}
    >
      <Drill
        key={`${n}-${run}`}
        lesson={lesson}
        side={opening.side}
        mode="match"
        pool={randomPool(opening, s, 'all')}
        onDone={onDone}
        after={
          <>
            <button className="btn primary" onClick={() => next()}>Next random line ▶</button>
            <button className="btn" onClick={() => setRun(run + 1)}>Repeat this line</button>
            <a className="btn" href={href('learn', lesson.id)}>Open the lesson</a>
            {lesson.plan && <a className="btn" href={href('play', lesson.id)}>Play on against the computer</a>}
          </>
        }
      />
      <div className="below">
        {settings}
        <div className="card">
          <div className="eyebrow">This session</div>
          <div className="row">
            <b className="big">{clean}/{played}</b>
            <div className="grow">
              <strong>lines played clean</strong>
              <br />
              <span className="note">
                {played === 0
                  ? 'Play the line on the board from memory. The opening is named above; the line is only named once the moves make it certain.'
                  : `Clean streak: ${streak}. ${retry.length ? `${retry.length} missed ${retry.length === 1 ? 'line is' : 'lines are'} coming back.` : 'No missed lines waiting.'}`}
              </span>
            </div>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => next()}>Skip to another line</button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
