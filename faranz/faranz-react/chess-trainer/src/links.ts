import { moveLabel } from './chess'
import { OPENINGS, lessonById, sans, type Lesson, type Opening } from './data'

/**
 * Lessons whose text points at another lesson: "the Traps chapter shows…",
 * "you know this from the London". Listed once, shown from both ends.
 */
export const SEE: Record<string, string[]> = {
  'london-plan': ['london-setup'],
  'london-main-qb6': ['london-qb6', 'london-b2-trap'],
  'london-qb6': ['london-b2-trap'],
  'london-bg4': ['london-bf5'],
  'london-bd6': ['london-hfile-mate'],
  'london-benoni': ['london-poisoned-pawn'],
  'london-kid': ['kid-london'],
  'italian-slow-d6': ['italian-centre'],
  'italian-nd4': ['italian-shilling'],
  'italian-bxf3': ['italian-legal'],
  'italian-two-knights': ['italian-fried-liver'],
  'italian-main-d5': ['italian-early-d5'],
  'e4-caro': ['caro-exchange', 'london-setup'],
  'e4-sicilian-d5': ['sicilian-alapin', 'italian-centre'],
  'e4-french-ne7': ['e4-french-gift'],
  'e4-pirc': ['sicilian-yugoslav'],
  'e4-modern': ['e4-pirc'],
  'e4-nimzowitsch': ['italian-start'],
  'e4-elephant': ['e4-scandi-qa5'],
  'e4-petrov': ['e4-petrov-trap', 'e4-stafford'],
  'e4-philidor-hanham': ['e4-philidor-trap'],
  'e4-owen': ['e4-owen-trap'],
  'e4-scandi-queen-sac': ['italian-legal', 'e4-alapin-queen-sac'],
  'caro-start': ['london-bishop', 'caro-bd3-gambit'],
  'caro-classical': ['caro-early-nf6'],
  'caro-advance-h4': ['caro-bishop-trap', 'london-qb6'],
  'caro-fantasy': ['caro-fantasy-trap'],
  'caro-two-knights': ['caro-two-knights-trap'],
  'caro-early-nf6': ['caro-two-knights-trap'],
  'sicilian-start': ['sicilian-smith-trap'],
  'sicilian-classical': ['sicilian-f4-qb6'],
  'sicilian-yugoslav': ['sicilian-ng4-trap'],
  'sicilian-levenfish': ['sicilian-levenfish-trap'],
  'sicilian-morra': ['sicilian-alapin'],
  'sicilian-bowdler': ['italian-start'],
  'kid-exchange': ['kid-pawn-trap', 'kid-exchange-greed'],
  'kid-pawn-trap': ['kid-exchange-greed'],
  'kid-four-pawns': ['kid-four-pawns-trap'],
  'kid-samisch': ['sicilian-yugoslav'],
}

export interface Link {
  /** from: the line this one branches off. to: a line that branches off this one. see: mentioned in the text. */
  kind: 'from' | 'to' | 'see'
  lesson: Lesson
  opening: Opening
  /** For from and to: where the two lines part, e.g. "5… Bg4". */
  at?: string
}

const sharedPlies = (a: string[], b: string[]) => {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n++
  return n
}

/** The earlier lesson of the same opening that this line follows longest, and the move with which it leaves it. */
function findParent(o: Opening, l: Lesson): { lesson: Lesson; at: string } | undefined {
  const line = sans(l)
  let best: Lesson | undefined
  let plies = 1 // sharing only the first move is not a connection
  for (const earlier of o.lessons.slice(0, o.lessons.indexOf(l))) {
    const n = sharedPlies(line, sans(earlier))
    if (n > plies) [best, plies] = [earlier, n]
  }
  return best && { lesson: best, at: plies < line.length ? `${moveLabel(plies)} ${line[plies]}` : 'the same moves' }
}

const parents = new Map<string, { lesson: Lesson; at: string }>()
const children = new Map<string, Lesson[]>()
const mentions = new Map<string, string[]>()

for (const o of OPENINGS) {
  for (const l of o.lessons) {
    const p = findParent(o, l)
    if (!p) continue
    parents.set(l.id, p)
    children.set(p.lesson.id, [...(children.get(p.lesson.id) ?? []), l])
  }
}
for (const [id, ids] of Object.entries(SEE)) {
  for (const other of ids) {
    mentions.set(id, [...(mentions.get(id) ?? []), other])
    mentions.set(other, [...(mentions.get(other) ?? []), id])
  }
}

export const parentOf = (id: string) => parents.get(id)
export const childrenOf = (id: string) => children.get(id) ?? []
/** Lessons of an opening that do not branch off another one. */
export const rootsOf = (o: Opening) => o.lessons.filter(l => !parents.has(l.id))

/** Lessons mentioned by this one, or that mention it, without the lines already linked by the move tree. */
export function seeAlso(id: string): Link[] {
  const inTree = new Set([parents.get(id)?.lesson.id, ...childrenOf(id).map(l => l.id)])
  return [...new Set(mentions.get(id) ?? [])]
    .filter(other => !inTree.has(other))
    .map(other => ({ kind: 'see' as const, ...lessonById(other)! }))
}

/** Everything one lesson connects to: where it comes from, what it mentions, and where it goes on. */
export function linksFor(id: string): Link[] {
  const found = lessonById(id)
  if (!found) return []
  const { opening } = found
  const parent = parents.get(id)
  return [
    ...(parent ? [{ kind: 'from' as const, lesson: parent.lesson, opening, at: parent.at }] : []),
    ...seeAlso(id),
    ...childrenOf(id).map(lesson => ({ kind: 'to' as const, lesson, opening, at: parents.get(lesson.id)!.at })),
  ]
}
