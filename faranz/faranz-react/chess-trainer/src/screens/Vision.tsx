import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Chess } from 'chess.js'
import { Board, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { clean, legalDests, replay, sanOf, type Square } from '../chess'
import { OPENINGS, sans } from '../data'
import { href } from '../router'
import { recordVision, useStore } from '../store'

const FILES = 'abcdefgh'
const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1'
const SECONDS = 30
const SET = 10
const ri = (n: number) => Math.floor(Math.random() * n)
const randomSquare = (not?: Square): Square => {
  const sq = FILES[ri(8)] + (1 + ri(8))
  return sq === not ? randomSquare(not) : sq
}
/** a1 is dark; a square is dark when its file number plus its rank is even. */
export const isDark = (sq: Square) => (FILES.indexOf(sq[0]) + 1 + +sq[1]) % 2 === 0

const NAMES: Record<string, string> = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' }

/** Put a move in standard notation into words, e.g. "Nxe5+" -> "Knight takes on e5, with check". */
export function inWords(san: string): string {
  const tail = san.endsWith('#') ? ', checkmate' : san.endsWith('+') ? ', with check' : ''
  const core = clean(san)
  if (core === 'O-O') return 'Castle kingside' + tail
  if (core === 'O-O-O') return 'Castle queenside' + tail
  const [body, promo] = core.split('=')
  const dest = body.slice(-2)
  const takes = body.includes('x')
  const piece = NAMES[body[0]]
  const from = body.slice(piece ? 1 : 0, -2).replace('x', '')
  const who = piece
    ? piece + (from ? ` from ${/\d/.test(from) && from.length === 1 ? `rank ${from}` : from.length === 1 ? `the ${from}-file` : from}` : '')
    : from ? `Pawn on the ${from}-file` : 'Pawn'
  return `${who} ${takes ? 'takes on' : 'to'} ${dest}${promo ? `, promoting to a ${NAMES[promo].toLowerCase()}` : ''}${tail}`
}

const EXERCISES = {
  find: 'Find the square',
  name: 'Name the square',
  colour: 'Light or dark?',
  play: 'Play the move',
  write: 'Name the move',
} as const
type Exercise = keyof typeof EXERCISES

export function Vision() {
  const [tab, setTab] = useState<Exercise>('find')
  const best = useStore().vision[tab] ?? 0
  return (
    <Shell back={href()} backLabel="Home" title="Board trainer" mode="Notation and board vision" right={<span className="count">Best: {best}</span>}>
      <div className="seg tabs">
        {(Object.keys(EXERCISES) as Exercise[]).map(id => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{EXERCISES[id]}</button>
        ))}
      </div>
      {tab === 'find' && <FindSquare />}
      {tab === 'name' && <NameSquare />}
      {tab === 'colour' && <Colour />}
      {tab === 'play' && <MoveSet key="play" exercise="play" />}
      {tab === 'write' && <MoveSet key="write" exercise="write" />}
    </Shell>
  )
}

function Primer() {
  return (
    <div className="card">
      <div className="eyebrow">How notation works</div>
      <ul className="primer">
        <li><b>Files</b> are the columns, lettered a to h from White's left. <b>Ranks</b> are the rows, numbered 1 to 8 starting from White's side.</li>
        <li>A square is named file first, then rank: <b>e4</b>.</li>
        <li>Pieces: <b>K</b> king, <b>Q</b> queen, <b>R</b> rook, <b>B</b> bishop, <b>N</b> knight. Pawns have no letter.</li>
        <li><b>Nf3</b> means a knight moves to f3. <b>e4</b> means a pawn moves to e4.</li>
        <li><b>x</b> is a capture: <b>Bxf7</b> is bishop takes on f7, and <b>exd5</b> is the e-pawn taking on d5.</li>
        <li><b>+</b> is check, <b>#</b> is checkmate. <b>O-O</b> is castling kingside, <b>O-O-O</b> queenside.</li>
        <li>When two of the same piece could go to a square, a letter says which: <b>Nbd2</b> is the knight from the b-file.</li>
        <li>Colours: <b>a1 is dark</b>. Count the file as a number (a = 1 … h = 8) and add the rank: an even total is dark, odd is light.</li>
      </ul>
    </div>
  )
}

/** A 30-second round: score as many as you can. */
function useRound(exercise: Exercise) {
  const [phase, setPhase] = useState<'ready' | 'run' | 'over'>('ready')
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const end = useRef(0)
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
    if (phase === 'over') recordVision(exercise, score)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps
  return {
    phase,
    left,
    score,
    misses,
    start: () => {
      end.current = Date.now() + SECONDS * 1000
      setLeft(SECONDS)
      setScore(0)
      setMisses(0)
      setPhase('run')
    },
    mark: (ok: boolean) => (ok ? setScore(n => n + 1) : setMisses(n => n + 1)),
  }
}

/** The side panel shared by the timed exercises: start, score and results. */
function RoundPanel({ round, exercise, intro, children }: { round: ReturnType<typeof useRound>; exercise: Exercise; intro: string; children?: ReactNode }) {
  const best = useStore().vision[exercise] ?? 0
  return (
    <div className="panel">
      <div className="card">
        <div className="eyebrow">{EXERCISES[exercise]} · {SECONDS} seconds</div>
        {round.phase === 'ready' && (
          <>
            <p>{intro}</p>
            <div className="actions"><button className="btn primary" onClick={round.start}>Start</button></div>
          </>
        )}
        {round.phase === 'run' && (
          <>
            <Meter value={round.left / SECONDS} />
            {children}
            <p className="note">{round.score} right · {round.misses} wrong · {round.left}s left</p>
          </>
        )}
        {round.phase === 'over' && (
          <>
            <div className={'move ' + (round.score >= best && round.score > 0 ? 'good' : '')}>{round.score} right in {SECONDS} seconds</div>
            <p className="muted">{round.misses} wrong. Your best is {Math.max(best, round.score)}.</p>
            <div className="actions"><button className="btn primary" onClick={round.start}>Go again</button></div>
          </>
        )}
      </div>
      <Primer />
    </div>
  )
}

function FindSquare() {
  const round = useRound('find')
  const [target, setTarget] = useState(randomSquare)
  const [flash, setFlash] = useState<Highlight[]>([])
  const [coords, setCoords] = useState(false)
  const busy = flash.length > 0

  const click = (sq: Square) => {
    if (round.phase !== 'run' || busy) return
    const ok = sq === target
    round.mark(ok)
    // on a miss, show where the square really is before moving on
    setFlash(ok ? [{ sq, kind: 'good' }] : [{ sq, kind: 'bad' }, { sq: target, kind: 'good' }])
    setTimeout(() => {
      setFlash([])
      setTarget(randomSquare(target))
    }, ok ? 250 : 900)
  }

  return (
    <div className="trainer">
      <Board fen={EMPTY} coords={coords} onSquare={click} highlights={flash} />
      <RoundPanel round={round} exercise="find" intro="A square name appears. Click that square on the empty board as fast as you can.">
        <div className="bigname">{target}</div>
        <p className="muted">Click this square.</p>
        <label className="check">
          <input type="checkbox" checked={coords} onChange={e => setCoords(e.target.checked)} /> Show the letters and numbers on the board (easier)
        </label>
      </RoundPanel>
    </div>
  )
}

function NameSquare() {
  const round = useRound('name')
  const [target, setTarget] = useState(randomSquare)
  const [file, setFile] = useState('')
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null)

  const answer = (f: string, r: string) => {
    const ok = f + r === target
    round.mark(ok)
    setSaid({ ok, text: ok ? `Yes, ${target}` : `That was ${target}, not ${f}${r}` })
    setFile('')
    setTarget(randomSquare(target))
  }
  const press = (ch: string) => {
    if (round.phase !== 'run') return
    if (FILES.includes(ch)) setFile(ch)
    else if (/^[1-8]$/.test(ch) && file) answer(file, ch)
  }
  const latest = useRef(press)
  latest.current = press
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => latest.current(e.key.toLowerCase())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="trainer">
      <Board fen={EMPTY} highlights={round.phase === 'run' ? [{ sq: target, kind: 'hint' }] : []} />
      <RoundPanel round={round} exercise="name" intro="A square lights up. Give its name: the file letter first, then the rank number. You can tap the buttons or type on the keyboard.">
        <div className="bigname">{file || '?'}<span className="muted">{file ? '?' : ''}</span></div>
        <div className="keys">
          {[...FILES].map(f => <button key={f} className={'btn' + (file === f ? ' primary' : '')} onClick={() => press(f)}>{f}</button>)}
        </div>
        <div className="keys">
          {'12345678'.split('').map(r => <button key={r} className="btn" disabled={!file} onClick={() => press(r)}>{r}</button>)}
        </div>
        {said && <p className={said.ok ? 'good' : 'bad'}>{said.text}</p>}
      </RoundPanel>
    </div>
  )
}

function Colour() {
  const round = useRound('colour')
  const [target, setTarget] = useState(randomSquare)
  const [said, setSaid] = useState<{ ok: boolean; sq: Square } | null>(null)

  const answer = (dark: boolean) => {
    if (round.phase !== 'run') return
    const ok = dark === isDark(target)
    round.mark(ok)
    setSaid({ ok, sq: target })
    setTarget(randomSquare(target))
  }
  const latest = useRef(answer)
  latest.current = answer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') latest.current(true)
      if (e.key.toLowerCase() === 'l') latest.current(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="trainer">
      {/* the square just answered is shown on the board, so you can check your picture of it */}
      <Board fen={EMPTY} coords highlights={said ? [{ sq: said.sq, kind: said.ok ? 'good' : 'bad' }] : []} />
      <RoundPanel round={round} exercise="colour" intro="A square name appears. Without looking for it on the board, say whether it is a light or a dark square. Keys: L and D.">
        <div className="bigname">{target}</div>
        <div className="keys">
          <button className="btn" onClick={() => answer(false)}>Light (L)</button>
          <button className="btn" onClick={() => answer(true)}>Dark (D)</button>
        </div>
        {said && <p className={said.ok ? 'good' : 'bad'}>{said.sq} is {isDark(said.sq) ? 'dark' : 'light'}. It is marked on the board.</p>}
      </RoundPanel>
    </div>
  )
}

interface MoveQuestion {
  fen: string
  san: string
  from: Square
  to: Square
  options: string[]
}

/** A real position from the lessons with one legal move to read or to name. */
function moveQuestion(): MoveQuestion {
  const lessons = OPENINGS.flatMap(o => o.lessons)
  const line = sans(lessons[ri(lessons.length)])
  const fen = replay(line, 2 + ri(line.length - 2)).fen()
  const moves = new Chess(fen).moves({ verbose: true })
  // lean toward piece moves and captures: they have more notation to read than a plain pawn push
  const rich = moves.filter(m => m.piece !== 'p' || m.san.includes('x'))
  const pool = rich.length && Math.random() < 0.75 ? rich : moves
  const mv = pool[ri(pool.length)]
  const others = moves.map(m => m.san).filter(s => s !== mv.san).sort(() => Math.random() - 0.5).slice(0, 3)
  return { fen, san: mv.san, from: mv.from, to: mv.to, options: [mv.san, ...others].sort(() => Math.random() - 0.5) }
}

/** Ten questions: either play a written move on the board, or pick the notation for a move shown by an arrow. */
function MoveSet({ exercise }: { exercise: 'play' | 'write' }) {
  const [i, setI] = useState(0)
  const [q, setQ] = useState(moveQuestion)
  const [state, setState] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [score, setScore] = useState(0)
  const best = useStore().vision[exercise] ?? 0
  const done = i >= SET

  useEffect(() => {
    if (done) recordVision(exercise, score)
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    setI(n => n + 1)
    setQ(moveQuestion())
    setState('ask')
  }
  const judge = (san: string | null) => {
    if (!san) return
    const ok = clean(san) === clean(q.san)
    if (state === 'ask' && ok) setScore(n => n + 1)
    if (ok) {
      setState('right')
      setTimeout(next, 900)
    } else setState('wrong')
  }
  const restart = () => {
    setI(0)
    setScore(0)
    setQ(moveQuestion())
    setState('ask')
  }

  if (done) {
    return (
      <div className="card result">
        <div className="eyebrow good">Set finished</div>
        <div className="move">{score} of {SET} right first time</div>
        <p className="muted">Your best is {Math.max(best, score)} of {SET}.</p>
        <div className="actions"><button className="btn primary" onClick={restart}>Another set</button></div>
      </div>
    )
  }

  const showMove = exercise === 'write' || state !== 'ask'
  const side = q.fen.split(' ')[1] === 'w' ? 'White' : 'Black'
  return (
    <div className="trainer">
      <Board
        key={i}
        fen={q.fen}
        coords
        dests={exercise === 'play' && state !== 'right' ? legalDests(q.fen) : undefined}
        onMove={(from, to) => judge(sanOf(q.fen, from, to))}
        arrows={showMove ? [{ from: q.from, to: q.to, color: state === 'right' ? 'good' : 'accent' }] : []}
      />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">{EXERCISES[exercise]} · {i + 1} of {SET} · {side} to move</div>
          {exercise === 'play' ? (
            <>
              <div className="bigname">{q.san}</div>
              {state === 'ask' && <p>Read the move and play it on the board for {side}.</p>}
            </>
          ) : (
            <>
              {state === 'ask' && <p>The arrow shows a move for {side}. Which notation describes it?</p>}
              <div className="keys">
                {q.options.map(san => (
                  <button
                    key={san}
                    className={'btn' + (state !== 'ask' && san === q.san ? ' primary' : '')}
                    disabled={state !== 'ask'}
                    onClick={() => judge(san)}
                  >
                    {san}
                  </button>
                ))}
              </div>
            </>
          )}
          {state === 'right' && <p className="good">Correct. {q.san}: {inWords(q.san)}.</p>}
          {state === 'wrong' && (
            <>
              <p className="bad">Not that one. {q.san} means: {inWords(q.san)}.</p>
              {exercise === 'play' ? (
                <p className="accent">The arrow shows it. Play it on the board to continue.</p>
              ) : (
                <div className="actions"><button className="btn primary" onClick={next}>Next</button></div>
              )}
            </>
          )}
          <p className="note">{score} right first time so far</p>
        </div>
        <Primer />
      </div>
    </div>
  )
}
