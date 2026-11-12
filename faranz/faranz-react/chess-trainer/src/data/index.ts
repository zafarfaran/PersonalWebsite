import { london } from './london'
import { italian } from './italian'
import { e4 } from './e4'
import { caro } from './caro'
import { sicilian } from './sicilian'
import { kid } from './kid'
import { moveLabel } from '../chess'
import type { Lesson, Opening, Side } from './types'

export * from './types'

export const OPENINGS: Opening[] = [london, italian, e4, caro, sicilian, kid]

export const openingById = (id: string) => OPENINGS.find(o => o.id === id)

/** Stands in for an opening when a game of yours follows none of the course's lines. */
export const freePlay = (side: Side): Opening => ({
  id: 'free-' + side,
  name: 'Your game',
  tagline: '',
  firstMoves: '',
  side,
  setupFen: '',
  setupNote: '',
  cardLesson: '',
  lessons: [],
})

export function lessonById(id: string): { opening: Opening; lesson: Lesson } | undefined {
  for (const opening of OPENINGS) {
    const lesson = opening.lessons.find(l => l.id === id)
    if (lesson) return { opening, lesson }
  }
}

/** Lines that are drilled in Practise, Match and Memorise. */
export const drillLines = (o: Opening) => o.lessons.filter(l => l.drill)

export const trapLessons = (o: Opening) => o.lessons.filter(l => l.chapter === 'traps')

/**
 * Lines of the one repertoire the course recommends. Lessons in the
 * "variations" chapter teach other systems that start from the same moves, so
 * they can ask for a different move in the same position and are left out
 * wherever a single right answer is needed.
 */
export const repertoireLines = (o: Opening) => drillLines(o).filter(l => l.chapter !== 'variations')

export const sans = (l: Lesson) => l.moves.map(s => s.san)

/** The fix of a trap lesson as a guided line of its own: the lesson up to the mistake, then the right moves. */
export function fixLesson(l: Lesson): Lesson | undefined {
  const { fix, plan: _plan, ...rest } = l
  return fix && {
    ...rest,
    id: l.id + '-fix',
    title: `The right move: ${moveLabel(fix.at)} ${fix.moves[0].san}`,
    kind: 'guided',
    drill: false,
    intro: fix.intro,
    moves: [...l.moves.slice(0, fix.at), ...fix.moves],
    outro: fix.outro,
  }
}
