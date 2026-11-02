import { Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ProductRow } from '../store/rows'
import { removeImage, saveProduct, uploadImage, type ProductDraft } from './api'
import { ImageInput } from './ImageInput'

type Props = {
  // The product being edited, 'new' for a new one, or null when closed.
  product: ProductRow | 'new' | null
  nextSortOrder: number
  onClose: () => void
  onSaved: (row: ProductRow, isNew: boolean) => void
  onError: (message: string) => void
}

const empty: ProductDraft = {
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  price: '',
  image_url: null,
  visible: true,
}

export function ProductEditor({ product, nextSortOrder, onClose, onSaved, onError }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<ProductDraft>(empty)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const isNew = product === 'new'

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (product && !dialog.open) {
      setDraft(product === 'new' ? empty : { ...product })
      setFile(null)
      dialog.showModal()
    } else if (!product && dialog.open) {
      dialog.close()
    }
  }, [product])

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!product) return
    setBusy(true)
    try {
      const previousImage = product === 'new' ? null : product.image_url
      let image_url = draft.image_url
      if (file) image_url = await uploadImage(file, 1600)

      const saved = await saveProduct({
        ...draft,
        name_en: draft.name_en.trim(),
        name_ar: draft.name_ar.trim(),
        description_en: draft.description_en.trim(),
        description_ar: draft.description_ar.trim(),
        price: Number(draft.price),
        image_url,
        ...(isNew ? { sort_order: nextSortOrder } : {}),
      })
      if (previousImage && previousImage !== image_url) await removeImage(previousImage)
      onSaved(saved, isNew)
    } catch (error) {
      onError(`Couldn’t save: ${(error as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={ref} className="editor-dialog" onClose={onClose} aria-label={isNew ? 'Add product' : 'Edit product'}>
      <form onSubmit={submit}>
        <header className="editor-header">
          <h2>{isNew ? 'Add product' : 'Edit product'}</h2>
          <button type="button" className="icon-only" onClick={() => ref.current?.close()} aria-label="Close">
            <X size={22} />
          </button>
        </header>

        <div className="editor-body">
          <ImageInput
            current={draft.image_url}
            file={file}
            onFile={setFile}
            onRemove={() => set('image_url', null)}
          />

          <div className="editor-fields">
            <div className="field-pair">
              <label className="field">
                <span>Name (English) *</span>
                <input value={draft.name_en} onChange={(e) => set('name_en', e.target.value)} required maxLength={80} />
              </label>
              <label className="field">
                <span>Name (Arabic)</span>
                <input value={draft.name_ar} onChange={(e) => set('name_ar', e.target.value)} dir="rtl" lang="ar" maxLength={80} />
              </label>
            </div>
            <div className="field-pair">
              <label className="field">
                <span>Description (English)</span>
                <textarea value={draft.description_en} onChange={(e) => set('description_en', e.target.value)} rows={3} maxLength={300} />
              </label>
              <label className="field">
                <span>Description (Arabic)</span>
                <textarea value={draft.description_ar} onChange={(e) => set('description_ar', e.target.value)} rows={3} dir="rtl" lang="ar" maxLength={300} />
              </label>
            </div>
            <p className="hint-text">Arabic left blank? The Arabic site shows the English text instead.</p>

            <div className="field-row">
              <label className="field price-field">
                <span>Price *</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => set('price', e.target.value)}
                  required
                />
              </label>
              <label className="switch-field">
                <input type="checkbox" checked={draft.visible} onChange={(e) => set('visible', e.target.checked)} />
                <span className="switch" aria-hidden="true" />
                <span>
                  <strong>Show on website</strong>
                  <small>Hidden products stay here but shoppers can’t see them.</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <footer className="editor-footer">
          <button type="button" className="admin-btn ghost" onClick={() => ref.current?.close()} disabled={busy}>
            Cancel
          </button>
          <button className="admin-btn primary" disabled={busy}>
            {busy && <Loader2 size={18} className="spin" />} {isNew ? 'Add product' : 'Save changes'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
