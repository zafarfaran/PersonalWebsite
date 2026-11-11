import { dueTricks } from '../lib'
import { href } from '../router'
import { dueLabel, isDue, streak, strength } from '../srs'
import { resetProgress, useStore } from '../store'
import { CHAPTERS, DECKS, TRICKS } from '../tricks'
import { Meter, Shell } from '../ui'

export function Progress() {
  const s = useStore()
  const now = Date.now()
  const due = dueTricks(s, now)
  const facts = Object.values(DECKS).flatMap(d => d.facts)
  const known = facts.filter(f => (s.cards[f.key]?.box ?? 0) >= 2).length
  const days = streak(s.days, now)

  return (
    <Shell back={href()} backLabel="Home" title="Progress">
      <div className="card stats">
        <div className="stat"><b>{TRICKS.filter(t => s.lessons[t.id]).length} / {TRICKS.length}</b><span>lessons finished</span></div>
        <div className="stat"><b>{due.length}</b><span>tricks due today</span></div>
        <div className="stat"><b>{known} / {facts.length}</b><span>facts memorised</span></div>
        <div className="stat"><b>{s.bestSprint}</b><span>best sprint</span></div>
        <div className="stat"><b>{days}</b><span>{days === 1 ? 'day streak' : 'days streak'}</span></div>
        <span className="spacer" />
        {due.length > 0 && <a className="btn primary" href={href('practise', 'due')}>Review {due.length} {due.length === 1 ? 'trick' : 'tricks'}</a>}
      </div>

      <div className="card tablewrap">
        <table>
          <thead>
            <tr><th>Trick</th><th>Topic</th><th>Memory</th><th>Accuracy</th><th>Average time</th><th>Next review</th></tr>
          </thead>
          <tbody>
            {TRICKS.map(t => {
              const st = s.tricks[t.id]
              return (
                <tr key={t.id}>
                  <td><a href={href(st ? 'practise' : 'learn', ...(st ? ['t', t.id] : [t.id]))}>{t.title}</a></td>
                  <td>{CHAPTERS[t.chapter]}</td>
                  <td><Meter value={strength(st)} /></td>
                  <td className={!st?.answered ? 'muted' : st.correct / st.answered >= 0.8 ? 'good' : 'bad'}>
                    {st?.answered ? `${Math.round((st.correct / st.answered) * 100)}% of ${st.answered}` : st ? 'Learned, not drilled' : 'Not started'}
                  </td>
                  <td>{st?.answered ? `${(st.ms / st.answered / 1000).toFixed(1)}s` : '–'}</td>
                  <td><span className={'pill' + (isDue(st, now) ? ' due' : '')}>{dueLabel(st, now)}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="actions end">
        <button
          className="btn"
          onClick={() => {
            if (window.confirm('Erase all lesson, trick and memory progress on this device?')) resetProgress()
          }}
        >
          Reset progress
        </button>
        <span className="note">Progress is saved in this browser only.</span>
      </div>
    </Shell>
  )
}
