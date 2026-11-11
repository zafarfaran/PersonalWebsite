import { describe, expect, it } from 'vitest'
import { DECKS, TRICKS, exampleOf, isRight, newProblem, parseAnswer, type Problem } from './tricks'

/** Work out a question directly, without any trick. */
function direct(q: string): number {
  let m = q.match(/^(\d+)²$/)
  if (m) return +m[1] * +m[1]
  m = q.match(/^(\d+)% of (\d+)$/)
  if (m) return (+m[1] * +m[2]) / 100
  m = q.match(/^(\d+) ([+−×÷]) (\d+)$/)
  if (!m) throw new Error(`unreadable question: ${q}`)
  const [a, b] = [+m[1], +m[3]]
  return { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]]!
}

/** Every "x op y = z" written in the steps must be true arithmetic. */
function checkSteps(p: Problem) {
  for (const step of p.steps) {
    for (const m of step.matchAll(/([\d.]+) ([+−×÷]) ([\d.]+) = ([\d.]+)/g)) {
      const [a, b, z] = [+m[1], +m[3], +m[4]]
      const got = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]]!
      expect(Math.abs(got - z), `${p.q}: "${step}"`).toBeLessThan(1e-9)
    }
  }
  // the last step must arrive at the answer
  expect(p.steps[p.steps.length - 1], p.q).toMatch(new RegExp(`(^|[^\\d.])${String(p.answer).replace('.', '\\.')}$`))
}

describe('tricks', () => {
  it.each(TRICKS.map(t => [t.id, t] as const))('%s: answers and worked steps are correct', (_, t) => {
    const problems = [exampleOf(t), ...Array.from({ length: 400 }, () => newProblem(t))]
    for (const p of problems) {
      expect(isRight(p.answer, direct(p.q)), `${p.q} = ${p.answer}`).toBe(true)
      expect(p.answer).toBeGreaterThan(0)
      checkSteps(p)
    }
    expect(t.how.length).toBeGreaterThanOrEqual(2)
  })

  it('trick ids are unique', () => {
    expect(new Set(TRICKS.map(t => t.id)).size).toBe(TRICKS.length)
  })
})

describe('memory facts', () => {
  it('have unique keys and correct answers', () => {
    const facts = Object.values(DECKS).flatMap(d => d.facts)
    expect(new Set(facts.map(f => f.key)).size).toBe(facts.length)
    expect(DECKS.tables.facts).toHaveLength(66)
    expect(DECKS.tables.facts.find(f => f.q === '7 × 8')!.answer).toBe(56)
    expect(DECKS.squares.facts.find(f => f.q === '17²')!.answer).toBe(289)
    expect(DECKS.fractions.facts.find(f => f.key === 'f3/8')!.answer).toBe(37.5)
  })
})

describe('answer parsing', () => {
  it('reads numbers people actually type', () => {
    expect(parseAnswer('1,250')).toBe(1250)
    expect(parseAnswer(' 18.5 ')).toBe(18.5)
    expect(parseAnswer('')).toBeNull()
    expect(parseAnswer('abc')).toBeNull()
    expect(parseAnswer('.')).toBeNull()
  })
})
