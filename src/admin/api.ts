import type { ProductRow, SettingsRow } from '../store/rows'
import { resizeImage } from './resizeImage'

// Everything the dashboard reads and writes, through the site's own API (server/app.ts).
// The server checks the sign-in on every change, whatever this code does.

export type ProductDraft = Omit<ProductRow, 'id' | 'sort_order' | 'price'> & {
  id?: string
  sort_order?: number
  price: number | string
}

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Called when the server says the session has ended, so the dashboard can show the sign-in screen.
let onSignedOut: () => void = () => {}
export const whenSignedOut = (handler: () => void) => {
  onSignedOut = handler
}

async function request<T>(method: string, path: string, body?: unknown, raw?: Blob): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: raw ? { 'Content-Type': raw.type } : body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
  } catch {
    throw new ApiError('Can’t reach the server. Check your connection and try again.', 0)
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/admin/')) onSignedOut()
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status)
  }
  return data as T
}

// ─── Sign-in ───
export type Account = { email: string }
export const me = () => request<Account>('GET', '/auth/me')
export const login = (email: string, password: string) => request<Account>('POST', '/auth/login', { email, password })
export const logout = () => request<{ ok: true }>('POST', '/auth/logout')
export const forgotPassword = (email: string) => request<{ ok: true }>('POST', '/auth/forgot', { email })
export const resetPassword = (token: string, password: string) =>
  request<Account>('POST', '/auth/reset', { token, password })

// ─── Products ───
export const listProducts = () => request<ProductRow[]>('GET', '/admin/products')

export function saveProduct({ id, ...fields }: ProductDraft): Promise<ProductRow> {
  const payload = { ...fields, price: Number(fields.price) }
  return id
    ? request<ProductRow>('PATCH', `/admin/products/${encodeURIComponent(id)}`, payload)
    : request<ProductRow>('POST', '/admin/products', payload)
}

export async function deleteProduct(row: ProductRow) {
  await request('DELETE', `/admin/products/${encodeURIComponent(row.id)}`)
}

export async function setVisible(id: string, visible: boolean) {
  await request('PATCH', `/admin/products/${encodeURIComponent(id)}`, { visible })
}

// Saves a new order: each product's position in the list becomes its sort order.
export async function saveOrder(ids: string[]) {
  await request('PUT', '/admin/products/order', { ids })
}

// ─── Photos ───
export async function uploadImage(file: File, maxSize: number): Promise<string> {
  const blob = await resizeImage(file, maxSize)
  const { url } = await request<{ url: string }>('POST', '/admin/images', undefined, blob)
  return url
}

// Deletes a photo we uploaded. Built-in photos (under /images/) aren't in the database and are left alone.
export async function removeImage(url: string | null | undefined) {
  const match = url?.match(/^\/api\/images\/([\w.-]+)$/)
  if (!match) return
  // A leftover file is harmless, so don't fail the whole save over it.
  await request('DELETE', `/admin/images/${match[1]}`).catch((error) => console.warn('Could not delete old photo', error))
}

// ─── Settings ───
export const getSettings = () => request<SettingsRow | null>('GET', '/admin/settings')
export async function updateSettings(patch: Partial<SettingsRow>) {
  await request('PATCH', '/admin/settings', patch)
}
