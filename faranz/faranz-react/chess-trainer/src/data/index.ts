import { london } from './london'
import { italian } from './italian'
import { caro } from './caro'
import { sicilian } from './sicilian'
import type { Lesson, Opening } from './types'

export * from './types'

export const OPENINGS: Opening[] = [london, italian, caro, sicilian]

export const openingById = (id: string) => OPENINGS.find(o => o.id === id)

export function lessonById(id: string): { opening: Opening; lesson: Lesson } | undefined {
  for (const opening of OPENINGS) {
    const lesson = opening.lessons.find(l => l.id === id)
    if (lesson) return { opening, lesson }
  }
}

/** Lines that are drilled in Practise, Match and Memorise. */
export const drillLines = (o: Opening) => o.lessons.filter(l => l.drill)

/**
 * Lines of the one repertoire the course recommends. Lessons in the
 * "variations" chapter teach other systems that start from the same moves, so
 * they can ask for a different move in the same position and are left out
 * wherever a single right answer is needed.
 */
export const repertoireLines = (o: Opening) => drillLines(o).filter(l => l.chapter !== 'variations')

export const sans = (l: Lesson) => l.moves.map(s => s.san)
