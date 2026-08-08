import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { clearStoredToken, getStoredToken, registerUnauthorizedHandler, setStoredToken } from '@/api/client'
import type { Role } from '@/types'

interface AuthUser {
  username: string
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USER_KEY = 'ironforge_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Restore session from localStorage on first load, so a refresh doesn't
  // bounce an already-logged-in staff member back to the login screen.
  useEffect(() => {
    const token = getStoredToken()
    const rawUser = localStorage.getItem(USER_KEY)
    if (token && rawUser) {
      try {
        setUser(JSON.parse(rawUser) as AuthUser)
      } catch {
        clearStoredToken()
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsInitializing(false)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // If a request ever comes back 401 (expired/invalid token), drop the
  // session so the app falls back to the login screen automatically.
  useEffect(() => {
    registerUnauthorizedHandler(() => logout())
  }, [logout])

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password })
    setStoredToken(response.token)
    const nextUser: AuthUser = { username: response.username, role: response.role }
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isInitializing, login, logout }),
    [user, isInitializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
