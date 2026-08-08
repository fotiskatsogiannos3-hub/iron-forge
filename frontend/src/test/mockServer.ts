import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// ============================================================
// In-memory fake backend, mirroring the real Spring Boot API
// contract (paths, DTO field names, status codes, error shapes)
// closely enough to exercise the frontend's real request/response
// handling without needing the actual backend running.
// ============================================================

const API = 'http://localhost:8080'

interface FakeMember {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string | null
  joinDate: string
}

interface FakePlan {
  id: number
  name: string
  durationDays: number
  price: number
  currency: string
  description: string | null
  active: boolean
}

interface FakeSubscription {
  id: number
  memberId: number
  memberFullName: string
  planId: number
  planName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
}

interface FakeStaff {
  id: number
  username: string
  email: string
  roleName: string
}

let members: FakeMember[] = [
  {
    id: 1,
    firstName: 'Maria',
    lastName: 'Antoniou',
    email: 'mariaant@mail.com',
    phoneNumber: '6971234567',
    dateOfBirth: '1994-05-14',
    joinDate: '2026-07-01',
  },
  {
    id: 2,
    firstName: 'Nikos',
    lastName: 'Stavrou',
    email: 'nikosst@mail.com',
    phoneNumber: '6987654321',
    dateOfBirth: '1990-02-20',
    joinDate: '2026-07-05',
  },
]

let plans: FakePlan[] = [
  { id: 1, name: 'Monthly', durationDays: 30, price: 25, currency: 'EUR', description: 'Standard monthly membership', active: true },
  { id: 2, name: 'Quarterly', durationDays: 90, price: 65, currency: 'EUR', description: '3-month membership', active: true },
  { id: 3, name: 'Annual', durationDays: 365, price: 220, currency: 'EUR', description: 'Best value', active: true },
]

let subscriptions: FakeSubscription[] = [
  {
    id: 1,
    memberId: 1,
    memberFullName: 'Maria Antoniou',
    planId: 1,
    planName: 'Monthly',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'ACTIVE',
  },
]

let staffUsers: FakeStaff[] = [
  { id: 1, username: 'admin', email: 'admin@ironforge.local', roleName: 'ADMIN' },
  { id: 2, username: 'trainer1', email: 'trainer1@ironforge.local', roleName: 'TRAINER' },
]

let nextMemberId = 3
let nextSubscriptionId = 2
let nextPlanId = 4
let nextStaffId = 3

/** Test hook: restore fixtures to their initial state between tests. */
export function resetFakeDb() {
  members = [
    {
      id: 1,
      firstName: 'Maria',
      lastName: 'Antoniou',
      email: 'mariaant@mail.com',
      phoneNumber: '6971234567',
      dateOfBirth: '1994-05-14',
      joinDate: '2026-07-01',
    },
    {
      id: 2,
      firstName: 'Nikos',
      lastName: 'Stavrou',
      email: 'nikosst@mail.com',
      phoneNumber: '6987654321',
      dateOfBirth: '1990-02-20',
      joinDate: '2026-07-05',
    },
  ]
  plans = [
    { id: 1, name: 'Monthly', durationDays: 30, price: 25, currency: 'EUR', description: 'Standard monthly membership', active: true },
    { id: 2, name: 'Quarterly', durationDays: 90, price: 65, currency: 'EUR', description: '3-month membership', active: true },
    { id: 3, name: 'Annual', durationDays: 365, price: 220, currency: 'EUR', description: 'Best value', active: true },
  ]
  subscriptions = [
    {
      id: 1,
      memberId: 1,
      memberFullName: 'Maria Antoniou',
      planId: 1,
      planName: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      status: 'ACTIVE',
    },
  ]
  staffUsers = [
    { id: 1, username: 'admin', email: 'admin@ironforge.local', roleName: 'ADMIN' },
    { id: 2, username: 'trainer1', email: 'trainer1@ironforge.local', roleName: 'TRAINER' },
  ]
  nextMemberId = 3
  nextSubscriptionId = 2
  nextPlanId = 4
  nextStaffId = 3
}

function page<T>(content: T[], pageNum: number, size: number) {
  const start = pageNum * size
  return {
    content: content.slice(start, start + size),
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
    number: pageNum,
    size,
  }
}

export const handlers = [
  // ---- Auth ----
  http.post(`${API}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string }
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({ token: 'fake-admin-jwt', username: 'admin', role: 'ADMIN' })
    }
    if (body.username === 'trainer1' && body.password === 'trainer123') {
      return HttpResponse.json({ token: 'fake-trainer-jwt', username: 'trainer1', role: 'TRAINER' })
    }
    return HttpResponse.json({ code: 'Unauthorized', message: 'Invalid username or password' }, { status: 401 })
  }),

  // ---- Members ----
  http.get(`${API}/api/members`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const pageNum = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    let result = members
    if (search) {
      result = members.filter((m) => m.firstName.toLowerCase().includes(search) || m.lastName.toLowerCase().includes(search))
    }
    return HttpResponse.json(page(result, pageNum, size))
  }),

  http.get(`${API}/api/members/:id`, ({ params }) => {
    const member = members.find((m) => m.id === Number(params.id))
    if (!member) return HttpResponse.json({ code: 'NotFound', message: 'Member not found' }, { status: 404 })
    return HttpResponse.json(member)
  }),

  http.post(`${API}/api/members`, async ({ request }) => {
    const body = (await request.json()) as Omit<FakeMember, 'id' | 'joinDate'>
    if (!body.firstName || !body.lastName) {
      return HttpResponse.json(
        { code: 'ValidationError', message: 'Request validation failed', fieldErrors: { firstName: 'must not be blank' } },
        { status: 400 },
      )
    }
    const created: FakeMember = { ...body, id: nextMemberId++, joinDate: '2026-08-05' }
    members.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API}/api/members/:id`, async ({ params, request }) => {
    const idx = members.findIndex((m) => m.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 'NotFound', message: 'Member not found' }, { status: 404 })
    const body = (await request.json()) as Omit<FakeMember, 'id' | 'joinDate'>
    members[idx] = { ...members[idx], ...body }
    return HttpResponse.json(members[idx])
  }),

  http.delete(`${API}/api/members/:id`, ({ params }) => {
    members = members.filter((m) => m.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // ---- Subscriptions ----
  http.get(`${API}/api/subscriptions`, ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 100)
    return HttpResponse.json(page(subscriptions, pageNum, size))
  }),

  http.get(`${API}/api/subscriptions/member/:memberId`, ({ params }) => {
    const result = subscriptions.filter((s) => s.memberId === Number(params.memberId))
    return HttpResponse.json(result)
  }),

  http.post(`${API}/api/subscriptions`, async ({ request }) => {
    const body = (await request.json()) as { memberId: number; planId: number; paymentMethod: string }
    const member = members.find((m) => m.id === body.memberId)
    const plan = plans.find((p) => p.id === body.planId)
    if (!member) return HttpResponse.json({ code: 'NotFound', message: 'Member not found' }, { status: 404 })
    if (!plan) return HttpResponse.json({ code: 'NotFound', message: 'SubscriptionPlan not found' }, { status: 404 })

    // Mirrors the real backend rule: one active subscription per member at a time.
    const hasActive = subscriptions.some((s) => s.memberId === body.memberId && s.status === 'ACTIVE')
    if (hasActive) {
      return HttpResponse.json(
        { code: 'Conflict', message: 'Member already has an active subscription' },
        { status: 409 },
      )
    }

    const created: FakeSubscription = {
      id: nextSubscriptionId++,
      memberId: member.id,
      memberFullName: `${member.firstName} ${member.lastName}`,
      planId: plan.id,
      planName: plan.name,
      startDate: '2026-08-05',
      endDate: '2026-09-04',
      status: 'ACTIVE',
    }
    subscriptions.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  // ---- Subscription Plans ----
  http.get(`${API}/api/subscription-plans`, ({ request }) => {
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('activeOnly') === 'true'
    return HttpResponse.json(activeOnly ? plans.filter((p) => p.active) : plans)
  }),

  http.post(`${API}/api/subscription-plans`, async ({ request }) => {
    const body = (await request.json()) as Omit<FakePlan, 'id' | 'active'>
    const created: FakePlan = { ...body, id: nextPlanId++, active: true }
    plans.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API}/api/subscription-plans/:id`, async ({ params, request }) => {
    const idx = plans.findIndex((p) => p.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 'NotFound', message: 'Plan not found' }, { status: 404 })
    const body = (await request.json()) as Omit<FakePlan, 'id'>
    plans[idx] = { ...plans[idx], ...body }
    return HttpResponse.json(plans[idx])
  }),

  http.delete(`${API}/api/subscription-plans/:id`, ({ params }) => {
    const idx = plans.findIndex((p) => p.id === Number(params.id))
    if (idx !== -1) plans[idx].active = false
    return new HttpResponse(null, { status: 204 })
  }),

  // ---- Staff ----
  http.get(`${API}/api/staff`, ({ request }) => {
    const url = new URL(request.url)
    const pageNum = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 50)
    return HttpResponse.json(page(staffUsers, pageNum, size))
  }),

  http.post(`${API}/api/staff`, async ({ request }) => {
    const body = (await request.json()) as { username: string; email: string; roleName: string }
    if (staffUsers.some((s) => s.username === body.username)) {
      return HttpResponse.json({ code: 'Conflict', message: `Username ${body.username} is already taken` }, { status: 409 })
    }
    const created: FakeStaff = { id: nextStaffId++, username: body.username, email: body.email, roleName: body.roleName }
    staffUsers.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(`${API}/api/staff/:id`, async ({ params, request }) => {
    const idx = staffUsers.findIndex((s) => s.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ code: 'NotFound', message: 'Staff user not found' }, { status: 404 })
    const body = (await request.json()) as { email: string; roleName: string }
    staffUsers[idx] = { ...staffUsers[idx], ...body }
    return HttpResponse.json(staffUsers[idx])
  }),

  http.delete(`${API}/api/staff/:id`, ({ params }) => {
    staffUsers = staffUsers.filter((s) => s.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // ---- Payments ----
  http.get(`${API}/api/payments/member/:memberId`, ({ params }) => {
    const memberId = Number(params.memberId)
    const result = subscriptions
      .filter((s) => s.memberId === memberId)
      .map((s, i) => ({
        id: i + 1,
        subscriptionId: s.id,
        memberId,
        amount: plans.find((p) => p.id === s.planId)?.price ?? 0,
        currency: 'EUR',
        paymentDate: `${s.startDate}T10:00:00`,
        method: 'CARD',
        status: 'COMPLETED',
      }))
    return HttpResponse.json(result)
  }),

  // ---- Reports (async job pattern) ----
  http.post(`${API}/api/reports/revenue`, () => {
    return HttpResponse.json({ jobId: 'fake-job-1' })
  }),

  http.get(`${API}/api/reports/:jobId`, () => {
    // Resolves immediately in tests, no need to exercise the real polling delay.
    return HttpResponse.json({
      jobId: 'fake-job-1',
      status: 'DONE',
      result: { from: '2026-08-01', to: '2026-08-05', paymentCount: 1, totalRevenue: 25, currency: 'EUR' },
      error: null,
    })
  }),
]

export const server = setupServer(...handlers)
