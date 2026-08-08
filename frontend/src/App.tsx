import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute, AdminRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MemberListPage } from '@/pages/MemberListPage'
import { MemberDetailPage } from '@/pages/MemberDetailPage'
import { SubscriptionListPage } from '@/pages/SubscriptionListPage'
import { SubscriptionPlansPage } from '@/pages/SubscriptionPlansPage'
import { StaffRolesPage } from '@/pages/StaffRolesPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/members" element={<MemberListPage />} />
                <Route path="/members/new" element={<MemberListPage openCreateModal />} />
                <Route path="/members/:id" element={<MemberDetailPage />} />

                <Route path="/subscriptions" element={<SubscriptionListPage />} />
                <Route path="/subscriptions/new" element={<SubscriptionListPage openCreateModal />} />

                <Route element={<AdminRoute />}>
                  <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
                  <Route path="/staff" element={<StaffRolesPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
