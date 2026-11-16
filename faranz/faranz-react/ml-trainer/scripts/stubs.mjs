// One-off: creates the registries and an empty file for every module that has none yet.
import fs from 'node:fs'
const mods = ['maths', 'classical', 'features', 'evaluation', 'neural', 'pytorch', 'transformers', 'aieng', 'mlops', 'design']
for (const m of mods) {
  const content = `src/content/${m}.ts`
  if (!fs.existsSync(content)) fs.writeFileSync(content, `import type { Module } from '../types'\n\nexport const ${m}: Module = { id: '${m}', title: '${m}', summary: '', lessons: [] }\n`)
  const widgets = `src/widgets/${m}.tsx`
  if (!fs.existsSync(widgets)) fs.writeFileSync(widgets, `import type { ComponentType } from 'react'\n\nexport const ${m}Widgets: Record<string, ComponentType> = {}\n`)
}
fs.writeFileSync(
  'src/content/index.ts',
  `import type { Module } from '../types'\n${mods.map(m => `import { ${m} } from './${m}'`).join('\n')}\n\n/** The course, in the order it is meant to be taken. A module with no lessons yet is left out. */\nexport const MODULES: Module[] = [${mods.join(', ')}].filter(m => m.lessons.length > 0)\n`,
)
fs.writeFileSync(
  'src/widgets/index.ts',
  `import type { ComponentType } from 'react'\n${mods.map(m => `import { ${m}Widgets } from './${m}'`).join('\n')}\n\n/** Every interactive figure, by the name a lesson refers to it with. Names start with the module: "maths-vectors". */\nexport const WIDGETS: Record<string, ComponentType> = {\n${mods.map(m => `  ...${m}Widgets,`).join('\n')}\n}\n`,
)
console.log('ok')
