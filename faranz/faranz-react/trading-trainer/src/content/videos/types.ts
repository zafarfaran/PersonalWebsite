/**
 * Videos that go with the lessons. Every id must be looked up on YouTube, and the
 * title and channel are the ones YouTube returns (`scripts/videos.ts` checks them).
 * They are a second explanation of the same idea in someone else's words.
 */
export interface Video {
  /** The YouTube video id. */
  id: string
  title: string
  by: string
}

export interface Playlist {
  /** The YouTube playlist id. */
  list: string
  title: string
  by: string
  /** What the series covers, in a line. */
  about: string
  /** The lessons whose idea the series carries on from. */
  lessons?: string[]
}

/** What one module offers to watch: `src/content/videos/<module>.ts`. */
export interface ModuleVideos {
  /** Videos on the idea of one lesson, by lesson id. */
  lessons: Record<string, Video[]>
  /** Longer courses and talks that go with the whole module. */
  module: Video[]
  /** Whole series worth following alongside the module. */
  playlists: Playlist[]
}
