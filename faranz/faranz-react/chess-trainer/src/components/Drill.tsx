import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { clean, lastMoveOf, legalDests, moveLabel, replay, sanOf, squaresOf, type Square } from '../chess'
import { sans, type Lesson } from '../data'
import { Board, type Arrow, type Highlight } from './Board'
import { MoveList } from './ui'

interface Props {
  lesson: Lesson
  /** learn: the move is shown and explained first. practise and match: from memory. */
  mode: 'learn' | 'practise' | 'match'
  /** Match only: the lines Black could be playing, used to hide the line's name until it is certain. */
  pool?: Lesson[]
  onDone: (cleanRun: boolean) => void
  /** Buttons shown once the line is finished. */
  after: ReactNode
}

interface Feedback {
  kind: 'wrong' | 'alt'
  san: string
  text: string
  from: Square
  to: Square
}

const lookup = (map: Record<string, string> | undefined, san: string) =>
  Object.entries(map ?? {}).find(([k]) => clean(k) === clean(san))?.[1]

/** Plays through one line: you move White, Black's replies are played for you. */
export function Drill({ lesson, mode, pool, onDone, after }: Props) {
  const line = useMemo(() => sans(lesson), [lesson])
  const [ply, setPly] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const [hint, setHint] = useState(0) // 0 none, 1 piece highlighted, 2 move shown
  const [slips, setSlips] = useState(0)

  const game = useMemo(() => replay(line, ply), [line, ply])
  const fen = game.fen()
  const done = ply >= line.length
  const yourMove = !done && ply % 2 === 0
  const step = lesson.moves[ply]
  const target = yourMove ? squaresOf(fen, step.san) : null
  const learn = mode === 'learn'

  // Black replies after a short pause
  useEffect(() => {
    if (done || ply % 2 === 0) return
    const t = setTimeout(() => setPly(p => p + 1), 650)
    return () => clearTimeout(t)
  }, [ply, done])

  const reported = useRef(false)
  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true
      onDone(slips === 0)
    }
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const play = (from: Square, to: Square) => {
    const san = sanOf(fen, from, to)
    if (!san || !yourMove) return
    if (clean(san) === clean(step.san)) {
      setFb(null)
      setHint(0)
      setPly(ply + 1)
      return
    }
    const alt = lookup(step.alts, san)
    if (alt) return setFb({ kind: 'alt', san, text: alt, from, to })
    if (!learn) setSlips(s => s + 1)
    setFb({
      kind: 'wrong',
      san,
      from,
      to,
      text:
        lookup(step.mistakes, san) ??
        (learn ? `Follow the arrow: the move here is ${step.san}.` : 'That is a legal move, but it is not the move in this line. Think about what the position needs and try again.'),
    })
  }

  const askHint = () => {
    if (hint === 0) setSlips(s => s + 1)
    setHint(h => Math.min(2, h + 1))
  }

  const last = lastMoveOf(game)
  const highlights: Highlight[] = last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []
  const arrows: Arrow[] = []
  if (target && (learn || hint === 2)) arrows.push({ ...target, color: 'accent' })
  if (target && hint >= 1) highlights.push({ sq: target.from, kind: 'hint' })
  if (fb?.kind === 'wrong') arrows.push({ from: fb.from, to: fb.to, color: 'bad' })

  // match: which of the possible lines are still consistent with the moves so far
  const candidates = pool?.filter(l => sans(l).slice(0, ply).join() === line.slice(0, ply).join()) ?? []
  const revealed = done || candidates.length <= 1

  const prevWhite = ply >= 1 ? lesson.moves[ply % 2 === 0 ? ply - 2 : ply - 1] : null
  const prevWhitePly = ply % 2 === 0 ? ply - 2 : ply - 1
  const prevBlack = ply >= 2 && ply % 2 === 0 ? lesson.moves[ply - 1] : null

  return (
    <div className="trainer">
      <Board fen={fen} coords dests={yourMove ? legalDests(fen) : undefined} onMove={play} highlights={highlights} arrows={arrows} />
      <div className="panel">
        {mode === 'match' && (
          <div className="card">
            <div className="eyebrow">This game Black chose</div>
            <div className={'move' + (revealed ? '' : ' muted')}>{revealed ? lesson.reply : 'Not clear yet'}</div>
            {!revealed && <p className="muted">{candidates.length} replies are still possible. Play your moves and see what Black does.</p>}
          </div>
        )}

        {done ? (
          <div className="card">
            {learn ? (
              <div className="eyebrow good">Lesson complete</div>
            ) : slips === 0 ? (
              <div className="eyebrow good">Clean run</div>
            ) : (
              <div className="eyebrow bad">Finished with {slips} {slips === 1 ? 'slip' : 'slips'}</div>
            )}
            <div className="move">{lesson.title}</div>
            {(learn || revealed) && <p>{lesson.outro}</p>}
            {!learn && <p className="muted">{slips === 0 ? 'This line moves up a level and comes back later.' : 'This line stays in today\'s review until you play it cleanly.'}</p>}
            <div className="actions">{after}</div>
          </div>
        ) : learn ? (
          <div className="card">
            <div className="eyebrow">Coach</div>
            {ply === 0 && <p>{lesson.intro}</p>}
            {prevBlack && (
              <p className="muted">
                Black played {moveLabel(ply - 1)} {prevBlack.san}. {prevBlack.note}
              </p>
            )}
            {yourMove ? (
              <>
                <div className="move">Play {moveLabel(ply)} {step.san}</div>
                <p>{step.note}</p>
                {step.key && <p className="key"><b>Key idea:</b> {step.key}</p>}
                {fb && <p className={fb.kind === 'wrong' ? 'bad' : 'accent'}>{fb.san}: {fb.text}</p>}
              </>
            ) : (
              <p className="muted">Black is replying…</p>
            )}
          </div>
        ) : (
          <div className="card">
            {prevWhite && (
              <>
                <div className="eyebrow good">Correct · {moveLabel(prevWhitePly)} {prevWhite.san}</div>
                <p>{prevWhite.note}</p>
                {prevWhite.key && <p className="key"><b>Key idea:</b> {prevWhite.key}</p>}
              </>
            )}
            {prevBlack && (
              <p className="muted">
                Black replied {moveLabel(ply - 1)} {prevBlack.san}. {prevBlack.note}
              </p>
            )}
            {yourMove ? (
              <>
                <div className="move">{ply === 0 ? 'Your move: start the line' : 'Your move'}</div>
                {fb && (
                  <div className={'feedback ' + fb.kind}>
                    <div className={'eyebrow ' + (fb.kind === 'wrong' ? 'bad' : 'accent')}>
                      {fb.kind === 'wrong' ? 'Not this one' : 'Playable, but not this line'} · {fb.san}
                    </div>
                    <p>{fb.text}</p>
                  </div>
                )}
                {hint === 1 && <p className="accent">Hint: move the highlighted piece.</p>}
                {hint === 2 && <p className="accent">The move is {moveLabel(ply)} {step.san}. Play it on the board.</p>}
              </>
            ) : (
              <p className="muted">Black is replying…</p>
            )}
          </div>
        )}

        <div className="card">
          <div className="eyebrow">Moves so far</div>
          <MoveList moves={line} upto={ply} pending={yourMove} />
        </div>

        {!done && !learn && (
          <div className="actions">
            <button className="btn" onClick={askHint} disabled={!yourMove || hint === 2}>
              {hint === 0 ? 'Hint' : 'Show me the move'}
            </button>
            <span className="note">{slips === 0 ? 'No slips so far' : `${slips} ${slips === 1 ? 'slip' : 'slips'} this line`}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Step through a line with Next and Back; both sides are played for you. */
export function Demo({ lesson, onDone, after }: { lesson: Lesson; onDone: () => void; after: ReactNode }) {
  const line = useMemo(() => sans(lesson), [lesson])
  const [ply, setPly] = useState(0)
  const game = useMemo(() => replay(line, ply), [line, ply])
  const done = ply >= line.length
  const shown = ply > 0 ? lesson.moves[ply - 1] : null
  const last = lastMoveOf(game)

  const reported = useRef(false)
  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true
      onDone()
    }
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPly(p => Math.min(line.length, p + 1))
      if (e.key === 'ArrowLeft') setPly(p => Math.max(0, p - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [line.length])

  return (
    <div className="trainer">
      <Board fen={game.fen()} coords highlights={last ? [{ sq: last.from, kind: 'last' }, { sq: last.to, kind: 'last' }] : []} />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">Coach · watch and step through</div>
          {shown ? (
            <>
              <div className="move">{moveLabel(ply - 1)} {shown.san}</div>
              <p>{shown.note ?? (ply % 2 ? 'White continues.' : 'Black replies.')}</p>
            </>
          ) : (
            <p>{lesson.intro}</p>
          )}
          {done && <p className="key">{lesson.outro}</p>}
        </div>
        <div className="card">
          <div className="eyebrow">Moves so far</div>
          <MoveList moves={line} upto={ply} />
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setPly(ply - 1)} disabled={ply === 0}>◀ Back</button>
          {!done && <button className="btn primary grow" onClick={() => setPly(ply + 1)}>Next ▶</button>}
          {done && after}
        </div>
        {!done && <div className="note">Move {Math.ceil(ply / 2)} of {Math.ceil(line.length / 2)}. You can also use the arrow keys.</div>}
      </div>
    </div>
  )
}
