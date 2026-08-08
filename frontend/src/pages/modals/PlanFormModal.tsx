import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { subscriptionPlansApi } from '@/api/subscriptionPlans'
import { extractErrorMessage, extractFieldErrors } from '@/api/client'
import type { SubscriptionPlanReadOnly } from '@/types'

interface PlanFormModalProps {
  mode: 'create' | 'edit'
  plan?: SubscriptionPlanReadOnly
  onClose: () => void
  onSaved: (plan: SubscriptionPlanReadOnly) => void
}

export function PlanFormModal({ mode, plan, onClose, onSaved }: PlanFormModalProps) {
  const [name, setName] = useState(plan?.name ?? '')
  const [durationDays, setDurationDays] = useState(plan?.durationDays?.toString() ?? '30')
  const [price, setPrice] = useState(plan?.price?.toString() ?? '')
  const [currency, setCurrency] = useState(plan?.currency ?? 'EUR')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [active, setActive] = useState(plan?.active ?? true)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const basePayload = {
        name,
        durationDays: Number(durationDays),
        price: Number(price),
        currency,
        description,
      }
      const saved =
        mode === 'create'
          ? await subscriptionPlansApi.create(basePayload)
          : await subscriptionPlansApi.update(plan!.id, { ...basePayload, active })
      onSaved(saved)
    } catch (err) {
      const fields = extractFieldErrors(err)
      if (fields) setFieldErrors(fields)
      else setFormError(extractErrorMessage(err, 'Could not save the plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'New Plan' : 'Edit Plan'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {formError && <div className="if-modal-banner">{formError}</div>}

        <Field label="Plan Name" htmlFor="name" error={fieldErrors.name}>
          <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>

        <Field label="Duration (days)" htmlFor="durationDays" error={fieldErrors.durationDays}>
          <TextInput
            id="durationDays"
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
          />
        </Field>

        <Field label="Price" htmlFor="price" error={fieldErrors.price}>
          <TextInput id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </Field>

        <Field label="Currency" htmlFor="currency" error={fieldErrors.currency}>
          <TextInput id="currency" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} required />
        </Field>

        <Field label="Description" htmlFor="description" error={fieldErrors.description}>
          <TextInput id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        {mode === 'edit' && (
          <div className="if-field">
            <div className="if-checkbox-row">
              <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <label htmlFor="active" className="if-label" style={{ marginBottom: 0 }}>
                Active (visible when creating new subscriptions)
              </label>
            </div>
          </div>
        )}

        <div className="if-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
