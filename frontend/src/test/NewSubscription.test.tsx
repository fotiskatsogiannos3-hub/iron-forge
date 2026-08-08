import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubscriptionListPage } from '@/pages/SubscriptionListPage'
import { renderApp, seedLoggedInSession } from '@/test/testUtils'

describe('New Subscription flow', () => {
  it('lists active plans (Monthly/Quarterly/Annual) in the plan dropdown', async () => {
    seedLoggedInSession('admin')
    renderApp(<SubscriptionListPage openCreateModal />, { route: '/subscriptions/new' })

    const dialog = await screen.findByRole('dialog', { name: /new subscription/i })
    const planSelect = within(dialog).getByLabelText(/plan/i)
    const options = within(planSelect).getAllByRole('option').map((o) => o.textContent)

    expect(options.some((t) => t?.includes('Monthly'))).toBe(true)
    expect(options.some((t) => t?.includes('Quarterly'))).toBe(true)
    expect(options.some((t) => t?.includes('Annual'))).toBe(true)
  })

  it('blocks a second active subscription for a member who already has one', async () => {
    // Fixture data: Maria Antoniou (member #1) already has an ACTIVE Monthly subscription.
    seedLoggedInSession('admin')
    const user = userEvent.setup()
    renderApp(<SubscriptionListPage openCreateModal />, { route: '/subscriptions/new' })

    const dialog = await screen.findByRole('dialog', { name: /new subscription/i })
    await user.type(within(dialog).getByLabelText(/member/i), 'Maria')

    const option = await within(dialog).findByText(/Maria Antoniou/i)
    await user.click(option)

    await user.click(within(dialog).getByRole('button', { name: /^create$/i }))

    expect(await screen.findByText(/already has an active subscription/i)).toBeInTheDocument()
  })

  it('creates a subscription for a member with no active plan', async () => {
    seedLoggedInSession('admin')
    const user = userEvent.setup()
    renderApp(<SubscriptionListPage openCreateModal />, { route: '/subscriptions/new' })

    const dialog = await screen.findByRole('dialog', { name: /new subscription/i })
    await user.type(within(dialog).getByLabelText(/member/i), 'Nikos')

    const option = await within(dialog).findByText(/Nikos Stavrou/i)
    await user.click(option)

    await user.click(within(dialog).getByRole('button', { name: /^create$/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /new subscription/i })).not.toBeInTheDocument()
    })
    expect(await screen.findByText(/subscription created/i)).toBeInTheDocument()
  })
})
