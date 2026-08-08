import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return null // avoid a login-screen flash while we check localStorage
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

/** Guards ADMIN-only pages (Subscription Plans, Staff | Roles). */
export function AdminRoute() {
  const { user } = useAuth()
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
