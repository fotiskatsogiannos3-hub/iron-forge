import { apiClient } from './client'
import type { ReportJobStatusDTO, RevenueReport } from '@/types'

export const reportsApi = {
  startRevenueReport: async (from: string, to: string): Promise<string> => {
    const { data } = await apiClient.post<{ jobId: string }>('/api/reports/revenue', null, {
      params: { from, to },
    })
    return data.jobId
  },

  getJobStatus: async (jobId: string): Promise<ReportJobStatusDTO> => {
    const { data } = await apiClient.get<ReportJobStatusDTO>(`/api/reports/${jobId}`)
    return data
  },
}

/**
 * Starts a revenue report job and polls until it's DONE or FAILED.
 * Mirrors the backend's async job pattern: kick off the job, then poll
 * instead of blocking on a single long request.
 */
export async function fetchRevenueReport(
  from: string,
  to: string,
  { intervalMs = 500, timeoutMs = 15000 }: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<RevenueReport> {
  const jobId = await reportsApi.startRevenueReport(from, to)
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const status = await reportsApi.getJobStatus(jobId)
    if (status.status === 'DONE' && status.result) {
      return status.result
    }
    if (status.status === 'FAILED') {
      throw new Error(status.error ?? 'Revenue report failed')
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Revenue report timed out')
}
