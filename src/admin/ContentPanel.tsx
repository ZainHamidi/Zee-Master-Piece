import { Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { strings, type Lang } from '../i18n/strings'
import { useStore } from '../store/context'
import type { Content, ContentKey } from '../store/types'
import { updateSettings } from './api'
import type { Notify } from './Toasts'
import { useSettingsRow } from './useSettingsRow'

const groups: { title: string; fields: { key: ContentKey; label: string; long?: boolean }[] }[] = [
  {
    title: 'Hero (top of the homepage)',
    fields: [
      { key: 'heroLine1', label: 'Headline, first line' },
      { key: 'heroLine2', label: 'Headline, second line' },
      { key: 'heroAccent', label: 'Gold word after the second line' },
      { key: 'heroText', label: 'Paragraph', long: true },
    ],
  },
  { title: 'Collection', fields: [{ key: 'collectionTitle', label: 'Heading above the products' }] },
  {
    title: 'Custom orders section',
    fields: [
      { key: 'customTitle', label: 'Heading' },
      { key: 'customAccent', label: 'Gold words after the heading' },
      { key: 'customText', label: 'Paragraph', long: true },
    ],
  },
  { title: 'Footer', fields: [{ key: 'footerTagline', label: 'Tagline' }] },
]

const langs: { lang: Lang; label: string }[] = [
  { lang: 'en', label: 'English' },
  { lang: 'ar', label: 'Arabic' },
]

export function ContentPanel({ notify }: { notify: Notify }) {
  const { row, error, load } = useSettingsRow()
  if (error) return <PanelError message={error} retry={load} />
  if (row === undefined) return <PanelLoading />
  return <ContentForm initial={{ en: row?.content?.en ?? {}, ar: row?.content?.ar ?? {} }} notify={notify} />
}

function ContentForm({ initial, notify }: { initial: Content; notify: Notify }) {
  const store = useStore()
  const [content, setContent] = useState<Content>(initial)
  const [saved, setSaved] = useState<Content>(initial)
  const [busy, setBusy] = useState(false)

  const dirty = JSON.stringify(content) !== JSON.stringify(saved)

  const setField = (lang: Lang, key: ContentKey, value: string) =>
    setContent((c) => ({ ...c, [lang]: { ...c[lang], [key]: value } }))

  const save = async () => {
    setBusy(true)
    // Store only filled-in fields; blank ones fall back to the built-in text.
    const clean = (lang: Lang) =>
      Object.fromEntries(Object.entries(content[lang]).flatMap(([k, v]) => (v?.trim() ? [[k, v.trim()]] : [])))
    const next: Content = { en: clean('en'), ar: clean('ar') }
    try {
      await updateSettings({ content: next })
      setContent(next)
      setSaved(next)
      notify('Homepage text saved')
      void store.reload()
    } catch (e) {
      notify(`Couldn’t save: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h1>Homepage text</h1>
          <p>Leave a field empty to keep the original wording, shown in grey.</p>
        </div>
        <button className="admin-btn primary" onClick={save} disabled={!dirty || busy}>
          {busy && <Loader2 size={18} className="spin" />} {dirty ? 'Save changes' : 'Saved'}
        </button>
      </header>

      {groups.map((group) => (
        <div key={group.title} className="content-group">
          <h2>{group.title}</h2>
          {group.fields.map((field) => (
            <div key={field.key} className="content-field">
              <span className="field-label">{field.label}</span>
              <div className="field-pair">
                {langs.map(({ lang, label }) => {
                  const value = content[lang][field.key] ?? ''
                  const Input = field.long ? 'textarea' : 'input'
                  return (
                    <label key={lang} className="field">
                      <span className="lang-tag">
                        {label}
                        {value && (
                          <button type="button" className="reset-field" onClick={() => setField(lang, field.key, '')}>
                            <RotateCcw size={13} /> Use original
                          </button>
                        )}
                      </span>
                      <Input
                        value={value}
                        onChange={(e) => setField(lang, field.key, e.target.value)}
                        placeholder={strings[lang][field.key].trim()}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        lang={lang}
                        rows={field.long ? 4 : undefined}
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

export function PanelLoading() {
  return (
    <div className="panel-loading">
      <Loader2 className="spin" size={26} />
    </div>
  )
}

export function PanelError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="panel-error">
      Couldn’t load: {message}{' '}
      <button className="text-btn" onClick={retry}>
        Try again
      </button>
    </div>
  )
}
