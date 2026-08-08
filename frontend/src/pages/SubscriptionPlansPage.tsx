import { useEffect, useState } from 'react'
import { Pencil, Trash2, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { subscriptionPlansApi } from '@/api/subscriptionPlans'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { formatMoney } from '@/lib/format'
import type { SubscriptionPlanReadOnly } from '@/types'
import { PlanFormModal } from './modals/PlanFormModal'
import './pages.css'

export function SubscriptionPlansPage() {
  const { showSuccess, showError } = useToast()
  const [plans, setPlans] = useState<SubscriptionPlanReadOnly[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanReadOnly | null>(null)
  const [retiringPlan, setRetiringPlan] = useState<SubscriptionPlanReadOnly | null>(null)
  const [isRetiring, setIsRetiring] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await subscriptionPlansApi.list(false)
      setPlans(data)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load subscription plans'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRetire = async () => {
    if (!retiringPlan) return
    setIsRetiring(true)
    try {
      await subscriptionPlansApi.retire(retiringPlan.id)
      showSuccess(`"${retiringPlan.name}" retired.`)
      setRetiringPlan(null)
      load()
    } catch (err) {
      const message = extractErrorMessage(err, 'Could not retire this plan')
      setError(message)
      showError(message)
    } finally {
      setIsRetiring(false)
    }
  }

  return (
    <div>
      <div className="if-page-header">
        <h1 className="if-page-title">Subscription Plans</h1>
        <Button onClick={() => setShowCreateModal(true)}>New Plan</Button>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-table-wrap">
        {isLoading ? (
          <div className="if-loading-row">
            <span className="if-spinner" />
            Loading…
          </div>
        ) : plans.length === 0 ? (
          <EmptyState icon={Wallet} message="No plans yet." />
        ) : (
          <table className="if-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.durationDays} days</td>
                  <td>{formatMoney(p.price, p.currency)}</td>
                  <td>{p.active ? <Badge variant="active">Active</Badge> : <Badge variant="inactive">Inactive</Badge>}</td>
                  <td>
                    <div className="if-table-actions">
                      <button onClick={() => setEditingPlan(p)} aria-label="Edit plan" title="Edit">
                        <Pencil size={17} />
                      </button>
                      {p.active && (
                        <button className="danger" onClick={() => setRetiringPlan(p)} aria-label="Retire plan" title="Retire">
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <PlanFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            setShowCreateModal(false)
            showSuccess('Plan created.')
            load()
          }}
        />
      )}

      {editingPlan && (
        <PlanFormModal
          mode="edit"
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => {
            setEditingPlan(null)
            showSuccess('Plan updated.')
            load()
          }}
        />
      )}

      {retiringPlan && (
        <div className="if-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setRetiringPlan(null)}>
          <div className="if-modal" style={{ maxWidth: 400 }}>
            <div className="if-modal-header">
              <h2 className="if-modal-title">Retire plan?</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
              "{retiringPlan.name}" will no longer be available for new subscriptions. Existing subscriptions on this plan
              are unaffected.
            </p>
            <div className="if-modal-actions">
              <Button variant="secondary" onClick={() => setRetiringPlan(null)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={isRetiring} onClick={handleRetire}>
                Retire
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}