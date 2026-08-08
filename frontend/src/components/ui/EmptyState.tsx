import type { LucideIcon } from 'lucide-react'
import './ui.css'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="if-empty-state">
      <Icon size={28} strokeWidth={1.5} />
      <span>{message}</span>
    </div>
  )
}