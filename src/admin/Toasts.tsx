import { CircleAlert, CircleCheck } from 'lucide-react'

export type Toast = { id: number; message: string; kind: 'success' | 'error' }
export type Notify = (message: string, kind?: Toast['kind']) => void

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
