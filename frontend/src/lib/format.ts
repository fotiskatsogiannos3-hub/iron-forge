/** Formats an ISO date (yyyy-MM-dd) as DD/MM/YYYY. */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('T')[0].split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

/** Formats an ISO datetime as DD/MM/YY, matching the compact list-view style. */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('T')[0].split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year.slice(2)}`
}

export function formatMoney(amount: number | null | undefined, currency = 'EUR'): string {
  if (amount == null) return '—'
  const symbol = currency === 'EUR' ? '€' : `${currency} `
  return `${symbol}${amount.toFixed(2)}`
}

/** Today's date as an ISO yyyy-MM-dd string, in the browser's local timezone. */
export function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Adds N days to an ISO yyyy-MM-dd date and returns the result, also ISO. */
export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** First day of the current month, ISO yyyy-MM-dd. */
export function startOfMonthIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/** Long month-day-year label for the dashboard header, e.g. "July 30 2026". */
export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
