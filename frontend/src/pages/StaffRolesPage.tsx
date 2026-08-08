import { useEffect, useState } from 'react'
import { Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { staffApi } from '@/api/staff'
import { extractErrorMessage } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge, roleVariant } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import type { StaffUserReadOnly } from '@/types'
import { StaffFormModal } from './modals/StaffFormModal'
import './pages.css'

export function StaffRolesPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [staffUsers, setStaffUsers] = useState<StaffUserReadOnly[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<StaffUserReadOnly | null>(null)
  const [deletingUser, setDeletingUser] = useState<StaffUserReadOnly | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const page = await staffApi.list({ size: 50 })
      setStaffUsers(page.content)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load staff users'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      await staffApi.remove(deletingUser.id)
      showSuccess(`"${deletingUser.username}" removed.`)
      setDeletingUser(null)
      load()
    } catch (err) {
      const message = extractErrorMessage(err, 'Could not remove this staff user')
      setError(message)
      showError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="if-page-header">
        <h1 className="if-page-title">Staff / Roles</h1>
        <Button onClick={() => setShowCreateModal(true)}>New Staff User</Button>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-table-wrap">
        {isLoading ? (
          <div className="if-loading-row">
            <span className="if-spinner" />
            Loading…
          </div>
        ) : staffUsers.length === 0 ? (
          <EmptyState icon={ShieldCheck} message="No staff users yet." />
        ) : (
          <table className="if-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffUsers.map((s) => (
                <tr key={s.id}>
                  <td>{s.username}</td>
                  <td>{s.email}</td>
                  <td>
                    <Badge variant={roleVariant(s.roleName)}>{s.roleName}</Badge>
                  </td>
                  <td>
                    <Badge variant="active">Active</Badge>
                  </td>
                  <td>
                    <div className="if-table-actions">
                      <button onClick={() => setEditingUser(s)} aria-label="Edit staff user" title="Edit">
                        <Pencil size={17} />
                      </button>
                      <button
                        className="danger"
                        onClick={() => setDeletingUser(s)}
                        aria-label="Remove staff user"
                        title={s.roleName === 'ADMIN' ? "The Admin account can't be removed" : 'Remove'}
                        disabled={s.username === user?.username || s.roleName === 'ADMIN'}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <StaffFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            setShowCreateModal(false)
            showSuccess('Staff user created.')
            load()
          }}
        />
      )}

      {editingUser && (
        <StaffFormModal
          mode="edit"
          staffUser={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null)
            showSuccess('Staff user updated.')
            load()
          }}
        />
      )}

      {deletingUser && (
        <div className="if-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDeletingUser(null)}>
          <div className="if-modal" style={{ maxWidth: 400 }}>
            <div className="if-modal-header">
              <h2 className="if-modal-title">Remove staff user?</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
              "{deletingUser.username}" will lose access to Iron Forge immediately.
            </p>
            <div className="if-modal-actions">
              <Button variant="secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}