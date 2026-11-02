import { useEffect, useMemo, useState } from 'react'
import type { CartItem, Product } from '../types'

const STORAGE_KEY = 'zee-master-cart'

type Line = { id: string; quantity: number }

function load(): Line[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved)
      ? saved.filter((l): l is Line => typeof l?.id === 'string' && Number.isInteger(l?.quantity) && l.quantity > 0)
      : []
  } catch {
    return []
  }
}

// The cart remembers product ids and quantities; names and prices always come from the current
// catalog, so dashboard edits show up in carts and removed products drop out.
export function useCart(products: Product[]) {
  const [lines, setLines] = useState<Line[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // Storage unavailable (e.g. private mode); the cart still works for this visit.
    }
  }, [lines])

  const items = useMemo<CartItem[]>(
    () =>
      lines.flatMap(({ id, quantity }) => {
        const product = products.find((p) => p.id === id)
        return product ? [{ product, quantity }] : []
      }),
    [lines, products],
  )

  const add = (product: Product, quantity = 1) =>
    setLines((prev) =>
      prev.some((l) => l.id === product.id)
        ? prev.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + quantity } : l))
        : [...prev, { id: product.id, quantity }],
    )

  const setQuantity = (id: string, quantity: number) =>
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity } : l)),
    )

  const clear = () => setLines([])

  const count = items.reduce((n, i) => n + i.quantity, 0)

  return { items, count, add, setQuantity, clear }
}
