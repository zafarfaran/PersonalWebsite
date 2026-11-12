import { useSyncExternalStore } from 'react'
import { dayStamp, review, type Memory } from './srs'

export interface LineStat extends Memory {
  runs: number
  clean: number
  last: 'clean' | 'missed'
  matches: number
  matchClean: number
}

export type Verdict = 'course' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'

/** What the computer made of one of your moves. */
export interface MoveNote {
  verdict: Verdict
  /** The engine's first choice in the position, when it differs from your move. */
  best?: string
  /** Pawns' worth given away, in hundredths. */
  loss?: number
  /** Score after the move, from your side, in hundredths of a pawn. */
  cp?: number
}

/** A full game you played, kept so it can be reviewed and replayed. */
export interface SavedGame {
  id: string
  at: number
  opening: string
  side: 'w' | 'b'
  moves: string[]
  result: string
  /** Notes on your moves, keyed by ply. */
  notes: Record<number, MoveNote>
}

/** A position in which you went wrong, kept for the mistake drill. */
export interface Fix extends Memory {
  fen: string
  played: string
  best: string
  /** Score of the best move, from your side. */
  bestCp: number
  game: string
  side: 'w' | 'b'
}

export const PIECE_SETS = {
  staunty: 'Staunty',
  maestro: 'Maestro',
  cburnett: 'Classic',
  merida: 'Merida',
} as const
export const BOARDS = { night: 'Night', slate: 'Slate', green: 'Green', walnut: 'Walnut' } as const

export interface State {
  lessons: Record<string, true>
  lines: Record<string, LineStat>
  /** Memory cards, keyed by position. */
  cards: Record<string, Memory>
  /** Setup builder: number of perfect builds per opening. */
  setups: Record<string, number>
  /** Board trainer: best score per exercise. */
  vision: Record<string, number>
  /** Calculation trainer: best streak per exercise, and solved combinations. */
  calc: Record<string, number>
  /** Full games, newest first. */
  games: SavedGame[]
  /** Mistakes from your games, keyed by position. */
  fixes: Record<string, Fix>
  days: string[]
  settings: {
    pieces: keyof typeof PIECE_SETS
    board: keyof typeof BOARDS
    level: number
    /** Random trainer: openings switched off. */
    randomOff: string[]
  }
}

const KEY = 'opening-trainer:v1'
const fresh = (): State => ({
  lessons: {},
  lines: {},
  cards: {},
  setups: {},
  vision: {},
  calc: {},
  games: [],
  fixes: {},
  days: [],
  settings: { pieces: 'staunty', board: 'night', level: 2, randomOff: [] },
})

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (saved) return { ...fresh(), ...saved, settings: { ...fresh().settings, ...saved.settings } }
  } catch {
    // unreadable or blocked storage: start fresh, the app still works for this visit
  }
  return fresh()
}

let state = load()
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked: keep going in memory
  }
  listeners.forEach(l => l())
}

export const getState = () => state
export function useStore(): State {
  return useSyncExternalStore(
    cb => (listeners.add(cb), () => listeners.delete(cb)),
    getState,
  )
}

const withToday = (days: string[], now: number) => {
  const today = dayStamp(now)
  return days.includes(today) ? days : [...days, today].slice(-120)
}

const blankLine = (now: number): LineStat => ({ box: 0, due: now, runs: 0, clean: 0, last: 'missed', matches: 0, matchClean: 0 })

export function completeLesson(id: string, drill: boolean, now = Date.now()) {
  set({
    ...state,
    lessons: { ...state.lessons, [id]: true },
    // a newly learned line is due for its first review straight away
    lines: drill && !state.lines[id] ? { ...state.lines, [id]: blankLine(now) } : state.lines,
    days: withToday(state.days, now),
  })
}

export function recordLine(id: string, cleanRun: boolean, mode: 'practise' | 'match', now = Date.now()) {
  const prev = state.lines[id] ?? blankLine(now)
  set({
    ...state,
    lines: {
      ...state.lines,
      [id]: {
        ...prev,
        ...review(prev, cleanRun, now),
        runs: prev.runs + 1,
        clean: prev.clean + (cleanRun ? 1 : 0),
        last: cleanRun ? 'clean' : 'missed',
        matches: prev.matches + (mode === 'match' ? 1 : 0),
        matchClean: prev.matchClean + (mode === 'match' && cleanRun ? 1 : 0),
      },
    },
    days: withToday(state.days, now),
  })
}

export function recordCard(key: string, correct: boolean, now = Date.now()) {
  set({ ...state, cards: { ...state.cards, [key]: review(state.cards[key], correct, now) }, days: withToday(state.days, now) })
}

export function recordSetup(openingId: string, now = Date.now()) {
  set({ ...state, setups: { ...state.setups, [openingId]: (state.setups[openingId] ?? 0) + 1 }, days: withToday(state.days, now) })
}

export function recordVision(exercise: string, score: number, now = Date.now()) {
  set({ ...state, vision: { ...state.vision, [exercise]: Math.max(state.vision[exercise] ?? 0, score) }, days: withToday(state.days, now) })
}

export function recordCalc(exercise: string, score: number, now = Date.now()) {
  set({ ...state, calc: { ...state.calc, [exercise]: Math.max(state.calc[exercise] ?? 0, score) }, days: withToday(state.days, now) })
}

const MAX_GAMES = 30

/** Add a game, or replace the saved copy of the same game. Only the most recent games are kept. */
export function saveGame(game: SavedGame) {
  set({ ...state, games: [game, ...state.games.filter(g => g.id !== game.id)].slice(0, MAX_GAMES) })
}

export function deleteGame(id: string) {
  const fixes = Object.fromEntries(Object.entries(state.fixes).filter(([, f]) => f.game !== id))
  set({ ...state, games: state.games.filter(g => g.id !== id), fixes })
}

/** Remember a position you went wrong in. A position already being drilled keeps its schedule. */
export function addFix(key: string, fix: Omit<Fix, 'box' | 'due'>, now = Date.now()) {
  if (state.fixes[key]) return
  set({ ...state, fixes: { ...state.fixes, [key]: { ...fix, box: 0, due: now } } })
}

export function recordFix(key: string, correct: boolean, now = Date.now()) {
  const prev = state.fixes[key]
  if (!prev) return
  set({ ...state, fixes: { ...state.fixes, [key]: { ...prev, ...review(prev, correct, now) } }, days: withToday(state.days, now) })
}

export function updateSettings(patch: Partial<State['settings']>) {
  set({ ...state, settings: { ...state.settings, ...patch } })
}

export function resetProgress() {
  set({ ...fresh(), settings: state.settings })
}
