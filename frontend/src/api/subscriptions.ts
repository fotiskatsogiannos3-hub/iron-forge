import { apiClient } from './client'
import type { Page, SubscriptionInsert, SubscriptionReadOnly } from '@/types'

export const subscriptionsApi = {
  list: async (params?: { page?: number; size?: number; sort?: string }): Promise<Page<SubscriptionReadOnly>> => {
    const { data } = await apiClient.get<Page<SubscriptionReadOnly>>('/api/subscriptions', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 100, // no server-side search/filter exists yet, see README
        sort: params?.sort,
      },
    })
    return data
  },

  listForMember: async (memberId: number): Promise<SubscriptionReadOnly[]> => {
    const { data } = await apiClient.get<SubscriptionReadOnly[]>(`/api/subscriptions/member/${memberId}`)
    return data
  },

  create: async (payload: SubscriptionInsert): Promise<SubscriptionReadOnly> => {
    const { data } = await apiClient.post<SubscriptionReadOnly>('/api/subscriptions', payload)
    return data
  },
}
