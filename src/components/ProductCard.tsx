import { useI18n } from '../i18n/context'
import { inquiryMessage } from '../lib/whatsapp'
import { useStore } from '../store/context'
import type { Product } from '../types'
import { Heart, ShoppingCartPlus } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import { ProductImage } from './ProductImage'

type Props = {
  product: Product
  inCart: number
  favorite: boolean
  onAdd: () => void
  onToggleFavorite: () => void
  onOpen: () => void
}

export function ProductCard({ product, inCart, favorite, onAdd, onToggleFavorite, onOpen }: Props) {
  const i18n = useI18n()
  const { whatsappLink } = useStore()
  const { t } = i18n
  const name = i18n.loc(product.name)

  return (
    <article className="card reveal">
      <div className="card-media">
        <button className="card-open" onClick={onOpen} aria-label={t.viewProduct(name)}>
          <ProductImage product={product} className="card-image" />
        </button>
        <button
          className={`fav-btn ${favorite ? 'on' : ''}`}
          onClick={onToggleFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? t.removeFavoriteNamed(name) : t.saveFavoriteNamed(name)}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-body">
        <h3>
          <button className="card-title" onClick={onOpen}>
            {name}
          </button>
        </h3>
        <p>{i18n.loc(product.description)}</p>
        <div className="card-actions">
          <a
            className="btn-outline"
            href={whatsappLink(inquiryMessage(product, i18n))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={17} /> {t.inquire}
          </a>
          <button
            className="btn-square"
            onClick={onAdd}
            aria-label={t.addToCartNamed(name)}
            title={inCart > 0 ? t.inCartCount(inCart) : t.addToCart}
          >
            <ShoppingCartPlus size={19} strokeWidth={1.8} />
            {inCart > 0 && <span className="mini-badge">{inCart}</span>}
          </button>
        </div>
      </div>
    </article>
  )
}
