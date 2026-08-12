import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { membersApi } from '@/api/members'
import { subscriptionsApi } from '@/api/subscriptions'
import { fetchRevenueReport } from '@/api/reports'
import { extractErrorMessage } from '@/api/client'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { formatDate, formatLongDate, formatMoney, startOfMonthIso, todayIso } from '@/lib/format'
import type { MemberReadOnly } from '@/types'
import './pages.css'

// Dashboard counts are derived client-side (no aggregate API yet).
const SAMPLE_SIZE = 200

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const [totalMembers, setTotalMembers] = useState<number | null>(null)
  const [activeSubscriptions, setActiveSubscriptions] = useState<number | null>(null)
  const [newSignupsThisMonth, setNewSignupsThisMonth] = useState<number | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null)
  const [currency, setCurrency] = useState('EUR')
  const [recentSignups, setRecentSignups] = useState<MemberReadOnly[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [totalPage, recentPage, subsPage] = await Promise.all([
          membersApi.list({ page: 0, size: 1 }),
          membersApi.list({ page: 0, size: SAMPLE_SIZE, sort: 'joinDate,desc' }),
          subscriptionsApi.list({ page: 0, size: SAMPLE_SIZE }),
        ])

        if (cancelled) return

        setTotalMembers(totalPage.totalElements)
        setRecentSignups(recentPage.content.slice(0, 5))

        const monthStart = startOfMonthIso()
        setNewSignupsThisMonth(recentPage.content.filter((m) => m.joinDate >= monthStart).length)

        // Only count active subs whose member is still in the fetched member set.
        const memberIds = new Set(recentPage.content.map((m) => m.id))
        setActiveSubscriptions(
          subsPage.content.filter((s) => s.status === 'ACTIVE' && memberIds.has(s.memberId)).length
        )

        if (isAdmin) {
          const report = await fetchRevenueReport(monthStart, todayIso())
          if (cancelled) return
          setMonthlyRevenue(report.totalRevenue)
          setCurrency(report.currency)
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load the dashboard'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  return (
    <div>
      <div className="if-page-header">
        <h1 className="if-page-title">Dashboard</h1>
        <span className="if-dashboard-date">{formatLongDate()}</span>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-dashboard-stats">
        <StatCard label="Total members" value={isLoading ? '—' : totalMembers ?? 0} />
        <StatCard label="Active subscriptions" value={isLoading ? '—' : activeSubscriptions ?? 0} />
        {isAdmin ? (
          <StatCard label="Monthly revenue" value={isLoading ? '—' : formatMoney(monthlyRevenue ?? 0, currency)} />
        ) : (
          <StatCard label="New signups this month" value={isLoading ? '—' : newSignupsThisMonth ?? 0} />
        )}
      </div>

      {isAdmin && (
        <div className="if-dashboard-actions">
          <Button variant="primary" onClick={() => navigate('/members/new')}>
            + New member
          </Button>
          <Button variant="secondary" onClick={() => navigate('/subscriptions/new')}>
            New subscription
          </Button>
        </div>
      )}

      <div className="if-panel">
        <div className="if-panel-title">Recent signups</div>
        {isLoading ? (
          <div className="if-loading-row">
            <span className="if-spinner" />
            Loading…
          </div>
        ) : recentSignups.length === 0 ? (
          <div className="if-panel-empty">No members yet.</div>
        ) : (
          recentSignups.map((m) => (
            <div className="if-panel-row" key={m.id}>
              <span>
                {m.firstName} {m.lastName}
              </span>
              <span className="if-panel-row-muted">{formatDate(m.joinDate)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}