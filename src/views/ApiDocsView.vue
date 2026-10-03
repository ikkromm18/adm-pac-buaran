<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  BookOpen,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-vue-next'

const router = useRouter()
const copiedIndex = ref<string | null>(null)

const gasApiUrl = import.meta.env.VITE_GAS_API_URL || 'https://script.google.com/macros/s/.../dev'
const gasDeploymentId = import.meta.env.VITE_GAS_DEPLOYMENT_ID || 'AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6'

function copyText(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedIndex.value = id
  setTimeout(() => {
    copiedIndex.value = null
  }, 2000)
}
</script>

<template>
  <div class="docs-page">
    <header class="top-nav glass-panel">
      <div class="nav-content">
        <button class="btn btn-secondary btn-sm" @click="router.back()">
          <ArrowLeft :size="16" />
          <span>Kembali</span>
        </button>
        <div class="header-title">
          <BookOpen :size="20" class="text-primary" />
          <h2>Dokumentasi API Google Apps Script</h2>
        </div>
        <div class="header-badge">
          <span class="badge badge-success">v1.0.0</span>
        </div>
      </div>
    </header>

    <main class="docs-container">
      <!-- Info Banner -->
      <section class="info-banner glass-panel">
        <div class="banner-icon">
          <Terminal :size="28" />
        </div>
        <div class="banner-body">
          <h3>Dokumentasi Teknis Backend Serverless</h3>
          <p>
            Dokumentasi ini disinkronkan dengan file <code>PRD.md</code> di root direktori project.
            Setiap ada penambahan router di <code>Code.gs</code> atau service di Apps Script,
            catat pembaruannya di <code>PRD.md</code> dan sesuaikan endpoint di bawah ini.
          </p>
          <div class="env-badges">
            <span class="badge badge-info">Base URL: {{ gasApiUrl }}</span>
            <span class="badge badge-warning">Deployment ID: {{ gasDeploymentId }}</span>
          </div>
        </div>
      </section>

      <!-- Senior Note on CORS -->
      <section class="alert alert-info">
        <AlertTriangle :size="20" class="flex-shrink-0" />
        <div>
          <strong>Aturan Wajib CORS di Google Apps Script:</strong>
          <p style="margin-top: 0.25rem;">
            Selalu kirim request <code>POST</code> dengan header <code>Content-Type: text/plain;charset=utf-8</code>.
            Jika menggunakan <code>application/json</code>, browser akan mengirim preflight <code>OPTIONS</code> yang tidak didukung oleh GAS dan memicu error CORS.
          </p>
        </div>
      </section>

      <!-- Endpoint 1: Login -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=login</code>
          </div>
          <span class="endpoint-desc">Autentikasi User & Pembuatan Sesi</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <button
                class="btn-code-copy"
                @click="copyText(JSON.stringify({ username: 'ikrom.admin', password: 'admin123', user_agent: 'Mozilla/5.0...' }, null, 2), 'login-req')"
              >
                <Check v-if="copiedIndex === 'login-req'" :size="14" />
                <Copy v-else :size="14" />
              </button>
              <pre><code>{
  "username": "ikrom.admin",
  "password": "admin123",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "user_id": "USR-001",
      "username": "ikrom.admin",
      "email": "ikrom@example.com",
      "full_name": "Muhammad Ikrom",
      "role": "admin",
      "status": "Active"
    },
    "session": {
      "session_id": "SES-20261004-984321",
      "session_token": "tok_e2b9c3f4a1...",
      "login_time": "2026-10-04 02:30:00",
      "expires_at": "2026-10-05 02:30:00"
    }
  }
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 2: Current User (me) -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=me</code>
          </div>
          <span class="endpoint-desc">Validasi Session Token & Update Aktivitas</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <button
                class="btn-code-copy"
                @click="copyText(JSON.stringify({ session_token: 'tok_xxxxx' }, null, 2), 'me-req')"
              >
                <Check v-if="copiedIndex === 'me-req'" :size="14" />
                <Copy v-else :size="14" />
              </button>
              <pre><code>{
  "session_token": "tok_e2b9c3f4a1..."
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Session valid.",
  "data": {
    "user": {
      "user_id": "USR-001",
      "username": "ikrom.admin",
      "email": "ikrom@example.com",
      "full_name": "Muhammad Ikrom",
      "role": "admin",
      "status": "Active"
    },
    "session": {
      "session_id": "SES-20261004-984321",
      "login_time": "2026-10-04 02:30:00",
      "last_activity": "2026-10-04 03:15:22",
      "expires_at": "2026-10-05 02:30:00"
    }
  }
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 3: Logout -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=logout</code>
          </div>
          <span class="endpoint-desc">Inaktivasi Sesi Pengguna</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "session_token": "tok_e2b9c3f4a1..."
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 4: Kegiatan Internal List -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST / GET</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_internal_list</code>
          </div>
          <span class="endpoint-desc">Ambil Semua Data Kegiatan Internal</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <pre><code>{} // Kosong atau tanpa parameter</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Data kegiatan internal berhasil diambil.",
  "data": [
    {
      "no": 1,
      "tanggal": "12/04/2026",
      "tempat": "Gedung NU Simbang Kulon",
      "nama_kegiatan": "Rapat Tim Formatur",
      "pelaksana": "Tim Formatur",
      "keterangan": "-",
      "jumlah_peserta": null
    }
  ]
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 5: Kegiatan Internal Create -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_internal_create</code>
          </div>
          <span class="endpoint-desc">Tambah Agenda Kegiatan Baru</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "tanggal": "15/08/2026",
  "tempat": "Kantor MWC NU Buaran",
  "nama_kegiatan": "Pendidikan Kader Pertama",
  "pelaksana": "Pengurus Harian",
  "keterangan": "Wajib diikuti calon kader",
  "jumlah_peserta": 45
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Kegiatan internal berhasil ditambahkan.",
  "data": {
    "no": 5,
    "tanggal": "15/08/2026",
    "tempat": "Kantor MWC NU Buaran",
    "nama_kegiatan": "Pendidikan Kader Pertama",
    "pelaksana": "Pengurus Harian",
    "keterangan": "Wajib diikuti calon kader",
    "jumlah_peserta": 45
  }
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 6: Kegiatan Internal Update & Delete -->
      <article class="endpoint-card glass-panel">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_internal_update &bull; ?action=kegiatan_internal_delete</code>
          </div>
          <span class="endpoint-desc">Ubah / Hapus Data Berdasarkan Kolom No</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Update Payload</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "no": 1,
  "tanggal": "12/04/2026",
  "tempat": "Gedung NU Simbang Kulon",
  "nama_kegiatan": "Rapat Tim Formatur (Revisi)",
  "pelaksana": "Tim Formatur",
  "keterangan": "Selesai dilaksanakan",
  "jumlah_peserta": 15
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Delete Payload</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "no": 1
}</code></pre>
            </div>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.docs-page {
  min-height: 100vh;
  background-color: var(--bg-main);
  padding-bottom: 3rem;
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
  background: rgba(11, 17, 32, 0.9);
  backdrop-filter: blur(16px);
}

.nav-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.header-title h2 {
  font-size: 1.15rem;
}

.text-primary {
  color: var(--primary-400);
}

.docs-container {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-banner {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  border-color: rgba(16, 185, 129, 0.2);
}

.banner-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-400);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-body h3 {
  font-size: 1.25rem;
  margin-bottom: 0.35rem;
}

.banner-body p {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.env-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.endpoint-card {
  padding: 1.75rem;
  border: 1px solid var(--border-subtle);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.method-tag {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.method-tag.post {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-blue);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.endpoint-path code {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--primary-300);
}

.endpoint-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-left: auto;
}

.endpoint-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.doc-section h4 {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.code-block-wrapper {
  position: relative;
  background: #060913;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 1rem;
  overflow-x: auto;
}

.btn-code-copy {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-code-copy:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.15);
}

.code-block-wrapper pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.825rem;
  color: #e2e8f0;
  line-height: 1.5;
}
</style>
