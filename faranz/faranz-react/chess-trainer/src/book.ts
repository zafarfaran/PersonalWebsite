import { Chess } from 'chess.js'
import { clean, fenKey } from './chess'
import { sans, type Lesson, type Opening, type Step } from './data'

// Common ways real opponents answer each opening, beyond the lines taught in
// the lessons. Each entry is [weight, moves]; a higher weight is played more
// often. Only the opponent's moves are chosen from here: your side's moves just
// describe how the position is reached, so many of these run into a lesson line
// by a different move order.
const SETUP = 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O Nbd2 c5 c3 Nc6 O-O'
const EXTRA: Record<string, [number, string][]> = {
  london: [
    [2, 'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O Bd3'],
    [2, 'd4 d5 Bf4 Nf6 e3 c5 Nf3 Nc6 c3 e6 Nbd2'],
    [1, 'd4 d5 Bf4 Nf6 e3 c5 c3 Qb6 Qb3 c4 Qc2'],
    [2, 'd4 d5 Bf4 Nf6 e3 Bf5 Nf3 e6 c4 c6 Qb3 Qb6 c5 Qxb3 axb3'],
    [2, 'd4 d5 Bf4 e6 e3 Nf6 Nf3 c5'],
    [1, 'd4 d5 Bf4 e6 e3 Bd6 Bg3 Nf6 Nf3 O-O Bd3'],
    [1, 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bg4'],
    [1, 'd4 d5 Bf4 c6 e3 Nf6 Nf3 Bf5 c4 e6'],
    [3, 'd4 Nf6 Bf4 d5 e3 e6 Nf3 c5'],
    [2, 'd4 Nf6 Bf4 e6 e3 d5 Nf3 Bd6'],
    [1, 'd4 Nf6 Bf4 e6 e3 c5 c3 Nc6 Nf3 d5'],
    [1, 'd4 Nf6 Bf4 e6 e3 b6 Nf3 Bb7 Bd3 c5 c3 Be7 h3 O-O O-O'],
    [1, 'd4 Nf6 Bf4 c5 e3 Qb6'],
    [1, 'd4 Nf6 Bf4 d6 e3 g6 Nf3 Bg7 Be2 O-O h3'],
    [1, 'd4 g6 Bf4 Bg7 e3 d6 Nf3 Nf6 Be2 O-O h3'],
    [1, 'd4 e6 Bf4 d5 e3 Nf6 Nf3 c5'],
    [1, 'd4 f5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 O-O'],
    [1, 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Be7 Bd3 c5 c3 Nc6 Nbd2 O-O O-O'],
    [2, `${SETUP} b6 Ne5 Bb7 Qf3`],
    [1, `${SETUP} Qb6 Qb3`],
  ],
  italian: [
    [3, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 O-O O-O d6 Re1 a6 Bb3 Ba7 h3 h6 Nbd2'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 a6 O-O d6 Re1 Ba7 Bb3 O-O h3 h6 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 Bg4 h3 Bh5 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 h6 Bb3 a6 h3 Ba7 Nbd2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 d6 d4 exd4 cxd4 Bb6 Nc3 Nf6'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Qe7 O-O d6 d4 Bb6'],
    [3, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 d6 O-O O-O Re1 a6 Bb3 Ba7 h3 h6 Nbd2'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3 h6 Nbd2 Re8 Nf1 Bf8 Ng3'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 h6 O-O d6 c3 g6 Re1 Bg7'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d5 exd5 Nxd5 O-O Be7 Re1'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Be7 O-O Nf6 d3 O-O Re1 d6 c3'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bxf3 Qxf3 Nf6 d3'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d5 exd5 Nxd5 O-O Bc5 Re1 O-O Nxe5 Nxe5 Rxe5'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O Be6 Nbd2 O-O'],
    [1, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Be7 d4 exd4 Nxd4'],
    [2, 'e4 e5 Nf3 Nc6 Bc4 d6 Nc3 Bg4 h3 Bh5 Nxe5 Nxe5 Qxh5 Nxc4 Qb5+ c6 Qxc4'],
  ],
  caro: [
    [2, 'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7 Bd3 Bxd3 Qxd3 e6 O-O Ngf6'],
    [1, 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Nf3 Nd7 h4 h6 Bd3 Bxd3 Qxd3 e6'],
    [1, 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 Bc4 e6 N1e2 Nf6 O-O Bd6'],
    [2, 'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5'],
    [1, 'e4 c6 d4 d5 e5 Bf5 Bd3 Bxd3 Qxd3 e6 Nf3 c5'],
    [1, 'e4 c6 d4 d5 e5 Bf5 c4 e6 Nc3 Ne7'],
    [1, 'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bf4 Bg4'],
    [1, 'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 Bd3 dxc4 Bxc4 O-O O-O Nc6'],
    [1, 'e4 c6 c4 d5 exd5 cxd5 cxd5 Nf6 Nc3 Nxd5 Nf3 Nc6'],
    [1, 'e4 c6 Nf3 d5 Nc3 Bg4 Be2 e6 d4 Nf6'],
  ],
  sicilian: [
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bc4 Bg7 h3 O-O Bb3 Nc6 Be3 Bd7 O-O'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Bg5 Bg7 Qd2 Nc6 O-O-O Nxd4 Qxd4 O-O'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 g3 Nc6 Nde2 Bg7 Bg2 O-O O-O Rb8'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 h3 Bg7 Be3 O-O Qd2 Nc6 O-O-O Nxd4 Bxd4 Be6'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 exd5 Nxd5 Nxc6 bxc6'],
    [2, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 g4 Be6'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Qxd4 Nc6 Bb5 Bd7 Bxc6 Bxc6 Nc3 Nf6 Bg5 e6'],
    [1, 'e4 c5 Nf3 d6 Bc4 Nf6 d3 e6 O-O Be7 Bb3 O-O'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Bd3 Nc6 O-O cxd4 cxd4 Be7 Nc3 Qd6'],
    [1, 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Na3 Nc6 Be3 cxd4 Nb5 Qd8'],
    [1, 'e4 c5 Nc3 d6 Nf3 Nf6 d4 cxd4 Nxd4 g6'],
    [1, 'e4 c5 f4 d5 exd5 Qxd5 Nc3 Qd8'],
    [1, 'e4 c5 d4 cxd4 Qxd4 Nc6 Qa4 Nf6'],
    [1, 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6'],
  ],
}

/** How often the opponent heads for a lesson's line, by chapter. */
const LESSON_WEIGHT = { main: 4, idea: 2, replies: 2, traps: 1, variations: 1 }

export const extraLines = (o: Opening) => (EXTRA[o.id] ?? []).map(([weight, text]) => ({ weight, moves: text.split(' ') }))

export interface Book {
  /** The opponent's options in a position, with how often each is played. */
  replies: Map<string, Map<string, number>>
  /** The moves this course teaches for your side in a position: the recommended one first, then other variations. */
  repertoire: Map<string, { step: Step; lesson: Lesson }[]>
}

const cache = new Map<string, Book>()

export function bookFor(o: Opening): Book {
  const cached = cache.get(o.id)
  if (cached) return cached
  const book: Book = { replies: new Map(), repertoire: new Map() }
  const guided = o.lessons.filter(l => l.kind === 'guided')
  const lines = [...guided.map(l => ({ weight: LESSON_WEIGHT[l.chapter], moves: sans(l) })), ...extraLines(o)]
  for (const { weight, moves } of lines) {
    const c = new Chess()
    for (const san of moves) {
      if (c.turn() !== o.side) {
        const key = fenKey(c.fen())
        const options = book.replies.get(key) ?? new Map<string, number>()
        options.set(clean(san), (options.get(clean(san)) ?? 0) + weight)
        book.replies.set(key, options)
      }
      c.move(san)
    }
  }
  // recommended lines first, so that their move is the first one listed for a position
  for (const lesson of [...guided].sort((a, b) => +(a.chapter === 'variations') - +(b.chapter === 'variations'))) {
    const c = new Chess()
    lesson.moves.forEach(step => {
      if (c.turn() === o.side) {
        const known = book.repertoire.get(fenKey(c.fen())) ?? []
        if (!known.some(k => clean(k.step.san) === clean(step.san))) book.repertoire.set(fenKey(c.fen()), [...known, { step, lesson }])
      }
      c.move(step.san)
    })
  }
  cache.set(o.id, book)
  return book
}

/** A move for the opponent from the book, chosen in proportion to how common it is. Null once the game has left the book. */
export function bookReply(o: Opening, fen: string, random = Math.random): string | null {
  const options = bookFor(o).replies.get(fenKey(fen))
  if (!options) return null
  let r = random() * [...options.values()].reduce((a, b) => a + b, 0)
  for (const [san, weight] of options) {
    r -= weight
    if (r <= 0) return san
  }
  return null
}
