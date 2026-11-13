import { placementOf, turnOf } from './chess'
import type { Goal } from './data/endgames'

/** Below this score (hundredths of a pawn, from your side) a winning position counts as thrown away. */
const WIN_FLOOR = 150
/** Below this score a position you were meant to hold counts as lost. */
const DRAW_FLOOR = -200
/** A drawing task ends once you have held the position for this many moves. */
export const HOLD = 12

const count = (fen: string, side: 'w' | 'b') => {
  const pieces = Object.values(placementOf(fen)).filter(p => p[0] === side).map(p => p[1])
  return { all: pieces.length, queens: pieces.filter(p => p === 'Q').length, rooks: pieces.filter(p => p === 'R').length }
}

/** Has the move just played given away what the position was worth? `score` is the engine's, from your side. */
export const slipped = (goal: Goal, score: number) => score < (goal === 'draw' ? DRAW_FLOOR : WIN_FLOOR)

/**
 * A winning task is finished before mate once the rest is one of the basic
 * mates: you have made a new queen that cannot be won back, or the opponent
 * is down to a bare king while you still have a queen or a rook.
 */
export function reached(goal: Goal, start: string, fen: string, score: number): boolean {
  if (goal !== 'win') return false
  const you = turnOf(start)
  const them = you === 'w' ? 'b' : 'w'
  const mine = count(fen, you)
  const theirs = count(fen, them)
  const newQueen = score >= 1000 && mine.queens > count(start, you).queens && theirs.queens === 0
  const bareKing = score >= 9000 && theirs.all === 1 && count(start, them).all > 1 && mine.queens + mine.rooks > 0
  return newQueen || bareKing
}

/** Moves to mate that a mate score stands for, or null when the score is not a forced mate. */
export const mateIn = (score: number) => (Math.abs(score) > 9000 ? Math.round((10000 - Math.abs(score)) / 10) : null)
