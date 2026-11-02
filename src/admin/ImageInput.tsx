import { ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

type Props = {
  // The photo currently saved, if any.
  current: string | null
  // A newly chosen file not yet uploaded (null when none).
  file: File | null
  onFile: (file: File | null) => void
  // Show "Remove" for the saved photo.
  onRemove?: () => void
  aspect?: string
  label?: string
}

const ACCEPT = 'image/jpeg,image/png,image/webp'

export function ImageInput({ current, file, onFile, onRemove, aspect = '4 / 5', label = 'Photo' }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const shown = preview ?? current

  return (
    <div className="image-input">
      <span className="field-label">{label}</span>
      <button
        type="button"
        className={`image-drop ${shown ? 'has-image' : ''}`}
        style={{ aspectRatio: aspect }}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const dropped = e.dataTransfer.files[0]
          if (dropped && ACCEPT.includes(dropped.type)) onFile(dropped)
        }}
      >
        {shown ? (
          <img src={shown} alt="" />
        ) : (
          <span className="image-empty">
            <ImagePlus size={28} strokeWidth={1.5} />
            Click or drop a photo
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      <div className="image-actions">
        <button type="button" className="admin-btn small" onClick={() => input.current?.click()}>
          <ImagePlus size={16} /> {shown ? 'Replace' : 'Choose photo'}
        </button>
        {file && (
          <button type="button" className="admin-btn small ghost" onClick={() => onFile(null)}>
            Undo
          </button>
        )}
        {!file && current && onRemove && (
          <button type="button" className="admin-btn small ghost danger" onClick={onRemove}>
            <Trash2 size={16} /> Remove
          </button>
        )}
      </div>
      <small className="hint-text">JPG, PNG or WebP. Large photos are resized automatically.</small>
    </div>
  )
}
