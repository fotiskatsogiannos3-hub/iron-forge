import axios, { type AxiosError } from 'axios'
import type { ApiErrorResponse, ApiValidationErrorResponse } from '@/types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const TOKEN_KEY = 'ironforge_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Fires when the backend rejects the token (expired/invalid) so the app can
// drop back to the login screen instead of showing a broken authenticated view.
let onUnauthorized: (() => void) | null = null
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

/** Narrows an axios error into a readable message using the backend's ErrorResponse shape. */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined
    if (data?.message) return data.message
  }
  return fallback
}

/**
 * True when the request never got a response at all: the backend is unreachable,
 * down, or the request was blocked by CORS. Distinguishing this from a real 401
 * matters most on the login screen: "wrong password" and "can't reach the server"
 * need very different messages, or the person ends up retyping a correct password
 * forever.
 */
export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response
}

/** Narrows an axios error into field-level validation errors, if present. */
export function extractFieldErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiValidationErrorResponse | undefined
    if (data?.fieldErrors) return data.fieldErrors
  }
  return null
}
