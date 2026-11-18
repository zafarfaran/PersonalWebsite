import { useSyncExternalStore } from 'react'
import type { Shape } from './components/Pad'
import { dayStamp, review, type Memory } from './srs'

/** How one question is going: its place in the review schedule, and the tally. */
export interface QuestionStat extends Memory {
  right: number
  wrong: number
  last: 'right' | 'wrong'
}

export interface State {
  /** Lessons you have opened and read. */
  lessons: Record<string, true>
  questions: Record<string, QuestionStat>
  /** Code you have written for an exercise, kept so that you can come back to it. */
  drafts: Record<string, string>
  /** Your notes, by page: "lesson:<id>" for a lesson, or the id of a page of the notebook. */
  notes: Record<string, string>
  /** Your drawings and diagrams, by page: as for notes, and "q:<id>" for the answer to a design question. */
  pads: Record<string, Shape[]>
  /** Pages you have added to the notebook, newest first. */
  pages: { id: string; title: string }[]
  days: string[]
}

const KEY = 'trading-trainer:v1'
const fresh = (): State => ({ lessons: {}, questions: {}, drafts: {}, notes: {}, pads: {}, pages: [], days: [] })

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (saved) return { ...fresh(), ...saved }
  } catch {
    // unreadable or blocked storage: start fresh, the app still works for this visit
  }
  return fresh()
}

let state = typeof localStorage === 'undefined' ? fresh() : load()
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked: progress lasts for this visit only
  }
  listeners.forEach(l => l())
}

export const getState = () => state
export const useStore = () =>
  useSyncExternalStore(
    cb => (listeners.add(cb), () => listeners.delete(cb)),
    () => state,
  )

const withToday = (days: string[], now: number) => (days.includes(dayStamp(now)) ? days : [...days, dayStamp(now)])

export function markRead(lesson: string) {
  if (!state.lessons[lesson]) set({ ...state, lessons: { ...state.lessons, [lesson]: true } })
}

export function recordAnswer(question: string, correct: boolean, now = Date.now()) {
  const prev = state.questions[question]
  const stat: QuestionStat = {
    ...review(prev, correct, now),
    right: (prev?.right ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
    last: correct ? 'right' : 'wrong',
  }
  set({ ...state, questions: { ...state.questions, [question]: stat }, days: withToday(state.days, now) })
}

export function saveDraft(question: string, code: string) {
  set({ ...state, drafts: { ...state.drafts, [question]: code } })
}

/** Keep a note. An empty note is removed. */
export function saveNote(page: string, text: string) {
  const notes = { ...state.notes, [page]: text }
  if (!text.trim()) delete notes[page]
  set({ ...state, notes })
}

/** Keep a drawing. An empty one is removed. */
export function savePad(page: string, shapes: Shape[]) {
  const pads = { ...state.pads, [page]: shapes }
  if (!shapes.length) delete pads[page]
  set({ ...state, pads })
}

export function addPage(title: string): string {
  const id = `page:${Date.now().toString(36)}`
  set({ ...state, pages: [{ id, title }, ...state.pages] })
  return id
}

export function renamePage(id: string, title: string) {
  set({ ...state, pages: state.pages.map(p => (p.id === id ? { ...p, title } : p)) })
}

export function deletePage(id: string) {
  const { [id]: _note, ...notes } = state.notes
  const { [id]: _pad, ...pads } = state.pads
  set({ ...state, notes, pads, pages: state.pages.filter(p => p.id !== id) })
}

/** Forget answers and review dates. Notes and drawings are kept. */
export function resetProgress() {
  set({ ...fresh(), notes: state.notes, pads: state.pads, pages: state.pages })
}
