import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LanguageProvider } from './i18n/LanguageProvider'
import { Root } from './Root'
import { StoreProvider } from './store/StoreProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <LanguageProvider>
        <Root />
      </LanguageProvider>
    </StoreProvider>
  </StrictMode>,
)
