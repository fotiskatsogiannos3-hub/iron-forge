import type { ReactNode } from 'react'

export type BadgeVariant = 'active' | 'expired' | 'inactive' | 'admin' | 'trainer'

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; fg: string }> = {
  active: { bg: 'var(--status-active-bg)', fg: 'var(--status-active-fg)' },
  expired: { bg: 'var(--status-expired-bg)', fg: 'var(--status-expired-fg)' },
  inactive: { bg: 'var(--status-inactive-bg)', fg: 'var(--status-inactive-fg)' },
  admin: { bg: 'var(--status-admin-bg)', fg: 'var(--status-admin-fg)' },
  trainer: { bg: 'var(--status-trainer-bg)', fg: 'var(--status-trainer-fg)' },
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  const style = VARIANT_STYLES[variant]
  return (
    <span
      style={{
        display: 'inline-block',
        background: style.bg,
        color: style.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** Maps a subscription status enum straight to its badge variant. */
export function subscriptionStatusVariant(status: string): BadgeVariant {
  if (status === 'ACTIVE') return 'active'
  if (status === 'EXPIRED') return 'expired'
  return 'inactive' // CANCELLED
}

/** Maps a staff role name to its badge variant. */
export function roleVariant(roleName: string): BadgeVariant {
  return roleName === 'ADMIN' ? 'admin' : 'trainer'
}
