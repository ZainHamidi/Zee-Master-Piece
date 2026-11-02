import type { Lang } from '../i18n/strings'

export type Settings = {
  whatsappNumber: string
  facebookUrl: string
  instagramUrl: string
  currency: string
  heroImage: string
  customImage: string
}

// Homepage text the dashboard can override. Each key matches a key in i18n/strings.ts.
export const contentKeys = [
  'heroLine1',
  'heroLine2',
  'heroAccent',
  'heroText',
  'collectionTitle',
  'customTitle',
  'customAccent',
  'customText',
  'footerTagline',
] as const

export type ContentKey = (typeof contentKeys)[number]

// Only filled-in fields override the built-in text.
export type Content = Record<Lang, Partial<Record<ContentKey, string>>>
