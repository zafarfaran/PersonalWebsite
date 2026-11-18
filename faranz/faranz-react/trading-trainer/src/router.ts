import { useSyncExternalStore } from 'react'

// Hash routing (#/learn/london-main) so the app works from any folder on any
// static host without server rewrites.
const read = () => window.location.hash.replace(/^#\/?/, '')

export function useRoute(): string[] {
  const path = useSyncExternalStore(
    cb => (window.addEventListener('hashchange', cb), () => window.removeEventListener('hashchange', cb)),
    read,
  )
  return path.split('/').filter(Boolean)
}

export const href = (...parts: string[]) => '#/' + parts.join('/')

export function go(...parts: string[]) {
  window.location.hash = '/' + parts.join('/')
  window.scrollTo(0, 0)
}
