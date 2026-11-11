import { Meter, Shell } from '../components/ui'
import { OPENINGS, drillLines } from '../data'
import { cardsFor, dueLines, lessonsDone } from '../lib'
import { href } from '../router'
import { dueLabel, isDue, streak, strength } from '../srs'
import { resetProgress, useStore } from '../store'

export function Progress() {
  const s = useStore()
  const now = Date.now()
  const due = dueLines(s, now)
  const totalLessons = OPENINGS.reduce((n, o) => n + o.lessons.length, 0)
  const doneLessons = OPENINGS.reduce((n, o) => n + lessonsDone(o, s), 0)
  const allCards = OPENINGS.flatMap(cardsFor)
  const knownCards = allCards.filter(c => (s.cards[c.key]?.box ?? 0) >= 2).length
  const days = streak(s.days, now)

  return (
    <Shell back={href()} backLabel="Home" title="Progress">
      <div className="card stats">
        <div className="stat"><b>{doneLessons} / {totalLessons}</b><span>lessons finished</span></div>
        <div className="stat"><b>{Object.keys(s.lines).length}</b><span>lines learned</span></div>
        <div className="stat"><b>{due.length}</b><span>due today</span></div>
        <div className="stat"><b>{knownCards} / {allCards.length}</b><span>positions memorised</span></div>
        <div className="stat"><b>{days}</b><span>{days === 1 ? 'day streak' : 'days streak'}</span></div>
        <span className="spacer" />
        {due.length > 0 && <a className="btn primary" href={href('practise', 'due')}>Review {due.length} {due.length === 1 ? 'line' : 'lines'}</a>}
      </div>

      <div className="card tablewrap">
        <table>
          <thead>
            <tr><th>Line</th><th>Opening</th><th>Memory</th><th>Last result</th><th>Clean runs</th><th>Next review</th></tr>
          </thead>
          <tbody>
            {OPENINGS.flatMap(o =>
              drillLines(o).map(l => {
                const st = s.lines[l.id]
                return (
                  <tr key={l.id}>
                    <td><a href={href(st ? 'practise' : 'learn', ...(st ? ['line', l.id] : [l.id]))}>{l.title}</a></td>
                    <td>{o.name}</td>
                    <td><Meter value={strength(st)} /></td>
                    <td className={!st || !st.runs ? 'muted' : st.last === 'clean' ? 'good' : 'bad'}>
                      {!st ? 'Not started' : !st.runs ? 'Learned, not drilled' : st.last === 'clean' ? 'Clean' : 'Missed a move'}
                    </td>
                    <td>{st ? `${st.clean} of ${st.runs}` : '–'}</td>
                    <td><span className={'pill' + (isDue(st, now) ? ' due' : '')}>{dueLabel(st, now)}</span></td>
                  </tr>
                )
              }),
            )}
          </tbody>
        </table>
      </div>

      <div className="actions end">
        <button
          className="btn"
          onClick={() => {
            if (window.confirm('Erase all lesson, line and memory progress on this device?')) resetProgress()
          }}
        >
          Reset progress
        </button>
        <span className="note">Progress is saved in this browser only.</span>
      </div>
    </Shell>
  )
}
