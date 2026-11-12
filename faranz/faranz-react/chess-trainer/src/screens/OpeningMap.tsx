import { Board } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { CHAPTERS, TRAP_NAME, chapterName, type Chapter, type Opening } from '../data'
import { lessonsDone, nextLesson } from '../lib'
import { href } from '../router'
import { useStore } from '../store'

export function OpeningMap({ o }: { o: Opening }) {
  const s = useStore()
  const done = lessonsDone(o, s)
  const next = nextLesson(o, s)
  let n = 0

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title={o.name}
      right={
        <>
          <Meter value={done / o.lessons.length} />
          <span className="count">{done} of {o.lessons.length} done</span>
        </>
      }
    >
      <div className="mapwrap">
        <div>
          {(Object.keys(CHAPTERS) as Chapter[]).filter(ch => o.lessons.some(l => l.chapter === ch)).map(ch => (
            <div className="chapter" key={ch}>
              <h2>{chapterName(ch, o)}</h2>
              {o.lessons.filter(l => l.chapter === ch).map(l => {
                n++
                const isDone = !!s.lessons[l.id]
                const isNext = l.id === next.id && !isDone
                return (
                  <a key={l.id} className={'lesson' + (isDone ? ' done' : '') + (isNext ? ' now' : '')} href={href('learn', l.id)}>
                    <span className="dot">{isDone ? '✓' : n}</span>
                    <span className="t">
                      {l.title}
                      <small>{l.blurb}</small>
                    </span>
                    {l.trap && <span className={'pill ' + l.trap}>{TRAP_NAME[l.trap]}</span>}
                    <span className="pill">{l.kind === 'demo' ? 'Watch' : 'Play'}</span>
                  </a>
                )
              })}
            </div>
          ))}
        </div>
        <div className="card side">
          <div className="eyebrow">Your target setup</div>
          <Board fen={o.setupFen + ' w - - 0 1'} flip={o.side === 'b'} />
          <p className="note">{o.setupNote}</p>
          <a className="btn" href={href('practise', 'o', o.id)}>Practise the lines</a>
          <a className="btn" href={href('match', o.id)}>Play a practice match</a>
          <a className="btn" href={href('game', o.id)}>Play a full game</a>
          <a className="btn" href={href('memorise', o.id)}>Memory trainer</a>
          <a className="btn" href={href('map', o.id)}>Lesson map</a>
        </div>
      </div>
    </Shell>
  )
}
