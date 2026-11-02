import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { defaultSettings } from '../config'
import { useStore } from '../store/context'
import type { SettingsRow } from '../store/rows'
import { removeImage, updateSettings, uploadImage } from './api'
import { PanelError, PanelLoading } from './ContentPanel'
import { ImageInput } from './ImageInput'
import type { Notify } from './Toasts'
import { useSettingsRow } from './useSettingsRow'

type Slot = {
  column: 'hero_image_url' | 'custom_image_url'
  title: string
  description: string
  fallback: string
  aspect: string
}

const slots: Slot[] = [
  {
    column: 'hero_image_url',
    title: 'Hero photo',
    description: 'The large photo at the top of the homepage. A wide photo works best; the left side fades into the text.',
    fallback: defaultSettings.heroImage,
    aspect: '16 / 10',
  },
  {
    column: 'custom_image_url',
    title: 'Custom orders photo',
    description: 'Shown beside the “Custom Orders Made Simple” section.',
    fallback: defaultSettings.customImage,
    aspect: '4 / 3',
  },
]

export function PhotosPanel({ notify }: { notify: Notify }) {
  const { row, setRow, error, load } = useSettingsRow()

  if (error) return <PanelError message={error} retry={load} />
  if (row === undefined) return <PanelLoading />

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h1>Photos</h1>
          <p>Product photos are changed on each product. These are the homepage’s large photos.</p>
        </div>
      </header>
      <div className="photo-slots">
        {slots.map((slot) => (
          <PhotoSlot
            key={slot.column}
            slot={slot}
            saved={row?.[slot.column] ?? null}
            onSaved={(url) => setRow((r) => ({ ...(r ?? ({} as SettingsRow)), [slot.column]: url }))}
            notify={notify}
          />
        ))}
      </div>
    </section>
  )
}

function PhotoSlot({
  slot,
  saved,
  onSaved,
  notify,
}: {
  slot: Slot
  saved: string | null
  onSaved: (url: string | null) => void
  notify: Notify
}) {
  const store = useStore()
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const apply = async (url: string | null, message: string) => {
    await updateSettings({ [slot.column]: url })
    if (saved && saved !== url) await removeImage(saved)
    onSaved(url)
    notify(message)
    void store.reload()
  }

  const save = async () => {
    if (!file) return
    setBusy(true)
    try {
      await apply(await uploadImage(file, 2400), `${slot.title} updated`)
      setFile(null)
    } catch (e) {
      notify(`Couldn’t save: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const restore = async () => {
    if (!confirm(`Go back to the original ${slot.title.toLowerCase()}?`)) return
    setBusy(true)
    try {
      await apply(null, `Original ${slot.title.toLowerCase()} restored`)
    } catch (e) {
      notify(`Couldn’t restore: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="photo-slot">
      <h2>{slot.title}</h2>
      <p className="hint-text">{slot.description}</p>
      <ImageInput current={saved ?? slot.fallback} file={file} onFile={setFile} aspect={slot.aspect} label="" />
      <div className="slot-actions">
        {file && (
          <button className="admin-btn primary" onClick={save} disabled={busy}>
            {busy && <Loader2 size={18} className="spin" />} Save photo
          </button>
        )}
        {!file && saved && (
          <button className="text-btn" onClick={restore} disabled={busy}>
            Restore original photo
          </button>
        )}
      </div>
    </div>
  )
}
