import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_BASE_URL, extractErrorMessage, isNetworkError } from '@/api/client'
import './pages.css'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgotNote, setShowForgotNote] = useState(false)

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (isNetworkError(err)) {
        setError(
          `Can't reach the server at ${API_BASE_URL}. Check that the backend is running and that VITE_API_BASE_URL is correct.`,
        )
      } else {
        setError(extractErrorMessage(err, 'Invalid username or password'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="if-login-page">
      <form className="if-login-card" onSubmit={handleSubmit}>
        <div className="if-login-logo">
          <Dumbbell size={28} color="#5b9bf5" strokeWidth={2.4} />
          <span>IRON FORGE</span>
        </div>

        {error && <div className="if-alert-error">{error}</div>}

        <div className="if-field">
          <label className="if-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="if-input"
            type="text"
            placeholder="e.g. admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </div>

        <div className="if-field">
          <label className="if-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="if-input"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="if-login-forgot">
          <button type="button" className="if-link-btn" onClick={() => setShowForgotNote((v) => !v)}>
            Forgot your password?
          </button>
          {showForgotNote && <p className="if-login-forgot-note">Ask your gym administrator to reset it for you.</p>}
        </div>

        <button type="submit" className="if-btn if-btn-primary if-login-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Login'}
        </button>

        <p className="if-login-footer">Iron Forge Membership System</p>
      </form>
    </div>
  )
}
