import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextInput } from '@/components/ui/Field'
import { DateFieldInput } from '@/components/ui/DateFieldInput'
import { Button } from '@/components/ui/Button'
import { membersApi } from '@/api/members'
import { extractErrorMessage, extractFieldErrors } from '@/api/client'
import type { MemberReadOnly } from '@/types'

interface MemberFormModalProps {
  mode: 'create' | 'edit'
  member?: MemberReadOnly
  onClose: () => void
  onSaved: (member: MemberReadOnly) => void
}

export function MemberFormModal({ mode, member, onClose, onSaved }: MemberFormModalProps) {
  const [firstName, setFirstName] = useState(member?.firstName ?? '')
  const [lastName, setLastName] = useState(member?.lastName ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(member?.phoneNumber ?? '')
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(member?.dateOfBirth ?? null)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const payload = { firstName, lastName, email, phoneNumber, dateOfBirth }
      const saved =
        mode === 'create' ? await membersApi.create(payload) : await membersApi.update(member!.id, payload)
      onSaved(saved)
    } catch (err) {
      const fields = extractFieldErrors(err)
      if (fields) {
        setFieldErrors(fields)
      } else {
        const message = extractErrorMessage(err, 'Could not save the member')
        if (message.toLowerCase().includes('phone number')) {
          setFieldErrors({ phoneNumber: message })
        } else {
          setFormError(message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'New Member' : 'Edit Member'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {formError && <div className="if-modal-banner">{formError}</div>}

        <Field label="First Name" htmlFor="firstName" error={fieldErrors.firstName}>
          <TextInput id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </Field>

        <Field label="Last Name" htmlFor="lastName" error={fieldErrors.lastName}>
          <TextInput id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </Field>

        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>

        <Field
          label="Phone"
          htmlFor="phoneNumber"
          error={fieldErrors.phoneNumber}
          hint="Digits, spaces, + and - only, 7–20 characters."
        >
          <TextInput id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </Field>

        <Field label="Date of Birth" htmlFor="dateOfBirth" error={fieldErrors.dateOfBirth}>
          <DateFieldInput id="dateOfBirth" value={dateOfBirth} onChange={setDateOfBirth} />
        </Field>

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