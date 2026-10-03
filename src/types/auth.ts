import type { User } from './user'

export interface LoginPayload {
  username: string
  password: string
  user_agent?: string
}

export interface SessionData {
  session_id: string
  session_token?: string
  login_time: string
  last_activity?: string
  expires_at: string
  status?: string
}

export interface LoginResponseData {
  user: User
  session: SessionData
}

export interface MePayload {
  session_token: string
}

export interface LogoutPayload {
  session_token: string
}

export interface AuthState {
  user: User | null
  session: SessionData | null
  token: string | null
  loading: boolean
  error: string | null
  isInitialized: boolean
}
