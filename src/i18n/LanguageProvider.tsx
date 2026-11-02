import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '../store/context'
import { I18nContext, type I18n } from './context'
import { languages, strings, type Lang } from './strings'

const STORAGE_KEY = 'zee-master-lang'

// A saved choice wins; otherwise follow the browser's language.
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (languages.includes(saved as Lang)) return saved as Lang
  } catch {
    // Storage unavailable; fall through to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const { content } = useStore()

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Storage unavailable (e.g. private mode); the choice lasts for this visit.
    }
  }, [lang, dir])

  const value = useMemo<I18n>(() => {
    // Homepage text edited in the dashboard replaces the built-in text; blank fields keep the default.
    const overrides = Object.fromEntries(Object.entries(content[lang]).filter(([, text]) => text?.trim()))
    return {
      lang,
      dir,
      setLang,
      t: { ...strings[lang], ...overrides },
      // Fall back to English when a product has no Arabic text yet.
      loc: (text) => text[lang] || text.en,
    }
  }, [lang, dir, content])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
