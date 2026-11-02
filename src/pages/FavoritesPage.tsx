import { ArrowLeft, ArrowRight, Check, Heart, ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { Link } from '../components/Link'
import { ProductGrid } from '../components/ProductGrid'
import { useI18n } from '../i18n/context'
import type { Product } from '../types'

type Props = Omit<ComponentProps<typeof ProductGrid>, 'products'> & {
  // Saved products, already narrowed by any search.
  results: Product[]
  // Total saved, regardless of search.
  savedCount: number
  query: string
  onClearSearch: () => void
}

export function FavoritesPage({ results, savedCount, query, onClearSearch, ...grid }: Props) {
  const { t, dir } = useI18n()
  const [addedAll, setAddedAll] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const Back = dir === 'rtl' ? ArrowRight : ArrowLeft

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const addAll = () => {
    results.forEach((product) => grid.cart.add(product))
    setAddedAll(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAddedAll(false), 2200)
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-top">
          <Link to="/" className="back-link">
            <Back size={16} /> {t.backToCollection}
          </Link>
        </div>
        <h1>{t.favoritesTitle}</h1>
        <div className="ornament" aria-hidden="true" />
        <p>{savedCount > 0 ? t.favoritesCount(savedCount) : t.favoritesIntro}</p>
      </section>

      <section className="collection favorites" id="shop">
        {grid.loading ? (
          <ProductGrid products={[]} {...grid} />
        ) : savedCount === 0 ? (
          <div className="empty-state reveal">
            <span className="empty-heart" aria-hidden="true">
              <Heart size={34} strokeWidth={1.4} />
            </span>
            <h2>{t.noFavoritesTitle}</h2>
            <p>{t.emptyFavorites}</p>
            <Link to="/#shop" className="btn-primary">
              {t.browseCollection}
            </Link>
          </div>
        ) : results.length === 0 ? (
          <p className="no-results">
            {t.noMatches(query)}{' '}
            <button className="link-btn" onClick={onClearSearch}>
              {t.showAllFavorites}
            </button>
          </p>
        ) : (
          <>
            <div className="favorites-actions">
              <button className="btn-primary" onClick={addAll}>
                {addedAll ? <Check size={17} /> : <ShoppingCart size={17} />}
                {addedAll ? t.addedAllToCart : t.addAllToCart}
              </button>
            </div>
            <ProductGrid products={results} {...grid} />
          </>
        )}
      </section>
    </>
  )
}
