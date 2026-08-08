import { apiClient } from './client'
import type { SubscriptionPlanInsert, SubscriptionPlanReadOnly, SubscriptionPlanUpdate } from '@/types'

export const subscriptionPlansApi = {
  list: async (activeOnly = false): Promise<SubscriptionPlanReadOnly[]> => {
    const { data } = await apiClient.get<SubscriptionPlanReadOnly[]>('/api/subscription-plans', {
      params: { activeOnly },
    })
    return data
  },

  get: async (id: number): Promise<SubscriptionPlanReadOnly> => {
    const { data } = await apiClient.get<SubscriptionPlanReadOnly>(`/api/subscription-plans/${id}`)
    return data
  },

  create: async (payload: SubscriptionPlanInsert): Promise<SubscriptionPlanReadOnly> => {
    const { data } = await apiClient.post<SubscriptionPlanReadOnly>('/api/subscription-plans', payload)
    return data
  },

  update: async (id: number, payload: SubscriptionPlanUpdate): Promise<SubscriptionPlanReadOnly> => {
    const { data } = await apiClient.put<SubscriptionPlanReadOnly>(`/api/subscription-plans/${id}`, payload)
    return data
  },

  retire: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/subscription-plans/${id}`)
  },
}
