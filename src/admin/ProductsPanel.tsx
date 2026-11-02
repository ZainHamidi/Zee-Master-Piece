import { ArrowDown, ArrowUp, Gem, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../store/context'
import type { ProductRow } from '../store/rows'
import { deleteProduct, listProducts, saveOrder, setVisible } from './api'
import { ProductEditor } from './ProductEditor'
import type { Notify } from './Toasts'

export function ProductsPanel({ notify }: { notify: Notify }) {
  const store = useStore()
  const [rows, setRows] = useState<ProductRow[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<ProductRow | 'new' | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchRows = useCallback(
    () =>
      listProducts().then(
        (next) => {
          setRows(next)
          setLoadError('')
        },
        (error: Error) => setLoadError(error.message),
      ),
    [],
  )

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const load = () => {
    setLoadError('')
    setRows(null)
    void fetchRows()
  }

  // Every change also refreshes the public site's copy, so "View website" is up to date.
  const changed = (message: string) => {
    notify(message)
    void store.reload()
  }

  const move = async (index: number, by: -1 | 1) => {
    if (!rows) return
    const next = [...rows]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    setRows(next)
    try {
      await saveOrder(next.map((r) => r.id))
      changed('Order saved')
    } catch (error) {
      notify(`Couldn’t save the order: ${(error as Error).message}`, 'error')
      void load()
    }
  }

  const toggleVisible = async (row: ProductRow) => {
    setBusyId(row.id)
    try {
      await setVisible(row.id, !row.visible)
      setRows((all) => all?.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)) ?? null)
      changed(row.visible ? `“${row.name_en}” is now hidden` : `“${row.name_en}” is now on the website`)
    } catch (error) {
      notify(`Couldn’t update: ${(error as Error).message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (row: ProductRow) => {
    if (!confirm(`Delete “${row.name_en}”? This can’t be undone.`)) return
    setBusyId(row.id)
    try {
      await deleteProduct(row)
      setRows((all) => all?.filter((r) => r.id !== row.id) ?? null)
      changed(`“${row.name_en}” deleted`)
    } catch (error) {
      notify(`Couldn’t delete: ${(error as Error).message}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const visibleCount = rows?.filter((r) => r.visible).length ?? 0

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h1>Products</h1>
          {rows && (
            <p>
              {rows.length} {rows.length === 1 ? 'product' : 'products'} · {visibleCount} on the website
            </p>
          )}
        </div>
        <button className="admin-btn primary" onClick={() => setEditing('new')}>
          <Plus size={18} /> Add product
        </button>
      </header>

      {loadError ? (
        <div className="panel-error">
          Couldn’t load products: {loadError}{' '}
          <button className="text-btn" onClick={load}>
            Try again
          </button>
        </div>
      ) : !rows ? (
        <div className="panel-loading">
          <Loader2 className="spin" size={26} />
        </div>
      ) : rows.length === 0 ? (
        <div className="panel-empty">
          <Gem size={30} strokeWidth={1.4} />
          <p>No products yet.</p>
          <button className="admin-btn primary" onClick={() => setEditing('new')}>
            <Plus size={18} /> Add your first product
          </button>
        </div>
      ) : (
        <ul className="product-list">
          {rows.map((row, index) => (
            <li key={row.id} className={`product-row ${row.visible ? '' : 'hidden-product'}`}>
              <div className="reorder">
                <button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${row.name_en} up`}>
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label={`Move ${row.name_en} down`}>
                  <ArrowDown size={16} />
                </button>
              </div>
              <div className="row-thumb">
                {row.image_url ? <img src={row.image_url} alt="" /> : <Gem size={20} strokeWidth={1.4} />}
              </div>
              <div className="row-names">
                <strong>{row.name_en}</strong>
                <span dir="rtl" lang="ar">{row.name_ar || '—'}</span>
              </div>
              <div className="row-price">{store.formatPrice(Number(row.price))}</div>
              <label className="switch-field compact" title={row.visible ? 'Shown on website' : 'Hidden from website'}>
                <input
                  type="checkbox"
                  checked={row.visible}
                  onChange={() => toggleVisible(row)}
                  disabled={busyId === row.id}
                  aria-label={`Show ${row.name_en} on website`}
                />
                <span className="switch" aria-hidden="true" />
                <span className="switch-text">{row.visible ? 'Shown' : 'Hidden'}</span>
              </label>
              <div className="row-actions">
                <button className="admin-btn small" onClick={() => setEditing(row)} disabled={busyId === row.id}>
                  <Pencil size={15} /> Edit
                </button>
                <button
                  className="admin-btn small ghost danger"
                  onClick={() => remove(row)}
                  disabled={busyId === row.id}
                  aria-label={`Delete ${row.name_en}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProductEditor
        product={editing}
        nextSortOrder={(rows?.reduce((max, r) => Math.max(max, r.sort_order), 0) ?? 0) + 1}
        onClose={() => setEditing(null)}
        onSaved={(row, isNew) => {
          setRows((all) => (isNew ? [...(all ?? []), row] : all?.map((r) => (r.id === row.id ? row : r)) ?? null))
          setEditing(null)
          changed(isNew ? `“${row.name_en}” added` : 'Changes saved')
        }}
        onError={(message) => notify(message, 'error')}
      />
    </section>
  )
}
