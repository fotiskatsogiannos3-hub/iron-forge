import { apiClient } from './client'
import type { Page, StaffUserInsert, StaffUserReadOnly, StaffUserUpdate } from '@/types'

export const staffApi = {
  list: async (params?: { page?: number; size?: number }): Promise<Page<StaffUserReadOnly>> => {
    const { data } = await apiClient.get<Page<StaffUserReadOnly>>('/api/staff', {
      params: { page: params?.page ?? 0, size: params?.size ?? 50 },
    })
    return data
  },

  create: async (payload: StaffUserInsert): Promise<StaffUserReadOnly> => {
    const { data } = await apiClient.post<StaffUserReadOnly>('/api/staff', payload)
    return data
  },

  update: async (id: number, payload: StaffUserUpdate): Promise<StaffUserReadOnly> => {
    const { data } = await apiClient.put<StaffUserReadOnly>(`/api/staff/${id}`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/staff/${id}`)
  },
}
