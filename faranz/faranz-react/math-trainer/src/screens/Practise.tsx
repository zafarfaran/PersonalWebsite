import { useState } from 'react'
import { dueTricks, mixPool, sample, shuffle } from '../lib'
import { href } from '../router'
import { Session } from '../Session'
import { getState, recordSession } from '../store'
import { trickById, type Trick } from '../tricks'
import { Shell } from '../ui'

/** Which questions to ask, from the route: due | mix | t/<trick>. */
function buildPlan(kind: string, id?: string): Trick[] {
  const s = getState()
  if (kind === 't') {
    const t = id ? trickById(id) : undefined
    return t ? Array(8).fill(t) : []
  }
  if (kind === 'due') return shuffle(dueTricks(s, Date.now()).flatMap(t => [t, t, t]))
  const pool = mixPool(s)
  return Array.from({ length: 10 }, () => sample(pool))
}

export function Practise({ kind, id }: { kind: string; id?: string }) {
  const [round, setRound] = useState(0)
  const [plan, setPlan] = useState(() => buildPlan(kind, id))
  const single = kind === 't' ? trickById(id ?? '') : undefined
  const again = () => {
    setPlan(buildPlan(kind, id))
    setRound(round + 1)
  }

  if (!plan.length) {
    return (
      <Shell back={href()} backLabel="Home" title="Practise">
        <div className="card">
          <div className="eyebrow good">All caught up</div>
          <p>No tricks are due for review right now. Learn a new one, or try mixed practice.</p>
          <div className="actions">
            <a className="btn primary" href={href('practise', 'mix')}>Mixed practice</a>
            <a className="btn" href={href()}>Back to home</a>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title={single ? single.title : kind === 'due' ? 'Review' : 'Mixed practice'}
      mode="Practise"
    >
      <Session
        key={round}
        plan={plan}
        mode={single ? 'recall' : 'mixed'}
        onDone={recordSession}
        after={
          <>
            <button className="btn primary" onClick={again}>{kind === 'due' ? 'Review what is still due' : 'Another set'}</button>
            {single && <a className="btn" href={href('learn', single.id)}>Reread the lesson</a>}
            <a className="btn" href={href()}>Home</a>
          </>
        }
      />
    </Shell>
  )
}
