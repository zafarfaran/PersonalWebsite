import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { OPENINGS, drillLines, fixLesson, lessonById, repertoireLines, sans } from './data'
import { clean, fenKey, placementFen, placementOf, replay } from './chess'
import { DAY, review, streak, dayStamp } from './srs'
import type { State } from './store'
import type { Lesson } from './data'

const lessons = OPENINGS.flatMap(o => o.lessons)

describe('opening content', () => {
  it.each(lessons.map(l => [l.id, l] as const))('%s: every move is legal and written as the engine writes it', (_, l) => {
    const c = new Chess()
    l.moves.forEach((step, i) => {
      const mv = c.move(step.san) // throws on an illegal move
      expect(mv.san, `${l.id} move ${i + 1}`).toBe(step.san)
    })
    const yours = lessonById(l.id)!.opening.side === 'w' ? 1 : 0
    expect(l.moves.length % 2, 'guided lines end on your own move').toBe(l.kind === 'guided' ? yours : l.moves.length % 2)
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
      for (const l of o.lessons.filter(l => l.kind === 'guided' && l.chapter !== 'variations')) {
        const c = new Chess()
        l.moves.forEach((step, i) => {
          if (c.turn() === o.side) {
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
      const yours = Object.fromEntries(Object.entries(final).filter(([, p]) => p[0] === o.side))
      expect(placementFen(yours), o.id).toBe(o.setupFen)
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
      // the first position in which the opponent has to move
      const first = replay(o.side === 'w' ? [sans(o.lessons[0])[0]] : []).fen()
      const seen = new Set(Array.from({ length: 200 }, () => bookReply(o, first)))
      expect(seen.has(null)).toBe(false)
      if (o.id === 'london') expect(seen.size).toBeGreaterThanOrEqual(4)
    }
  })

  it('knows the course move for the starting position and nothing for an unknown one', () => {
    for (const o of OPENINGS) {
      const yourFirst = replay(o.side === 'w' ? [] : [sans(o.lessons[0])[0]]).fen()
      expect(bookFor(o).repertoire.get(fenKey(yourFirst))![0].step.san).toBe(sans(o.lessons[0])[o.side === 'w' ? 0 : 1])
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

import { GUIDE, searchGuide } from './screens/Guide'

describe('guide', () => {
  it('links only to lessons and openings that exist', () => {
    for (const block of GUIDE.flatMap(s => s.blocks)) {
      if (block.opening) expect(OPENINGS.some(o => o.id === block.opening), block.opening).toBe(true)
      for (const row of block.rows) if (row.lesson) expect(lessonById(row.lesson), row.lesson).toBeTruthy()
    }
  })

  it('has a row for every drilled line of the Black openings and of the other defences to 1. e4', () => {
    const linked = new Set(GUIDE.flatMap(s => s.blocks).flatMap(b => b.rows.map(r => r.lesson)))
    const listed = OPENINGS.filter(o => o.side === 'b' || o.id === 'e4')
    // traps have their own page
    for (const o of listed) for (const l of drillLines(o)) expect(linked.has(l.id) || l.chapter === 'traps', l.id).toBe(true)
  })

  it('finds lines by name or by moves, whatever the spelling, best match first', () => {
    const lessonsFor = (q: string) => searchGuide(q).map(hit => hit.row.lesson)
    expect(searchGuide('  ')).toEqual([])
    expect(lessonsFor('samisch').sort()).toEqual(['kid-samisch', 'kid-samisch-nge2'])
    expect(lessonsFor('SÄMISCH nge2')).toEqual(['kid-samisch-nge2'])
    expect(lessonsFor('e4 d5')[0]).toBe('e4-scandi-qa5')
    expect(lessonsFor('1... Nf6 2... c5')[0]).toBe('london-benoni')
    expect(lessonsFor('italian').length).toBeGreaterThanOrEqual(6)
    expect(lessonsFor('zzz')).toEqual([])
  })

  it('marks every trap as one you set or one you avoid', () => {
    for (const l of lessons) expect(!!l.trap, l.id).toBe(l.chapter === 'traps')
    for (const o of OPENINGS) expect(new Set(o.lessons.map(l => l.trap)).size, o.id).toBe(3)
  })
})

describe('trap fixes', () => {
  const fixed = lessons.filter(l => l.fix)

  it('every watched trap you have to avoid comes with the right move to play', () => {
    for (const l of lessons) expect(!!l.fix, l.id).toBe(l.trap === 'avoid' && l.kind === 'demo')
  })

  it.each(fixed.map(l => [l.id, l] as const))('%s: the fix is a legal line that starts and ends on your move', (_, l) => {
    const yours = lessonById(l.id)!.opening.side === 'w' ? 0 : 1
    const line = fixLesson(l)!
    const c = new Chess()
    line.moves.forEach((step, i) => {
      expect(c.move(step.san).san, `${l.id} move ${i + 1}`).toBe(step.san)
    })
    expect(l.fix!.at % 2, 'starts on your move').toBe(yours)
    expect(line.moves.length % 2, 'ends on your move').toBe(1 - yours)
    expect(l.fix!.moves[0].san).not.toBe(l.moves[l.fix!.at].san)
    // the hints on each step are legal moves other than the answer
    l.fix!.moves.forEach((step, i) => {
      const legal = replay(sans(line), l.fix!.at + i).moves().map(clean)
      for (const san of Object.keys({ ...step.alts, ...step.mistakes })) {
        expect(legal, `${l.id}: ${san}`).toContain(clean(san))
        expect(clean(san)).not.toBe(clean(step.san))
      }
    })
  })

  it('never contradicts the repertoire', () => {
    for (const o of OPENINGS) {
      const book = new Map<string, string>()
      for (const l of repertoireLines(o)) {
        sans(l).forEach((san, i) => { if (i % 2 === (o.side === 'w' ? 0 : 1)) book.set(fenKey(replay(sans(l), i).fen()), san) })
      }
      for (const l of o.lessons.filter(l => l.fix)) {
        const line = sans(fixLesson(l)!)
        for (let i = l.fix!.at; i < line.length; i += 2) {
          const known = book.get(fenKey(replay(line, i).fen()))
          if (known) expect(line[i], `${l.id} move ${i + 1}`).toBe(known)
        }
      }
    }
  })
})

import { FOCUS, drawLine, lineWeight } from './random'

describe('random trainer', () => {
  const blank = { lines: {} } as unknown as State
  const seq = (...xs: number[]) => { let i = 0; return () => xs[i++ % xs.length] }

  it('draws from every opening, the focus openings most often, and only repertoire lines', () => {
    const count: Record<string, number> = {}
    let k = 0
    const rnd = () => ((k += 0.6180339887) % 1)
    for (let i = 0; i < 3000; i++) {
      const d = drawLine(blank, 'all', [], undefined, rnd)!
      expect(d.lesson.drill && d.lesson.chapter !== 'variations', d.lesson.id).toBe(true)
      expect(d.opening.lessons).toContain(d.lesson)
      count[d.opening.id] = (count[d.opening.id] ?? 0) + 1
    }
    expect(Object.keys(count).sort()).toEqual(OPENINGS.map(o => o.id).sort())
    for (const id of FOCUS) expect(count[id], id).toBeGreaterThan(2 * Math.max(count.e4, count.kid))
  })

  it('leaves out openings that are switched off and the line just played', () => {
    const only = OPENINGS.filter(o => o.id !== 'london').map(o => o.id)
    for (const x of [0, 0.3, 0.7, 0.999]) {
      expect(drawLine(blank, 'all', only, undefined, seq(x))!.opening.id).toBe('london')
      expect(drawLine(blank, 'all', only, 'london-main', seq(0))!.lesson.id).not.toBe('london-main')
    }
    expect(drawLine(blank, 'all', OPENINGS.map(o => o.id))).toBeUndefined()
    expect(drawLine(blank, 'learned', [])).toBeUndefined()
  })

  it('brings up missed and new lines more often than known ones', () => {
    const line = (box: number, last: 'clean' | 'missed') => ({ lines: { x: { box, due: 0, runs: 3, clean: 1, last, matches: 0, matchClean: 0 } } }) as unknown as State
    const l = { id: 'x' } as Lesson
    expect(lineWeight(l, line(0, 'missed'))).toBeGreaterThan(lineWeight(l, blank))
    expect(lineWeight(l, blank)).toBeGreaterThan(lineWeight(l, line(5, 'clean')))
  })
})

import { SEE, childrenOf, linksFor, parentOf, rootsOf } from './links'

describe('lesson links', () => {
  it('points only at lessons that exist, and never at itself', () => {
    for (const [id, ids] of Object.entries(SEE)) {
      expect(lessonById(id), id).toBeTruthy()
      for (const other of ids) {
        expect(lessonById(other), other).toBeTruthy()
        expect(other).not.toBe(id)
      }
    }
  })

  it('puts every lesson in the tree of its opening exactly once', () => {
    for (const o of OPENINGS) {
      const seen: string[] = []
      const walk = (id: string) => { seen.push(id); childrenOf(id).forEach(l => walk(l.id)) }
      rootsOf(o).forEach(l => walk(l.id))
      expect(seen.sort()).toEqual(o.lessons.map(l => l.id).sort())
    }
  })

  it('connects a line to the lesson it branches from and to the traps its text mentions', () => {
    expect(parentOf('london-hfile-mate')).toMatchObject({ lesson: { id: 'london-bd6' }, at: '9… b6' })
    expect(linksFor('london-benoni').map(l => `${l.kind} ${l.lesson.id}`)).toContain('to london-poisoned-pawn')
    expect(linksFor('e4-scandi-queen-sac').map(l => `${l.kind} ${l.lesson.id}`)).toContain('see italian-legal')
    expect(linksFor('italian-legal').map(l => `${l.kind} ${l.lesson.id}`)).toContain('see e4-scandi-queen-sac')
  })
})

import { COMBOS, followRound } from './calc'
import { verdictFor } from './screens/Games'

describe('calculation trainer', () => {
  it('every combination is a legal line that starts and ends with the solver', () => {
    expect(COMBOS.length).toBeGreaterThanOrEqual(10)
    for (const combo of COMBOS) {
      const c = new Chess(combo.fen)
      expect(c.turn(), combo.id).toBe(combo.side)
      expect(combo.moves.length % 2, combo.id).toBe(1)
      for (const san of combo.moves) expect(c.move(san).san, combo.id).toBe(san)
    }
  })

  it('asks questions that have exactly one right answer among the options', () => {
    for (const plies of [2, 4, 6, 8]) {
      for (let n = 0; n < 150; n++) {
        const round = followRound(plies)
        const q = round.question
        expect(round.moves.length).toBe(plies)
        expect(new Set(q.options).size).toBe(q.options.length)
        expect(q.options.filter(o => o === q.answer).length).toBe(1)
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        if (q.kind === 'square') {
          expect(placementOf(round.finalFen)[q.sq] ?? '').toBe(q.answer)
        } else {
          const legal = new Chess(round.finalFen).moves()
          expect(q.options.filter(o => legal.includes(o))).toEqual([q.answer])
        }
      }
    }
  })
})

describe('game review', () => {
  it('grades a move by how much it gives away', () => {
    expect(verdictFor(50, 50, true)).toBe('best')
    expect(verdictFor(50, 20, false)).toBe('good')
    expect(verdictFor(50, -30, false)).toBe('inaccuracy')
    expect(verdictFor(50, -150, false)).toBe('mistake')
    expect(verdictFor(50, -400, false)).toBe('blunder')
    expect(verdictFor(9990, 2000, false)).toBe('good') // still completely winning
  })
})

import { courseOpening, outcome, parsePgn, sideOf, toSaved } from './pgn'

describe('loading games from PGN', () => {
  const header = (white: string, black: string, result: string, extra = '') =>
    `[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2026.11.12"]\n[White "${white}"]\n[Black "${black}"]\n[Result "${result}"]\n${extra}\n`
  const first = header('anna', 'Bob', '0-1', '[UTCDate "2026.11.12"]\n[UTCTime "20:24:35"]\n[Termination "Bob won by resignation"]\n[Link "https://www.chess.com/game/live/1"]\n')
    + '1. e4 {[%clk 0:09:58]} 1... c6 {[%clk 0:09:57]} 2. d4 d5 (2... g6 3. Nc3) 3. e5 Bf5 $1 4. Nf3 e6 0-1'
  const second = header('Bob', 'carl', '1/2-1/2') + '1. d4 d5 2. Bf4 Nf6 3. e3 e6 1/2-1/2'

  it('reads moves and players, ignoring clocks, comments and side lines', () => {
    const { games, skipped } = parsePgn(first + '\r\n\r\n' + second + '\n\n' + header('x', 'y', '*') + '1. e4 e5 2. Ke3 *')
    expect(skipped).toBe(1)
    expect(games.map(g => g.moves.join(' '))).toEqual(['e4 c6 d4 d5 e5 Bf5 Nf3 e6', 'd4 d5 Bf4 Nf6 e3 e6'])
    expect(games[0]).toMatchObject({ white: 'anna', black: 'Bob', result: '0-1', at: Date.UTC(2026, 10, 12, 20, 24, 35), link: 'https://www.chess.com/game/live/1' })
    expect(parsePgn('1. e4 e5 2. Nf3').games[0]).toMatchObject({ white: '', black: '', result: '*', moves: ['e4', 'e5', 'Nf3'] })
    expect(() => parsePgn('hello there')).toThrow()
    expect(() => parsePgn('  ')).toThrow()
    expect(() => parsePgn('[FEN "8/8/8/8/8/4k3/4p3/4K3 b - - 0 1"]\n[SetUp "1"]\n\n1... Kd3')).toThrow(/set-up/)
  })

  it('works out which side is yours, the opening and the result', () => {
    const [a, b] = parsePgn(first + '\n\n' + second).games
    expect([sideOf(a, []), sideOf(a, ['bob']), sideOf(b, ['BOB']), sideOf(a, ['anna', 'bob'])]).toEqual([undefined, 'b', 'w', undefined])
    expect(outcome(a, 'b')).toBe('You won by resignation')
    expect(outcome(a, 'w')).toBe('You lost by resignation')
    expect(outcome(b, 'w')).toBe('Draw')
    expect(courseOpening(a.moves, 'b')?.id).toBe('caro')
    expect(courseOpening(b.moves, 'w')?.id).toBe('london')
    expect(courseOpening(['e4', 'e5', 'f3', 'Nc6'], 'w')).toBeUndefined()
    expect(courseOpening(['e4', 'e5', 'f3', 'Nc6'], 'b')).toBeUndefined()

    const saved = toSaved(a, 'b')
    expect(saved).toMatchObject({ opening: 'caro', side: 'b', imported: true, white: 'anna', black: 'Bob', result: 'You won by resignation' })
    expect(saved.notes[1]).toEqual({ verdict: 'course' }) // 1… c6
    expect(saved.notes[0]).toBeUndefined() // not your move
    expect(toSaved(a, 'b').id).toBe(saved.id)
    expect(toSaved(a, 'w').id).not.toBe(saved.id)
    expect(replay(saved.moves).history()).toEqual(saved.moves)
  })
})

import { accuracyOf, gameAccuracy, moveAccuracy, winChance } from './accuracy'

describe('accuracy', () => {
  it('rates a move by the winning chances it gives away', () => {
    expect(winChance(0)).toBe(50)
    expect(winChance(300)).toBeGreaterThan(70)
    expect(moveAccuracy(50, 50)).toBe(100)
    expect(moveAccuracy(50, 120)).toBe(100) // the position got better than expected
    expect(moveAccuracy(50, -50)).toBeGreaterThan(moveAccuracy(50, -300))
    expect(moveAccuracy(0, -1000)).toBeLessThan(15)
    expect(moveAccuracy(1000, 800)).toBeGreaterThan(85) // still winning easily
  })

  it('sums a game up, weighing bad moves more than an average would', () => {
    expect(gameAccuracy([])).toBeNull()
    expect(gameAccuracy([100, 100])).toBe(100)
    expect(gameAccuracy([100, 100, 100, 10])!).toBeLessThan(77.5)
    expect(accuracyOf({ 0: { verdict: 'course' }, 2: { verdict: 'best', cp: 30, loss: 0 } })).toBe(100)
    expect(accuracyOf({ 0: { verdict: 'best', cp: 30, loss: 0 }, 2: { verdict: 'blunder', cp: -400, loss: 430 } })!).toBeLessThan(70)
    expect(accuracyOf({})).toBeNull()
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
