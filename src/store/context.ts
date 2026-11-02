import { createContext, useContext } from 'react'
import { defaultSettings } from '../config'
import { products as defaultProducts } from '../products'
import type { Product } from '../types'
import type { Content, Settings } from './types'

export type StoreData = {
  products: Product[]
  settings: Settings
  content: Content
}

export type Store = StoreData & {
  // 'loading' only while there's nothing to show yet (first visit, nothing cached).
  status: 'loading' | 'ready'
  reload: () => Promise<void>
  formatPrice: (amount: number) => string
  whatsappLink: (message: string) => string
}

export const defaultData: StoreData = {
  products: defaultProducts,
  settings: defaultSettings,
  content: { en: {}, ar: {} },
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
