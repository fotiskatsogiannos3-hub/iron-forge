import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemberListPage } from '@/pages/MemberListPage'
import { renderApp, seedLoggedInSession } from '@/test/testUtils'

describe('MemberListPage', () => {
  it('loads and displays seeded members', async () => {
    seedLoggedInSession('admin')
    renderApp(<MemberListPage />, { route: '/members' })

    expect(await screen.findByText('Antoniou')).toBeInTheDocument()
    expect(screen.getByText('Stavrou')).toBeInTheDocument()
  })

  it('filters members by search text', async () => {
    seedLoggedInSession('admin')
    const user = userEvent.setup()
    renderApp(<MemberListPage />, { route: '/members' })

    await screen.findByText('Antoniou')
    await user.type(screen.getByPlaceholderText(/search by name or email/i), 'Nikos')

    await waitFor(() => {
      expect(screen.queryByText('Antoniou')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Stavrou')).toBeInTheDocument()
  })

  it('creates a new member from the modal and shows a confirmation toast', async () => {
    seedLoggedInSession('admin')
    const user = userEvent.setup()
    renderApp(<MemberListPage />, { route: '/members' })

    await screen.findByText('Antoniou')
    await user.click(screen.getByRole('button', { name: /\+ new member/i }))

    expect(screen.getByRole('dialog', { name: /new member/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/first name/i), 'Eleni')
    await user.type(screen.getByLabelText(/last name/i), 'Georgiou')
    await user.type(screen.getByLabelText(/^email$/i), 'eleni@mail.com')
    await user.type(screen.getByLabelText(/phone/i), '6900000000')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(await screen.findByText(/eleni georgiou was added/i)).toBeInTheDocument()
  })

  it('masks the Date of Birth input as DD/MM/YYYY without a native date picker', async () => {
    seedLoggedInSession('admin')
    const user = userEvent.setup()
    renderApp(<MemberListPage />, { route: '/members' })

    await screen.findByText('Antoniou')
    await user.click(screen.getByRole('button', { name: /\+ new member/i }))

    const dobInput = screen.getByPlaceholderText('DD/MM/YYYY')
    expect(dobInput).not.toHaveAttribute('type', 'date') // not the native <input type="date">
    await user.type(dobInput, '15051994')
    expect(dobInput).toHaveValue('15/05/1994')
  })
})
