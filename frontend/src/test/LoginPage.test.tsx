import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { LoginPage } from '@/pages/LoginPage'
import { renderApp } from '@/test/testUtils'
import { server } from '@/test/mockServer'

describe('LoginPage', () => {
  it('logs in with correct admin credentials and stores the session', async () => {
    const user = userEvent.setup()
    renderApp(<LoginPage />, { route: '/login' })

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(localStorage.getItem('ironforge_token')).toBe('fake-admin-jwt')
    })
    const storedUser = JSON.parse(localStorage.getItem('ironforge_user') ?? '{}')
    expect(storedUser).toEqual({ username: 'admin', role: 'ADMIN' })
  })

  it('shows a real 401 as "Invalid username or password"', async () => {
    const user = userEvent.setup()
    renderApp(<LoginPage />, { route: '/login' })

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument()
    expect(localStorage.getItem('ironforge_token')).toBeNull()
  })

  it('distinguishes an unreachable backend from a wrong password', async () => {
    // Simulate the backend being completely unreachable (down, wrong port, CORS block)
    server.use(
      http.post('http://localhost:8080/api/auth/login', () => HttpResponse.error()),
    )

    const user = userEvent.setup()
    renderApp(<LoginPage />, { route: '/login' })

    await user.type(screen.getByLabelText(/username/i), 'admin')
    await user.type(screen.getByLabelText(/password/i), 'admin123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/can't reach the server/i)).toBeInTheDocument()
    // Critically, this must NOT be confused with the wrong-password message.
    expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument()
  })
})
