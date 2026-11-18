// Looks every video and playlist up on YouTube and reports any that is gone or whose channel has changed.
// Usage: npx vite-node scripts/videos.ts [module]
import { BY_MODULE } from '../src/content/videos'

const only = process.argv[2]
const chosen = Object.entries(BY_MODULE).filter(([id]) => !only || id === only).map(([, m]) => m)
const all = new Map(chosen.flatMap(m => [...Object.values(m.lessons).flat(), ...m.module]).map(v => [v.id, v]))
const PLAYLISTS = [...new Map(chosen.flatMap(m => m.playlists).map(p => [p.list, p])).values()]
let bad = 0
for (const video of all.values()) {
  const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`)
  if (!res.ok) {
    bad++
    console.log(`GONE   ${video.id}  ${video.title}`)
    continue
  }
  const found = (await res.json()) as { title: string; author_name: string }
  const words = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3)
  const shared = words(video.title).filter(w => words(found.title).includes(w)).length
  const sameChannel = found.author_name.toLowerCase().includes(video.by.toLowerCase().split(' ')[0])
  if (!sameChannel || shared < Math.min(2, words(video.title).length)) {
    bad++
    console.log(`CHECK  ${video.id}  ours: "${video.title}" by ${video.by}  |  YouTube: "${found.title}" by ${found.author_name}`)
  }
}
for (const playlist of PLAYLISTS) {
  const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlist.list}&format=json`)
  if (!res.ok) {
    bad++
    console.log(`GONE   ${playlist.list}  ${playlist.title}`)
    continue
  }
  const found = (await res.json()) as { title: string; author_name: string }
  if (!found.author_name.toLowerCase().includes(playlist.by.toLowerCase().split(' ')[0])) {
    bad++
    console.log(`CHECK  ${playlist.list}  ours: "${playlist.title}" by ${playlist.by}  |  YouTube: "${found.title}" by ${found.author_name}`)
  }
}
console.log(`${all.size} videos and ${PLAYLISTS.length} playlists looked up, ${bad} to check`)
process.exit(bad ? 1 : 0)
