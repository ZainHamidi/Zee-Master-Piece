import { ShoppingBag } from 'lucide-react'
import type { ComponentProps } from 'react'
import { WhatsAppIcon } from '../components/BrandIcons'
import { ProductGrid } from '../components/ProductGrid'
import { store } from '../config'
import { useStore } from '../store/context'
import { useI18n } from '../i18n/context'

type Props = Omit<ComponentProps<typeof ProductGrid>, 'products'> & {
  results: ComponentProps<typeof ProductGrid>['products']
  query: string
  onClearSearch: () => void
  onShop: () => void
}

export function HomePage({ results, query, onClearSearch, onShop, ...grid }: Props) {
  const { t } = useI18n()
  const { settings, whatsappLink } = useStore()

  return (
    <>
      <section className="hero">
        <img className="hero-image" src={settings.heroImage} alt={t.heroAlt} />
        <div className="hero-content">
          <h1>
            {t.heroLine1}
            <br />
            {t.heroLine2}{' '}
            <em>{t.heroAccent}</em>
          </h1>
          <p>{t.heroText}</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onShop}>
              <ShoppingBag size={17} /> {t.shopCollection}
            </button>
            <a className="btn-gold" href={whatsappLink(t.msgGreeting(store.name))} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> {t.orderNow}
            </a>
          </div>
        </div>
      </section>

      <section className="collection" id="shop">
        <div className="reveal">
          <h2 className="section-title">{t.collectionTitle}</h2>
          <div className="ornament" aria-hidden="true" />
        </div>

        {results.length === 0 && !grid.loading ? (
          <p className="no-results">
            {t.noMatches(query)}{' '}
            <button className="link-btn" onClick={onClearSearch}>
              {t.showEverything}
            </button>
          </p>
        ) : (
          <ProductGrid products={results} {...grid} />
        )}
      </section>

      <section className="custom" id="about">
        <img className="custom-image reveal" src={settings.customImage} alt={t.customAlt} loading="lazy" />
        <div className="custom-content reveal">
          <h2>
            {t.customTitle}{' '}
            <em>{t.customAccent}</em>
          </h2>
          <p>{t.customText}</p>
          <a className="btn-gold" href={whatsappLink(t.msgCustom(store.name))} target="_blank" rel="noopener noreferrer">
            {t.startCustomOrder}
          </a>
        </div>
      </section>
    </>
  )
}
