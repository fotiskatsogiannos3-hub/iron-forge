import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscriptionsApi } from '@/api/subscriptions'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge, subscriptionStatusVariant } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CreditCard } from 'lucide-react'
import { Select } from '@/components/ui/Field'
import { formatDate } from '@/lib/format'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useToast } from '@/context/ToastContext'
import type { SubscriptionReadOnly, SubscriptionStatus } from '@/types'
import { NewSubscriptionModal } from './modals/NewSubscriptionModal'
import './pages.css'

type StatusFilter = 'ALL' | SubscriptionStatus

export function SubscriptionListPage({ openCreateModal = false }: { openCreateModal?: boolean }) {
  const navigate = useNavigate()
  const { showSuccess } = useToast()
  const [subscriptions, setSubscriptions] = useState<SubscriptionReadOnly[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(openCreateModal)

  // no server-side search/filter for subscriptions yet, so fetch one page
  // and filter client-side
  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const page = await subscriptionsApi.list({ size: 200 })
      setSubscriptions(page.content)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load subscriptions'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visible = subscriptions.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    const matchesSearch = s.memberFullName.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <div className="if-page-header">
        <h1 className="if-page-title">Subscriptions</h1>
        <Button onClick={() => setShowCreateModal(true)}>New subscription</Button>
      </div>

      <div className="if-filters-row">
        <input className="if-input" placeholder="Search by member…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-table-wrap">
        {isLoading ? (
          <div className="if-loading-row">
            <span className="if-spinner" />
            Loading…
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon={CreditCard} message="No subscriptions match your filters." />
        ) : (
          <table className="if-table if-table-clickable">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} onClick={() => navigate(`/members/${s.memberId}`)}>
                  <td>{s.memberFullName}</td>
                  <td>{s.planName}</td>
                  <td>{formatDate(s.startDate)}</td>
                  <td>{formatDate(s.endDate)}</td>
                  <td>
                    <Badge variant={subscriptionStatusVariant(s.status)}>
                      {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <NewSubscriptionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            showSuccess('Subscription created.')
            load()
          }}
        />
      )}
    </div>
  )
}