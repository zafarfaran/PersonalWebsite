import { isDue } from './srs'
import type { State } from './store'
import { TRICKS } from './tricks'

export const learned = (s: State) => TRICKS.filter(t => s.tricks[t.id])
export const dueTricks = (s: State, now: number) => TRICKS.filter(t => isDue(s.tricks[t.id], now))
/** The first trick whose lesson is not finished, or the first trick if all are done. */
export const nextTrick = (s: State) => TRICKS.find(t => !s.lessons[t.id]) ?? TRICKS[0]
/** Tricks to draw mixed questions from: what you have learned, or everything if that is too few to mix. */
export const mixPool = (s: State) => (learned(s).length >= 3 ? learned(s) : TRICKS)

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]
