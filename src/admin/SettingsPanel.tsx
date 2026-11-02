import { ExternalLink, Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { defaultSettings } from '../config'
import { useStore } from '../store/context'
import { updateSettings } from './api'
import { PanelError, PanelLoading } from './ContentPanel'
import type { Notify } from './Toasts'
import { useSettingsRow } from './useSettingsRow'

const currencies = [
  ['USD', 'US Dollar ($)'],
  ['EUR', 'Euro (€)'],
  ['GBP', 'British Pound (£)'],
  ['JOD', 'Jordanian Dinar'],
  ['ILS', 'Israeli New Shekel (₪)'],
  ['EGP', 'Egyptian Pound'],
  ['SAR', 'Saudi Riyal'],
  ['AED', 'UAE Dirham'],
  ['QAR', 'Qatari Riyal'],
  ['KWD', 'Kuwaiti Dinar'],
  ['BHD', 'Bahraini Dinar'],
  ['OMR', 'Omani Rial'],
  ['TRY', 'Turkish Lira'],
  ['CAD', 'Canadian Dollar'],
  ['AUD', 'Australian Dollar'],
] as const

type Form = { whatsapp: string; facebook: string; instagram: string; currency: string }

// "+44 7700 900123" or "0044…" → "447700900123"
const normalizeNumber = (raw: string) => raw.replace(/\D/g, '').replace(/^00/, '')

const isUrlOrEmpty = (value: string) => {
  if (!value.trim()) return true
  try {
    return ['http:', 'https:'].includes(new URL(value.trim()).protocol)
  } catch {
    return false
  }
}

export function SettingsPanel({ notify }: { notify: Notify }) {
  const { row, error, load } = useSettingsRow()
  if (error) return <PanelError message={error} retry={load} />
  if (row === undefined) return <PanelLoading />
  const initial: Form = {
    whatsapp: row?.whatsapp_number || defaultSettings.whatsappNumber,
    facebook: row?.facebook_url ?? '',
    instagram: row?.instagram_url ?? '',
    currency: row?.currency || defaultSettings.currency,
  }
  return <SettingsForm initial={initial} notify={notify} />
}

function SettingsForm({ initial, notify }: { initial: Form; notify: Notify }) {
  const store = useStore()
  const [form, setForm] = useState<Form>(initial)
  const [saved, setSaved] = useState<Form>(initial)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const dirty = JSON.stringify(form) !== JSON.stringify(saved)
  const number = normalizeNumber(form.whatsapp)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (number.length < 8 || number.length > 15) {
      return setProblem('Enter the WhatsApp number with its country code, e.g. 962 7 9123 4567.')
    }
    if (!isUrlOrEmpty(form.facebook) || !isUrlOrEmpty(form.instagram)) {
      return setProblem('Social links must be full web addresses starting with https://')
    }
    setProblem('')
    setBusy(true)
    const patch = {
      whatsapp_number: number,
      facebook_url: form.facebook.trim(),
      instagram_url: form.instagram.trim(),
      currency: form.currency,
    }
    try {
      await updateSettings(patch)
      const next = { ...form, whatsapp: number, facebook: patch.facebook_url, instagram: patch.instagram_url }
      setForm(next)
      setSaved(next)
      notify('Settings saved')
      void store.reload()
    } catch (err) {
      notify(`Couldn’t save: ${(err as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <form onSubmit={submit}>
        <header className="panel-header">
          <div>
            <h1>Settings</h1>
            <p>Where orders go, your social links, and the currency for prices.</p>
          </div>
          <button className="admin-btn primary" disabled={!dirty || busy}>
            {busy && <Loader2 size={18} className="spin" />} {dirty ? 'Save changes' : 'Saved'}
          </button>
        </header>

        {problem && (
          <p className="form-error" role="alert">
            {problem}
          </p>
        )}

        <div className="settings-grid">
          <div className="content-group">
            <h2>WhatsApp orders</h2>
            <label className="field">
              <span>WhatsApp number, with country code</span>
              <input
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                inputMode="tel"
                placeholder="e.g. 962 79 123 4567"
                required
              />
            </label>
            <p className="hint-text">
              Orders and questions from the website open a chat with this number.{' '}
              {number.length >= 8 && (
                <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer">
                  Test it <ExternalLink size={12} />
                </a>
              )}
            </p>
          </div>

          <div className="content-group">
            <h2>Social links</h2>
            <label className="field">
              <span>Facebook page</span>
              <input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} type="url" placeholder="https://facebook.com/yourpage" />
            </label>
            <label className="field">
              <span>Instagram profile</span>
              <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} type="url" placeholder="https://instagram.com/yourname" />
            </label>
            <p className="hint-text">Leave one empty to hide its icon in the footer.</p>
          </div>

          <div className="content-group">
            <h2>Currency</h2>
            <label className="field">
              <span>Prices are shown in</span>
              <select value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                {currencies.map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} · {name}
                  </option>
                ))}
              </select>
            </label>
            <p className="hint-text">This changes the symbol only; it doesn’t convert your prices.</p>
          </div>
        </div>
      </form>
    </section>
  )
}
