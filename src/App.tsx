import { Heart, Search, ShoppingCart, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './components/BrandIcons'
import { CartDrawer } from './components/CartDrawer'
import { LanguageMenu } from './components/LanguageMenu'
import { Link } from './components/Link'
import { ProductModal } from './components/ProductModal'
import { store } from './config'
import { useI18n } from './i18n/context'
import { FAVORITES_PATH, useRoute } from './lib/router'
import { useCart } from './lib/useCart'
import { useFavorites } from './lib/useFavorites'
import { useReveal } from './lib/useReveal'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { useStore } from './store/context'
import type { Product } from './types'

const year = new Date().getFullYear()

// Search both languages, so an English query still works on the Arabic page and vice versa.
const matches = (product: Product, q: string) =>
  !q ||
  [product.name.en, product.name.ar, product.description.en, product.description.ar]
    .join(' ')
    .toLowerCase()
    .includes(q)

export default function App() {
  const { t, lang } = useI18n()
  const route = useRoute()
  const { products, settings, status, whatsappLink } = useStore()
  const cart = useCart(products)
  const favorites = useFavorites()
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const closeCart = useCallback(() => setCartOpen(false), [])
  const closeProduct = useCallback(() => setSelected(null), [])
  useReveal()

  const onFavoritesPage = route.path === FAVORITES_PATH
  const q = query.trim().toLowerCase()
  const saved = products.filter((p) => favorites.has(p.id))
  const results = (onFavoritesPage ? saved : products).filter((p) => matches(p, q))

  // After an in-app link click, jump to its #section, or to the top of the new page.
  useEffect(() => {
    if (!route.scroll) return
    const target = route.hash && document.getElementById(route.hash)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0 })
  }, [route])

  useEffect(() => {
    document.title = onFavoritesPage ? `${t.favoritesTitle} · ${store.name}` : store.name
  }, [onFavoritesPage, t, lang])

  const greetingLink = whatsappLink(t.msgGreeting(store.name))
  const goToShop = () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  const clearSearch = () => setQuery('')

  const toggleSearch = () => {
    setSearchOpen((open) => !open)
    setQuery('')
  }

  const grid = { cart, favorites, onOpen: setSelected, loading: status === 'loading' }

  return (
    <>
      <header className="topbar" id="top">
        <div className="topbar-inner">
          <Link to="/" className="logo" aria-label={t.homeLink(store.name)}>
            <img src="/images/logo.jpg" alt={store.name} />
          </Link>

          <nav className="nav" aria-label={t.mainNav}>
            <Link to="/" className={route.path === '/' ? 'active' : ''}>
              {t.home}
            </Link>
            <Link to="/#about">{t.about}</Link>
            <a href="#contact">{t.contact}</a>
          </nav>

          <div className="tools">
            <button onClick={toggleSearch} aria-label={t.searchProducts} aria-expanded={searchOpen}>
              {searchOpen ? <X size={24} strokeWidth={1.6} /> : <Search size={24} strokeWidth={1.6} />}
            </button>
            <Link
              to={FAVORITES_PATH}
              className={`tool-link ${onFavoritesPage ? 'on' : ''}`}
              aria-label={t.showFavorites}
              aria-current={onFavoritesPage ? 'page' : undefined}
            >
              <Heart size={24} strokeWidth={1.6} fill={onFavoritesPage ? 'currentColor' : 'none'} />
              {/* Keyed by count so the badge pops each time it changes. */}
              {favorites.ids.length > 0 && (
                <span key={favorites.ids.length} className="badge">
                  {favorites.ids.length}
                </span>
              )}
            </Link>
            <LanguageMenu />
            <button onClick={() => setCartOpen(true)} aria-label={t.openCart}>
              <ShoppingCart size={24} strokeWidth={1.6} />
              {cart.count > 0 && (
                <span key={cart.count} className="badge">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-bar">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goToShop()}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </div>
        )}
      </header>

      {/* Keyed by page so switching pages replays the fade-in. */}
      <main key={route.path} className="page">
        {onFavoritesPage ? (
          <FavoritesPage
            results={results}
            savedCount={saved.length}
            query={query}
            onClearSearch={clearSearch}
            {...grid}
          />
        ) : (
          <HomePage results={results} query={query} onClearSearch={clearSearch} onShop={goToShop} {...grid} />
        )}
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-inner">
          <div>
            <p className="footer-tagline">{t.footerTagline}</p>
            <div className="social">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              <a href={greetingLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={24} />
              </a>
            </div>
          </div>
          <img className="footer-logo" src="/images/logo-footer.jpg" alt={store.name} loading="lazy" />
        </div>
        <p className="copyright">{t.rights(year, store.name)}</p>
      </footer>

      <ProductModal
        product={selected}
        inCart={selected ? (cart.items.find((i) => i.product.id === selected.id)?.quantity ?? 0) : 0}
        favorite={selected ? favorites.has(selected.id) : false}
        onAdd={(quantity) => selected && cart.add(selected, quantity)}
        onToggleFavorite={() => selected && favorites.toggle(selected.id)}
        onViewCart={() => setCartOpen(true)}
        onClose={closeProduct}
      />

      <CartDrawer
        open={cartOpen}
        items={cart.items}
        onClose={closeCart}
        onQuantity={cart.setQuantity}
        onClear={cart.clear}
      />
    </>
  )
}
