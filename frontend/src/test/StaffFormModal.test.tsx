import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffFormModal } from '@/pages/modals/StaffFormModal'
import { renderApp, seedLoggedInSession } from '@/test/testUtils'

describe('StaffFormModal single-admin policy', () => {
  it('creating a new staff user never offers an Admin role option', async () => {
    seedLoggedInSession('admin')
    renderApp(<StaffFormModal mode="create" onClose={vi.fn()} onSaved={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: /new staff user/i })
    // There must be no interactive role control at all, role is fixed to Trainer.
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
    expect(within(dialog).getByText('TRAINER')).toBeInTheDocument()
    expect(within(dialog).queryByText('ADMIN')).not.toBeInTheDocument()
  })

  it('creates the staff user with roleName TRAINER regardless of what is typed elsewhere', async () => {
    seedLoggedInSession('admin')
    const onSaved = vi.fn()
    const user = userEvent.setup()
    renderApp(<StaffFormModal mode="create" onClose={vi.fn()} onSaved={onSaved} />)

    await user.type(screen.getByLabelText(/username/i), 'newtrainer')
    await user.type(screen.getByLabelText(/email/i), 'newtrainer@ironforge.com')
    await user.type(screen.getByLabelText(/password/i), 'Passw0rd!123')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await vi.waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ roleName: 'TRAINER' }))
    })
  })

  it('editing an existing staff user shows the role as read-only, not a selectable field', () => {
    seedLoggedInSession('admin')
    renderApp(
      <StaffFormModal
        mode="edit"
        staffUser={{ id: 2, username: 'trainer1', email: 'trainer1@ironforge.local', roleName: 'TRAINER' }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /edit staff user/i })
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
    expect(within(dialog).getByText('TRAINER')).toBeInTheDocument()
    // No password field when editing: the backend's update DTO doesn't support it.
    expect(within(dialog).queryByLabelText(/password/i)).not.toBeInTheDocument()
  })
})
