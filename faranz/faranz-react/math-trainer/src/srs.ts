// Spaced repetition: each item sits in a box. A clean answer moves it up a box
// and pushes the next review further away; a miss sends it back to the start.

export const DAY = 24 * 60 * 60 * 1000
/** Days until the next review, by box. */
export const INTERVALS = [0, 1, 3, 7, 14, 30]

export interface Memory {
  box: number
  due: number
}

export function review(prev: Memory | undefined, correct: boolean, now: number): Memory {
  if (!correct) return { box: 0, due: now }
  const box = Math.min((prev?.box ?? 0) + 1, INTERVALS.length - 1)
  return { box, due: now + INTERVALS[box] * DAY }
}

export const isDue = (m: Memory | undefined, now: number) => !!m && m.due <= now

/** Memory strength from 0 to 1, for progress bars. */
export const strength = (m: Memory | undefined) => (m ? m.box / (INTERVALS.length - 1) : 0)

export function dueLabel(m: Memory | undefined, now: number): string {
  if (!m) return 'Not started'
  const days = Math.ceil((m.due - now) / DAY)
  if (days <= 0) return 'Today'
  return days === 1 ? 'Tomorrow' : `In ${days} days`
}

export const dayStamp = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Consecutive days of practice ending today (or yesterday, so the streak survives until you practise). */
export function streak(days: string[], now: number): number {
  const set = new Set(days)
  let t = now
  if (!set.has(dayStamp(t))) t -= DAY
  let n = 0
  while (set.has(dayStamp(t))) {
    n++
    t -= DAY
  }
  return n
}
