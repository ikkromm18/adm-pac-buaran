import { gasRequest } from './gasClient'
import type { ApiResponse } from '@/types/api'
import type {
  LoginPayload,
  LoginResponseData,
  LogoutPayload,
  MePayload,
} from '@/types/auth'

/**
 * Service untuk operasi Autentikasi Google Apps Script API
 */
export const authService = {
  /**
   * Login user dengan username dan password
   */
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const userAgent = payload.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Vue-Client')

    return gasRequest<LoginResponseData>({
      action: 'login',
      method: 'POST',
      body: {
        username: payload.username,
        password: payload.password,
        user_agent: userAgent,
      },
    })
  },

  /**
   * Cek validitas session dan ambil data user terbaru
   */
  async getCurrentUser(sessionToken: string): Promise<ApiResponse<LoginResponseData>> {
    const payload: MePayload = { session_token: sessionToken }

    return gasRequest<LoginResponseData>({
      action: 'me',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Logout user dan batalkan session di sheet backend
   */
  async logout(sessionToken: string): Promise<ApiResponse<null>> {
    const payload: LogoutPayload = { session_token: sessionToken }

    return gasRequest<null>({
      action: 'logout',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },
}
