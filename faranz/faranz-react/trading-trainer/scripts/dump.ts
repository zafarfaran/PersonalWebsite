// Writes the questions (of one module, if named) to scripts/.questions[-<module>].json for verify.py, which runs the code in them.
import fs from 'node:fs'
import { MODULES } from '../src/content'

// one file per module, so that several people can check their own module at the same time
const only = process.argv[2]
const rows = MODULES.filter(m => !only || m.id === only).flatMap(m => m.lessons.flatMap(l => l.questions.map(q => ({ module: m.id, lesson: l.id, ...q }))))
fs.writeFileSync(new URL(`./.questions${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(rows))
console.log(`${rows.length} questions written`)
