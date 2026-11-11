import { Chess } from 'chess.js'

export type Square = string
export type Placement = Record<Square, string> // square -> piece code, e.g. { e4: 'wP' }

/** Strip check, mate and annotation marks so "Nd5#" and "Nd5" compare equal. */
export const clean = (san: string) => san.replace(/[+#?!]/g, '')

/** Position after the first `upto` moves. */
export function replay(moves: string[], upto = moves.length): Chess {
  const c = new Chess()
  for (let i = 0; i < upto; i++) c.move(moves[i])
  return c
}

/** From and to squares of a move in standard notation, or null if it is not legal. */
export function squaresOf(fen: string, san: string): { from: Square; to: Square } | null {
  try {
    const mv = new Chess(fen).move(san)
    return { from: mv.from, to: mv.to }
  } catch {
    return null
  }
}

/** Standard notation for a from/to move (auto-queens), or null if it is not legal. */
export function sanOf(fen: string, from: Square, to: Square): string | null {
  try {
    return new Chess(fen).move({ from, to, promotion: 'q' }).san
  } catch {
    return null
  }
}

/** Legal destinations for every piece of the side to move. */
export function legalDests(fen: string): Map<Square, Square[]> {
  const map = new Map<Square, Square[]>()
  for (const mv of new Chess(fen).moves({ verbose: true })) {
    map.set(mv.from, [...(map.get(mv.from) ?? []), mv.to])
  }
  return map
}

export function lastMoveOf(c: Chess): { from: Square; to: Square } | null {
  const h = c.history({ verbose: true })
  const mv = h[h.length - 1]
  return mv ? { from: mv.from, to: mv.to } : null
}

/** Identifies a position regardless of move counters. */
export const fenKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ')

export const turnOf = (fen: string) => (fen.split(' ')[1] === 'b' ? 'b' : 'w')

export function placementOf(fen: string): Placement {
  const out: Placement = {}
  fen.split(' ')[0].split('/').forEach((row, r) => {
    let f = 0
    for (const ch of row) {
      if (/\d/.test(ch)) f += +ch
      else {
        out['abcdefgh'[f] + (8 - r)] = (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase()
        f++
      }
    }
  })
  return out
}

export function placementFen(p: Placement): string {
  const rows: string[] = []
  for (let r = 8; r >= 1; r--) {
    let row = ''
    let gap = 0
    for (const file of 'abcdefgh') {
      const piece = p[file + r]
      if (!piece) gap++
      else {
        if (gap) row += gap
        gap = 0
        row += piece[0] === 'w' ? piece[1] : piece[1].toLowerCase()
      }
    }
    rows.push(row + (gap || ''))
  }
  return rows.join('/')
}

/** "5." for White's moves and "5…" for Black's, from a ply index starting at 0. */
export const moveLabel = (ply: number) => `${Math.floor(ply / 2) + 1}${ply % 2 ? '…' : '.'}`
