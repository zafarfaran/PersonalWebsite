// One-off: creates the registries and an empty file for every module that has none yet.
import fs from 'node:fs'
const mods = ['markets', 'charts', 'orderflow', 'profile', 'options', 'pricing', 'volatility', 'strategies', 'risk', 'daytrading', 'backtest', 'quant', 'algo', 'business']
for (const m of mods) {
  const make = (path, body) => fs.existsSync(path) || fs.writeFileSync(path, body)
  make(`src/content/${m}.ts`, `import type { Module } from '../types'\n\nexport const ${m}: Module = { id: '${m}', title: '${m}', summary: '', lessons: [] }\n`)
  make(`src/widgets/${m}.tsx`, `import type { ComponentType } from 'react'\n\nexport const ${m}Widgets: Record<string, ComponentType> = {}\n`)
  make(`src/content/theory/${m}.ts`, `import type { Block } from '../../types'\n\nexport const ${m}Theory: Record<string, Block[]> = {}\n`)
  make(`src/content/videos/${m}.ts`, `import type { ModuleVideos } from './types'\n\nexport const ${m}Videos: ModuleVideos = { lessons: {}, module: [], playlists: [] }\n`)
}
const imports = (suffix, from) => mods.map(m => `import { ${m}${suffix} } from '${from}${m}'`).join('\n')
fs.writeFileSync(
  'src/content/index.ts',
  `import type { Module } from '../types'\n${imports('', './')}\nimport { THEORY } from './theory'\n\n/** The course, in the order it is meant to be taken. A module with no lessons yet is left out. */\nexport const MODULES: Module[] = [${mods.join(', ')}]\n  .filter(m => m.lessons.length > 0)\n  .map(m => ({ ...m, lessons: m.lessons.map(l => ({ ...l, theory: THEORY[l.id] })) }))\n`,
)
fs.writeFileSync(
  'src/widgets/index.ts',
  `import type { ComponentType } from 'react'\n${imports('Widgets', './')}\n\n/** Every interactive figure, by the name a lesson refers to it with. Names start with the module: "options-payoff". */\nexport const WIDGETS: Record<string, ComponentType> = {\n${mods.map(m => `  ...${m}Widgets,`).join('\n')}\n}\n`,
)
fs.writeFileSync(
  'src/content/theory/index.ts',
  `import type { Block } from '../../types'\n${imports('Theory', './')}\n\n/** The full theory of every lesson, keyed by lesson id. */\nexport const THEORY: Record<string, Block[]> = { ${mods.map(m => `...${m}Theory`).join(', ')} }\n`,
)
fs.writeFileSync(
  'src/content/videos/index.ts',
  `import type { ModuleVideos, Playlist, Video } from './types'\n${imports('Videos', './')}\n\nexport type { Playlist, Video } from './types'\n\nexport const BY_MODULE: Record<string, ModuleVideos> = { ${mods.map(m => `${m}: ${m}Videos`).join(', ')} }\nconst some = <T,>(entries: [string, T[]][]) => Object.fromEntries(entries.filter(([, list]) => list.length > 0))\n\n/** Videos on the idea of one lesson, by lesson id. */\nexport const LESSON_VIDEOS: Record<string, Video[]> = some(Object.values(BY_MODULE).flatMap(m => Object.entries(m.lessons)))\n\n/** Longer courses and talks that go with a whole module. */\nexport const MODULE_VIDEOS: Record<string, Video[]> = some(Object.entries(BY_MODULE).map(([id, m]) => [id, m.module]))\n\n// a series named by two modules is one playlist, carrying the lessons of both\nconst merged = new Map<string, Playlist>()\nfor (const m of Object.values(BY_MODULE))\n  for (const playlist of m.playlists) {\n    const seen = merged.get(playlist.list)\n    if (seen) seen.lessons = [...new Set([...(seen.lessons ?? []), ...(playlist.lessons ?? [])])]\n    else merged.set(playlist.list, { ...playlist })\n  }\n\n/** Whole series worth following alongside a module. */\nexport const MODULE_PLAYLISTS: Record<string, Playlist[]> = some(Object.entries(BY_MODULE).map(([id, m]) => [id, m.playlists.map(playlist => merged.get(playlist.list)!)]))\n\nexport const PLAYLISTS = [...merged.values()]\n\n/** The series a lesson's idea belongs to. */\nexport const lessonPlaylists = (lessonId: string) => PLAYLISTS.filter(list => list.lessons?.includes(lessonId))\n\nexport const watchUrl = (video: Video) => \`https://www.youtube.com/watch?v=\${video.id}\`\n\nexport const playlistUrl = (playlist: Playlist) => \`https://www.youtube.com/playlist?list=\${playlist.list}\`\n`,
)
console.log('ok')
