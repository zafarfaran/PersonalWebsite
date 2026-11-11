export interface Step {
  /** Move in standard notation, e.g. "Nf3". */
  san: string
  /** Why this move is played (shown by the coach). */
  note?: string
  /** One-line takeaway. */
  key?: string
  /** Other reasonable moves: explained, not counted as mistakes. */
  alts?: Record<string, string>
  /** Tempting wrong moves with a specific explanation. */
  mistakes?: Record<string, string>
}

export type Chapter = 'idea' | 'main' | 'replies' | 'traps'

export interface Lesson {
  id: string
  chapter: Chapter
  title: string
  blurb: string
  /** guided: you play White's moves. demo: you watch both sides. */
  kind: 'guided' | 'demo'
  /** Whether the line is drilled in Practise, Match and Memorise. */
  drill: boolean
  intro: string
  moves: Step[]
  outro: string
  /** What to aim for once the line ends (shown when playing on). */
  plan?: string
  /** Short name for Black's choice, revealed during a match. */
  reply?: string
}

export interface Opening {
  id: string
  name: string
  tagline: string
  firstMoves: string
  /** White's finished setup (white pieces only), used by the setup builder. */
  setupFen: string
  setupNote: string
  /** Lesson whose final position is shown on the home card. */
  cardLesson: string
  lessons: Lesson[]
}

export const CHAPTERS: Record<Chapter, string> = {
  idea: 'The idea',
  main: 'Main line',
  replies: "Black's replies",
  traps: 'Traps and mistakes',
}

/** Shorthand used by the opening files. */
export const m = (san: string, note?: string, extra: Omit<Step, 'san' | 'note'> = {}): Step => ({ san, note, ...extra })
