// Checks the theory of one module (or of all of them): that every lesson has it, that it is laid out
// under headings, and that every code block with an `out` prints exactly that.
// Usage: npx vite-node scripts/theory.ts <module>
import { spawnSync } from 'node:child_process'
import { MODULES } from '../src/content'
import type { Block } from '../src/types'

const only = process.argv[2]
const BANNED = /\b(simply|just|powerful|crucial|delve|robust|landscape)\b/i
const prose = (b: Block): string[] => (typeof b === 'string' ? [b] : 'h' in b ? [b.h] : 'sub' in b ? [b.sub] : 'list' in b ? b.list : [])

let bad = 0
let lessons = 0
let ran = 0
const fail = (where: string, what: string) => {
  bad++
  console.log(`WRONG  ${where}: ${what}`)
}

for (const m of MODULES) {
  if (only && m.id !== only) continue
  for (const lesson of m.lessons) {
    lessons++
    const blocks = lesson.theory
    if (!blocks) {
      fail(lesson.id, 'no theory')
      continue
    }
    const first = blocks[0]
    if (typeof first === 'string' || !('h' in first)) fail(lesson.id, 'must start with a heading')
    const heads = blocks.filter(b => typeof b !== 'string' && 'h' in b).length
    const subs = blocks.filter(b => typeof b !== 'string' && 'sub' in b).length
    if (heads < 4 || heads > 9) fail(lesson.id, `${heads} headings (want 4 to 9)`)
    if (subs < 2) fail(lesson.id, `${subs} subheadings (want at least 2)`)
    const words = blocks.flatMap(prose).join(' ').split(/\s+/).length
    if (words < 450 || words > 1200) fail(lesson.id, `${words} words (want 450 to 1200)`)
    blocks.forEach((b, i) => {
      const next = blocks[i + 1]
      if (typeof b !== 'string' && ('h' in b || 'sub' in b) && (next === undefined || (typeof next !== 'string' && 'h' in next))) fail(lesson.id, `heading "${prose(b)[0]}" has nothing under it`)
      for (const text of prose(b)) {
        if (text.includes('—')) fail(lesson.id, `em dash in "${text.slice(0, 50)}"`)
        const word = text.match(BANNED)
        if (word) fail(lesson.id, `"${word[0]}" in "${text.slice(0, 50)}"`)
        if ((text.match(/`/g)?.length ?? 0) % 2) fail(lesson.id, `odd number of backticks in "${text.slice(0, 50)}"`)
        if ((text.match(/\*\*/g)?.length ?? 0) % 2) fail(lesson.id, `unclosed ** in "${text.slice(0, 50)}"`)
      }
      if (typeof b !== 'string' && ('h' in b || 'sub' in b) && /[?.:]$/.test(prose(b)[0])) fail(lesson.id, `heading "${prose(b)[0]}" should not end in punctuation`)
      if (typeof b !== 'string' && 'code' in b && b.out !== undefined) {
        ran++
        const res = spawnSync('python', ['-c', b.code], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, timeout: 120000 })
        const got = (res.stdout ?? '').replace(/\r\n/g, '\n').trimEnd()
        if (res.status !== 0) fail(lesson.id, `code block ${i} failed: ${(res.stderr ?? '').trim().split('\n').pop()}`)
        else if (got !== b.out.trimEnd()) fail(lesson.id, `code block ${i} prints\n${got}\nbut out says\n${b.out}`)
      }
    })
  }
}
console.log(`${lessons} lessons, ${ran} code blocks run, ${bad} wrong`)
process.exit(bad ? 1 : 0)
