// The live dashboard runs on admin.<domain> while the store is on the main domain, so links back to
// the store need the full address there. Elsewhere (local dev, Vercel) both share one address.
export const STORE_URL = location.hostname.startsWith('admin.')
  ? `${location.protocol}//${location.host.slice('admin.'.length)}/`
  : '/'
