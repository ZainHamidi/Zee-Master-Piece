import { Check, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { languages, strings } from '../i18n/strings'

// Header language picker: a globe icon that opens a small list of languages.
export function LanguageMenu() {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="lang-menu" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.changeLanguage}
        aria-haspopup="menu"
        aria-expanded={open}
        className={open ? 'on' : ''}
      >
        <Globe size={23} strokeWidth={1.6} />
      </button>
      {open && (
        <ul className="lang-list" role="menu">
          {languages.map((l) => (
            <li key={l} role="none">
              <button
                role="menuitemradio"
                aria-checked={l === lang}
                lang={l}
                onClick={() => {
                  setLang(l)
                  setOpen(false)
                }}
              >
                {strings[l].langName}
                {l === lang && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
