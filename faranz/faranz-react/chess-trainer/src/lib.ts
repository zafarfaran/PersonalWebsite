import { fenKey, lastMoveOf, replay, type Square } from './chess'
import { OPENINGS, drillLines, sans, type Lesson, type Opening } from './data'
import { isDue } from './srs'
import type { State } from './store'

/** The first lesson not yet finished, or the first lesson if all are done. */
export const nextLesson = (o: Opening, s: State) => o.lessons.find(l => !s.lessons[l.id]) ?? o.lessons[0]

export const lessonsDone = (o: Opening, s: State) => o.lessons.filter(l => s.lessons[l.id]).length

/** Lines you have learned or practised at least once. */
export const learnedLines = (o: Opening, s: State) => drillLines(o).filter(l => s.lines[l.id])

export const dueLines = (s: State, now: number) =>
  OPENINGS.flatMap(o => drillLines(o)).filter(l => isDue(s.lines[l.id], now))

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface Card {
  key: string
  fen: string
  san: string
  note?: string
  lesson: Lesson
  ply: number
  last: { from: Square; to: Square } | null
}

/** One memory card per distinct position in which you have a move to remember. */
export function cardsFor(o: Opening): Card[] {
  const seen = new Set<string>()
  const cards: Card[] = []
  for (const lesson of drillLines(o)) {
    const line = sans(lesson)
    for (let ply = o.side === 'w' ? 0 : 1; ply < line.length; ply += 2) {
      const game = replay(line, ply)
      const key = fenKey(game.fen())
      if (seen.has(key)) continue
      seen.add(key)
      cards.push({ key, fen: game.fen(), san: line[ply], note: lesson.moves[ply].note, lesson, ply, last: lastMoveOf(game) })
    }
  }
  return cards
}
