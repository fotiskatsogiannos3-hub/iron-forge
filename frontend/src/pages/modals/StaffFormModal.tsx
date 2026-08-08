import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Field, TextInput } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Badge, roleVariant } from '@/components/ui/Badge'
import { staffApi } from '@/api/staff'
import { extractErrorMessage, extractFieldErrors } from '@/api/client'
import type { StaffUserReadOnly } from '@/types'

const PASSWORD_HINT = 'Min. 8 characters, with an uppercase letter, lowercase letter, digit and special character.'

interface StaffFormModalProps {
  mode: 'create' | 'edit'
  staffUser?: StaffUserReadOnly
  onClose: () => void
  onSaved: (staffUser: StaffUserReadOnly) => void
}

// single Admin account; new staff are always TRAINER, role isn't editable here
const NEW_STAFF_ROLE = 'TRAINER'

export function StaffFormModal({ mode, staffUser, onClose, onSaved }: StaffFormModalProps) {
  const [username, setUsername] = useState(staffUser?.username ?? '')
  const [email, setEmail] = useState(staffUser?.email ?? '')
  const [password, setPassword] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const saved =
        mode === 'create'
          ? await staffApi.create({ username, email, password, roleName: NEW_STAFF_ROLE })
          : await staffApi.update(staffUser!.id, { email, roleName: staffUser!.roleName })
      onSaved(saved)
    } catch (err) {
      const fields = extractFieldErrors(err)
      if (fields) setFieldErrors(fields)
      else setFormError(extractErrorMessage(err, 'Could not save this staff user'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'New Staff User' : 'Edit Staff User'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {formError && <div className="if-modal-banner">{formError}</div>}

        <Field label="Username" htmlFor="username" error={fieldErrors.username}>
          <TextInput
            id="username"
            placeholder="e.g. gpapadopoulos"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={mode === 'edit'}
            required
          />
        </Field>

        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <TextInput
            id="email"
            type="email"
            placeholder="gpap@ironforge.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        {mode === 'create' && (
          <Field label="Password" htmlFor="password" hint={PASSWORD_HINT} error={fieldErrors.password}>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
        )}

        <Field
          label="Role"
          htmlFor="role"
          hint={
            mode === 'create'
              ? 'New staff accounts are always created as Trainer. Iron Forge has a single Admin account.'
              : 'Roles can\'t be changed here. Iron Forge has a single Admin account, fixed outside the app.'
          }
        >
          <div id="role" style={{ display: 'flex', alignItems: 'center', height: 44 }}>
            <Badge variant={roleVariant(mode === 'create' ? NEW_STAFF_ROLE : staffUser!.roleName)}>
              {mode === 'create' ? NEW_STAFF_ROLE : staffUser!.roleName}
            </Badge>
          </div>
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