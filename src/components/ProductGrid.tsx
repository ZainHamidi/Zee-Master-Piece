import type { useCart } from '../lib/useCart'
import type { useFavorites } from '../lib/useFavorites'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

type Props = {
  products: Product[]
  cart: ReturnType<typeof useCart>
  favorites: ReturnType<typeof useFavorites>
  onOpen: (product: Product) => void
  // Show placeholder cards while the catalog is loading.
  loading?: boolean
}

export function ProductGrid({ products, cart, favorites, onOpen, loading }: Props) {
  if (loading) {
    return (
      <div className="grid" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card skeleton" aria-hidden="true">
            <div className="skeleton-image" />
            <div className="card-body">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          inCart={cart.items.find((i) => i.product.id === product.id)?.quantity ?? 0}
          favorite={favorites.has(product.id)}
          onAdd={() => cart.add(product)}
          onToggleFavorite={() => favorites.toggle(product.id)}
          onOpen={() => onOpen(product)}
        />
      ))}
    </div>
  )
}
