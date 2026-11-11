import { london } from './london'
import { italian } from './italian'
import type { Lesson, Opening } from './types'

export * from './types'

export const OPENINGS: Opening[] = [london, italian]

export const openingById = (id: string) => OPENINGS.find(o => o.id === id)

export function lessonById(id: string): { opening: Opening; lesson: Lesson } | undefined {
  for (const opening of OPENINGS) {
    const lesson = opening.lessons.find(l => l.id === id)
    if (lesson) return { opening, lesson }
  }
}

/** Lines that are drilled in Practise, Match and Memorise. */
export const drillLines = (o: Opening) => o.lessons.filter(l => l.drill)

export const sans = (l: Lesson) => l.moves.map(s => s.san)
