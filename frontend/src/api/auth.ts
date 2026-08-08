import { apiClient } from './client'
import type { LoginRequest, LoginResponse } from '@/types'

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload)
    return data
  },
}
