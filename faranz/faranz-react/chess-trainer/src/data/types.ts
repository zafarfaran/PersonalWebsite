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

export type Side = 'w' | 'b'

export type Chapter = 'idea' | 'main' | 'replies' | 'traps' | 'variations'

export interface Lesson {
  id: string
  chapter: Chapter
  /** Lessons in the traps chapter: whether you set the trap or have to avoid it. */
  trap?: 'set' | 'avoid'
  title: string
  blurb: string
  /** guided: you play your side's moves. demo: you watch both sides. */
  kind: 'guided' | 'demo'
  /** Whether the line is drilled in Practise, Match and Memorise. */
  drill: boolean
  intro: string
  moves: Step[]
  outro: string
  /** What to aim for once the line ends (shown when playing on). */
  plan?: string
  /** Short name for the opponent's choice, revealed during a match. */
  reply?: string
}

export interface Opening {
  id: string
  name: string
  tagline: string
  firstMoves: string
  /** The colour you play in this opening. */
  side: Side
  /** Your finished setup (your pieces only), used by the setup builder. */
  setupFen: string
  setupNote: string
  /** Lesson whose final position is shown on the home card. */
  cardLesson: string
  /** Chapter headings that differ from the usual ones. */
  chapters?: Partial<Record<Chapter, string>>
  lessons: Lesson[]
}

export const CHAPTERS: Record<Chapter, string> = {
  idea: 'The idea',
  main: 'Main line',
  replies: "Black's replies",
  traps: 'Traps and mistakes',
  variations: 'Other variations to try',
}

/** Chapter heading for an opening: the "replies" belong to whoever you are playing against. */
export const chapterName = (ch: Chapter, o: Pick<Opening, 'side' | 'chapters'>) =>
  o.chapters?.[ch] ?? (ch === 'replies' && o.side === 'b' ? "White's other systems" : CHAPTERS[ch])

export const TRAP_NAME: Record<NonNullable<Lesson['trap']>, string> = { set: 'You set it', avoid: 'Avoid it' }

export const SIDE_NAME: Record<Side, string> = { w: 'White', b: 'Black' }
export const other = (side: Side): Side => (side === 'w' ? 'b' : 'w')

/** Shorthand used by the opening files. */
export const m = (san: string, note?: string, extra: Omit<Step, 'san' | 'note'> = {}): Step => ({ san, note, ...extra })
