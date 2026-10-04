import type { ApiResponse, RequestConfig } from '@/types/api'

/**
 * Base URL Google Apps Script Web App
 */
const BASE_URL: string = import.meta.env.VITE_GAS_API_URL || ''
const DEPLOYMENT_ID: string = import.meta.env.VITE_GAS_DEPLOYMENT_ID || ''

if (!BASE_URL) {
  console.warn(
    '[GAS Client] VITE_GAS_API_URL belum terpasang di file .env. Pastikan konfigurasi env sudah sesuai.'
  )
}

/**
 * Custom Error Class untuk Google Apps Script API
 */
export class GasApiError extends Error {
  statusCode: number
  rawResponse?: unknown

  constructor(message: string, statusCode: number = 400, rawResponse?: unknown) {
    super(message)
    this.name = 'GasApiError'
    this.statusCode = statusCode
    this.rawResponse = rawResponse
  }
}

/**
 * Core HTTP Request Wrapper untuk Google Apps Script
 *
 * MENGAPA TEXT/PLAIN?
 * Google Apps Script Web App TIDAK menangani HTTP OPTIONS preflight request.
 * Jika browser mengirim 'Content-Type: application/json', browser akan memicu preflight CORS
 * yang akan gagal. Dengan menggunakan 'text/plain;charset=utf-8', browser tidak akan mengirim
 * preflight request, sementara e.postData.contents di Apps Script tetap menerima raw string JSON
 * yang diparse dengan JSON.parse().
 */
export async function gasRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  if (!BASE_URL) {
    throw new GasApiError('URL API Google Apps Script belum dikonfigurasi di .env', 500)
  }

  const { action, method = 'POST', params = {}, body = {}, timeoutMs = 30000 } = config

  // Ambil session token aktif dari storage jika ada
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('adm_pac_buaran_session_token')
      : null

  // Buat query parameters
  const queryParams = new URLSearchParams()
  queryParams.set('action', action)

  for (const [key, val] of Object.entries(params)) {
    queryParams.set(key, String(val))
  }

  // Jika method GET dan ada token, lampirkan ke query params (kecuali action login)
  if (method === 'GET' && token && !queryParams.has('session_token') && action !== 'login') {
    queryParams.set('session_token', token)
  }

  const url = `${BASE_URL}?${queryParams.toString()}`

  // AbortController untuk timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const fetchOptions: RequestInit = {
      method,
      redirect: 'follow',
      signal: controller.signal,
    }

    if (method === 'POST') {
      // Wajib text/plain untuk bypass CORS preflight di Google Apps Script
      fetchOptions.headers = {
        'Content-Type': 'text/plain;charset=utf-8',
      }

      // Otomatis lampirkan session_token dari storage jika tersedia dan belum ada di body (kecuali aksi login)
      const payload: Record<string, unknown> = { ...body }
      if (token && !payload.session_token && action !== 'login') {
        payload.session_token = token
      }

      fetchOptions.body = JSON.stringify(payload)
    }

    const response = await fetch(url, fetchOptions)

    clearTimeout(timeoutId)

    if (!response.ok && response.status !== 302) {
      throw new GasApiError(
        `Koneksi server gagal dengan status HTTP ${response.status}`,
        response.status
      )
    }

    const responseText = await response.text()
    let data: ApiResponse<T>

    try {
      data = JSON.parse(responseText)
    } catch {
      throw new GasApiError(
        'Format respons dari server tidak valid (bukan JSON). Pastikan deployment GAS sudah benar.',
        502,
        responseText
      )
    }

    if (!data.success) {
      throw new GasApiError(data.message || 'Terjadi kesalahan pada request.', data.statusCode || 400, data)
    }

    return data
  } catch (error: unknown) {
    clearTimeout(timeoutId)

    if (error instanceof GasApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GasApiError('Request timeout: Server Google Apps Script memakan waktu terlalu lama.', 408)
    }

    let errorMessage = error instanceof Error ? error.message : 'Terjadi kegagalan jaringan.'

    // Deteksi jika menggunakan URL /dev yang memicu 401 / CORS block oleh Google
    if (BASE_URL.includes('/dev') || errorMessage.toLowerCase().includes('failed to fetch')) {
      errorMessage =
        'Gagal mengakses Google Apps Script (401 / CORS Blocked). URL /dev tidak mengizinkan akses anonim/eksternal. Silakan buat "New Deployment" di Apps Script dengan "Who has access: Anyone", lalu gunakan URL berakhiran "/exec".'
    }

    throw new GasApiError(errorMessage, 401, error)
  }
}

export { BASE_URL, DEPLOYMENT_ID }
