import { ExternalLink, FileText, Images, LogOut, Package, Settings as SettingsIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from '../components/Link'
import { ADMIN_PATH, navigate, useRoute } from '../lib/router'
import { ApiError, logout, me, whenSignedOut, type Account } from './api'
import { ErrorScreen, LoadingScreen, LoginScreen, NewPasswordScreen, SetupScreen } from './AuthScreens'
import { ContentPanel } from './ContentPanel'
import { PhotosPanel } from './PhotosPanel'
import { ProductsPanel } from './ProductsPanel'
import { SettingsPanel } from './SettingsPanel'
import { Toasts, type Notify, type Toast } from './Toasts'
import './admin.css'

const RESET_PATH = `${ADMIN_PATH}/reset-password`

const sections = [
  { path: `${ADMIN_PATH}/products`, label: 'Products', icon: Package },
  { path: `${ADMIN_PATH}/homepage`, label: 'Homepage text', icon: FileText },
  { path: `${ADMIN_PATH}/photos`, label: 'Photos', icon: Images },
  { path: `${ADMIN_PATH}/settings`, label: 'Settings', icon: SettingsIcon },
] as const

// undefined while checking; null when signed out.
type Session = Account | null | undefined
type Problem = { kind: 'setup' } | { kind: 'error'; message: string } | null

export default function AdminApp() {
  const route = useRoute()
  const [session, setSession] = useState<Session>(undefined)
  const [problem, setProblem] = useState<Problem>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify: Notify = useCallback((message, kind = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((all) => [...all, { id, message, kind }])
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), kind === 'error' ? 7000 : 3500)
  }, [])

  const checkSession = useCallback(
    () =>
      me().then(
        (account) => {
          setProblem(null)
          setSession(account)
        },
        (error: ApiError) => {
          if (error.status === 401) setSession(null)
          else if (error.status === 503) setProblem({ kind: 'setup' })
          else setProblem({ kind: 'error', message: error.message })
        },
      ),
    [],
  )

  useEffect(() => {
    document.title = 'Dashboard · ZEE Masterpiece'
    checkSession()
  }, [checkSession])

  // If a save finds the session has expired, go back to the sign-in screen.
  useEffect(() => {
    whenSignedOut(() => {
      setSession(null)
      notify('You were signed out. Please sign in again.', 'error')
    })
  }, [notify])

  // /admin on its own (or after signing in) opens the first section.
  const signedIn = Boolean(session)
  useEffect(() => {
    if (signedIn && (route.path === ADMIN_PATH || route.path === `${ADMIN_PATH}/`)) {
      history.replaceState(null, '', sections[0].path)
      navigate(sections[0].path)
    }
  }, [signedIn, route.path])

  const signOut = async () => {
    await logout().catch(() => undefined)
    setSession(null)
  }

  const content = (() => {
    if (problem?.kind === 'setup') return <SetupScreen />
    if (problem?.kind === 'error') return <ErrorScreen message={problem.message} retry={checkSession} />
    if (route.path === RESET_PATH) {
      return (
        <NewPasswordScreen
          token={new URLSearchParams(location.search).get('token') ?? ''}
          onDone={(account) => {
            setSession(account)
            navigate(sections[0].path)
            notify('Password updated. You’re signed in.')
          }}
          onCancel={() => navigate(ADMIN_PATH)}
        />
      )
    }
    if (session === undefined) return <LoadingScreen />
    if (!session) return <LoginScreen onSignedIn={setSession} />

    const current = sections.find((s) => route.path.startsWith(s.path)) ?? sections[0]
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <img className="admin-logo" src="/images/logo.jpg" alt="ZEE Masterpiece" />
          <nav className="admin-nav" aria-label="Dashboard">
            {sections.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className={current.path === path ? 'active' : ''} aria-current={current.path === path ? 'page' : undefined}>
                <Icon size={19} /> <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="admin-account">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={17} /> <span>View website</span>
            </a>
            <button onClick={signOut}>
              <LogOut size={17} /> <span>Sign out</span>
            </button>
            <small title={session.email}>{session.email}</small>
          </div>
        </aside>

        <main className="admin-main">
          {current.label === 'Products' && <ProductsPanel notify={notify} />}
          {current.label === 'Homepage text' && <ContentPanel notify={notify} />}
          {current.label === 'Photos' && <PhotosPanel notify={notify} />}
          {current.label === 'Settings' && <SettingsPanel notify={notify} />}
        </main>
      </div>
    )
  })()

  return (
    <div className="admin" dir="ltr" lang="en">
      {content}
      <Toasts toasts={toasts} />
    </div>
  )
}
