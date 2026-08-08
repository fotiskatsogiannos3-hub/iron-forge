import { ChevronLeft, ChevronRight } from 'lucide-react'
import './ui.css'

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '18px 0 4px' }}>
      <button className="if-btn if-btn-ghost" disabled={page <= 0} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
        Page {page + 1} of {totalPages}
      </span>
      <button
        className="if-btn if-btn-ghost"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
