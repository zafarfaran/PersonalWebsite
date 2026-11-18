/** A small line chart shown with a question: loss curves, metrics over time. */
export interface ChartSpec {
  title?: string
  x?: string
  y?: string
  /** Use a log scale on the y axis. All values must be positive. */
  log?: boolean
  series: { name: string; points: number[]; color?: 'accent' | 'good' | 'bad' | 'blue' | 'muted' }[]
}

interface Base {
  /** Unique across the whole course: "<lesson id>-<n>". */
  id: string
  ask: string
  /** Shown after the answer: why the right answer is right. */
  why: string
  /** A nudge, shown on request before answering. */
  hint?: string
}

/** Pick one of several answers. With `run`, the right option is exactly what the code prints. */
export interface Choice extends Base {
  kind: 'choice'
  code?: string
  chart?: ChartSpec
  options: string[]
  /** Index of the right option. */
  answer: number
  /** The code is real Python and the right option is its output (checked by `npm run verify`). */
  run?: true
}

/** Read the code and type what it prints. */
export interface Output extends Base {
  kind: 'output'
  code: string
  /** Exactly what the code prints (checked by `npm run verify`). */
  answer: string
}

/** One line of the code is wrong: click it. */
export interface Bug extends Base {
  kind: 'bug'
  code: string
  /** The line with the bug, counted from 1. */
  line: number
  /** The line as it should read. */
  fix: string
}

/** Work out a number. */
export interface Numeric extends Base {
  kind: 'number'
  answer: number
  /** How far off still counts. Defaults to 1% of the answer, or 0.01 for answers near zero. */
  tol?: number
  /** A Python expression that evaluates to the answer (checked by `npm run verify`; `np` and `math` are imported). */
  check?: string
}

/** Write a function; it is run against tests in the browser. */
export interface Write extends Base {
  kind: 'write'
  /** What you start from. */
  starter: string
  /** Python that raises (usually by assert) if the solution is wrong. It runs after your code. */
  tests: string
  solution: string
  /** Needs NumPy, which takes a few seconds longer to load the first time. */
  numpy?: true
}

/** An open design question. You answer in your head or in notes, then tick off what you covered. */
export interface Design extends Base {
  kind: 'design'
  /** What a good answer covers, each with a line on why it matters. */
  checklist: { point: string; why: string }[]
}

export type Question = Choice | Output | Bug | Numeric | Write | Design

/**
 * A piece of lesson text. A plain string is a paragraph, in which `backticks` mark code and **stars** mark bold.
 * `h` is a heading and `sub` a subheading. `list` is a bullet list. `code` is a block of Python; with `out` it is
 * shown with what it prints, and that output is checked by `scripts/theory.ts`.
 */
export type Block = string | { code: string; out?: string } | { h: string } | { sub: string } | { list: string[] }

export interface Lesson {
  id: string
  title: string
  summary: string
  text: Block[]
  /** The full explanation from the beginning, under headings. Kept in `src/content/theory/` and attached by the registry. */
  theory?: Block[]
  rules: string[]
  /** An interactive figure, by its name in the widget registry. */
  widget?: string
  questions: Question[]
}

export interface Module {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
}
