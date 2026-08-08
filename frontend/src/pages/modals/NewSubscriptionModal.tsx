import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { subscriptionPlansApi } from '@/api/subscriptionPlans'
import { subscriptionsApi } from '@/api/subscriptions'
import { extractErrorMessage } from '@/api/client'
import { addDaysIso, formatDate, formatMoney, todayIso } from '@/lib/format'
import type { MemberReadOnly, PaymentMethod, SubscriptionPlanReadOnly, SubscriptionReadOnly } from '@/types'
import { MemberAutocomplete } from './MemberAutocomplete'

interface NewSubscriptionModalProps {
  onClose: () => void
  onCreated: (subscription: SubscriptionReadOnly) => void
  /** Pre-selected member, e.g. when opening this from a Member Detail page. */
  initialMember?: MemberReadOnly
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CARD', label: 'Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
]

export function NewSubscriptionModal({ onClose, onCreated, initialMember }: NewSubscriptionModalProps) {
  const [member, setMember] = useState<MemberReadOnly | null>(initialMember ?? null)
  const [plans, setPlans] = useState<SubscriptionPlanReadOnly[]>([])
  const [planId, setPlanId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD')
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    subscriptionPlansApi
      .list(true) // active plans only, a retired plan can't be sold
      .then((data) => {
        setPlans(data)
        if (data.length > 0) setPlanId(data[0].id)
      })
      .catch((err) => setFormError(extractErrorMessage(err, 'Could not load subscription plans')))
      .finally(() => setIsLoadingPlans(false))
  }, [])

  const selectedPlan = plans.find((p) => p.id === planId) ?? null
  const startDate = todayIso()
  const endDate = selectedPlan ? addDaysIso(startDate, selectedPlan.durationDays) : null

  const handleSubmit = async () => {
    if (!member || !planId) return
    setFormError(null)
    setIsSubmitting(true)
    try {
      const created = await subscriptionsApi.create({ memberId: member.id, planId, paymentMethod })
      onCreated(created)
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create the subscription'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="New Subscription" onClose={onClose}>
      {formError && <div className="if-modal-banner">{formError}</div>}

      <Field label="Member" htmlFor="member-search">
        {initialMember ? (
          <input className="if-input" disabled value={`${initialMember.firstName} ${initialMember.lastName}`} />
        ) : (
          <MemberAutocomplete id="member-search" value={member} onChange={setMember} />
        )}
      </Field>

      <Field label="Plan" htmlFor="plan">
        <Select
          id="plan"
          value={planId ?? ''}
          onChange={(e) => setPlanId(Number(e.target.value))}
          disabled={isLoadingPlans || plans.length === 0}
        >
          {plans.length === 0 && <option value="">No active plans available</option>}
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {formatMoney(p.price, p.currency)} / {p.durationDays} days
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Payment Method" htmlFor="paymentMethod">
        <Select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm.value} value={pm.value}>
              {pm.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Start Date" htmlFor="startDate" hint="Subscriptions start today and are paid at sign-up.">
        <input className="if-input" id="startDate" disabled value={formatDate(startDate)} />
      </Field>

      <div className="if-summary-row">
        <span>End Date (auto-calculated)</span>
        <strong>{endDate ? formatDate(endDate) : '—'}</strong>
      </div>

      <div className="if-modal-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" isLoading={isSubmitting} disabled={!member || !planId} onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </Modal>
  )
}
