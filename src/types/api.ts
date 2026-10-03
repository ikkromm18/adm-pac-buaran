/**
 * Standar format respon API Google Apps Script
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}

export interface ApiErrorResponse {
  success: false
  message: string
  statusCode: number
  data: null
}

export type HttpMethod = 'GET' | 'POST'

export interface RequestConfig {
  action: string
  method?: HttpMethod
  params?: Record<string, string | number | boolean>
  body?: Record<string, unknown>
  timeoutMs?: number
}
