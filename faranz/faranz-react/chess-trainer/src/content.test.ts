import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { OPENINGS, drillLines, lessonById, sans } from './data'
import { clean, fenKey, placementFen, placementOf, replay } from './chess'
import { DAY, review, streak, dayStamp } from './srs'

const lessons = OPENINGS.flatMap(o => o.lessons)

describe('opening content', () => {
  it.each(lessons.map(l => [l.id, l] as const))('%s: every move is legal and written as the engine writes it', (_, l) => {
    const c = new Chess()
    l.moves.forEach((step, i) => {
      const mv = c.move(step.san) // throws on an illegal move
      expect(mv.san, `${l.id} move ${i + 1}`).toBe(step.san)
    })
    expect(l.moves.length % 2, 'lines end on a White move').toBe(l.kind === 'guided' ? 1 : l.moves.length % 2)
  })

  it('alternatives and named mistakes are legal moves that differ from the answer', () => {
    for (const l of lessons) {
      l.moves.forEach((step, i) => {
        const fen = replay(sans(l), i).fen()
        for (const san of [...Object.keys(step.alts ?? {}), ...Object.keys(step.mistakes ?? {})]) {
          expect(() => new Chess(fen).move(san), `${l.id} ply ${i}: ${san}`).not.toThrow()
          expect(clean(san)).not.toBe(clean(step.san))
        }
      })
    }
  })

  it('the repertoire never asks for two different moves in the same position', () => {
    for (const o of OPENINGS) {
      const seen = new Map<string, string>()
      for (const l of o.lessons.filter(l => l.kind === 'guided')) {
        const c = new Chess()
        l.moves.forEach((step, i) => {
          if (i % 2 === 0) {
            const key = fenKey(c.fen())
            const prev = seen.get(key)
            expect(prev ?? step.san, `${l.id} ply ${i}`).toBe(step.san)
            seen.set(key, step.san)
          }
          c.move(step.san)
        })
      }
    }
  })

  it('each opening has drill lines with a name for Black\'s reply', () => {
    for (const o of OPENINGS) {
      expect(drillLines(o).length).toBeGreaterThanOrEqual(4)
      for (const l of drillLines(o)) {
        expect(l.kind).toBe('guided')
        expect(l.reply, l.id).toBeTruthy()
      }
    }
  })

  it('the setup builder target matches the position the card lesson reaches', () => {
    for (const o of OPENINGS) {
      const final = placementOf(replay(sans(lessonById(o.cardLesson)!.lesson)).fen())
      const white = Object.fromEntries(Object.entries(final).filter(([, p]) => p[0] === 'w'))
      expect(placementFen(white), o.id).toBe(o.setupFen)
    }
  })
})

describe('spaced repetition', () => {
  const now = new Date(2026, 0, 10, 12).getTime()
  it('moves up a box on a correct answer and resets on a miss', () => {
    const a = review(undefined, true, now)
    expect(a).toEqual({ box: 1, due: now + DAY })
    const b = review(a, true, now)
    expect(b).toEqual({ box: 2, due: now + 3 * DAY })
    expect(review(b, false, now)).toEqual({ box: 0, due: now })
  })
  it('counts a streak of consecutive days', () => {
    const days = [0, 1, 2, 4].map(n => dayStamp(now - n * DAY))
    expect(streak(days, now)).toBe(3)
    expect(streak(days.slice(1), now)).toBe(2) // nothing today yet: yesterday still counts
    expect(streak([], now)).toBe(0)
  })
})

import { bookFor, bookReply, extraLines } from './book'
import { chooseMove, parseInfo } from './engine'
import { inWords, isDark } from './screens/Vision'

describe('full-game opening book', () => {
  it('every extra line is legal and written as the engine writes it', () => {
    for (const o of OPENINGS) {
      expect(extraLines(o).length).toBeGreaterThan(5)
      for (const { moves } of extraLines(o)) {
        const c = new Chess()
        for (const san of moves) expect(c.move(san).san, `${o.id}: ${moves.join(' ')}`).toBe(san)
      }
    }
  })

  it('offers Black several first replies and only legal moves', () => {
    for (const o of OPENINGS) {
      const book = bookFor(o)
      for (const [key, options] of book.replies) {
        for (const san of options.keys()) expect(() => new Chess(key + ' 0 1').move(san), `${key} ${san}`).not.toThrow()
      }
      const first = replay([sans(o.lessons[0])[0]]).fen()
      const seen = new Set(Array.from({ length: 200 }, () => bookReply(o, first)))
      expect(seen.has(null)).toBe(false)
      if (o.id === 'london') expect(seen.size).toBeGreaterThanOrEqual(4)
    }
  })

  it('knows the course move for the starting position and nothing for an unknown one', () => {
    for (const o of OPENINGS) {
      expect(bookFor(o).repertoire.get(fenKey(new Chess().fen()))!.step.san).toBe(sans(o.lessons[0])[0])
      expect(bookReply(o, '8/8/8/8/8/8/8/K6k b - - 0 1')).toBeNull()
    }
  })
})

describe('engine helpers', () => {
  it('reads scores and moves from engine output', () => {
    expect(parseInfo('info depth 12 seldepth 16 multipv 2 score cp -34 nodes 1 pv g8f6 c2c4')).toEqual({ index: 2, line: { from: 'g8', to: 'f6', promotion: undefined, cp: -34 } })
    expect(parseInfo('info depth 9 multipv 1 score mate 3 pv e7e8q')!.line).toEqual({ from: 'e7', to: 'e8', promotion: 'q', cp: 9970 })
    expect(parseInfo('info depth 9 multipv 1 score mate -2 pv a1a2')!.line.cp).toBe(-9980)
    expect(parseInfo('info depth 9 score cp 10 lowerbound pv a1a2')).toBeNull()
    expect(parseInfo('bestmove e2e4')).toBeNull()
  })

  it('full strength always plays the best move; weak levels vary but never skip a mate', () => {
    const lines = [100, 60, 20, -200].map((cp, i) => ({ from: 'a1', to: 'a' + (i + 2), cp }))
    expect(new Set(Array.from({ length: 50 }, () => chooseMove(lines, 8).to))).toEqual(new Set(['a2']))
    expect(new Set(Array.from({ length: 300 }, () => chooseMove(lines, 1).to)).size).toBeGreaterThan(1)
    const mate = [{ from: 'a1', to: 'a2', cp: 9990 }, { from: 'a1', to: 'a3', cp: 500 }]
    expect(new Set(Array.from({ length: 50 }, () => chooseMove(mate, 1).to))).toEqual(new Set(['a2']))
  })
})

describe('board trainer', () => {
  it('knows square colours', () => {
    expect([isDark('a1'), isDark('h1'), isDark('e4'), isDark('d4'), isDark('h8')]).toEqual([true, false, false, true, true])
  })
  it('puts notation into words', () => {
    expect(inWords('Nf3')).toBe('Knight to f3')
    expect(inWords('Bxf7+')).toBe('Bishop takes on f7, with check')
    expect(inWords('exd5')).toBe('Pawn on the e-file takes on d5')
    expect(inWords('e4')).toBe('Pawn to e4')
    expect(inWords('Nbd2')).toBe('Knight from the b-file to d2')
    expect(inWords('O-O')).toBe('Castle kingside')
    expect(inWords('Nd5#')).toBe('Knight to d5, checkmate')
    expect(inWords('e8=Q+')).toBe('Pawn to e8, promoting to a queen, with check')
  })
})
