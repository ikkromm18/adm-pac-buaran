<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LogOut,
  User,
  Shield,
  Key,
  Clock,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Server,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isRefreshing = ref(false)
const refreshSuccess = ref(false)
const tokenCopied = ref(false)

const gasApiUrl = import.meta.env.VITE_GAS_API_URL || ''
const gasDeploymentId = import.meta.env.VITE_GAS_DEPLOYMENT_ID || ''

async function handleRefreshSession() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  refreshSuccess.value = false

  try {
    if (authStore.token) {
      await authStore.initAuth()
      refreshSuccess.value = true
      setTimeout(() => {
        refreshSuccess.value = false
      }, 3000)
    }
  } catch (err) {
    console.error('Refresh session failed:', err)
  } finally {
    isRefreshing.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function copyToken() {
  if (!authStore.token) return
  navigator.clipboard.writeText(authStore.token)
  tokenCopied.value = true
  setTimeout(() => {
    tokenCopied.value = false
  }, 2000)
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Top Navigation Bar -->
    <header class="top-nav glass-panel">
      <div class="nav-content">
        <div class="brand-group">
          <div class="brand-badge-icon">
            <Shield :size="20" />
          </div>
          <div>
            <h2 class="nav-title">ADM PAC BUARAN</h2>
            <span class="nav-subtitle">Sistem Administrasi Terpadu</span>
          </div>
        </div>

        <div class="nav-actions">
          <RouterLink to="/kegiatan-internal" class="btn btn-primary btn-sm">
            <Calendar :size="16" />
            <span>Kegiatan Internal</span>
          </RouterLink>

          <RouterLink to="/api-docs" class="btn btn-secondary btn-sm">
            <BookOpen :size="16" />
            <span>Dokumentasi API</span>
          </RouterLink>

          <button
            class="btn btn-outline-danger btn-sm"
            @click="handleLogout"
            :disabled="authStore.loading"
          >
            <LogOut :size="16" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="dashboard-container">
      <!-- Welcome Hero Banner -->
      <section class="welcome-card glass-panel">
        <div class="welcome-info">
          <div class="avatar-box">
            <User :size="32" class="avatar-icon" />
          </div>
          <div class="user-details">
            <div class="user-name-row">
              <h1 class="user-full-name">{{ authStore.user?.full_name || authStore.user?.username || 'Administrator' }}</h1>
              <span class="badge badge-success">{{ authStore.user?.status || 'Active' }}</span>
              <span class="badge badge-info">{{ authStore.user?.role || 'Admin' }}</span>
            </div>
            <p class="user-email">{{ authStore.user?.email || 'email@example.com' }} &bull; User ID: <code>{{ authStore.user?.user_id }}</code></p>
          </div>
        </div>

        <div class="welcome-controls">
          <button
            class="btn btn-secondary btn-sm"
            @click="handleRefreshSession"
            :disabled="isRefreshing"
          >
            <RefreshCw :size="16" :class="{ 'spin-anim': isRefreshing }" />
            <span>{{ isRefreshing ? 'Memverifikasi...' : 'Verifikasi Sesi (me)' }}</span>
          </button>
          <span v-if="refreshSuccess" class="refresh-indicator">
            <CheckCircle2 :size="14" /> Sesi Valid
          </span>
        </div>
      </section>

      <!-- Grid 2 Columns: Session Info & Backend Architecture -->
      <div class="dashboard-grid">
        <!-- Session Info Card -->
        <div class="card glass-panel">
          <div class="card-header">
            <div class="card-title-row">
              <Key :size="18" class="card-icon" />
              <h3>Informasi Sesi Aktif</h3>
            </div>
            <span class="badge badge-success">24 Jam Valid</span>
          </div>

          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">Session ID</span>
              <span class="meta-value font-mono">{{ authStore.session?.session_id || 'SES-PENDING' }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Session Token</span>
              <div class="token-row">
                <span class="meta-value font-mono token-preview">
                  {{ authStore.token ? authStore.token.slice(0, 16) + '...' : 'Tidak ada token' }}
                </span>
                <button
                  v-if="authStore.token"
                  class="btn-copy"
                  @click="copyToken"
                  title="Salin Token"
                >
                  <Check v-if="tokenCopied" :size="14" />
                  <Copy v-else :size="14" />
                </button>
              </div>
            </div>

            <div class="meta-item">
              <span class="meta-label"><Clock :size="14" class="inline-icon" /> Waktu Login</span>
              <span class="meta-value">{{ authStore.session?.login_time || '-' }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label"><Clock :size="14" class="inline-icon" /> Terakhir Aktif</span>
              <span class="meta-value">{{ authStore.session?.last_activity || authStore.session?.login_time || '-' }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label"><Clock :size="14" class="inline-icon" /> Kedaluwarsa Pada</span>
              <span class="meta-value text-amber">{{ authStore.session?.expires_at || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Google Apps Script Backend Card -->
        <div class="card glass-panel">
          <div class="card-header">
            <div class="card-title-row">
              <Server :size="18" class="card-icon" />
              <h3>Backend Apps Script</h3>
            </div>
            <span class="badge badge-info">Connected</span>
          </div>

          <div class="meta-list">
            <div class="meta-item">
              <span class="meta-label">Deployment ID</span>
              <span class="meta-value font-mono">{{ gasDeploymentId || 'Belum diatur' }}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Endpoint Mode</span>
              <span class="meta-value">
                <span class="badge badge-warning">/dev (Development)</span>
              </span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Base URL</span>
              <a :href="gasApiUrl" target="_blank" rel="noopener noreferrer" class="gas-url-link">
                <span class="url-text">{{ gasApiUrl }}</span>
                <ExternalLink :size="14" />
              </a>
            </div>

            <div class="meta-item">
              <span class="meta-label">CORS Mitigation</span>
              <span class="meta-value text-green">text/plain;charset=utf-8 &bull; Redirect Follow</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Administration Modules Ready for Future API Actions -->
      <section class="modules-section">
        <div class="section-header">
          <h3>Modul Administrasi</h3>
          <p>Dipersiapkan untuk ekspansi endpoint Apps Script selanjutnya</p>
        </div>

        <div class="modules-grid">
          <div class="module-card glass-panel">
            <div class="module-icon-box">
              <FileText :size="24" />
            </div>
            <h4>Surat & Kearsipan</h4>
            <p>Kelola surat masuk, surat keluar, dan penomoran resmi surat PAC Buaran.</p>
            <span class="badge badge-info">Fase Berikutnya</span>
          </div>

          <div class="module-card glass-panel">
            <div class="module-icon-box">
              <Users :size="24" />
            </div>
            <h4>Data Pengurus & Anggota</h4>
            <p>Database keanggotaan terintegrasi dengan Google Sheets sheet <code>users</code>.</p>
            <span class="badge badge-info">Fase Berikutnya</span>
          </div>

          <div class="module-card glass-panel">
            <div class="module-icon-box">
              <DollarSign :size="24" />
            </div>
            <h4>Keuangan & Kas</h4>
            <p>Laporan penerimaan, pengeluaran kas, serta transparansi keuangan organisasi.</p>
            <span class="badge badge-info">Fase Berikutnya</span>
          </div>

          <RouterLink to="/kegiatan-internal" class="module-card glass-panel module-card-active">
            <div class="module-icon-box active-emerald">
              <Calendar :size="24" />
            </div>
            <h4>Kegiatan Internal</h4>
            <p>Kelola seluruh agenda rapat, formatur, pleno, dan kegiatan PAC Buaran (Sheet: <code>kegiatan-internal</code>).</p>
            <div class="module-card-footer">
              <span class="badge badge-success">Aktif (CRUD Siap)</span>
              <ArrowRight :size="16" class="arrow-icon" />
            </div>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: var(--bg-main);
  background-image: radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.04) 0%, transparent 40%);
  display: flex;
  flex-direction: column;
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(11, 17, 32, 0.85);
  backdrop-filter: blur(16px);
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.brand-badge-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--primary-400);
}

.nav-title {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text-main);
}

.nav-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.45rem 0.85rem;
  font-size: 0.825rem;
}

.dashboard-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.welcome-card {
  padding: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(16, 185, 129, 0.08) 100%);
}

.welcome-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.avatar-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid var(--primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-400);
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.user-full-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.welcome-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.refresh-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--primary-400);
  font-size: 0.825rem;
  font-weight: 600;
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.card-icon {
  color: var(--primary-400);
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
}

.meta-label {
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.meta-value {
  color: var(--text-main);
  text-align: right;
  word-break: break-all;
}

.font-mono {
  font-family: var(--font-mono);
}

.token-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-preview {
  background: rgba(30, 41, 59, 0.6);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.btn-copy {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.btn-copy:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.15);
}

.text-amber {
  color: var(--accent-amber);
}

.text-green {
  color: var(--primary-400);
}

.gas-url-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 250px;
}

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modules-section {
  margin-top: 1rem;
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-header h3 {
  font-size: 1.25rem;
}

.section-header p {
  font-size: 0.875rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.module-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.3);
}

.module-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--primary-400);
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-card h4 {
  font-size: 1.1rem;
}

.module-card p {
  font-size: 0.85rem;
  line-height: 1.5;
  flex-grow: 1;
}

.module-card-active {
  cursor: pointer;
  border-color: rgba(16, 185, 129, 0.35);
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(16, 185, 129, 0.08) 100%);
}

.module-card-active:hover {
  transform: translateY(-3px);
  border-color: var(--primary-500);
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.2);
}

.active-emerald {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.module-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.arrow-icon {
  color: var(--primary-400);
  transition: transform 0.2s ease;
}

.module-card-active:hover .arrow-icon {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
