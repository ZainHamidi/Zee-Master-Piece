import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultData, StoreContext, type Store, type StoreData } from './context'
import { toContent, toProduct, toSettings, type ProductRow, type SettingsRow } from './rows'

const CACHE_KEY = 'zee-master-store'

async function fetchStore(): Promise<StoreData> {
  const res = await fetch('/api/store')
  if (!res.ok) throw new Error(`Store API ${res.status}`)
  const { products, settings } = (await res.json()) as { products: ProductRow[]; settings: SettingsRow | null }
  return {
    products: products.map(toProduct),
    settings: settings ? toSettings(settings) : defaultData.settings,
    content: settings ? toContent(settings) : defaultData.content,
  }
}

function readCache(): StoreData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as StoreData) : null
  } catch {
    return null
  }
}

// Shows the last copy of the catalog this browser saw straight away (if any) and refreshes it from
// the API. If the API isn't set up yet (no database), the site runs on its built-in data.
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData | null>(readCache)

  const apply = useCallback((fresh: StoreData) => {
    setData(fresh)
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
    } catch {
      // Storage unavailable; the site still works, just without the instant start next time.
    }
  }, [])

  const fallBack = useCallback((error: unknown) => {
    console.warn('Using the built-in catalog:', error)
    setData((current) => current ?? defaultData)
  }, [])

  const reload = useCallback(() => fetchStore().then(apply, fallBack), [apply, fallBack])

  useEffect(() => {
    fetchStore().then(apply, fallBack)
  }, [apply, fallBack])

  const value = useMemo<Store>(() => {
    const current = data ?? defaultData
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: current.settings.currency })
    return {
      ...current,
      // Keep built-in products out of view while the real catalog is still on its way.
      products: data ? current.products : [],
      status: data ? 'ready' : 'loading',
      reload,
      formatPrice: (amount) => currency.format(amount),
      // wa.me opens the WhatsApp app on phones and WhatsApp Web on desktop.
      whatsappLink: (message) =>
        `https://wa.me/${current.settings.whatsappNumber}?text=${encodeURIComponent(message)}`,
    }
  }, [data, reload])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
