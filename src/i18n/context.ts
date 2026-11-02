import { createContext, useContext } from 'react'
import { strings, type Lang, type Localized, type Strings } from './strings'

export type I18n = {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (lang: Lang) => void
  // Interface text in the current language.
  t: Strings
  // Picks the current language's version of a Localized value.
  loc: (text: Localized) => string
}

export const I18nContext = createContext<I18n>({
  lang: 'en',
  dir: 'ltr',
  setLang: () => {},
  t: strings.en,
  loc: (text) => text.en,
})

export const useI18n = () => useContext(I18nContext)
