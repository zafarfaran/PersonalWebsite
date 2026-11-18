import { describe, expect, it } from 'vitest'
import { closeEnough, parseNumber, tidy } from './components/Quiz'
import { endPoint, wrap, type Shape } from './components/Pad'
import { ticks } from './components/Plot'
import { MODULES } from './content'
import { THEORY } from './content/theory'
import { LESSON_VIDEOS, MODULE_PLAYLISTS, MODULE_VIDEOS, PLAYLISTS, lessonPlaylists, playlistUrl, watchUrl } from './content/videos'
import { preview } from './screens/Notebook'
import { LESSONS, QUESTIONS, deal, drillPool, nextLesson, rightIn } from './lib'
import { DAY, review, streak, dayStamp } from './srs'
import type { State } from './store'
import type { Numeric } from './types'
import { WIDGETS } from './widgets'

const blank: State = { lessons: {}, questions: {}, drafts: {}, notes: {}, pads: {}, pages: [], days: [] }

describe('course content', () => {
  it('has modules with lessons, and ids that are unique and say where they belong', () => {
    expect(MODULES.length).toBeGreaterThan(0)
    expect(new Set(MODULES.map(m => m.id)).size).toBe(MODULES.length)
    expect(new Set(LESSONS.map(l => l.lesson.id)).size).toBe(LESSONS.length)
    expect(new Set(QUESTIONS.map(q => q.question.id)).size).toBe(QUESTIONS.length)
    for (const m of MODULES) {
      expect(m.title.length, m.id).toBeGreaterThan(3)
      expect(m.summary.length, m.id).toBeGreaterThan(20)
      expect(m.lessons.length, m.id).toBeGreaterThanOrEqual(4)
      for (const l of m.lessons) expect(l.id.startsWith(m.id + '-'), l.id).toBe(true)
    }
    for (const { lesson, question } of QUESTIONS) expect(question.id.startsWith(lesson.id + '-'), question.id).toBe(true)
  })

  it.each(LESSONS.map(l => [l.lesson.id, l.lesson] as const))('%s: has text, rules, a figure that exists and enough questions', (_, l) => {
    expect(l.title.length).toBeGreaterThan(3)
    expect(l.summary.length).toBeGreaterThan(10)
    expect(l.text.length).toBeGreaterThanOrEqual(3)
    expect(l.rules.length).toBeGreaterThanOrEqual(3)
    expect(l.questions.length).toBeGreaterThanOrEqual(5)
    if (l.widget) expect(WIDGETS[l.widget], l.widget).toBeTruthy()
    // more than one way of being asked
    expect(new Set(l.questions.map(q => q.kind)).size).toBeGreaterThanOrEqual(2)
  })

  it('has well-formed questions of every kind', () => {
    for (const { question: q } of QUESTIONS) {
      expect(q.ask.length, q.id).toBeGreaterThan(8)
      expect(q.why.length, q.id).toBeGreaterThan(20)
      if (q.kind === 'choice') {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(2)
        expect(new Set(q.options).size, q.id).toBe(q.options.length)
        expect(q.answer >= 0 && q.answer < q.options.length, q.id).toBe(true)
        if (q.run) expect(q.code, q.id).toBeTruthy()
        for (const s of q.chart?.series ?? []) {
          expect(s.points.length, q.id).toBeGreaterThanOrEqual(2)
          if (q.chart!.log) expect(Math.min(...s.points), q.id).toBeGreaterThan(0)
        }
      }
      if (q.kind === 'output') {
        expect(q.code.trim().length, q.id).toBeGreaterThan(0)
        expect(tidy(q.answer).length, q.id).toBeGreaterThan(0)
      }
      if (q.kind === 'bug') {
        const lines = q.code.split('\n')
        expect(lines[q.line - 1]?.trim(), q.id).toBeTruthy()
        expect(q.fix.trim(), q.id).not.toBe(lines[q.line - 1].trim())
        expect(lines.length, q.id).toBeGreaterThanOrEqual(3)
      }
      if (q.kind === 'number') {
        expect(Number.isFinite(q.answer), q.id).toBe(true)
        expect(closeEnough(q, q.answer), q.id).toBe(true)
      }
      if (q.kind === 'write') {
        expect(q.starter, q.id).not.toBe(q.solution)
        expect(q.tests, q.id).toContain('assert')
      }
      if (q.kind === 'design') {
        expect(q.checklist.length, q.id).toBeGreaterThanOrEqual(4)
        for (const item of q.checklist) expect(item.point.length > 5 && item.why.length > 10, q.id).toBe(true)
      }
    }
  })

  it('names only figures that are used, and uses only figures that exist', () => {
    const used = new Set(LESSONS.map(l => l.lesson.widget).filter(Boolean))
    for (const name of Object.keys(WIDGETS)) expect(used.has(name), `${name} is not used by any lesson`).toBe(true)
  })
})

describe('videos', () => {
  it('are attached to lessons and modules that exist, with well-formed links', () => {
    for (const id of Object.keys(LESSON_VIDEOS)) expect(LESSONS.some(l => l.lesson.id === id), id).toBe(true)
    for (const id of Object.keys(MODULE_VIDEOS)) expect(MODULES.some(m => m.id === id), id).toBe(true)
    for (const list of [...Object.values(LESSON_VIDEOS), ...Object.values(MODULE_VIDEOS)]) {
      expect(list.length).toBeGreaterThan(0)
      expect(new Set(list.map(v => v.id)).size).toBe(list.length)
      for (const video of list) {
        expect(video.id).toMatch(/^[A-Za-z0-9_-]{11}$/)
        expect(watchUrl(video)).toBe(`https://www.youtube.com/watch?v=${video.id}`)
        expect(video.title.length > 5 && video.by.length > 2, video.id).toBe(true)
      }
    }
    // most lessons have something to watch
    expect(Object.keys(LESSON_VIDEOS).length).toBeGreaterThanOrEqual(LESSONS.length / 2)
  })
})

describe('theory', () => {
  it('every lesson has one, laid out under headings, and none is left over', () => {
    for (const { lesson } of LESSONS) {
      const blocks = lesson.theory
      expect(blocks, lesson.id).toBeDefined()
      const first = blocks![0]
      expect(typeof first !== 'string' && 'h' in first, lesson.id).toBe(true)
      expect(blocks!.filter(b => typeof b !== 'string' && 'h' in b).length, lesson.id).toBeGreaterThanOrEqual(4)
      expect(blocks!.filter(b => typeof b !== 'string' && 'sub' in b).length, lesson.id).toBeGreaterThanOrEqual(2)
      const words = blocks!.flatMap(b => (typeof b === 'string' ? [b] : 'list' in b ? b.list : [])).join(' ').split(/\s+/).length
      expect(words, lesson.id).toBeGreaterThan(400)
    }
    for (const id of Object.keys(THEORY)) expect(LESSONS.some(l => l.lesson.id === id), id).toBe(true)
  })
})

describe('playlists', () => {
  it('every module has some, each is used, and each points at lessons that exist', () => {
    for (const m of MODULES) expect(MODULE_PLAYLISTS[m.id]?.length, m.id).toBeGreaterThan(0)
    for (const id of Object.keys(MODULE_PLAYLISTS)) expect(MODULES.some(m => m.id === id), id).toBe(true)
    expect(new Set(PLAYLISTS.map(p => p.list)).size).toBe(PLAYLISTS.length)
    const used = new Set(Object.values(MODULE_PLAYLISTS).flat())
    for (const playlist of PLAYLISTS) {
      expect(used.has(playlist), playlist.title).toBe(true)
      expect(playlist.list).toMatch(/^PL[A-Za-z0-9_-]{14,32}$/)
      expect(playlistUrl(playlist)).toBe(`https://www.youtube.com/playlist?list=${playlist.list}`)
      expect(playlist.about.length, playlist.title).toBeGreaterThan(15)
      for (const id of playlist.lessons ?? []) expect(LESSONS.some(l => l.lesson.id === id), id).toBe(true)
    }
    expect(lessonPlaylists('maths-vectors').map(p => p.title)).toContain('Essence of linear algebra')
  })
})

describe('answers', () => {
  it('compares printed output without regard to spacing at the ends of lines', () => {
    expect(tidy(' [[2 1]\n [4 3]]\n')).toBe(tidy('[[2 1]\r\n[4 3]]'))
    expect(tidy('5.0')).not.toBe(tidy('5'))
  })

  it('reads numbers typed as decimals, fractions and percentages', () => {
    expect(parseNumber('0.25')).toBe(0.25)
    expect(parseNumber(' 1/4 ')).toBe(0.25)
    expect(parseNumber('25%')).toBe(0.25)
    expect(parseNumber('-4')).toBe(-4)
    expect(parseNumber('1,000')).toBe(1000)
    expect(Number.isNaN(parseNumber('about two'))).toBe(true)
  })

  it('accepts a number within the tolerance and no further', () => {
    const q = { kind: 'number', id: 'x', ask: '', why: '', answer: 200 } as Numeric
    expect(closeEnough(q, 201.9)).toBe(true)
    expect(closeEnough(q, 203)).toBe(false)
    expect(closeEnough({ ...q, answer: 0 }, 0.005)).toBe(true)
    expect(closeEnough({ ...q, answer: 0 }, 0.05)).toBe(false)
    expect(closeEnough({ ...q, answer: 0.1538, tol: 0.006 }, 0.15)).toBe(true)
  })
})

describe('drills and review', () => {
  const now = new Date(2026, 0, 10, 12).getTime()
  const some = QUESTIONS.slice(0, 12)
  const stat = (last: 'right' | 'wrong', box: number, due: number) => ({ box, due, right: 1, wrong: 0, last })

  it('asks missed questions first, then new ones, then the ones you know', () => {
    const s: State = { ...blank, questions: { [some[5].question.id]: stat('wrong', 0, now), [some[6].question.id]: stat('right', 4, now + 9 * DAY) } }
    const round = deal(some, s, 12)
    expect(round[0].question.id).toBe(some[5].question.id)
    expect(round[11].question.id).toBe(some[6].question.id)
    expect(new Set(round.map(q => q.question.id)).size).toBe(12)
    expect(deal(some, blank, 5).length).toBe(5)
  })

  it('draws a review from what is due, and a mixed drill from what you have studied', () => {
    const due = some[2].question.id
    const s: State = { ...blank, questions: { [due]: stat('right', 1, now - 1), [some[3].question.id]: stat('right', 2, now + DAY) } }
    expect(drillPool('due', s, now).map(q => q.question.id)).toEqual([due])
    expect(drillPool('weak', s, now)).toEqual([])
    expect(drillPool('mixed', blank, now).length).toBe(QUESTIONS.length)
    const lesson = LESSONS[0].lesson
    const studied = drillPool('mixed', { ...blank, lessons: { [lesson.id]: true } }, now)
    expect(studied.every(q => q.lesson.id === lesson.id)).toBe(true)
    const m = MODULES[0]
    expect(drillPool(m.id, blank, now).every(q => q.module === m)).toBe(true)
  })

  it('moves on to the first lesson with a question still to get right', () => {
    const m = MODULES[0]
    expect(nextLesson(m, blank)).toBe(m.lessons[0])
    const done = Object.fromEntries(m.lessons[0].questions.map(q => [q.id, stat('right', 1, now)]))
    expect(nextLesson(m, { ...blank, questions: done })).toBe(m.lessons[1])
    expect(rightIn(m.lessons[0].questions, { ...blank, questions: done })).toBe(m.lessons[0].questions.length)
  })

  it('spaces reviews out after right answers and resets after a miss', () => {
    const a = review(undefined, true, now)
    expect(a).toEqual({ box: 1, due: now + DAY })
    expect(review(a, false, now)).toEqual({ box: 0, due: now })
    expect(streak([0, 1, 2, 4].map(n => dayStamp(now - n * DAY)), now)).toBe(3)
  })
})

describe('notebook', () => {
  const boxes: Shape[] = [
    { id: 'a', kind: 'box', x: 0, y: 0, w: 100, h: 40, text: 'API' },
    { id: 'b', kind: 'box', x: 300, y: 0, w: 100, h: 40, text: 'Model' },
    { id: 'c', kind: 'box', x: 0, y: 200, w: 100, h: 40, text: 'Feature store', store: true },
  ]

  it('draws an arrow from the edge of one box to the edge of the other', () => {
    expect(endPoint(boxes, { box: 'a' }, { box: 'b' })).toEqual([100, 20])
    expect(endPoint(boxes, { box: 'b' }, { box: 'a' })).toEqual([300, 20])
    expect(endPoint(boxes, { box: 'a' }, { box: 'c' })).toEqual([50, 40])
    expect(endPoint(boxes, { x: 7, y: 9 }, { box: 'a' })).toEqual([7, 9])
    // an arrow whose box has been removed is not drawn
    expect(endPoint(boxes, { box: 'gone' }, { box: 'a' })).toBeNull()
  })

  it('wraps a label to the width of its box', () => {
    expect(wrap('Feature store', 200)).toEqual(['Feature store'])
    expect(wrap('Candidate generation service', 90)).toEqual(['Candidate', 'generation', 'service'])
    expect(wrap('a\nb', 200)).toEqual(['a', 'b'])
  })

  it('says what is on a page in one line', () => {
    expect(preview('', 0)).toBe('Empty')
    expect(preview('  Chain rule:\n multiply the slopes ', 0)).toBe('Chain rule: multiply the slopes')
    expect(preview('', 1)).toBe('drawing with 1 item')
    expect(preview('Funnel', 3)).toBe('Funnel · drawing with 3 items')
    expect(preview('x'.repeat(200), 0).length).toBe(141)
  })
})

describe('charts', () => {
  it('picks round tick marks that cover the range', () => {
    expect(ticks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
    expect(ticks(-4, 4, 4)).toEqual([-4, -2, 0, 2, 4])
    expect(ticks(0, 10)).toEqual([0, 2, 4, 6, 8, 10])
  })
})
