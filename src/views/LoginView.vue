<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const showPassword = ref(false)
const localError = ref<string | null>(null)

function quickFill(user: string, pass: string) {
  form.username = user
  form.password = pass
  localError.value = null
}

async function handleLogin() {
  localError.value = null

  if (!form.username.trim() || !form.password) {
    localError.value = 'Silakan isi username dan password Anda.'
    return
  }

  try {
    await authStore.login({
      username: form.username.trim(),
      password: form.password,
    })

    const redirectPath = (route.query.redirect as string) || '/dashboard'
    router.push(redirectPath)
  } catch (err: unknown) {
    if (err instanceof Error) {
      localError.value = err.message
    } else {
      localError.value = 'Gagal melakukan login. Periksa koneksi atau kredensial Anda.'
    }
  }
}
</script>

<template>
  <div class="login-wrapper">
    <!-- Ambient glowing backdrop effect -->
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <div class="login-card glass-panel">
      <!-- Header Branding -->
      <div class="brand-header">
        <div class="brand-logo-icon">
          <ShieldCheck :size="32" class="icon-brand" />
        </div>
        <h1 class="brand-title">ADM PAC BUARAN</h1>
        <p class="brand-subtitle">Portal Administrasi Terpadu</p>
      </div>

      <!-- Error Notification -->
      <div v-if="localError || authStore.error" class="alert alert-danger">
        <AlertCircle :size="18" class="flex-shrink-0" />
        <span>{{ localError || authStore.error }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <div class="input-with-icon">
            <User :size="18" class="input-icon" />
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input with-icon"
              placeholder="Masukkan username Anda"
              autocomplete="username"
              :disabled="authStore.loading"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label class="form-label" for="password">Password</label>
          </div>
          <div class="input-with-icon">
            <Lock :size="18" class="input-icon" />
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input with-icon with-action"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="authStore.loading"
              required
            />
            <button
              type="button"
              class="btn-icon-action"
              @click="showPassword = !showPassword"
              title="Toggle password"
            >
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block submit-btn"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner"></span>
          <span v-else class="btn-text-content">
            Masuk ke Sistem
            <ArrowRight :size="18" />
          </span>
        </button>
      </form>

      <!-- Demo Credentials Helper -->
      <div class="credentials-helper">
        <div class="helper-header">
          <span>Kredensial Default (Backend GAS):</span>
        </div>
        <div class="helper-content">
          <code>ikrom.admin</code> / <code>admin123</code>
          <button
            type="button"
            class="btn-quick-fill"
            @click="quickFill('ikrom.admin', 'admin123')"
          >
            Gunakan
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="card-footer">
        <RouterLink to="/api-docs" class="footer-link">
          <BookOpen :size="15" />
          <span>Lihat Dokumentasi API GAS</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: hidden;
  background: radial-gradient(circle at 50% 20%, #132238 0%, #0b1120 70%);
}

.ambient-glow {
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.15;
}

.glow-1 {
  top: -100px;
  left: 20%;
  background: #10b981;
}

.glow-2 {
  bottom: -100px;
  right: 20%;
  background: #047857;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem 2.25rem;
  z-index: 10;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1);
}

.brand-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glow);
}

.icon-brand {
  color: var(--primary-400);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-dim);
  pointer-events: none;
}

.form-input.with-icon {
  padding-left: 2.75rem;
}

.form-input.with-action {
  padding-right: 2.75rem;
}

.btn-icon-action {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-dim);
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-icon-action:hover {
  color: var(--text-main);
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.875rem;
  font-size: 1rem;
}

.btn-text-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.credentials-helper {
  margin-top: 1.5rem;
  padding: 0.85rem 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
}

.helper-header {
  color: var(--text-dim);
  margin-bottom: 0.4rem;
}

.helper-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.helper-content code {
  color: var(--primary-300);
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.btn-quick-fill {
  background: rgba(16, 185, 129, 0.15);
  color: var(--primary-400);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-quick-fill:hover {
  background: rgba(16, 185, 129, 0.25);
  color: var(--text-main);
}

.card-footer {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle);
  text-align: center;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.825rem;
  color: var(--text-dim);
}

.footer-link:hover {
  color: var(--primary-400);
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
