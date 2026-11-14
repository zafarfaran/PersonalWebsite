import { useState } from 'react'
import { Chess } from 'chess.js'
import { Board, type Arrow, type Highlight } from '../components/Board'
import { Meter, Shell } from '../components/ui'
import { legalDests, sanOf, squaresOf, turnOf, type Square } from '../chess'
import { SIDE_NAME, other } from '../data'
import { JUDGE, JUDGE_MODES, TACTICS, TACTIC_GROUPS, passed, type JudgeMode, type JudgePosition, type TacticLesson, type Verdict } from '../data/tactics'
import { shuffle } from '../lib'
import { href } from '../router'
import { getState, recordJudge, useStore } from '../store'
import { Demo } from './Endgames'

const ROUND = 10
const MODES = Object.keys(JUDGE_MODES) as JudgeMode[]
const inMode = (mode: JudgeMode) => JUDGE.filter(p => JUDGE_MODES[mode].kinds.includes(p.kind))

/** The tactics lessons and the drills on judging the other side's move. */
export function Tactics() {
  const judged = useStore().judged
  const right = JUDGE.filter(p => judged[p.id] === 2).length

  return (
    <Shell
      back={href()}
      backLabel="Home"
      title="Tactics"
      right={
        <>
          <Meter value={right / JUDGE.length} />
          <span className="count">{right} of {JUDGE.length} positions judged right</span>
        </>
      }
    >
      <p className="muted">
        Tactics start with the other side’s move. In the drills your opponent has just played, and you have to say what the move does: is it a mistake you can punish, does it
        threaten something you have to stop, or is it nothing special? Then you prove it on the board. The lessons below explain what to look for.
      </p>
      <h2 className="sidehead">Drills</h2>
      <div className="card">
        {MODES.map(mode => {
          const all = inMode(mode)
          const n = all.filter(p => judged[p.id] === 2).length
          return (
            <div className="reply" key={mode}>
              <div className="t">
                <b>{JUDGE_MODES[mode].title}</b>
                <small>{JUDGE_MODES[mode].summary} {n} of {all.length} right so far.</small>
              </div>
              <a className={'btn' + (mode === 'mixed' ? ' primary' : '')} href={href('judge', mode)}>Start</a>
            </div>
          )
        })}
      </div>
      {TACTIC_GROUPS.map(group => (
        <section key={group}>
          <h2 className="sidehead">{group}</h2>
          <div className="card">
            {TACTICS.filter(t => t.group === group).map(t => (
              <a className="topic" key={t.id} href={href('tactic', t.id)}>
                <b>{t.title}</b>
                <small>{t.summary}</small>
              </a>
            ))}
          </div>
        </section>
      ))}
    </Shell>
  )
}

/** One lesson: the idea, the rules to remember and an example to step through. */
export function TacticLessonPage({ lesson }: { lesson: TacticLesson }) {
  const next = TACTICS[TACTICS.indexOf(lesson) + 1]

  return (
    <Shell back={href('tactics')} backLabel="Tactics" title={lesson.title} mode={lesson.group}>
      <div className="theory">
        <div className="panel text">
          <div className="card">
            <div className="eyebrow">The idea</div>
            {lesson.text.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="card">
            <div className="eyebrow">Remember</div>
            <ul className="rules">{lesson.rules.map((r, i) => <li key={i}>{r}</li>)}</ul>
            <div className="actions">
              <a className="btn primary" href={href('judge', 'mixed')}>Practise: judge the move</a>
              {next && <a className="btn" href={href('tactic', next.id)}>Next lesson: {next.title}</a>}
            </div>
          </div>
        </div>
        {lesson.demo && <Demo demo={lesson.demo} />}
      </div>
    </Shell>
  )
}

const CHOICES: { kind: Verdict; label: string }[] = [
  { kind: 'mistake', label: 'A mistake: I can win something' },
  { kind: 'threat', label: 'It threatens something I have to stop' },
  { kind: 'quiet', label: 'Nothing special' },
]
const NAME: Record<Verdict, string> = { mistake: 'a mistake', threat: 'a threat', quiet: 'nothing special' }
const worth = (cp = 0) => (cp >= 5000 ? 'the game' : `about ${Math.max(1, Math.round(cp / 100))} pawns’ worth`)

/** A round of positions in which the other side has just moved. */
export function Judge({ mode }: { mode: JudgeMode }) {
  const [round, setRound] = useState(0)
  return <JudgeRound key={round} mode={mode} again={() => setRound(round + 1)} />
}

function JudgeRound({ mode, again }: { mode: JudgeMode; again: () => void }) {
  const [deck] = useState(() => {
    // positions you have not had yet come first, then the ones you got wrong last time
    const seen = getState().judged
    return shuffle(inMode(mode)).sort((a, b) => (seen[a.id] ?? 0) - (seen[b.id] ?? 0)).slice(0, ROUND)
  })
  const [at, setAt] = useState(0)
  const [score, setScore] = useState(0)
  const title = JUDGE_MODES[mode].title

  if (at >= deck.length) {
    return (
      <Shell back={href('tactics')} backLabel="Tactics" title={title}>
        <div className="card">
          <div className="eyebrow">Round over</div>
          <div className="move">{score} of {deck.length} right</div>
          <p>
            {score === deck.length
              ? 'Every one. The positions you have not had yet come first in the next round.'
              : 'The ones you got wrong come back in a later round. Before each move of a real game, ask the same three questions.'}
          </p>
          <div className="actions">
            <button className="btn primary" onClick={again}>Another round</button>
            <a className="btn" href={href('tactic', 'three-questions')}>The three questions</a>
            <a className="btn" href={href('tactics')}>Back to Tactics</a>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell back={href('tactics')} backLabel="Tactics" title={title} right={<span className="count">Position {at + 1} of {deck.length} · {score} right</span>}>
      <JudgeOne
        key={deck[at].id}
        p={deck[at]}
        ask={mode === 'mixed'}
        last={at === deck.length - 1}
        next={ok => {
          setScore(score + (ok ? 1 : 0))
          setAt(at + 1)
        }}
      />
    </Shell>
  )
}

type Try = { san: string; ok: boolean }

/**
 * One position. In the mixed drill you first say what the move is; then you
 * show the threat by playing the other side's next move, and play your answer.
 */
function JudgeOne({ p, ask, last, next }: { p: JudgePosition; ask: boolean; last: boolean; next: (ok: boolean) => void }) {
  const you = turnOf(p.fen)
  const them = SIDE_NAME[other(you)]
  const [step, setStep] = useState<'judge' | 'threat' | 'answer' | 'done'>(ask ? 'judge' : p.kind === 'threat' ? 'threat' : 'answer')
  const [said, setSaid] = useState<Verdict | null>(null)
  const [threat, setThreat] = useState<Try | null>(null)
  const [answer, setAnswer] = useState<Try | null>(null)

  const free = passed(p.fen)
  const saidRight = !ask || said === p.kind
  const allRight = saidRight && (threat?.ok ?? true) && (answer?.ok ?? true)
  const full = +p.fen.split(' ')[5]
  const label = you === 'w' ? `${full - 1}…` : `${full}.`

  const choose = (kind: Verdict) => {
    setSaid(kind)
    if (p.kind === 'quiet') {
      recordJudge(p.id, kind === 'quiet')
      setStep('done')
    } else setStep(p.kind === 'threat' ? 'threat' : 'answer')
  }

  const play = (from: Square, to: Square) => {
    if (step === 'threat') {
      const san = sanOf(free, from, to)
      if (!san) return
      setThreat({ san, ok: p.threats!.includes(san) })
      setStep('answer')
    } else if (step === 'answer') {
      const san = sanOf(p.fen, from, to)
      if (!san) return
      const ok = p.good!.includes(san)
      setAnswer({ san, ok })
      recordJudge(p.id, saidRight && (threat?.ok ?? true) && ok)
      setStep('done')
    }
  }

  // the board: their free move while you show the threat, your right answer once it is played
  const fen = step === 'threat' ? free : step === 'done' && answer?.ok ? new Chess(p.fen).move(answer.san).after : p.fen
  const highlights: Highlight[] = [{ sq: p.from, kind: 'last' }, { sq: p.to, kind: 'last' }]
  const arrows: Arrow[] = []
  const threatAt = p.threats && squaresOf(free, p.threats[0])
  if (threatAt && (step === 'answer' || (step === 'done' && !answer?.ok))) arrows.push({ ...threatAt, color: 'bad' })
  const bestAt = squaresOf(p.fen, p.best)
  if (bestAt && step === 'done' && p.kind !== 'quiet' && !answer?.ok) arrows.push({ ...bestAt, color: 'good' })

  const verdict = ask && said && (
    <p className={said === p.kind ? 'good' : 'bad'}>
      {said === p.kind ? 'Right' : 'Not this time'}: it is {NAME[p.kind]}.
      {said !== p.kind && p.kind === 'mistake' && said === 'threat' && ' Whatever it threatens, you get there first.'}
    </p>
  )

  return (
    <div className="trainer">
      <Board
        fen={fen}
        coords
        markable
        flip={you === 'b'}
        dests={step === 'threat' ? legalDests(free) : step === 'answer' ? legalDests(p.fen) : undefined}
        onMove={play}
        highlights={highlights}
        arrows={arrows}
      />
      <div className="panel">
        <div className="card">
          <div className="eyebrow">{them} has just played · you are {SIDE_NAME[you]}</div>
          <div className="move">{label} {p.last}</div>

          {step === 'judge' && (
            <>
              <p>What do you make of it? Look at what the move attacks, what it stopped guarding, and what {them} would play next.</p>
              <div className="actions choices">
                {CHOICES.map(c => <button key={c.kind} className="btn" onClick={() => choose(c.kind)}>{c.label}</button>)}
              </div>
              <p className="note">A mistake that also threatens something counts as a mistake: punishing it comes first.</p>
            </>
          )}

          {step === 'threat' && (
            <>
              {verdict}
              <p><b>Show the threat.</b> Imagine you pass. Play the move {them} would make next: the {them} pieces are yours to move for one move.</p>
            </>
          )}

          {step === 'answer' && (
            <>
              {verdict}
              {threat && (
                <p className={threat.ok ? 'good' : 'bad'}>
                  {threat.ok ? `Right: ${threat.san} is the threat` : `${threat.san} is not it. The threat is ${p.threats![0]}`} (red arrow).
                </p>
              )}
              <p>
                <b>{p.kind === 'threat' ? 'Now deal with it.' : 'Punish it.'}</b>{' '}
                {p.kind === 'threat' ? 'Play a move after which the threat no longer works.' : 'Play the move that wins something.'}
              </p>
            </>
          )}

          {step === 'done' && (
            <>
              {verdict}
              {p.kind === 'quiet' && (
                <p>
                  {said === 'threat' ? `If ${them} could move again, nothing would be won. ` : said === 'mistake' ? 'There is nothing to win here. ' : ''}
                  A normal move: no threat to stop and nothing to punish, so you can get on with your own plan. The computer would play {p.best}.
                </p>
              )}
              {p.kind === 'threat' && (
                <>
                  <p className={answer!.ok ? 'good' : 'bad'}>
                    {answer!.ok ? `${answer!.san} deals with it.` : `${answer!.san} does not stop it. ${p.best} was the best answer (green arrow).`}
                  </p>
                  <p>
                    {p.last} threatened {p.threatLine!.join(' ')}, winning {worth(p.gain)}.
                    {' '}The moves that meet it: {p.good!.join(', ')}.
                  </p>
                </>
              )}
              {p.kind === 'mistake' && (
                <>
                  <p className={answer!.ok ? 'good' : 'bad'}>
                    {answer!.ok ? `${answer!.san} is the move.` : `${answer!.san} lets ${them} off. ${p.best} was the move (green arrow).`}
                  </p>
                  <p>{p.last} loses {worth(p.gain)}. Play could go on {p.line!.join(' ')}.</p>
                </>
              )}
              <div className="actions">
                <button className="btn primary" onClick={() => next(allRight)}>{last ? 'Finish the round' : 'Next position'}</button>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="eyebrow">Three questions after every move</div>
          <ul className="rules">{TACTICS[0].rules.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}
