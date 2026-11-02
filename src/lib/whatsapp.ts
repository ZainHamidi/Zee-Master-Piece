import { store } from '../config'
import type { I18n } from '../i18n/context'
import type { CartItem, Product } from '../types'

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

// The order summary sent to WhatsApp, written in the visitor's current language.
export function buildOrderMessage(
  items: CartItem[],
  note: string,
  { t, loc }: I18n,
  formatPrice: (amount: number) => string,
): string {
  const lines = items.map(
    ({ product, quantity }) =>
      `• ${quantity} × ${loc(product.name)} — ${formatPrice(product.price * quantity)}`,
  )

  return [
    t.msgOrderIntro(store.name),
    '',
    ...lines,
    '',
    `${t.msgTotal}: ${formatPrice(cartTotal(items))}`,
    ...(note.trim() ? ['', `${t.msgNote}: ${note.trim()}`] : []),
  ].join('\n')
}

export const inquiryMessage = (product: Product, { t, loc }: I18n) => t.msgInquiry(store.name, loc(product.name))
