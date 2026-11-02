import { useEffect, useState } from 'react'

const STORAGE_KEY = 'zee-master-favorites'

function load(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

// Product ids the visitor has hearted, remembered in this browser.
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // Storage unavailable (e.g. private mode); favorites still work for this visit.
    }
  }, [ids])

  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return { ids, has: (id: string) => ids.includes(id), toggle }
}
