import { useSyncExternalStore } from 'react'

// A tiny History API router: the site only has a couple of pages, so no routing library is needed.

export const FAVORITES_PATH = '/favorites'
export const ADMIN_PATH = '/admin'

export type Route = {
  path: string
  // Element id after '#', or '' when there is none.
  hash: string
  // Changes on every navigation, so effects can react even when the path stays the same.
  key: number
  // True for in-app link clicks; false for Back/Forward, where the browser restores the scroll position.
  scroll: boolean
}

const read = (key: number, scroll: boolean): Route => ({
  path: location.pathname,
  hash: decodeURIComponent(location.hash.slice(1)),
  key,
  scroll,
})

let route = read(0, false)
const listeners = new Set<() => void>()

const emit = (scroll: boolean) => {
  route = read(route.key + 1, scroll)
  listeners.forEach((listener) => listener())
}

window.addEventListener('popstate', () => emit(false))

export function navigate(to: string) {
  if (to !== location.pathname + location.hash) history.pushState(null, '', to)
  emit(true)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useRoute = () => useSyncExternalStore(subscribe, () => route)
