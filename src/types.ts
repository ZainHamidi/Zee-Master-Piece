import type { Localized } from './i18n/strings'

export type Product = {
  id: string
  name: Localized
  description: Localized
  price: number
  // URL or path under /public (e.g. '/images/bag.jpg'). Optional: a "photo coming soon" tile is shown without it.
  image?: string
}

export type CartItem = {
  product: Product
  quantity: number
}
