import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { GasApiError } from '@/services/gasClient'
import type { User } from '@/types/user'
import type { LoginPayload, SessionData } from '@/types/auth'

const TOKEN_STORAGE_KEY = 'adm_pac_buaran_session_token'
const USER_STORAGE_KEY = 'adm_pac_buaran_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<SessionData | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isInitialized = ref<boolean>(false)

  // Try hydration from localStorage cache if available for fast initial paint
  const cachedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (cachedUser && token.value) {
    try {
      user.value = JSON.parse(cachedUser)
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  const previewRoleOverride = ref<string | null>(localStorage.getItem('adm_pac_role_preview'))

  function setPreviewRole(role: string | null) {
    previewRoleOverride.value = role
    if (role) {
      localStorage.setItem('adm_pac_role_preview', role)
    } else {
      localStorage.removeItem('adm_pac_role_preview')
    }
  }

  const effectiveRole = computed(() => {
    if (previewRoleOverride.value) return previewRoleOverride.value
    return user.value?.role || 'admin'
  })

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => effectiveRole.value)
  const isSuperAdmin = computed(() => {
    const role = (effectiveRole.value || '').toLowerCase().trim()
    return role === 'superadmin' || role === 'super_admin'
  })
  const userFullName = computed(() => user.value?.full_name || user.value?.username || 'Pengguna')

  /**
   * Login action
   */
  async function login(credentials: LoginPayload): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      const data = response.data

      user.value = data.user
      session.value = data.session
      token.value = data.session.session_token || null

      if (token.value) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token.value)
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
    } catch (err: unknown) {
      if (err instanceof GasApiError) {
        error.value = err.message
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Terjadi kesalahan saat login.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validasi session saat aplikasi pertama kali dimuat
   */
  async function initAuth(): Promise<void> {
    if (isInitialized.value) return

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      isInitialized.value = true
      return
    }

    loading.value = true
    try {
      const response = await authService.getCurrentUser(storedToken)
      user.value = response.data.user
      session.value = response.data.session
      token.value = storedToken
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user))
    } catch (err) {
      console.warn('[Auth] Session telah kedaluwarsa atau tidak valid:', err)
      // Session expired / invalid, bersihkan storage
      clearAuthData()
    } finally {
      loading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Logout action
   */
  async function logout(): Promise<void> {
    const currentToken = token.value

    loading.value = true
    try {
      if (currentToken) {
        await authService.logout(currentToken)
      }
    } catch (err) {
      console.warn('[Auth] Logout warning:', err)
    } finally {
      clearAuthData()
      loading.value = false
    }
  }

  function clearAuthData() {
    user.value = null
    session.value = null
    token.value = null
    error.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  return {
    user,
    session,
    token,
    loading,
    error,
    isInitialized,
    isAuthenticated,
    userRole,
    isSuperAdmin,
    previewRoleOverride,
    setPreviewRole,
    userFullName,
    login,
    logout,
    initAuth,
    clearAuthData,
  }
})
