import { Check, Heart, Minus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { inquiryMessage } from '../lib/whatsapp'
import { useStore } from '../store/context'
import type { Product } from '../types'
import { WhatsAppIcon } from './BrandIcons'
import { ProductImage } from './ProductImage'

type Props = {
  product: Product | null
  inCart: number
  favorite: boolean
  onAdd: (quantity: number) => void
  onToggleFavorite: () => void
  onViewCart: () => void
  onClose: () => void
}

// Must match the modal-out / sheet-out animation length in index.css.
const CLOSE_MS = 220

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Product details popup. The native <dialog> handles Esc, focus trapping and the backdrop.
export function ProductModal({ product, inCart, favorite, onAdd, onToggleFavorite, onViewCart, onClose }: Props) {
  const i18n = useI18n()
  const { t, loc } = i18n
  const { formatPrice, whatsappLink } = useStore()
  const ref = useRef<HTMLDialogElement>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (product && !dialog.open) {
      setQuantity(1)
      setAdded(false)
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!product && dialog.open) {
      dialog.close()
    }
  }, [product])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Play the exit animation, then actually close the dialog.
  const requestClose = (after?: () => void) => {
    const dialog = ref.current
    if (!dialog?.open || closing) return
    const finish = () => {
      dialog.close()
      // Clean up here too rather than waiting on the async close event; running it twice is harmless.
      handleClose()
      after?.()
    }
    if (prefersReducedMotion()) return finish()
    setClosing(true)
    closeTimer.current = window.setTimeout(finish, CLOSE_MS)
  }

  const handleClose = () => {
    window.clearTimeout(closeTimer.current)
    setClosing(false)
    document.body.style.overflow = ''
    onClose()
  }

  const add = () => {
    onAdd(quantity)
    setAdded(true)
  }

  return (
    <dialog
      ref={ref}
      className={`product-modal ${closing ? 'closing' : ''}`}
      onClose={handleClose}
      // Esc: animate out instead of vanishing instantly.
      onCancel={(e) => {
        e.preventDefault()
        requestClose()
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && requestClose()}
      aria-label={product ? loc(product.name) : undefined}
    >
      {product && (
        <div className="modal-layout">
          <div className="modal-media">
            <ProductImage product={product} className="modal-image" />
          </div>

          <div className="modal-info">
            <div className="modal-top">
              <button
                className={`modal-icon ${favorite ? 'on' : ''}`}
                onClick={onToggleFavorite}
                aria-pressed={favorite}
                aria-label={favorite ? t.removeFavorite : t.saveFavorite}
              >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
              </button>
              <button className="modal-icon" onClick={() => requestClose()} aria-label={t.close} autoFocus>
                <X size={22} />
              </button>
            </div>

            <h2>{loc(product.name)}</h2>
            <div className="modal-ornament" aria-hidden="true" />
            <p className="modal-price">{formatPrice(product.price)}</p>
            <p className="modal-desc">{loc(product.description)}</p>
            <p className="modal-note">{t.productNote}</p>

            <div className="modal-buy">
              <div className="qty modal-qty" aria-label={t.quantity}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label={t.decrease}>
                  <Minus size={14} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label={t.increase}>
                  <Plus size={14} />
                </button>
              </div>
              <button className="btn-primary modal-add" onClick={add}>
                {added ? <Check size={18} /> : null}
                {added ? t.addedToCart : t.addToCart}
              </button>
            </div>

            <a
              className="btn-outline modal-inquire"
              href={whatsappLink(inquiryMessage(product, i18n))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={18} /> {t.inquireWhatsApp}
            </a>

            {inCart > 0 && (
              <button className="link-btn modal-cart-link" onClick={() => requestClose(onViewCart)}>
                {t.inCartViewCart(inCart)}
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
