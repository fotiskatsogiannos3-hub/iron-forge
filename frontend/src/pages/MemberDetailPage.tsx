import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { membersApi } from '@/api/members'
import { subscriptionsApi } from '@/api/subscriptions'
import { paymentsApi } from '@/api/payments'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge, subscriptionStatusVariant } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { formatDate, formatMoney } from '@/lib/format'
import type { MemberReadOnly, PaymentReadOnly, SubscriptionReadOnly } from '@/types'
import { MemberFormModal } from './modals/MemberFormModal'
import './pages.css'

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const memberId = Number(id)
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [member, setMember] = useState<MemberReadOnly | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubscriptionReadOnly[]>([])
  const [payments, setPayments] = useState<PaymentReadOnly[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [memberData, subsData, paymentsData] = await Promise.all([
        membersApi.get(memberId),
        subscriptionsApi.listForMember(memberId),
        paymentsApi.listForMember(memberId),
      ])
      setMember(memberData)
      setSubscriptions(subsData)
      setPayments(paymentsData)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load this member'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Number.isFinite(memberId)) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId])

  const isActive = subscriptions.some((s) => s.status === 'ACTIVE')

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await membersApi.remove(memberId)
      showSuccess('Member removed.')
      navigate('/members')
    } catch (err) {
      const message = extractErrorMessage(err, 'Could not delete this member')
      setError(message)
      showError(message)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="if-loading-row">
        <span className="if-spinner" />
        Loading…
      </div>
    )
  }

  if (error && !member) {
    return <div className="if-alert-error">{error}</div>
  }

  if (!member) return null

  return (
    <div>
      <div className="if-detail-header">
        <div>
          <div className="if-detail-title-row">
            <h1>
              {member.firstName} {member.lastName}
            </h1>
            {isActive ? <Badge variant="active">Active</Badge> : <Badge variant="inactive">Inactive</Badge>}
          </div>
          <p className="if-detail-subtitle">Member since {formatDate(member.joinDate)}</p>
        </div>
        <div className="if-detail-actions">
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-card if-detail-section">
        <h2 className="if-detail-section-title">Details</h2>
        <div className="if-detail-grid">
          <div>
            <div className="if-detail-field-label">Email</div>
            <div className="if-detail-field-value">{member.email}</div>
          </div>
          <div>
            <div className="if-detail-field-label">Phone</div>
            <div className="if-detail-field-value">{member.phoneNumber}</div>
          </div>
          <div>
            <div className="if-detail-field-label">Date of birth</div>
            <div className="if-detail-field-value">{formatDate(member.dateOfBirth)}</div>
          </div>
          <div>
            <div className="if-detail-field-label">Join Date</div>
            <div className="if-detail-field-value">{formatDate(member.joinDate)}</div>
          </div>
        </div>
      </div>

      <div className="if-card if-detail-section">
        <h2 className="if-detail-section-title">Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No subscriptions yet.</p>
        ) : (
          <table className="if-table" style={{ marginLeft: -4 }}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
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

      <div className="if-card if-detail-section">
        <h2 className="if-detail-section-title">Payment History</h2>
        {payments.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No payments yet.</p>
        ) : (
          <table className="if-table" style={{ marginLeft: -4 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.paymentDate)}</td>
                  <td>{formatMoney(p.amount, p.currency)}</td>
                  <td>{p.method.replace('_', ' ')}</td>
                  <td>
                    <Badge variant={p.status === 'COMPLETED' ? 'active' : p.status === 'REFUNDED' ? 'expired' : 'inactive'}>
                      {p.status === 'COMPLETED' ? 'Paid' : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEditModal && (
        <MemberFormModal
          mode="edit"
          member={member}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setMember(updated)
            setShowEditModal(false)
            showSuccess('Member details saved.')
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="if-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="if-modal" style={{ maxWidth: 400 }}>
            <div className="if-modal-header">
              <h2 className="if-modal-title">Delete member?</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
              This will remove {member.firstName} {member.lastName} from the active member list. This can't be undone from
              here.
            </p>
            <div className="if-modal-actions">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
