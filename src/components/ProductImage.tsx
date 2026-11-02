import { Gem } from 'lucide-react'
import { useI18n } from '../i18n/context'
import type { Product } from '../types'

// Shows the product photo, or a branded "photo coming soon" tile when there's no photo yet.
export function ProductImage({ product, className }: { product: Product; className?: string }) {
  const { t, loc } = useI18n()

  if (product.image) {
    return <img className={className} src={product.image} alt={loc(product.name)} loading="lazy" />
  }
  return (
    <div className={`${className ?? ''} placeholder`} aria-hidden="true">
      <Gem className="placeholder-icon" strokeWidth={1.2} />
      <span className="placeholder-label">{t.photoComingSoon}</span>
    </div>
  )
}
