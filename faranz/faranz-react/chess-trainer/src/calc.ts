import { Chess } from 'chess.js'
import { placementOf, replay, type Square } from './chess'
import { OPENINGS, lessonById, sans, type Side } from './data'

// ---- Combinations: forcing sequences taken from the trap lessons ----

interface ComboDef {
  lesson: string
  /** The solver's first move. */
  first: string
  /** The solver's last move, when the lesson line carries on past the combination. */
  last?: string
  goal: string
}

const COMBO_DEFS: ComboDef[] = [
  { lesson: 'sicilian-ng4-trap', first: 'Bb5+', goal: 'Black has just attacked your bishop with the knight. Win a piece in two moves.' },
  { lesson: 'sicilian-levenfish-trap', first: 'Bb5+', goal: 'Black\'s knight has wandered to g4. Win the queen in two moves.' },
  { lesson: 'london-poisoned-pawn', first: 'a3', goal: 'Black\'s queen wants the pawn on b2. Make one quiet move so that taking it costs her the queen, then spring the trap.' },
  { lesson: 'london-b2-trap', first: 'Bf5', goal: 'Offer a piece so that taking it costs White the rook on a1. Two moves.' },
  { lesson: 'caro-fantasy-trap', first: 'Qh4+', goal: 'White has just taken the pawn on e5. Win a rook in three moves. White will block your first check with the g-pawn.' },
  { lesson: 'italian-legal', first: 'Nxe5', goal: 'Your knight is pinned to your queen. Move it anyway and give checkmate in three moves.' },
  { lesson: 'italian-two-knights-d5', first: 'g4', last: 'Rxe5', goal: 'The pin on your knight is all that protects Black\'s pawn on e5. Break the pin and win the pawn. Three moves.' },
  { lesson: 'italian-fried-liver', first: 'Nxf7', goal: 'Black\'s king has not castled. Find the sacrifice that drags it out and the two moves that follow.' },
  { lesson: 'caro-bishop-trap', first: 'g4', goal: 'Black\'s bishop on f5 is short of squares. Trap it with three pawn moves.' },
  { lesson: 'italian-d6-nf6', first: 'Ng5', last: 'Nxf8', goal: 'The f7 square is defended only once. Win a pawn by force in four moves.' },
  { lesson: 'italian-shilling', first: 'Qg5', goal: 'White has just grabbed the pawn on e5. Find the attack that ends in checkmate. Four moves.' },
  { lesson: 'e4-petrov-trap', first: 'Qe2', goal: 'Black has just copied you and taken on e4. Win the queen in three moves. Black will move the attacked knight away.' },
  { lesson: 'e4-philidor-trap', first: 'dxe5', goal: 'Black\'s queen is shut in by her own pieces. Find the two moves that leave Black with no good answer to a mate threat.' },
  { lesson: 'e4-french-gift', first: 'Bxh7+', goal: 'Nothing guards h7 and the bishop on g4 is loose. Sacrifice, win the piece back and keep the attack going. Four moves.' },
  { lesson: 'e4-owen-trap', first: 'Qh5+', goal: 'Black has taken on g2 and is about to win your rook. Ignore it and give checkmate in four moves. Black will attack your queen with the knight.' },
  { lesson: 'london-plan', first: 'Ne5', last: 'Qh6', goal: 'Carry out the London attack: knight forward, recapture toward the king, queen across, queen in. Four moves.' },
]

export interface Combo {
  id: string
  title: string
  goal: string
  side: Side
  /** Position in which the solver has to start. */
  fen: string
  /** The solver's moves and the replies between them, starting and ending with a solver move. */
  moves: string[]
}

export const COMBOS: Combo[] = COMBO_DEFS.map(def => {
  const { lesson } = lessonById(def.lesson)!
  const line = sans(lesson)
  const from = line.indexOf(def.first)
  const to = def.last ? line.indexOf(def.last, from) : line.length - 1
  const before = replay(line, from)
  return { id: def.lesson, title: lesson.title, goal: def.goal, side: before.turn(), fen: before.fen(), moves: line.slice(from, to + 1) }
})

// ---- Follow the moves: picture a position a few moves ahead ----

export const PIECE_NAMES: Record<string, string> = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }
/** "White knight" for "wN"; "Nothing" for an empty square. */
export const pieceName = (code: string) => (code ? `${code[0] === 'w' ? 'White' : 'Black'} ${PIECE_NAMES[code[1]]}` : 'Nothing')

export type Question =
  | { kind: 'square'; sq: Square; answer: string; options: string[] }
  | { kind: 'legal'; side: Side; answer: string; options: string[] }

export interface Round {
  side: Side
  startPly: number
  startFen: string
  finalFen: string
  moves: string[]
  question: Question
}

const pick = <T,>(items: T[], random: () => number) => items[Math.floor(random() * items.length)]
function shuffled<T>(items: T[], random: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SOURCES = OPENINGS.flatMap(o => o.lessons.map(l => ({ side: o.side, line: sans(l) })))

const movesOf = (c: Chess) => new Map(c.moves({ verbose: true }).map(mv => [mv.from + mv.to + (mv.promotion ?? ''), mv.san]))

/** A move that has only become possible, with decoys that were possible before and no longer are. */
function legalQuestion(line: string[], start: number, plies: number, random: () => number): Question | null {
  const final = replay(line, start + plies)
  // the earliest position in the sequence in which the same side is to move
  const earlier = replay(line, start + (plies % 2))
  const now = movesOf(final)
  const then = movesOf(earlier)
  const fresh = [...now].filter(([key]) => !then.has(key)).map(([, san]) => san)
  const gone = [...then].filter(([key]) => !now.has(key)).map(([, san]) => san).filter(san => ![...now.values()].includes(san))
  if (!fresh.length || gone.length < 2) return null
  const answer = pick(fresh, random)
  return { kind: 'legal', side: final.turn(), answer, options: shuffled([answer, ...shuffled(gone, random).slice(0, 3)], random) }
}

/** What stands on one of the squares the moves have changed. */
function squareQuestion(startFen: string, finalFen: string, random: () => number): Question {
  const before = placementOf(startFen)
  const after = placementOf(finalFen)
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(sq => before[sq] !== after[sq])
  const sq = pick(changed, random)
  const answer = after[sq] ?? ''
  const decoys = shuffled([...new Set([before[sq] ?? '', '', ...changed.flatMap(c => [before[c] ?? '', after[c] ?? ''])])].filter(c => c !== answer), random)
  return { kind: 'square', sq, answer, options: shuffled([answer, ...decoys.slice(0, 3)], random) }
}

/** A stretch of `plies` moves from one of the course lines, and a question about the position it leads to. */
export function followRound(plies: number, random: () => number = Math.random): Round {
  const usable = SOURCES.filter(s => s.line.length >= plies + 2)
  const { side, line } = pick(usable, random)
  const start = Math.floor(random() * (line.length - plies + 1))
  const startFen = replay(line, start).fen()
  const finalFen = replay(line, start + plies).fen()
  const question = (random() < 0.5 && legalQuestion(line, start, plies, random)) || squareQuestion(startFen, finalFen, random)
  return { side, startPly: start, startFen, finalFen, moves: line.slice(start, start + plies), question }
}
