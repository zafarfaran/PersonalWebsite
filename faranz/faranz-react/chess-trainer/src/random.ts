import { OPENINGS, repertoireLines, type Lesson, type Opening } from './data'
import type { State } from './store'

/** The openings the random trainer leans on: each comes up three times as often as the others. */
export const FOCUS = ['london', 'italian', 'caro', 'sicilian']
export const FOCUS_WEIGHT = 3

export type Scope = 'learned' | 'all'

/** The lines the random trainer can draw from in one opening. */
export const randomPool = (o: Opening, s: State, scope: Scope) =>
  repertoireLines(o).filter(l => scope === 'all' || s.lines[l.id])

/** How often a line should come up: new and shaky lines more often than ones you know well. */
export function lineWeight(l: Lesson, s: State): number {
  const st = s.lines[l.id]
  if (!st || !st.runs) return 3
  if (st.last === 'missed') return 4
  return st.box >= 4 ? 1 : st.box >= 2 ? 2 : 3
}

function weighted<T>(items: T[], weight: (item: T) => number, rnd: () => number): T | undefined {
  let at = rnd() * items.reduce((sum, item) => sum + weight(item), 0)
  for (const item of items) {
    at -= weight(item)
    if (at < 0) return item
  }
  return items[items.length - 1]
}

/**
 * Draw the next line: first an opening (the focus openings more often), then
 * one of its lines (the weak ones more often). Never the line just played,
 * unless it is the only one.
 */
export function drawLine(
  s: State,
  scope: Scope,
  off: string[],
  avoid?: string,
  rnd: () => number = Math.random,
): { opening: Opening; lesson: Lesson } | undefined {
  const pools = OPENINGS.filter(o => !off.includes(o.id))
    .map(o => ({ opening: o, lines: randomPool(o, s, scope) }))
    .filter(p => p.lines.length)
  const fresh = pools.map(p => ({ ...p, lines: p.lines.filter(l => l.id !== avoid) })).filter(p => p.lines.length)
  const from = weighted(fresh.length ? fresh : pools, p => (FOCUS.includes(p.opening.id) ? FOCUS_WEIGHT : 1), rnd)
  const lesson = from && weighted(from.lines, l => lineWeight(l, s), rnd)
  return from && lesson && { opening: from.opening, lesson }
}
