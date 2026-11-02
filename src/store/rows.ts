import { defaultSettings } from '../config'
import type { Product } from '../types'
import type { Content, Settings } from './types'

// Shapes the API returns (see server/app.ts) and how they map onto the site's types.

export type ProductRow = {
  id: string
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price: number | string
  image_url: string | null
  visible: boolean
  sort_order: number
}

export type SettingsRow = {
  whatsapp_number: string
  facebook_url: string
  instagram_url: string
  currency: string
  hero_image_url: string | null
  custom_image_url: string | null
  content: Partial<Content> | null
}

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: { en: row.name_en, ar: row.name_ar },
  description: { en: row.description_en, ar: row.description_ar },
  price: Number(row.price),
  image: row.image_url ?? undefined,
})

export const toSettings = (row: SettingsRow): Settings => ({
  whatsappNumber: row.whatsapp_number || defaultSettings.whatsappNumber,
  facebookUrl: row.facebook_url,
  instagramUrl: row.instagram_url,
  currency: row.currency || defaultSettings.currency,
  heroImage: row.hero_image_url || defaultSettings.heroImage,
  customImage: row.custom_image_url || defaultSettings.customImage,
})

export const toContent = (row: SettingsRow): Content => ({
  en: row.content?.en ?? {},
  ar: row.content?.ar ?? {},
})
