import { apiClient } from './client'
import type { MemberInsert, MemberReadOnly, MemberUpdate, Page } from '@/types'

export const membersApi = {
  list: async (params?: { search?: string; page?: number; size?: number; sort?: string }): Promise<Page<MemberReadOnly>> => {
    const { data } = await apiClient.get<Page<MemberReadOnly>>('/api/members', {
      params: {
        search: params?.search || undefined,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort,
      },
    })
    return data
  },

  get: async (id: number): Promise<MemberReadOnly> => {
    const { data } = await apiClient.get<MemberReadOnly>(`/api/members/${id}`)
    return data
  },

  create: async (payload: MemberInsert): Promise<MemberReadOnly> => {
    const { data } = await apiClient.post<MemberReadOnly>('/api/members', payload)
    return data
  },

  update: async (id: number, payload: MemberUpdate): Promise<MemberReadOnly> => {
    const { data } = await apiClient.put<MemberReadOnly>(`/api/members/${id}`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/members/${id}`)
  },
}
