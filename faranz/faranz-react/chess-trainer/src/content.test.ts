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
