import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'

export function renderApp(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  window.history.pushState({}, '', route)
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

/** Seeds localStorage as if the given user already logged in, before rendering. */
export function seedLoggedInSession(username: 'admin' | 'trainer1' = 'admin') {
  const role = username === 'admin' ? 'ADMIN' : 'TRAINER'
  localStorage.setItem('ironforge_token', username === 'admin' ? 'fake-admin-jwt' : 'fake-trainer-jwt')
  localStorage.setItem('ironforge_user', JSON.stringify({ username, role }))
}
