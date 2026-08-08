import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Users } from 'lucide-react'
import { membersApi } from '@/api/members'
import { subscriptionsApi } from '@/api/subscriptions'
import { extractErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useToast } from '@/context/ToastContext'
import { formatDateShort } from '@/lib/format'
import type { MemberReadOnly } from '@/types'
import { MemberFormModal } from './modals/MemberFormModal'
import './pages.css'

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export function MemberListPage({ openCreateModal = false }: { openCreateModal?: boolean }) {
  const navigate = useNavigate()
  const { showSuccess } = useToast()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const [page, setPage] = useState(0)
  const [members, setMembers] = useState<MemberReadOnly[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [activeMemberIds, setActiveMemberIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(openCreateModal)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        // "Active" = has a non-expired subscription (Member has no status field itself)
        const [membersPage, subsPage] = await Promise.all([
          membersApi.list({ search: debouncedSearch, page, size: 20, sort: 'lastName,asc' }),
          subscriptionsApi.list({ page: 0, size: 200 }),
        ])
        if (cancelled) return
        setMembers(membersPage.content)
        setTotalPages(membersPage.totalPages)
        setActiveMemberIds(new Set(subsPage.content.filter((s) => s.status === 'ACTIVE').map((s) => s.memberId)))
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load members'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, page])

  const visibleMembers = members.filter((m) => {
    if (statusFilter === 'ALL') return true
    const isActive = activeMemberIds.has(m.id)
    return statusFilter === 'ACTIVE' ? isActive : !isActive
  })

  return (
    <div>
      <div className="if-page-header">
        <h1 className="if-page-title">Members</h1>
        <Button onClick={() => setShowCreateModal(true)}>+ New member</Button>
      </div>

      <div className="if-filters-row">
        <input
          className="if-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      {error && <div className="if-alert-error">{error}</div>}

      <div className="if-table-wrap">
        {isLoading ? (
          <div className="if-loading-row">
            <span className="if-spinner" />
            Loading…
          </div>
        ) : visibleMembers.length === 0 ? (
          <EmptyState icon={Users} message="No members match your filters." />
        ) : (
          <table className="if-table if-table-clickable">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((m) => (
                <tr key={m.id} onClick={() => navigate(`/members/${m.id}`)}>
                  <td>{m.firstName}</td>
                  <td>{m.lastName}</td>
                  <td>{m.email}</td>
                  <td>{m.phoneNumber}</td>
                  <td>{formatDateShort(m.joinDate)}</td>
                  <td>
                    {activeMemberIds.has(m.id) ? <Badge variant="active">Active</Badge> : <Badge variant="inactive">Inactive</Badge>}
                  </td>
                  <td>
                    <div className="if-table-actions" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/members/${m.id}`)} aria-label="View member" title="View">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showCreateModal && (
        <MemberFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSaved={(created) => {
            setShowCreateModal(false)
            showSuccess(`${created.firstName} ${created.lastName} was added.`)
            navigate(`/members/${created.id}`)
          }}
        />
      )}
    </div>
  )
}