export interface Problem {
  /** The question as shown, e.g. "47 × 5". */
  q: string
  answer: number
  /** This problem worked out with the trick, one step per line. */
  steps: string[]
}

export type Chapter = 'add' | 'mul' | 'sq' | 'div' | 'pct'

export const CHAPTERS: Record<Chapter, string> = {
  add: 'Adding and subtracting',
  mul: 'Multiplying',
  sq: 'Squares',
  div: 'Dividing',
  pct: 'Percentages',
}

export interface Trick {
  id: string
  chapter: Chapter
  title: string
  blurb: string
  /** The trick in one sentence. */
  rule: string
  /** The method as generic steps, shown alongside while you practise. */
  how: string[]
  why: string
  /** Arguments for the worked example in the lesson. */
  example: number[]
  /** Random arguments for a new problem. */
  random: () => number[]
  build: (...n: number[]) => Problem
}

const ri = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = <T,>(items: T[]): T => items[ri(0, items.length - 1)]
/** Print a number without floating-point noise (18.5, not 18.500000001). */
export const fmt = (n: number) => String(Number(n.toFixed(4)))
const f = fmt

export const TRICKS: Trick[] = [
  {
    id: 'add-ltr',
    chapter: 'add',
    title: 'Add from left to right',
    blurb: 'Tens first, then units',
    rule: 'Keep the first number whole, add the tens of the second number, then add its units.',
    how: ['Keep the first number whole.', 'Add the tens of the second number.', 'Add the units.'],
    why: 'School teaches right to left with carries, which is built for paper. Going left to right, the big part of the answer comes first and you never have to hold a carry in your head.',
    example: [47, 38],
    random: () => [ri(23, 89), ri(1, 8) * 10 + ri(1, 9)],
    build: (a, b) => {
      const tens = Math.floor(b / 10) * 10
      return { q: `${a} + ${b}`, answer: a + b, steps: [`${a} + ${tens} = ${a + tens}`, `${a + tens} + ${b - tens} = ${a + b}`] }
    },
  },
  {
    id: 'add-round',
    chapter: 'add',
    title: 'Round up, then give back',
    blurb: 'Adding numbers that end in 7, 8 or 9',
    rule: 'Round the awkward number up to the next ten, add that, then subtract the extra.',
    how: ['Round the second number up to the next ten.', 'Add the round number.', 'Subtract the little bit you added on.'],
    why: 'Adding a round number is easy, and the correction is tiny. 99 is just 100 minus 1.',
    example: [56, 38],
    random: () => [ri(24, 489), pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 200]) - ri(1, 3)],
    build: (a, b) => {
      const round = Math.ceil(b / 10) * 10
      const d = round - b
      return {
        q: `${a} + ${b}`,
        answer: a + b,
        steps: [`${b} is ${d} less than ${round}`, `${a} + ${round} = ${a + round}`, `${a + round} − ${d} = ${a + b}`],
      }
    },
  },
  {
    id: 'sub-round',
    chapter: 'add',
    title: 'Subtract a round number, then add back',
    blurb: 'Taking away numbers that end in 7, 8 or 9',
    rule: 'Round the number you are subtracting up to the next ten, subtract that, then add the extra back.',
    how: ['Round the second number up to the next ten.', 'Subtract the round number.', 'You took away too much, so add the difference back.'],
    why: 'It avoids borrowing. Taking away 40 and returning 2 is the same as taking away 38.',
    example: [83, 38],
    random: () => {
      const round = ri(2, 9) * 10
      return [round + ri(5, 400), round - ri(1, 3)]
    },
    build: (a, b) => {
      const round = Math.ceil(b / 10) * 10
      const d = round - b
      return {
        q: `${a} − ${b}`,
        answer: a - b,
        steps: [`${b} is ${d} less than ${round}`, `${a} − ${round} = ${a - round}`, `${a - round} + ${d} = ${a - b}`],
      }
    },
  },
  {
    id: 'sub-count-up',
    chapter: 'add',
    title: 'Subtract by counting up',
    blurb: 'How shopkeepers make change',
    rule: 'Instead of taking away, count up from the smaller number to the bigger one and add the jumps.',
    how: ['Jump from the smaller number up to the next ten.', 'Jump from there to the bigger number.', 'Add the two jumps.'],
    why: 'The difference between two numbers is the distance between them. Measuring that distance in easy jumps avoids borrowing across zeros.',
    example: [500, 237],
    random: () => {
      const a = ri(1, 10) * 100
      let b = ri(11, a - 11)
      if (b % 10 === 0) b += ri(1, 9)
      return [a, b]
    },
    build: (a, b) => {
      const ten = Math.ceil(b / 10) * 10
      return {
        q: `${a} − ${b}`,
        answer: a - b,
        steps: [`From ${b} up to ${ten} is ${ten - b}`, `From ${ten} up to ${a} is ${a - ten}`, `${ten - b} + ${a - ten} = ${a - b}`],
      }
    },
  },
  {
    id: 'mul-5',
    chapter: 'mul',
    title: 'Multiply by 5',
    blurb: 'Halve it, then times 10',
    rule: 'Halve the number, then multiply by 10.',
    how: ['Halve the number.', 'Multiply by 10 (move the decimal point one place).'],
    why: '5 is half of 10. Multiplying by 10 and halving are both easy, and it does not matter which you do first.',
    example: [68],
    random: () => [ri(12, 198)],
    build: n => ({ q: `${n} × 5`, answer: n * 5, steps: [`${n} ÷ 2 = ${f(n / 2)}`, `${f(n / 2)} × 10 = ${n * 5}`] }),
  },
  {
    id: 'mul-9',
    chapter: 'mul',
    title: 'Multiply by 9',
    blurb: 'Times 10, minus one lot',
    rule: 'Multiply by 10, then subtract the number once.',
    how: ['Multiply the number by 10.', 'Subtract the original number.'],
    why: 'Nine lots of something is ten lots minus one lot.',
    example: [47],
    random: () => [ri(12, 99)],
    build: n => ({ q: `${n} × 9`, answer: n * 9, steps: [`${n} × 10 = ${n * 10}`, `${n * 10} − ${n} = ${n * 9}`] }),
  },
  {
    id: 'mul-11',
    chapter: 'mul',
    title: 'Multiply a two-digit number by 11',
    blurb: 'Add the digits and put the sum in the middle',
    rule: 'Add the two digits and write the sum between them. If the sum is 10 or more, carry the 1 to the first digit.',
    how: ['Add the two digits.', 'Write that sum between the two digits.', 'If the sum is 10 or more, keep its last digit in the middle and add 1 to the first digit.'],
    why: 'Multiplying by 11 is the number times 10 plus the number. Written out, the tens digit of one lines up with the units digit of the other, so they add in the middle.',
    example: [53],
    random: () => [ri(1, 9) * 10 + ri(1, 9)],
    build: n => {
      const [t, u] = [Math.floor(n / 10), n % 10]
      const s = t + u
      return {
        q: `${n} × 11`,
        answer: n * 11,
        steps: [
          `${t} + ${u} = ${s}`,
          s < 10
            ? `Put the ${s} between the ${t} and the ${u}: ${n * 11}`
            : `Put the ${s % 10} in the middle and carry the 1 to the ${t}: ${n * 11}`,
        ],
      }
    },
  },
  {
    id: 'mul-double',
    chapter: 'mul',
    title: 'Multiply by 4 and 8',
    blurb: 'Keep doubling',
    rule: 'To multiply by 4, double twice. To multiply by 8, double three times.',
    how: ['Double the number.', 'Double again (that is times 4).', 'For times 8, double once more.'],
    why: '4 is 2 × 2 and 8 is 2 × 2 × 2, and doubling is one of the easiest things to do in your head.',
    example: [37, 8],
    random: () => [ri(13, 75), pick([4, 8])],
    build: (n, k) => ({
      q: `${n} × ${k}`,
      answer: n * k,
      steps: [`${n} × 2 = ${n * 2}`, `${n * 2} × 2 = ${n * 4}`, ...(k === 8 ? [`${n * 4} × 2 = ${n * 8}`] : [])],
    }),
  },
  {
    id: 'mul-25',
    chapter: 'mul',
    title: 'Multiply by 25',
    blurb: 'Times 100, then halve twice',
    rule: 'Multiply by 100, then halve the result twice.',
    how: ['Multiply the number by 100.', 'Halve it.', 'Halve it again.'],
    why: '25 is a quarter of 100, and a quarter is half of a half.',
    example: [36],
    random: () => [ri(12, 88)],
    build: n => ({
      q: `${n} × 25`,
      answer: n * 25,
      steps: [`${n} × 100 = ${n * 100}`, `${n * 100} ÷ 2 = ${n * 50}`, `${n * 50} ÷ 2 = ${n * 25}`],
    }),
  },
  {
    id: 'mul-split',
    chapter: 'mul',
    title: 'Split the big number',
    blurb: 'One digit times two digits',
    rule: 'Multiply the tens first, then the units, and add the two results.',
    how: ['Multiply by the tens part.', 'Multiply by the units part.', 'Add the two results.'],
    why: '7 × 46 is seven 40s plus seven 6s. Doing the tens first gives you most of the answer straight away.',
    example: [7, 46],
    random: () => [ri(3, 9), ri(1, 9) * 10 + ri(2, 9)],
    build: (a, b) => {
      const tens = Math.floor(b / 10) * 10
      const u = b - tens
      return { q: `${a} × ${b}`, answer: a * b, steps: [`${a} × ${tens} = ${a * tens}`, `${a} × ${u} = ${a * u}`, `${a * tens} + ${a * u} = ${a * b}`] }
    },
  },
  {
    id: 'mul-teens',
    chapter: 'mul',
    title: 'Multiply two teens',
    blurb: 'Any two numbers from 11 to 19',
    rule: 'Add the units digit of one number to the other number, multiply by 10, then add the product of the two units digits.',
    how: ['Add the second number\'s units digit to the first number.', 'Multiply that by 10.', 'Multiply the two units digits together.', 'Add the two results.'],
    why: '(10 + a)(10 + b) is 100 + 10a + 10b + ab. The first three parts are 10 × (10 + a + b), which is the "add, then times 10" step.',
    example: [13, 17],
    random: () => [ri(11, 19), ri(11, 19)],
    build: (a, b) => {
      const [ua, ub] = [a - 10, b - 10]
      const base = (a + ub) * 10
      return {
        q: `${a} × ${b}`,
        answer: a * b,
        steps: [`${a} + ${ub} = ${a + ub}`, `${a + ub} × 10 = ${base}`, `${ua} × ${ub} = ${ua * ub}`, `${base} + ${ua * ub} = ${a * b}`],
      }
    },
  },
  {
    id: 'mul-halve-double',
    chapter: 'mul',
    title: 'Halve one, double the other',
    blurb: 'Even number times a number ending in 5',
    rule: 'Halve the even number and double the other one. The answer stays the same but the sum gets easier.',
    how: ['Halve the even number.', 'Double the number ending in 5 (it becomes a round number).', 'Multiply the two new numbers.'],
    why: 'Halving one factor and doubling the other cancels out. A number ending in 5 doubles to a multiple of 10.',
    example: [16, 35],
    random: () => [ri(6, 24) * 2, pick([15, 25, 35, 45, 55])],
    build: (a, b) => ({
      q: `${a} × ${b}`,
      answer: a * b,
      steps: [`${a} ÷ 2 = ${a / 2}`, `${b} × 2 = ${b * 2}`, `${a / 2} × ${b * 2} = ${a * b}`],
    }),
  },
  {
    id: 'mul-near-100',
    chapter: 'mul',
    title: 'Two numbers just under 100',
    blurb: 'Like 96 × 93',
    rule: 'Work out how far each number is below 100. Subtract one gap from the other number for the front of the answer, and multiply the gaps for the last two digits.',
    how: ['Find how far each number is below 100.', 'Subtract one number\'s gap from the other number. That is the front of the answer.', 'Multiply the two gaps. That is the last two digits.', 'Put them together.'],
    why: '(100 − a)(100 − b) is 100 × (100 − a − b) + ab. The first part is the cross-subtraction and the second is the product of the gaps.',
    example: [96, 93],
    random: () => [ri(91, 99), ri(91, 99)],
    build: (a, b) => {
      const [da, db] = [100 - a, 100 - b]
      const front = a - db
      return {
        q: `${a} × ${b}`,
        answer: a * b,
        steps: [
          `${a} is ${da} below 100 and ${b} is ${db} below 100`,
          `${a} − ${db} = ${front}`,
          `${da} × ${db} = ${da * db}`,
          `${front * 100} + ${da * db} = ${a * b}`,
        ],
      }
    },
  },
  {
    id: 'mul-diff-squares',
    chapter: 'mul',
    title: 'Same distance from a round number',
    blurb: 'Like 47 × 53',
    rule: 'When two numbers sit the same distance either side of a round number, square the round number and subtract the square of the distance.',
    how: ['Spot the round number in the middle and the distance to it.', 'Square the round number.', 'Square the distance.', 'Subtract.'],
    why: '(m − d)(m + d) always equals m² − d². The cross terms cancel.',
    example: [50, 3],
    random: () => [pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), ri(1, 5)],
    build: (m, d) => ({
      q: `${m - d} × ${m + d}`,
      answer: (m - d) * (m + d),
      steps: [`${m - d} and ${m + d} are both ${d} away from ${m}`, `${m} × ${m} = ${m * m}`, `${d} × ${d} = ${d * d}`, `${m * m} − ${d * d} = ${m * m - d * d}`],
    }),
  },
  {
    id: 'sq-5',
    chapter: 'sq',
    title: 'Square a number ending in 5',
    blurb: 'Like 65²',
    rule: 'Multiply the tens digit by the next number up, then write 25 after it.',
    how: ['Take the part before the 5.', 'Multiply it by one more than itself.', 'Write 25 on the end.'],
    why: '(10t + 5)² is 100 × t × (t + 1) + 25. The t × (t + 1) part gives the hundreds, and the 25 never changes.',
    example: [65],
    random: () => [ri(1, 11) * 10 + 5],
    build: n => {
      const t = (n - 5) / 10
      return { q: `${n}²`, answer: n * n, steps: [`${t} × ${t + 1} = ${t * (t + 1)}`, `Write 25 after ${t * (t + 1)}: ${n * n}`] }
    },
  },
  {
    id: 'sq-near',
    chapter: 'sq',
    title: 'Square any two-digit number',
    blurb: 'Go down to a round number and up by the same amount',
    rule: 'Move the number down and up by the same amount so one of them is round. Multiply those two, then add the square of the amount you moved.',
    how: ['Find the distance to the nearest ten.', 'Go that far down and that far up, so one of the two numbers is round.', 'Multiply those two numbers.', 'Add the square of the distance.'],
    why: 'n² equals (n − d)(n + d) + d². You swap one hard square for an easy multiplication and a tiny square.',
    example: [48],
    random: () => [ri(1, 9) * 10 + pick([1, 2, 3, 4, 6, 7, 8, 9])],
    build: n => {
      const d = Math.abs(n - Math.round(n / 10) * 10)
      const [lo, hi] = [n - d, n + d]
      return {
        q: `${n}²`,
        answer: n * n,
        steps: [`Go ${d} down and ${d} up: ${lo} and ${hi}`, `${lo} × ${hi} = ${lo * hi}`, `${d} × ${d} = ${d * d}`, `${lo * hi} + ${d * d} = ${n * n}`],
      }
    },
  },
  {
    id: 'div-5',
    chapter: 'div',
    title: 'Divide by 5',
    blurb: 'Double it, then divide by 10',
    rule: 'Double the number, then divide by 10.',
    how: ['Double the number.', 'Divide by 10 (move the decimal point one place).'],
    why: 'Dividing by 5 is the same as dividing by 10 and doubling, because 5 is 10 ÷ 2.',
    example: [435],
    random: () => [ri(13, 199) * 5],
    build: n => ({ q: `${n} ÷ 5`, answer: n / 5, steps: [`${n} × 2 = ${n * 2}`, `${n * 2} ÷ 10 = ${n / 5}`] }),
  },
  {
    id: 'div-4',
    chapter: 'div',
    title: 'Divide by 4',
    blurb: 'Halve it twice',
    rule: 'Halve the number, then halve it again.',
    how: ['Halve the number.', 'Halve the result.'],
    why: 'A quarter is half of a half.',
    example: [348],
    random: () => [ri(13, 99) * 4],
    build: n => ({ q: `${n} ÷ 4`, answer: n / 4, steps: [`${n} ÷ 2 = ${n / 2}`, `${n / 2} ÷ 2 = ${n / 4}`] }),
  },
  {
    id: 'pct-10',
    chapter: 'pct',
    title: 'Build percentages from 10%',
    blurb: '5%, 15%, 20% and 30% of anything',
    rule: 'Find 10% by dividing by 10, then build the percentage you need from it.',
    how: ['Find 10%: divide by 10.', 'For 5%, halve the 10%. For 20% or 30%, double or triple it.', 'For 15%, add the 10% and the 5%.'],
    why: '10% is always one easy step away, and most everyday percentages (tips, discounts, tax) are simple combinations of it.',
    example: [15, 240],
    random: () => [pick([5, 15, 20, 30]), ri(2, 45) * 20],
    build: (p, n) => {
      const t = n / 10
      const rest: Record<number, string[]> = {
        5: [`${f(t)} ÷ 2 = ${f(t / 2)}`],
        15: [`${f(t)} ÷ 2 = ${f(t / 2)}`, `${f(t)} + ${f(t / 2)} = ${f(t * 1.5)}`],
        20: [`${f(t)} × 2 = ${f(t * 2)}`],
        30: [`${f(t)} × 3 = ${f(t * 3)}`],
      }
      return { q: `${p}% of ${n}`, answer: (p * n) / 100, steps: [`10% of ${n} is ${f(t)}`, ...rest[p]] }
    },
  },
  {
    id: 'pct-flip',
    chapter: 'pct',
    title: 'Flip the percentage',
    blurb: 'x% of y is the same as y% of x',
    rule: 'Swap the two numbers if that makes the percentage easier. 16% of 50 is the same as 50% of 16.',
    how: ['Swap the two numbers.', 'Read the new percentage as a fraction: 50% is a half, 25% a quarter, 20% a fifth.', 'Divide.'],
    why: 'x% of y is x × y ÷ 100, and y% of x is y × x ÷ 100. Same multiplication, so same answer.',
    example: [16, 50],
    random: () => {
      const b = pick([50, 25, 20])
      return [b === 50 ? ri(6, 44) * 2 : b === 25 ? ri(3, 22) * 4 : ri(3, 19) * 5, b]
    },
    build: (a, b) => {
      const den = 100 / b
      const name = { 2: 'a half', 4: 'a quarter', 5: 'a fifth' }[den]
      return { q: `${a}% of ${b}`, answer: (a * b) / 100, steps: [`Flip it: ${b}% of ${a}`, `${b}% is ${name}`, `${a} ÷ ${den} = ${a / den}`] }
    },
  },
]

export const trickById = (id: string) => TRICKS.find(t => t.id === id)
export const newProblem = (t: Trick) => t.build(...t.random())
export const exampleOf = (t: Trick) => t.build(...t.example)

/** Reads a typed answer; accepts "1,250" and "18.5". Returns null if it is not a number. */
export function parseAnswer(text: string): number | null {
  const s = text.replace(/[,\s]/g, '')
  return s !== '' && /^-?\d*\.?\d*$/.test(s) && !Number.isNaN(Number(s)) ? Number(s) : null
}

export const isRight = (given: number, answer: number) => Math.abs(given - answer) < 1e-9

// ---- memory facts ----

export interface Fact {
  key: string
  q: string
  answer: number
  /** Unit shown after the input, e.g. "%". */
  unit?: string
}

export const DECKS: Record<string, { name: string; blurb: string; facts: Fact[] }> = {
  tables: {
    name: 'Times tables',
    blurb: 'Every product from 2 × 2 to 12 × 12',
    facts: Array.from({ length: 11 }, (_, i) => i + 2).flatMap(a =>
      Array.from({ length: 13 - a }, (_, j) => a + j).map(b => ({ key: `t${a}x${b}`, q: `${a} × ${b}`, answer: a * b })),
    ),
  },
  squares: {
    name: 'Squares',
    blurb: '11² to 25²',
    facts: Array.from({ length: 15 }, (_, i) => i + 11).map(n => ({ key: `s${n}`, q: `${n}²`, answer: n * n })),
  },
  fractions: {
    name: 'Fractions as percentages',
    blurb: 'The ones worth knowing by heart',
    facts: [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [1, 20], [1, 25], [1, 50]].map(
      ([n, d]) => ({ key: `f${n}/${d}`, q: `${n}/${d} as a percentage`, answer: (n / d) * 100, unit: '%' }),
    ),
  },
}
