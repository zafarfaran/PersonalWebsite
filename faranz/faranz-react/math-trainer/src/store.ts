import { useSyncExternalStore } from 'react'
import { dayStamp, review, type Memory } from './srs'

export interface TrickStat extends Memory {
  answered: number
  correct: number
  /** Total time spent on answered questions, for the average. */
  ms: number
  last: 'clean' | 'missed'
}

export interface State {
  lessons: Record<string, true>
  tricks: Record<string, TrickStat>
  /** Memory facts, keyed by fact. */
  cards: Record<string, Memory>
  bestSprint: number
  days: string[]
}

const KEY = 'math-trainer:v1'
const fresh = (): State => ({ lessons: {}, tricks: {}, cards: {}, bestSprint: 0, days: [] })

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (saved) return { ...fresh(), ...saved }
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

const blank = (now: number): TrickStat => ({ box: 0, due: now, answered: 0, correct: 0, ms: 0, last: 'missed' })

export function completeLesson(id: string, now = Date.now()) {
  set({
    ...state,
    lessons: { ...state.lessons, [id]: true },
    // a newly learned trick is due for its first review straight away
    tricks: state.tricks[id] ? state.tricks : { ...state.tricks, [id]: blank(now) },
    days: withToday(state.days, now),
  })
}

export interface Outcome {
  trickId: string
  correct: boolean
  ms: number
}

/** Record a finished set of questions. A trick moves up a box only if every question on it was right. */
export function recordSession(outcomes: Outcome[], now = Date.now()) {
  const tricks = { ...state.tricks }
  for (const id of new Set(outcomes.map(o => o.trickId))) {
    const mine = outcomes.filter(o => o.trickId === id)
    const prev = tricks[id] ?? blank(now)
    const cleanRun = mine.every(o => o.correct)
    tricks[id] = {
      ...prev,
      ...review(prev, cleanRun, now),
      answered: prev.answered + mine.length,
      correct: prev.correct + mine.filter(o => o.correct).length,
      ms: prev.ms + mine.reduce((n, o) => n + o.ms, 0),
      last: cleanRun ? 'clean' : 'missed',
    }
  }
  set({ ...state, tricks, days: withToday(state.days, now) })
}

export function recordCard(key: string, correct: boolean, now = Date.now()) {
  set({ ...state, cards: { ...state.cards, [key]: review(state.cards[key], correct, now) }, days: withToday(state.days, now) })
}

export function recordSprint(score: number, now = Date.now()) {
  set({ ...state, bestSprint: Math.max(state.bestSprint, score), days: withToday(state.days, now) })
}

export function resetProgress() {
  set(fresh())
}
