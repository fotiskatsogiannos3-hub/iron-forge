// ============================================================
// Types mirror the backend DTOs field-for-field
// (com.ironforge.backend.dto.*). Keep in sync with the backend
// if those records change.
// ============================================================

export type Role = 'ADMIN' | 'TRAINER'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: Role
}

// ---- Members ----

export interface MemberReadOnly {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string | null // ISO date
  joinDate: string // ISO date
}

export interface MemberInsert {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string | null
}

export type MemberUpdate = MemberInsert

// ---- Subscription Plans ----

export interface SubscriptionPlanReadOnly {
  id: number
  name: string
  durationDays: number
  price: number
  currency: string
  description: string | null
  active: boolean
}

export interface SubscriptionPlanInsert {
  name: string
  durationDays: number
  price: number
  currency: string
  description: string
}

export interface SubscriptionPlanUpdate extends SubscriptionPlanInsert {
  active: boolean
}

// ---- Subscriptions ----

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface SubscriptionReadOnly {
  id: number
  memberId: number
  memberFullName: string
  planId: number
  planName: string
  startDate: string
  endDate: string
  status: SubscriptionStatus
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER'

export interface SubscriptionInsert {
  memberId: number
  planId: number
  paymentMethod: PaymentMethod
}

// ---- Payments ----

export type PaymentStatus = 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface PaymentReadOnly {
  id: number
  subscriptionId: number
  memberId: number
  amount: number
  currency: string
  paymentDate: string // ISO datetime
  method: PaymentMethod
  status: PaymentStatus
}

// ---- Staff / Roles ----

export interface StaffUserReadOnly {
  id: number
  username: string
  email: string
  roleName: string
}

export interface StaffUserInsert {
  username: string
  email: string
  password: string
  roleName: string
}

export interface StaffUserUpdate {
  email: string
  roleName: string
}

// ---- Reports ----

export interface RevenueReport {
  from: string
  to: string
  paymentCount: number
  totalRevenue: number
  currency: string
}

export type ReportJobStatus = 'PENDING' | 'DONE' | 'FAILED'

export interface ReportJobStatusDTO {
  jobId: string
  status: ReportJobStatus
  result: RevenueReport | null
  error: string | null
}

// ---- Spring Data Page wrapper ----

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ---- API error shapes ----

export interface ApiErrorResponse {
  code: string
  message: string
}

export interface ApiValidationErrorResponse extends ApiErrorResponse {
  fieldErrors: Record<string, string>
}
