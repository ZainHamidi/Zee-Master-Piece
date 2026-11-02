import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/context'
import { buildOrderMessage, cartTotal } from '../lib/whatsapp'
import { useStore } from '../store/context'
import type { CartItem } from '../types'
import { Minus, Plus, X } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import { ProductImage } from './ProductImage'

type Props = {
  open: boolean
  items: CartItem[]
  onClose: () => void
  onQuantity: (id: string, quantity: number) => void
  onClear: () => void
}

export function CartDrawer({ open, items, onClose, onQuantity, onClear }: Props) {
  const i18n = useI18n()
  const { t, loc } = i18n
  const { formatPrice, whatsappLink } = useStore()
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const orderUrl = whatsappLink(buildOrderMessage(items, note, i18n, formatPrice))

  return (
    <>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label={t.cartTitle}>
        <header className="drawer-header">
          <h2>{t.cartTitle}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t.closeCart}>
            <X size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <p className="empty">{t.cartEmpty}</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cart-item">
                  <ProductImage product={product} className="cart-thumb" />
                  <div className="cart-info">
                    <span>{loc(product.name)}</span>
                    <small>{t.priceEach(formatPrice(product.price))}</small>
                  </div>
                  <div className="qty">
                    <button onClick={() => onQuantity(product.id, quantity - 1)} aria-label={t.removeOne(loc(product.name))}>
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => onQuantity(product.id, quantity + 1)} aria-label={t.addOne(loc(product.name))}>
                      <Plus size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <label className="note">
              {t.noteLabel}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.notePlaceholder}
                rows={3}
              />
            </label>

            <div className="drawer-footer">
              <div className="total">
                <span>{t.total}</span>
                <strong>{formatPrice(cartTotal(items))}</strong>
              </div>
              <a className="btn whatsapp" href={orderUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> {t.orderOnWhatsApp}
              </a>
              <p className="hint">{t.orderHint}</p>
              <button className="link-btn" onClick={onClear}>
                {t.clearCart}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
