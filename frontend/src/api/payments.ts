import { apiClient } from './client'
import type { PaymentReadOnly } from '@/types'

export const paymentsApi = {
  listForMember: async (memberId: number): Promise<PaymentReadOnly[]> => {
    const { data } = await apiClient.get<PaymentReadOnly[]>(`/api/payments/member/${memberId}`)
    return data
  },
}
