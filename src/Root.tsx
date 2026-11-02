import { lazy, Suspense } from 'react'
import App from './App'
import { ADMIN_PATH, useRoute } from './lib/router'

// The dashboard is its own bundle, so shoppers never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export function Root() {
  const route = useRoute()
  if (route.path === ADMIN_PATH || route.path.startsWith(`${ADMIN_PATH}/`)) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    )
  }
  return <App />
}
