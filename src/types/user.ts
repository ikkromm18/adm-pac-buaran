export type UserRole = 'admin' | 'pengurus' | 'anggota' | string

export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | string

export interface User {
  user_id: string
  username: string
  email: string
  full_name: string
  role: UserRole
  status: UserStatus
  last_login?: string
  created_at?: string
  updated_at?: string
}
