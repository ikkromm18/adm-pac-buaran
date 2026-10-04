<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useKegiatanStore } from '@/stores/kegiatan'
import { useKegiatanEksternalStore } from '@/stores/kegiatanEksternal'
import { useSuratMasukStore } from '@/stores/suratMasuk'
import logoPacBuaran from '@/assets/logopacbuaran.webp'
import type { KegiatanInternal, CreateKegiatanPayload } from '@/types/kegiatan'
import {
  LayoutDashboard,
  Calendar,
  Compass,
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
  FileText,
  DollarSign,
  Settings,
  BookOpen,
  LogOut,
  Server,
  Menu,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const kegiatanStore = useKegiatanStore()
const kegiatanEksternalStore = useKegiatanEksternalStore()
const suratMasukStore = useSuratMasukStore()

// State Drawer Mobile
const isMobileMenuOpen = ref(false)

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
    await Promise.all([
      kegiatanStore.fetchItems(),
      kegiatanEksternalStore.fetchItems(),
      suratMasukStore.fetchItems(),
    ])
  } catch (err) {
    console.error('Initial fetch failed:', err)
  }
})

function openCreateModal() {
  isEditMode.value = false
  formData.no = undefined
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

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <!-- MOBILE TOPBAR BAR -->
    <header class="mobile-navbar">
      <button
        class="btn-hamburger"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        aria-label="Toggle Menu"
      >
        <Menu v-if="!isMobileMenuOpen" :size="22" />
        <X v-else :size="22" />
      </button>
      <div class="mobile-brand">
        <div class="logo-box-sm">
          <img :src="logoPacBuaran" alt="Logo PAC Buaran" class="logo-img-sm" />
        </div>
        <span class="mobile-brand-title">PAC Buaran</span>
      </div>
      <div class="mobile-avatar">
        {{ (authStore.user?.full_name || authStore.user?.username || 'A')[0].toUpperCase() }}
      </div>
    </header>

    <!-- BACKDROP FOR MOBILE DRAWER -->
    <transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="sidebar-backdrop"
        @click="isMobileMenuOpen = false"
      ></div>
    </transition>

    <!-- LEFT SIDEBAR -->
    <aside class="sidebar" :class="{ 'drawer-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <div class="logo-box">
          <img :src="logoPacBuaran" alt="Logo PAC Buaran" class="logo-img" />
        </div>
        <div class="logo-text">
          <h2>PAC Buaran</h2>
          <span>Portal Administrasi</span>
        </div>
        <button class="btn-close-drawer" @click="isMobileMenuOpen = false" aria-label="Tutup Menu">
          <X :size="18" />
        </button>
      </div>

      <nav class="sidebar-menu">
        <div class="menu-group">
          <span class="group-title">MAIN MENU</span>
          <RouterLink to="/dashboard" class="menu-item" @click="isMobileMenuOpen = false">
            <LayoutDashboard :size="18" />
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/kegiatan-internal" class="menu-item active" @click="isMobileMenuOpen = false">
            <Calendar :size="18" />
            <span>Kegiatan Internal</span>
            <span class="item-badge" v-if="kegiatanStore.totalKegiatan">{{ kegiatanStore.totalKegiatan }}</span>
          </RouterLink>
          <RouterLink to="/kegiatan-eksternal" class="menu-item" @click="isMobileMenuOpen = false">
            <Compass :size="18" />
            <span>Kegiatan Eksternal</span>
            <span class="item-badge" v-if="kegiatanEksternalStore.totalKegiatan">{{ kegiatanEksternalStore.totalKegiatan }}</span>
          </RouterLink>
        </div>

        <div class="menu-group">
          <span class="group-title">DATA & ANGGOTA</span>
          <a href="#" class="menu-item disabled">
            <Users :size="18" />
            <span>Data Pengurus</span>
          </a>
          <RouterLink to="/surat-masuk" class="menu-item" title="Modul Surat Masuk" @click="isMobileMenuOpen = false">
            <FileText :size="18" />
            <span>Surat Masuk</span>
            <span class="item-badge" v-if="suratMasukStore.totalSuratMasuk">{{ suratMasukStore.totalSuratMasuk }}</span>
          </RouterLink>
          <a href="#" class="menu-item disabled">
            <DollarSign :size="18" />
            <span>Laporan Keuangan</span>
          </a>
        </div>

        <!-- SUPERADMIN ONLY MENU -->
        <div class="menu-group" v-if="authStore.isSuperAdmin">
          <span class="group-title superadmin-group">SISTEM & API (SUPERADMIN)</span>
          <RouterLink to="/api-docs" class="menu-item superadmin-link">
            <BookOpen :size="18" />
            <span>Dokumentasi API</span>
          </RouterLink>
          <RouterLink to="/dashboard#gas-technical-panel" class="menu-item superadmin-link">
            <Server :size="18" />
            <span>Status Server GAS</span>
          </RouterLink>
        </div>

        <div class="menu-group">
          <span class="group-title">PENGATURAN</span>
          <a href="#" class="menu-item disabled">
            <Settings :size="18" />
            <span>Pengaturan Akun</span>
          </a>
        </div>
      </nav>

      <!-- Sidebar Footer User Profile -->
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">
            {{ (authStore.user?.full_name || authStore.user?.username || 'A')[0].toUpperCase() }}
          </div>
          <div class="user-chip-info">
            <span class="chip-name">{{ authStore.user?.full_name || authStore.user?.username }}</span>
            <span class="chip-role" :class="{ 'role-super': authStore.isSuperAdmin }">
              {{ authStore.userRole }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="main-wrapper">
      <!-- TOP NAVIGATION BAR -->
      <header class="topbar">
        <div class="search-bar">
          <Search :size="17" class="search-icon" />
          <input
            v-model="kegiatanStore.searchQuery"
            type="text"
            placeholder="Cari kegiatan, tempat, tanggal..."
            class="search-input"
          />
        </div>

        <div class="topbar-right">
          <div class="user-profile-badge">
            <div class="avatar-circle">
              <span class="avatar-letter">
                {{ (authStore.user?.full_name || authStore.user?.username || 'U')[0].toUpperCase() }}
              </span>
            </div>
            <div class="user-names">
              <span class="full-name">{{ authStore.user?.full_name || authStore.user?.username }}</span>
              <span class="user-email-text">{{ authStore.userRole }}</span>
            </div>
          </div>

          <button class="btn btn-outline-danger btn-sm" @click="handleLogout" title="Keluar">
            <LogOut :size="16" />
          </button>
        </div>
      </header>

      <!-- CONTENT BODY -->
      <main class="content-body">
        <!-- Toast Notification -->
        <transition name="fade">
          <div v-if="toastMessage" :class="['toast-notification', `alert-${toastType}`]">
            <CheckCircle2 v-if="toastType === 'success'" :size="18" />
            <AlertCircle v-else :size="18" />
            <span>{{ toastMessage }}</span>
          </div>
        </transition>

        <!-- Header Row -->
        <div class="page-header-row">
          <div>
            <h1 class="page-title">Kegiatan Internal PAC</h1>
            <p class="page-desc">
              Kelola seluruh agenda rapat, kegiatan harian, dan sidang program kerja (Sheet: <code>kegiatan-internal</code>)
            </p>
          </div>
          <div class="header-action-group">
            <button
              class="btn btn-secondary btn-sm"
              @click="kegiatanStore.fetchItems"
              :disabled="kegiatanStore.loading"
            >
              <RefreshCw :size="15" :class="{ 'spin-anim': kegiatanStore.loading }" />
              <span>Segarkan</span>
            </button>
            <button class="btn btn-primary" @click="openCreateModal">
              <Plus :size="16" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        <!-- 3 PASTEL STAT CARDS -->
        <section class="stats-grid">
          <div class="pastel-card lime">
            <div class="card-top">
              <div class="icon-circle lime">
                <Calendar :size="16" />
              </div>
            </div>
            <span class="card-category">Total Kegiatan</span>
            <div class="card-value">{{ kegiatanStore.totalKegiatan }}</div>
            <span class="card-hint">Agenda terdaftar</span>
          </div>

          <div class="pastel-card teal">
            <div class="card-top">
              <div class="icon-circle teal">
                <Users :size="16" />
              </div>
            </div>
            <span class="card-category">Total Peserta Terdata</span>
            <div class="card-value">{{ kegiatanStore.totalPeserta }}</div>
            <span class="card-hint">Partisipan aktif</span>
          </div>

          <div class="pastel-card purple">
            <div class="card-top">
              <div class="icon-circle purple">
                <Briefcase :size="16" />
              </div>
            </div>
            <span class="card-category">Entitas Pelaksana</span>
            <div class="card-value">{{ kegiatanStore.pelaksanaList.length }}</div>
            <span class="card-hint">Kelompok pelaksana</span>
          </div>
        </section>

        <!-- TOOLBAR: FILTER & SEARCH -->
        <section class="white-card toolbar-card">
          <div class="search-box">
            <Search :size="16" class="search-icon-sm" />
            <input
              v-model="kegiatanStore.searchQuery"
              type="text"
              class="form-input search-input-sm"
              placeholder="Cari berdasarkan nama kegiatan, tempat, pelaksana..."
            />
          </div>

          <div class="filter-box">
            <label class="filter-label">Filter Pelaksana:</label>
            <select v-model="kegiatanStore.selectedPelaksana" class="filter-select">
              <option value="all">Semua Pelaksana</option>
              <option v-for="pelaksana in kegiatanStore.pelaksanaList" :key="pelaksana" :value="pelaksana">
                {{ pelaksana }}
              </option>
            </select>
          </div>
        </section>

        <!-- DATA TABLE CARD -->
        <section class="white-card table-card">
          <div class="table-header-row">
            <div class="table-title">
              <FileSpreadsheet :size="18" class="text-teal" />
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
          <div v-else-if="kegiatanStore.filteredItems.length === 0" class="empty-state">
            <Calendar :size="48" class="empty-icon" />
            <h4>Tidak ada kegiatan ditemukan</h4>
            <p>Coba sesuaikan kata kunci pencarian atau tambahkan kegiatan baru.</p>
            <button class="btn btn-primary btn-sm" @click="openCreateModal">
              <Plus :size="15" /> Tambah Kegiatan
            </button>
          </div>

          <!-- Responsive Table -->
          <div v-else class="table-responsive">
            <table class="styled-table">
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
                <tr v-for="item in kegiatanStore.filteredItems" :key="item.no">
                  <td class="font-mono text-dim">{{ item.no }}</td>
                  <td>
                    <span class="date-chip">
                      <Calendar :size="12" />
                      {{ item.tanggal }}
                    </span>
                  </td>
                  <td>
                    <span class="activity-title">{{ item.nama_kegiatan }}</span>
                  </td>
                  <td>
                    <span class="loc-chip">
                      <MapPin :size="12" />
                      {{ item.tempat }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-success">{{ item.pelaksana }}</span>
                  </td>
                  <td>
                    <span class="note-text">{{ item.keterangan || '-' }}</span>
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
                        <Edit2 :size="14" />
                      </button>
                      <button
                        class="btn-action delete"
                        @click="openDeleteModal(item)"
                        title="Hapus Kegiatan"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <!-- MODAL FORM (CREATE & EDIT) -->
    <div v-if="isModalOpen" class="modal-backdrop">
      <div class="modal-card white-card">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Ubah Kegiatan Internal' : 'Tambah Kegiatan Internal' }}</h3>
          <button class="btn-close" @click="isModalOpen = false"><X :size="20" /></button>
        </div>

        <form @submit.prevent="handleSave" class="modal-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Tanggal (DD/MM/YYYY) *</label>
              <input
                v-model="formData.tanggal"
                type="text"
                class="form-input"
                placeholder="15/08/2026"
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
                placeholder="Gedung MWC NU Buaran"
                required
              />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Pelaksana</label>
              <input
                v-model="formData.pelaksana"
                type="text"
                class="form-input"
                placeholder="Pengurus Harian"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Catatan</label>
            <textarea
              v-model="formData.keterangan"
              class="form-input"
              rows="3"
              placeholder="Catatan pembahasan atau agenda rapat..."
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

    <!-- MODAL CONFIRM DELETE -->
    <div v-if="isDeleteModalOpen" class="modal-backdrop">
      <div class="modal-card delete-card white-card">
        <div class="delete-icon-box">
          <Trash2 :size="30" />
        </div>
        <h3>Hapus Kegiatan?</h3>
        <p>
          Anda akan menghapus kegiatan nomor <strong>{{ selectedItem?.no }}</strong>:
          <em>"{{ selectedItem?.nama_kegiatan }}"</em>. Tindakan ini akan menghapus baris terkait di Google Sheets.
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
            <span v-else>Hapus Kegiatan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* App Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-canvas);
  color: var(--text-main);
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.5rem 1.25rem;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 2rem;
  padding-left: 0.5rem;
}

.logo-box {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(9, 44, 43, 0.12);
  border: 1.5px solid var(--border-soft);
  flex-shrink: 0;
  padding: 2px;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.logo-text h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.logo-text span {
  font-size: 0.725rem;
  color: var(--text-muted);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.group-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-left: 0.75rem;
  margin-bottom: 0.35rem;
}

.superadmin-group {
  color: #7c3aed;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s ease;
}

.menu-item:hover:not(.active) {
  background-color: #f1f8f7;
  color: var(--primary-dark);
}

.menu-item.active {
  background-color: var(--primary-dark);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(9, 44, 43, 0.2);
}

.menu-item.superadmin-link {
  color: #6b21a8;
}

.menu-item.superadmin-link:hover {
  background-color: #f5f3ff;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-badge {
  margin-left: auto;
  font-size: 0.7rem;
  background: #e2f4f2;
  color: var(--primary-dark);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background: #f8fbfa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-dark);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.user-chip-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chip-name {
  font-size: 0.825rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-role {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.role-super {
  color: #7c3aed;
  font-weight: 700;
}

/* Main Area */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 1.15rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.search-input {
  width: 100%;
  padding: 0.65rem 1.15rem 0.65rem 2.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  font-size: 0.875rem;
  outline: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #d1fae5;
  color: #065f46;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-names {
  display: flex;
  flex-direction: column;
}

.full-name {
  font-size: 0.85rem;
  font-weight: 700;
}

.user-email-text {
  font-size: 0.725rem;
  color: var(--text-muted);
}

/* Content Body */
.content-body {
  padding: 0 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.page-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Pastel Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.pastel-card {
  padding: 1.35rem 1.25rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.pastel-card.lime { background-color: var(--pastel-lime-bg); color: var(--pastel-lime-text); }
.pastel-card.teal { background-color: var(--pastel-teal-bg); color: var(--pastel-teal-text); }
.pastel-card.purple { background-color: var(--pastel-purple-bg); color: var(--pastel-purple-text); }

.card-top {
  display: flex;
  align-items: center;
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle.lime { background: var(--pastel-lime-accent); color: var(--pastel-lime-text); }
.icon-circle.teal { background: var(--pastel-teal-accent); color: var(--pastel-teal-text); }
.icon-circle.purple { background: var(--pastel-purple-accent); color: var(--pastel-purple-text); }

.card-category {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.85;
}

.card-value {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
  margin: 0.2rem 0;
}

.card-hint {
  font-size: 0.725rem;
  font-weight: 600;
  opacity: 0.85;
}

/* Toolbar */
.toolbar-card {
  padding: 1.15rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon-sm {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-dim);
}

.search-input-sm {
  padding-left: 2.6rem;
  border-radius: var(--radius-pill);
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.filter-label {
  font-size: 0.825rem;
  color: var(--text-muted);
  font-weight: 600;
}

.filter-select {
  padding: 0.6rem 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  font-size: 0.85rem;
  outline: none;
}

/* Table Card */
.table-card {
  padding: 1.5rem;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-title h3 {
  font-size: 1.1rem;
}

.text-teal {
  color: var(--primary-accent);
}

.table-responsive {
  overflow-x: auto;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.styled-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.styled-table td {
  padding: 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.styled-table tr:hover td {
  background-color: #fbfdfd;
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-main);
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}

.activity-title {
  font-weight: 600;
  color: var(--text-main);
}

.loc-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-muted);
  font-size: 0.825rem;
}

.note-text {
  color: var(--text-muted);
  font-size: 0.825rem;
  max-width: 240px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-action {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
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
  color: #047857;
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.btn-action.delete:hover {
  color: #e11d48;
  background: #fff1f2;
  border-color: #fecdd3;
}

.loading-state, .empty-state {
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
  background: rgba(9, 44, 43, 0.4);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.delete-card {
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.delete-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fee2e2;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-card .modal-actions {
  justify-content: center;
  width: 100%;
}

.toast-notification {
  position: fixed;
  top: 4.5rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-pill);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

/* MOBILE NAVBAR & DRAWER STYLES */
.mobile-navbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(9, 44, 43, 0.04);
}

.btn-hamburger {
  background: transparent;
  border: none;
  color: var(--primary-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.btn-hamburger:hover {
  background: #f1f8f7;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-box-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(9, 44, 43, 0.12);
  border: 1.5px solid var(--border-soft);
  flex-shrink: 0;
  padding: 1px;
}

.logo-img-sm {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.mobile-brand-title {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--primary-dark);
}

.mobile-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--pastel-teal-bg);
  color: var(--pastel-teal-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.btn-close-drawer {
  display: none;
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
}

.btn-close-drawer:hover {
  background: #f1f8f7;
  color: var(--primary-dark);
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(9, 44, 43, 0.45);
  backdrop-filter: blur(4px);
  z-index: 99;
}

/* RESPONSIVE */
@media (max-width: 860px) {
  .app-layout {
    flex-direction: column;
  }

  .mobile-navbar {
    display: flex;
  }

  .btn-close-drawer {
    display: flex;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    width: 280px;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    overflow-y: auto;
  }

  .sidebar.drawer-open {
    transform: translateX(0);
    box-shadow: 10px 0 35px rgba(9, 44, 43, 0.25);
  }

  .topbar {
    padding: 1rem 1.25rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.85rem;
  }

  .search-bar {
    max-width: 100%;
  }

  .topbar-right {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .content-body {
    padding: 0 1rem 2rem;
    gap: 1.5rem;
  }

  .page-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-action-group {
    width: 100%;
  }

  .header-action-group .btn {
    flex: 1;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-box {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
  }

  .form-row {
    flex-direction: column;
    gap: 0.85rem;
  }

  .modal-card {
    max-width: 95vw;
  }
}

@media (min-width: 520px) and (max-width: 860px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
