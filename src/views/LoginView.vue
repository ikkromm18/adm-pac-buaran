<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-vue-next'
import logoPacBuaran from '@/assets/logopacbuaran.webp'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const showPassword = ref(false)
const localError = ref<string | null>(null)

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
    <div class="ambient-shape shape-1"></div>
    <div class="ambient-shape shape-2"></div>

    <div class="login-card white-card">
      <!-- Header Branding -->
      <div class="brand-header">
        <div class="brand-logo-container">
          <img :src="logoPacBuaran" alt="Logo PAC Buaran" class="brand-logo-img" />
        </div>
        <h1 class="brand-title">PAC BUARAN</h1>
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
              title="Lihat password"
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
  background-color: var(--bg-canvas);
}

.ambient-shape {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.5;
}

.shape-1 {
  top: -120px;
  left: 10%;
  background: var(--pastel-teal-bg);
}

.shape-2 {
  bottom: -120px;
  right: 15%;
  background: var(--pastel-lime-bg);
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 2.75rem 2.25rem;
  z-index: 10;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px -10px rgba(9, 44, 43, 0.08);
}

.brand-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-logo-container {
  width: 76px;
  height: 76px;
  margin: 0 auto 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 8px 22px rgba(9, 44, 43, 0.12);
  border: 2px solid var(--border-soft);
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.brand-title {
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--primary-dark);
  margin-bottom: 0.25rem;
}

.brand-subtitle {
  font-size: 0.85rem;
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
}

.btn-icon-action:hover {
  color: var(--text-main);
}

.submit-btn {
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.85rem;
  font-size: 0.95rem;
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
  background: #f8fbfa;
  border: 1px dashed rgba(9, 44, 43, 0.15);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
}

.helper-header {
  color: var(--text-dim);
  margin-bottom: 0.35rem;
}

.helper-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.helper-content code {
  color: var(--primary-accent);
  background: #e6f4f2;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.btn-quick-fill {
  background: var(--primary-dark);
  color: #ffffff;
  border: none;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-quick-fill:hover {
  background: var(--primary-dark-hover);
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style>
