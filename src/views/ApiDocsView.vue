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
  ShieldCheck,
} from 'lucide-vue-next'

const router = useRouter()
const copiedIndex = ref<string | null>(null)

const gasApiUrl = import.meta.env.VITE_GAS_API_URL || 'https://script.google.com/macros/s/.../exec'
const gasDeploymentId = import.meta.env.VITE_GAS_DEPLOYMENT_ID || 'AKfycb...'

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
    <header class="top-nav white-card">
      <div class="nav-content">
        <button class="btn btn-secondary btn-sm" @click="router.push('/dashboard')">
          <ArrowLeft :size="16" />
          <span>Kembali ke Dashboard</span>
        </button>
        <div class="header-title">
          <BookOpen :size="20" class="text-primary" />
          <h2>Dokumentasi API Google Apps Script</h2>
        </div>
        <div class="header-badge">
          <span class="badge badge-purple">
            <ShieldCheck :size="13" />
            Superadmin Access
          </span>
        </div>
      </div>
    </header>

    <main class="docs-container">
      <!-- Info Banner -->
      <section class="info-banner white-card">
        <div class="banner-icon">
          <Terminal :size="28" />
        </div>
        <div class="banner-body">
          <h3>Dokumentasi Teknis Backend Serverless</h3>
          <p>
            Dokumentasi ini disinkronkan dengan file <code>PRD.md</code> di root direktori project.
            Halaman ini khusus untuk peran <strong>Superadmin</strong> untuk memonitor routing dan struktur JSON Google Apps Script.
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
      <article class="endpoint-card white-card">
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
      <article class="endpoint-card white-card">
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
      <article class="endpoint-card white-card">
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
      <article class="endpoint-card white-card">
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
      <article class="endpoint-card white-card">
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
      <article class="endpoint-card white-card">
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

      <!-- Endpoint 7: Kegiatan Eksternal List -->
      <article class="endpoint-card white-card">
        <div class="endpoint-header">
          <div class="method-tag get">GET / POST</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_eksternal_list</code>
          </div>
          <span class="endpoint-desc">Ambil Seluruh Data Sheet kegiatan-eksternal</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Data kegiatan eksternal berhasil diambil.",
  "data": [
    {
      "no": 1,
      "tanggal": "14/04/2026",
      "tempat": "Gedung PC NU Kab Pekalongan",
      "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
      "pelaksana": "PC IPNU Kab. Pekalongan",
      "keterangan": "Menghadiri",
      "delegasi_pac": "Heri, Lintang",
      "_rowNumber": 2
    }
  ]
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 8: Kegiatan Eksternal Create -->
      <article class="endpoint-card white-card">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_eksternal_create</code>
          </div>
          <span class="endpoint-desc">Tambah Baris Baru pada Sheet kegiatan-eksternal</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Request Body</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "tanggal": "14/04/2026",
  "tempat": "Gedung PC NU Kab Pekalongan",
  "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
  "pelaksana": "PC IPNU Kab. Pekalongan",
  "keterangan": "Menghadiri",
  "delegasi_pac": "Heri, Lintang"
}</code></pre>
            </div>
          </div>

          <div class="doc-section">
            <h4>Response Sukses (200 OK)</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "success": true,
  "message": "Kegiatan eksternal berhasil ditambahkan.",
  "data": {
    "no": 2,
    "tanggal": "14/04/2026",
    "tempat": "Gedung PC NU Kab Pekalongan",
    "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
    "pelaksana": "PC IPNU Kab. Pekalongan",
    "keterangan": "Menghadiri",
    "delegasi_pac": "Heri, Lintang"
  }
}</code></pre>
            </div>
          </div>
        </div>
      </article>

      <!-- Endpoint 9: Kegiatan Eksternal Update & Delete -->
      <article class="endpoint-card white-card">
        <div class="endpoint-header">
          <div class="method-tag post">POST</div>
          <div class="endpoint-path">
            <code>?action=kegiatan_eksternal_update &bull; ?action=kegiatan_eksternal_delete</code>
          </div>
          <span class="endpoint-desc">Ubah / Hapus Data Kegiatan Eksternal Berdasarkan Kolom No</span>
        </div>

        <div class="endpoint-content">
          <div class="doc-section">
            <h4>Update Payload</h4>
            <div class="code-block-wrapper">
              <pre><code>{
  "no": 1,
  "tanggal": "14/04/2026",
  "tempat": "Gedung PC NU Kab Pekalongan",
  "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD (Revisi)",
  "pelaksana": "PC IPNU Kab. Pekalongan",
  "keterangan": "Menghadiri",
  "delegasi_pac": "Heri, Lintang, M. Ikrom"
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
  background-color: var(--bg-canvas);
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;
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
  color: var(--primary-dark);
}

.text-primary {
  color: var(--primary-dark);
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
}

.banner-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: #e2f4f2;
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-body h3 {
  font-size: 1.2rem;
  color: var(--primary-dark);
  margin-bottom: 0.35rem;
}

.banner-body p {
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.env-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.endpoint-card {
  padding: 1.75rem;
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.method-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-pill);
}

.method-tag.post {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.endpoint-path code {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.endpoint-desc {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-left: auto;
}

.endpoint-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.doc-section h4 {
  font-size: 0.825rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.code-block-wrapper {
  position: relative;
  background: #081d1c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 1rem;
  overflow-x: auto;
}

.btn-code-copy {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  padding: 0.25rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-code-copy:hover {
  background: rgba(255, 255, 255, 0.25);
}

.code-block-wrapper pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #d1fae5;
  line-height: 1.5;
}
</style>
