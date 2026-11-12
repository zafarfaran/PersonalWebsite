import type { MoveNote } from './store'

const cap = (cp: number) => Math.max(-1000, Math.min(1000, cp))

/** Chance of winning, in percent, for the side whose score this is. The curve Lichess fitted to real games. */
export const winChance = (cp: number) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)

/** Accuracy of one move, 0 to 100, from the score before it (with best play) and after it. */
export function moveAccuracy(beforeCp: number, afterCp: number): number {
  const lost = Math.max(0, winChance(beforeCp) - winChance(afterCp))
  return lost === 0 ? 100 : Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * lost) - 3.1669))
}

/**
 * Accuracy of a whole game from the accuracy of each move: halfway between the
 * plain average and the harmonic mean, so that a few terrible moves weigh more
 * than they would in an average. Null when no move has been rated.
 */
export function gameAccuracy(moves: number[]): number | null {
  if (!moves.length) return null
  const mean = moves.reduce((a, b) => a + b, 0) / moves.length
  const harmonic = moves.length / moves.reduce((a, b) => a + 1 / Math.max(1, b), 0)
  return (mean + harmonic) / 2
}

/** Your accuracy in a game, from the computer's notes on your moves. */
export function accuracyOf(notes: Record<number, MoveNote>): number | null {
  const rated = Object.values(notes).flatMap(n =>
    n.cp !== undefined ? [moveAccuracy(cap(n.cp) + (n.loss ?? 0), cap(n.cp))] : n.verdict === 'course' ? [100] : [],
  )
  return gameAccuracy(rated)
}

export const percent = (accuracy: number) => accuracy.toFixed(1) + '%'
