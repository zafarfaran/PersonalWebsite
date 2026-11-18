import type { ModuleVideos, Playlist, Video } from './types'
import { marketsVideos } from './markets'
import { chartsVideos } from './charts'
import { orderflowVideos } from './orderflow'
import { profileVideos } from './profile'
import { optionsVideos } from './options'
import { pricingVideos } from './pricing'
import { volatilityVideos } from './volatility'
import { strategiesVideos } from './strategies'
import { riskVideos } from './risk'
import { daytradingVideos } from './daytrading'
import { backtestVideos } from './backtest'
import { quantVideos } from './quant'
import { algoVideos } from './algo'
import { businessVideos } from './business'

export type { Playlist, Video } from './types'

export const BY_MODULE: Record<string, ModuleVideos> = { markets: marketsVideos, charts: chartsVideos, orderflow: orderflowVideos, profile: profileVideos, options: optionsVideos, pricing: pricingVideos, volatility: volatilityVideos, strategies: strategiesVideos, risk: riskVideos, daytrading: daytradingVideos, backtest: backtestVideos, quant: quantVideos, algo: algoVideos, business: businessVideos }
const some = <T,>(entries: [string, T[]][]) => Object.fromEntries(entries.filter(([, list]) => list.length > 0))

/** Videos on the idea of one lesson, by lesson id. */
export const LESSON_VIDEOS: Record<string, Video[]> = some(Object.values(BY_MODULE).flatMap(m => Object.entries(m.lessons)))

/** Longer courses and talks that go with a whole module. */
export const MODULE_VIDEOS: Record<string, Video[]> = some(Object.entries(BY_MODULE).map(([id, m]) => [id, m.module]))

// a series named by two modules is one playlist, carrying the lessons of both
const merged = new Map<string, Playlist>()
for (const m of Object.values(BY_MODULE))
  for (const playlist of m.playlists) {
    const seen = merged.get(playlist.list)
    if (seen) seen.lessons = [...new Set([...(seen.lessons ?? []), ...(playlist.lessons ?? [])])]
    else merged.set(playlist.list, { ...playlist })
  }

/** Whole series worth following alongside a module. */
export const MODULE_PLAYLISTS: Record<string, Playlist[]> = some(Object.entries(BY_MODULE).map(([id, m]) => [id, m.playlists.map(playlist => merged.get(playlist.list)!)]))

export const PLAYLISTS = [...merged.values()]

/** The series a lesson's idea belongs to. */
export const lessonPlaylists = (lessonId: string) => PLAYLISTS.filter(list => list.lessons?.includes(lessonId))

export const watchUrl = (video: Video) => `https://www.youtube.com/watch?v=${video.id}`

export const playlistUrl = (playlist: Playlist) => `https://www.youtube.com/playlist?list=${playlist.list}`
