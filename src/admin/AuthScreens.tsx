import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { forgotPassword, login, resetPassword, type Account } from './api'
import { STORE_URL } from './storeUrl'

// Server messages are written for developers; these are what the person signing in should read.
function friendly(message: string) {
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match.'
  return message
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <img className="auth-logo" src="/images/logo.jpg" alt="ZEE Masterpiece" />
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
      <a className="auth-back" href={STORE_URL}>
        ← Back to the website
      </a>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <label className="field">
      <span>{label}</span>
      <div className="password-input">
        <input
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'}>
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  )
}

export function LoginScreen({ onSignedIn }: { onSignedIn: (account: Account) => void }) {
  const [mode, setMode] = useState<'sign-in' | 'forgot' | 'sent'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(friendly((e as Error).message))
    } finally {
      setBusy(false)
    }
  }

  const signIn = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => onSignedIn(await login(email.trim(), password)))
  }

  const sendReset = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => {
      await forgotPassword(email.trim())
      setMode('sent')
    })
  }

  const switchTo = (next: typeof mode) => {
    setMode(next)
    setError('')
  }

  if (mode === 'sent') {
    return (
      <AuthCard title="Check your email">
        <div className="auth-note">
          <MailCheck size={22} />
          <p>
            If <strong>{email}</strong> has an account, a link to reset the password is on its way. It can take a
            minute; check spam too.
          </p>
        </div>
        <button className="admin-btn primary wide" onClick={() => switchTo('sign-in')}>
          Back to sign in
        </button>
      </AuthCard>
    )
  }

  if (mode === 'forgot') {
    return (
      <AuthCard title="Reset your password" subtitle="Enter your email and we’ll send you a link to choose a new one.">
        <form onSubmit={sendReset} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="admin-btn primary wide" disabled={busy}>
            {busy && <Loader2 size={18} className="spin" />} Send reset link
          </button>
          <button type="button" className="text-btn" onClick={() => switchTo('sign-in')}>
            Back to sign in
          </button>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Dashboard sign in" subtitle="Manage your products, photos and website text.">
      <form onSubmit={signIn} className="auth-form">
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus />
        </label>
        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="admin-btn primary wide" disabled={busy}>
          {busy && <Loader2 size={18} className="spin" />} Sign in
        </button>
        <button type="button" className="text-btn" onClick={() => switchTo('forgot')}>
          Forgot your password?
        </button>
      </form>
    </AuthCard>
  )
}

export function NewPasswordScreen({
  token,
  onDone,
  onCancel,
}: {
  token: string
  onDone: (account: Account) => void
  onCancel: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <AuthCard title="This link isn’t complete" subtitle="Open the link from the email again, or ask for a new one.">
        <button className="admin-btn primary wide" onClick={onCancel}>
          Back to sign in
        </button>
      </AuthCard>
    )
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('The two passwords don’t match.')
    setBusy(true)
    setError('')
    try {
      onDone(await resetPassword(token, password))
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="At least 8 characters.">
      <form onSubmit={save} className="auth-form">
        <PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="admin-btn primary wide" disabled={busy}>
          {busy && <Loader2 size={18} className="spin" />} Save password
        </button>
        <button type="button" className="text-btn" onClick={onCancel}>
          Back to sign in
        </button>
      </form>
    </AuthCard>
  )
}

export function SetupScreen() {
  return (
    <AuthCard title="Connect the database to use the dashboard">
      <p className="auth-help">
        The website is running on its built-in products and text. To edit them here, connect a free MongoDB
        Atlas database: follow <strong>MONGODB_SETUP.md</strong> in the project folder, then restart the dev server.
      </p>
    </AuthCard>
  )
}

export function ErrorScreen({ message, retry }: { message: string; retry: () => void }) {
  return (
    <AuthCard title="Can’t reach the dashboard" subtitle={message}>
      <button className="admin-btn primary wide" onClick={retry}>
        Try again
      </button>
    </AuthCard>
  )
}

export function LoadingScreen() {
  return (
    <div className="auth-screen">
      <Loader2 size={30} className="spin" aria-label="Loading" />
    </div>
  )
}
