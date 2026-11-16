import { MODULES } from './content'
import { isDue } from './srs'
import type { State } from './store'
import type { Lesson, Module, Question } from './types'

export interface Located {
  module: Module
  lesson: Lesson
  question: Question
}

export const LESSONS = MODULES.flatMap(module => module.lessons.map(lesson => ({ module, lesson })))
export const QUESTIONS: Located[] = LESSONS.flatMap(({ module, lesson }) => lesson.questions.map(question => ({ module, lesson, question })))

export const moduleById = (id: string) => MODULES.find(m => m.id === id)
export const lessonById = (id: string) => LESSONS.find(l => l.lesson.id === id)

/** Questions whose last answer was right. */
export const rightIn = (questions: Question[], s: Pick<State, 'questions'>) => questions.filter(q => s.questions[q.id]?.last === 'right').length

export const moduleQuestions = (m: Module) => m.lessons.flatMap(l => l.questions)

/** The lesson to go on with: the first one with a question you have not got right yet. */
export const nextLesson = (m: Module, s: State) => m.lessons.find(l => rightIn(l.questions, s) < l.questions.length) ?? m.lessons[0]

export const dueQuestions = (s: State, now: number) => QUESTIONS.filter(q => isDue(s.questions[q.question.id], now))

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** How badly a question needs asking: missed ones first, then new ones, then the ones you know least well. */
function need(q: Question, s: State): number {
  const stat = s.questions[q.id]
  if (!stat) return 1
  if (stat.last === 'wrong') return 0
  return 2 + stat.box
}

export type DrillKind = 'due' | 'mixed' | 'weak'

/** The questions a drill can draw from. A module id gives that module's questions. */
export function drillPool(kind: string, s: State, now: number): Located[] {
  if (kind === 'due') return dueQuestions(s, now)
  if (kind === 'weak') return QUESTIONS.filter(q => s.questions[q.question.id]?.last === 'wrong')
  if (kind === 'mixed') {
    // only what you have studied, unless you have not started yet
    const studied = QUESTIONS.filter(q => s.lessons[q.lesson.id])
    return studied.length >= 5 ? studied : QUESTIONS
  }
  return QUESTIONS.filter(q => q.module.id === kind)
}

/** A round of questions from a pool, the ones that most need asking first. */
export function deal(pool: Located[], s: State, size: number, random: () => number = Math.random): Located[] {
  return shuffle(pool, random)
    .sort((a, b) => need(a.question, s) - need(b.question, s))
    .slice(0, size)
}
