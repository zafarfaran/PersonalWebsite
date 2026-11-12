import { Chess } from 'chess.js'
import { bookFor } from './book'
import { clean, fenKey } from './chess'
import { OPENINGS, sans, type Opening, type Side } from './data'
import type { MoveNote, SavedGame } from './store'

/** One game read from a PGN file, before it is known which player you were. */
export interface PgnGame {
  /** Player names, empty when the file does not give them. */
  white: string
  black: string
  /** "1-0", "0-1", "1/2-1/2" or "*". */
  result: string
  /** How the game ended, as the site worded it. */
  termination: string
  /** When it was played, if the file says. */
  at?: number
  link?: string
  moves: string[]
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'
const named = (v?: string | null) => (v && !/^[?-]*$/.test(v.trim()) ? v.trim() : '')

function playedAt(h: Record<string, string | null | undefined>): number | undefined {
  const d = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(h.UTCDate ?? h.Date ?? '')
  if (!d) return undefined
  const t = /^(\d{2}):(\d{2}):(\d{2})$/.exec(h.UTCTime ?? '')
  return t ? Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2], +t[3]) : new Date(+d[1], +d[2] - 1, +d[3], 12).getTime()
}

/**
 * Read the games in a PGN file, as exported by Chess.com or Lichess. Clock
 * times, comments and side variations are ignored. Games that cannot be read
 * are counted in `skipped`; if none can, the first problem is thrown.
 */
export function parsePgn(text: string): { games: PgnGame[]; skipped: number } {
  const chunks = text.replace(/\r/g, '').split(/\n(?=\[Event\s)/).map(c => c.trim()).filter(Boolean)
  if (!chunks.length) throw new Error('There is no game in that text.')
  const games: PgnGame[] = []
  let problem = ''
  for (const chunk of chunks) {
    try {
      const c = new Chess()
      c.loadPgn(chunk)
      const h = c.getHeaders()
      if (h.FEN && fenKey(h.FEN) !== START) throw new Error('That game starts from a set-up position, which cannot be reviewed here.')
      const moves = c.history()
      if (!moves.length) throw new Error('That game has no moves.')
      games.push({
        white: named(h.White),
        black: named(h.Black),
        result: named(h.Result) || '*',
        termination: named(h.Termination),
        at: playedAt(h),
        link: /^https:\/\//.test(h.Link ?? '') ? h.Link! : /^https:\/\//.test(h.Site ?? '') ? h.Site! : undefined,
        moves,
      })
    } catch (err) {
      problem ||= err instanceof Error ? err.message : 'That is not a game in PGN format.'
    }
  }
  if (!games.length) throw new Error(problem.startsWith('Invalid move') ? `That does not read as a PGN game (${problem}).` : problem)
  return { games, skipped: chunks.length - games.length }
}

/** Which side you played, from the names you have said are yours. Undefined when that does not settle it. */
export function sideOf(g: PgnGame, players: string[]): Side | undefined {
  const mine = (name: string) => !!name && players.some(p => p.toLowerCase() === name.toLowerCase())
  return mine(g.white) === mine(g.black) ? undefined : mine(g.white) ? 'w' : 'b'
}

/** The opening of the course a game of yours went into, if it followed one for long enough to tell. */
export function courseOpening(moves: string[], side: Side): Opening | undefined {
  let found: Opening | undefined
  let most = side === 'w' ? 2 : 1 // at least your first move as Black, your first two as White
  for (const o of OPENINGS.filter(o => o.side === side)) {
    for (const l of o.lessons) {
      const line = sans(l)
      let shared = 0
      while (shared < line.length && shared < moves.length && clean(line[shared]) === clean(moves[shared])) shared++
      if (shared > most) [found, most] = [o, shared]
    }
  }
  return found
}

/** The result in your terms, e.g. "You lost by resignation". */
export function outcome(g: PgnGame, side: Side): string {
  const won = g.result === '1-0' ? 'w' : g.result === '0-1' ? 'b' : null
  const how = / (by|on) .+$/.exec(g.termination)?.[0] ?? ''
  return won ? (won === side ? 'You won' : 'You lost') + how : g.result === '1/2-1/2' ? 'Draw' + how : 'Unfinished'
}

function hash(text: string): string {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0
  return h.toString(36)
}

/** A game from a file as a saved game of yours. The same game always gets the same id. */
export function toSaved(g: PgnGame, side: Side, now = Date.now()): SavedGame {
  const opening = courseOpening(g.moves, side)
  const notes: Record<number, MoveNote> = {}
  if (opening) {
    // moves the lessons teach need no verdict from the computer
    const taught = bookFor(opening).repertoire
    const c = new Chess()
    g.moves.forEach((san, i) => {
      if (c.turn() === side && taught.get(fenKey(c.fen()))?.some(t => clean(t.step.san) === clean(san))) notes[i] = { verdict: 'course' }
      c.move(san)
    })
  }
  return {
    id: 'p' + hash([g.white, g.black, g.at ?? '', side, ...g.moves].join(' ')),
    at: g.at ?? now,
    opening: opening?.id ?? '',
    side,
    moves: g.moves,
    result: outcome(g, side),
    notes,
    imported: true,
    white: g.white || 'White',
    black: g.black || 'Black',
    link: g.link,
  }
}
