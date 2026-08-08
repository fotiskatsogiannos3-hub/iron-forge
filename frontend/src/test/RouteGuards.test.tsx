import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AdminRoute, ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { seedLoggedInSession } from '@/test/testUtils'

function TestTree(initialRoute: string) {
  window.history.pushState({}, '', initialRoute)
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/staff" element={<div>Staff Page (admin only)</div>} />
            </Route>
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Route guards', () => {
  it('redirects a Trainer away from the admin-only /staff route', async () => {
    seedLoggedInSession('trainer1')
    TestTree('/staff')

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Staff Page (admin only)')).not.toBeInTheDocument()
  })

  it('lets an Admin reach the /staff route', async () => {
    seedLoggedInSession('admin')
    TestTree('/staff')

    expect(await screen.findByText('Staff Page (admin only)')).toBeInTheDocument()
  })

  it('redirects an unauthenticated visitor to /login', async () => {
    TestTree('/dashboard')
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })
})
