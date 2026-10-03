<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useKegiatanStore } from '@/stores/kegiatan'
import type { KegiatanInternal, CreateKegiatanPayload } from '@/types/kegiatan'
import {
  ArrowLeft,
  Calendar,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  Users,
  Briefcase,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-vue-next'

const router = useRouter()
const kegiatanStore = useKegiatanStore()

// State Form Modal
const isModalOpen = ref(false)
const isEditMode = ref(false)
const isDeleteModalOpen = ref(false)
const selectedItem = ref<KegiatanInternal | null>(null)

// Toast Alert
const toastMessage = ref<string | null>(null)
const toastType = ref<'success' | 'danger'>('success')

function showToast(message: string, type: 'success' | 'danger' = 'success') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

// Form state
const formData = reactive<CreateKegiatanPayload & { no?: number }>({
  no: undefined,
  tanggal: '',
  tempat: '',
  nama_kegiatan: '',
  pelaksana: 'Pengurus Harian',
  keterangan: '',
  jumlah_peserta: '',
})

onMounted(async () => {
  try {
    await kegiatanStore.fetchItems()
  } catch (err) {
    console.error('Initial fetch failed:', err)
  }
})

function openCreateModal() {
  isEditMode.value = false
  formData.no = undefined
  // Default tanggal hari ini (DD/MM/YYYY)
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()

  formData.tanggal = `${dd}/${mm}/${yyyy}`
  formData.tempat = ''
  formData.nama_kegiatan = ''
  formData.pelaksana = 'Pengurus Harian'
  formData.keterangan = ''
  formData.jumlah_peserta = ''
  isModalOpen.value = true
}

function openEditModal(item: KegiatanInternal) {
  isEditMode.value = true
  formData.no = item.no
  formData.tanggal = item.tanggal
  formData.tempat = item.tempat
  formData.nama_kegiatan = item.nama_kegiatan
  formData.pelaksana = item.pelaksana
  formData.keterangan = item.keterangan
  formData.jumlah_peserta = item.jumlah_peserta ?? ''
  isModalOpen.value = true
}

function openDeleteModal(item: KegiatanInternal) {
  selectedItem.value = item
  isDeleteModalOpen.value = true
}

async function handleSave() {
  if (!formData.nama_kegiatan.trim() || !formData.tanggal.trim() || !formData.tempat.trim()) {
    showToast('Nama kegiatan, tanggal, dan tempat wajib diisi.', 'danger')
    return
  }

  try {
    if (isEditMode.value && formData.no !== undefined) {
      await kegiatanStore.updateItem({
        no: formData.no,
        tanggal: formData.tanggal.trim(),
        tempat: formData.tempat.trim(),
        nama_kegiatan: formData.nama_kegiatan.trim(),
        pelaksana: formData.pelaksana?.trim() || '-',
        keterangan: formData.keterangan?.trim() || '-',
        jumlah_peserta: formData.jumlah_peserta !== '' ? formData.jumlah_peserta : null,
      })
      showToast('Kegiatan internal berhasil diperbarui!', 'success')
    } else {
      await kegiatanStore.createItem({
        tanggal: formData.tanggal.trim(),
        tempat: formData.tempat.trim(),
        nama_kegiatan: formData.nama_kegiatan.trim(),
        pelaksana: formData.pelaksana?.trim() || '-',
        keterangan: formData.keterangan?.trim() || '-',
        jumlah_peserta: formData.jumlah_peserta !== '' ? formData.jumlah_peserta : null,
      })
      showToast('Kegiatan baru berhasil ditambahkan!', 'success')
    }
    isModalOpen.value = false
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan kegiatan.'
    showToast(msg, 'danger')
  }
}

async function handleDelete() {
  if (!selectedItem.value) return

  try {
    await kegiatanStore.deleteItem(selectedItem.value.no)
    showToast(`Kegiatan nomor ${selectedItem.value.no} berhasil dihapus.`, 'success')
    isDeleteModalOpen.value = false
    selectedItem.value = null
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus kegiatan.'
    showToast(msg, 'danger')
  }
}
</script>

<template>
  <div class="kegiatan-page">
    <!-- Top Navigation -->
    <header class="top-nav glass-panel">
      <div class="nav-content">
        <div class="nav-left">
          <button class="btn btn-secondary btn-sm" @click="router.push('/dashboard')">
            <ArrowLeft :size="16" />
            <span>Dashboard</span>
          </button>
          <div class="page-title-group">
            <div class="page-icon-badge">
              <Calendar :size="20" />
            </div>
            <div>
              <h2>Kegiatan Internal</h2>
              <span class="page-subtitle">Sheet: <code>kegiatan-internal</code></span>
            </div>
          </div>
        </div>

        <div class="nav-actions">
          <button
            class="btn btn-secondary btn-sm"
            @click="kegiatanStore.fetchItems"
            :disabled="kegiatanStore.loading"
          >
            <RefreshCw :size="15" :class="{ 'spin-anim': kegiatanStore.loading }" />
            <span>Segarkan</span>
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <Plus :size="16" />
            <span>Tambah Kegiatan</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-container">
      <!-- Toast Alert Notification -->
      <transition name="fade">
        <div v-if="toastMessage" :class="['toast-notification', `alert-${toastType}`]">
          <CheckCircle2 v-if="toastType === 'success'" :size="18" />
          <AlertCircle v-else :size="18" />
          <span>{{ toastMessage }}</span>
        </div>
      </transition>

      <!-- Global Error Banner if any -->
      <div v-if="kegiatanStore.error" class="alert alert-danger">
        <AlertCircle :size="18" class="flex-shrink-0" />
        <span>{{ kegiatanStore.error }}</span>
      </div>

      <!-- Stat Widgets -->
      <section class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper emerald">
            <Calendar :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Kegiatan</span>
            <h3 class="stat-value">{{ kegiatanStore.totalKegiatan }}</h3>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper blue">
            <Users :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Peserta Terdata</span>
            <h3 class="stat-value">{{ kegiatanStore.totalPeserta }}</h3>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-wrapper amber">
            <Briefcase :size="22" />
          </div>
          <div class="stat-info">
            <span class="stat-label">Entitas Pelaksana</span>
            <h3 class="stat-value">{{ kegiatanStore.pelaksanaList.length }} Kelompok</h3>
          </div>
        </div>
      </section>

      <!-- Search & Filter Bar -->
      <section class="toolbar-card glass-panel">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="kegiatanStore.searchQuery"
            type="text"
            class="form-input search-input"
            placeholder="Cari berdasarkan nama kegiatan, tempat, tanggal, atau pelaksana..."
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Filter Pelaksana:</label>
          <select v-model="kegiatanStore.selectedPelaksana" class="form-input filter-select">
            <option value="all">Semua Pelaksana</option>
            <option v-for="pelaksana in kegiatanStore.pelaksanaList" :key="pelaksana" :value="pelaksana">
              {{ pelaksana }}
            </option>
          </select>
        </div>
      </section>

      <!-- Data Table Card -->
      <section class="table-card glass-panel">
        <div class="table-header-row">
          <div class="table-header-title">
            <FileSpreadsheet :size="18" class="text-primary" />
            <h3>Daftar Agenda Kegiatan</h3>
          </div>
          <span class="badge badge-info">
            {{ kegiatanStore.filteredItems.length }} dari {{ kegiatanStore.totalKegiatan }} Kegiatan
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="kegiatanStore.loading && kegiatanStore.items.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data dari Google Sheets...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="kegiatanStore.filteredItems.length === 0"
          class="empty-state"
        >
          <Calendar :size="48" class="empty-icon" />
          <h4>Tidak ada kegiatan yang ditemukan</h4>
          <p>Coba sesuaikan kata kunci pencarian atau tambahkan kegiatan baru.</p>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <Plus :size="15" /> Tambah Kegiatan
          </button>
        </div>

        <!-- Responsive Table -->
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th style="width: 120px;">Tanggal</th>
                <th>Nama Kegiatan</th>
                <th>Tempat</th>
                <th>Pelaksana</th>
                <th>Keterangan</th>
                <th style="width: 100px; text-align: center;">Peserta</th>
                <th style="width: 110px; text-align: center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in kegiatanStore.filteredItems" :key="item.no" class="table-row">
                <td class="font-mono text-dim">{{ item.no }}</td>
                <td>
                  <span class="date-badge">
                    <Calendar :size="12" />
                    {{ item.tanggal }}
                  </span>
                </td>
                <td>
                  <div class="activity-title">{{ item.nama_kegiatan }}</div>
                </td>
                <td>
                  <div class="location-cell">
                    <MapPin :size="14" class="text-dim" />
                    <span>{{ item.tempat }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-success">{{ item.pelaksana }}</span>
                </td>
                <td>
                  <span class="text-muted note-text">{{ item.keterangan || '-' }}</span>
                </td>
                <td style="text-align: center;">
                  <span v-if="item.jumlah_peserta" class="badge badge-info">
                    {{ item.jumlah_peserta }} org
                  </span>
                  <span v-else class="text-dim">-</span>
                </td>
                <td style="text-align: center;">
                  <div class="action-buttons">
                    <button
                      class="btn-action edit"
                      @click="openEditModal(item)"
                      title="Edit Kegiatan"
                    >
                      <Edit2 :size="15" />
                    </button>
                    <button
                      class="btn-action delete"
                      @click="openDeleteModal(item)"
                      title="Hapus Kegiatan"
                    >
                      <Trash2 :size="15" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modal Form (Tambah / Edit) -->
    <div v-if="isModalOpen" class="modal-backdrop">
      <div class="modal-card glass-panel">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Ubah Kegiatan Internal' : 'Tambah Kegiatan Internal' }}</h3>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleSave" class="modal-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Tanggal (DD/MM/YYYY) *</label>
              <input
                v-model="formData.tanggal"
                type="text"
                class="form-input"
                placeholder="Contoh: 15/08/2026"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Jumlah Peserta</label>
              <input
                v-model="formData.jumlah_peserta"
                type="number"
                min="0"
                class="form-input"
                placeholder="Contoh: 35"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nama Kegiatan *</label>
            <input
              v-model="formData.nama_kegiatan"
              type="text"
              class="form-input"
              placeholder="Contoh: Rapat Harian & Koordinasi PAC"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Tempat *</label>
              <input
                v-model="formData.tempat"
                type="text"
                class="form-input"
                placeholder="Contoh: Gedung MWC NU Buaran"
                required
              />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Pelaksana</label>
              <input
                v-model="formData.pelaksana"
                type="text"
                class="form-input"
                placeholder="Contoh: Pengurus Harian / Tim Formatur"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Agenda</label>
            <textarea
              v-model="formData.keterangan"
              class="form-input textarea-input"
              rows="3"
              placeholder="Tambahkan catatan hasil atau pembahasan kegiatan..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="isModalOpen = false"
              :disabled="kegiatanStore.submitting"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="kegiatanStore.submitting"
            >
              <span v-if="kegiatanStore.submitting" class="spinner"></span>
              <span v-else>{{ isEditMode ? 'Simpan Perubahan' : 'Tambah Kegiatan' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="isDeleteModalOpen" class="modal-backdrop">
      <div class="modal-card delete-card glass-panel">
        <div class="delete-icon-box">
          <Trash2 :size="32" />
        </div>
        <h3>Hapus Kegiatan?</h3>
        <p>
          Apakah Anda yakin ingin menghapus kegiatan nomor <strong>{{ selectedItem?.no }}</strong>:
          <em>"{{ selectedItem?.nama_kegiatan }}"</em>? Tindakan ini akan menghapus baris terkait di Google Sheets.
        </p>

        <div class="modal-actions">
          <button
            class="btn btn-secondary"
            @click="isDeleteModalOpen = false"
            :disabled="kegiatanStore.submitting"
          >
            Batal
          </button>
          <button
            class="btn btn-outline-danger"
            @click="handleDelete"
            :disabled="kegiatanStore.submitting"
          >
            <span v-if="kegiatanStore.submitting" class="spinner"></span>
            <span v-else>Ya, Hapus Data</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kegiatan-page {
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.page-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--primary-400);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title-group h2 {
  font-size: 1.25rem;
}

.page-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-container {
  max-width: 1280px;
  margin: 1.75rem auto 0;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.toast-notification {
  position: fixed;
  top: 5rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.emerald {
  background: rgba(16, 185, 129, 0.15);
  color: var(--primary-400);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.stat-icon-wrapper.blue {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-blue);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.stat-icon-wrapper.amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-amber);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.65rem;
  font-weight: 700;
  margin-top: 0.2rem;
}

.toolbar-card {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
  pointer-events: none;
}

.search-input {
  padding-left: 2.75rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.filter-select {
  padding: 0.65rem 1rem;
  min-width: 180px;
}

.table-card {
  padding: 1.5rem;
  overflow: hidden;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
}

.table-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-primary {
  color: var(--primary-400);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table td {
  padding: 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}

.activity-title {
  font-weight: 600;
  color: var(--text-main);
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
}

.note-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 250px;
  font-size: 0.825rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-action {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action.edit:hover {
  color: var(--primary-400);
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.btn-action.delete:hover {
  color: var(--accent-red);
  background: rgba(244, 63, 94, 0.15);
  border-color: rgba(244, 63, 94, 0.3);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  color: var(--text-dim);
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 540px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.25rem;
}

.btn-close:hover {
  color: var(--text-main);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.textarea-input {
  resize: vertical;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.delete-card {
  max-width: 440px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.delete-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--accent-red);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-card .modal-actions {
  justify-content: center;
  width: 100%;
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}
</style>
