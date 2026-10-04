<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useKegiatanStore } from '@/stores/kegiatan'
import { useKegiatanEksternalStore } from '@/stores/kegiatanEksternal'
import { useSuratMasukStore } from '@/stores/suratMasuk'
import type { SuratMasuk, CreateSuratMasukPayload } from '@/types/suratMasuk'
import {
  LayoutDashboard,
  Calendar,
  Compass,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Users,
  DollarSign,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  Server,
  Eye,
  Tag,
  Copy,
  Check,
  Inbox,
  Menu,
  ShieldAlert,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const kegiatanInternalStore = useKegiatanStore()
const kegiatanEksternalStore = useKegiatanEksternalStore()
const suratMasukStore = useSuratMasukStore()

// State Drawer Mobile
const isMobileMenuOpen = ref(false)

// State Modal Form
const isModalOpen = ref(false)
const isEditMode = ref(false)
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedItem = ref<SuratMasuk | null>(null)
const copiedNo = ref<string | null>(null)

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

function copyToClipboard(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedNo.value = id
  setTimeout(() => {
    copiedNo.value = null
  }, 2000)
}

// Form state
const formData = reactive<CreateSuratMasukPayload & { no?: number }>({
  no: undefined,
  jenis_pengarsipan: 'D4',
  nomor_surat: '',
  tgl_diterima: '',
  pengirim: '',
  isi_perihal: '',
  tgl_surat: '',
  terusan: '-',
  disposisi: '-',
  keterangan: '',
})

onMounted(async () => {
  try {
    await Promise.all([
      suratMasukStore.fetchItems(),
      kegiatanInternalStore.fetchItems(),
      kegiatanEksternalStore.fetchItems(),
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
  const formattedToday = `${dd}/${mm}/${yyyy}`

  formData.jenis_pengarsipan = 'D4'
  formData.nomor_surat = ''
  formData.tgl_diterima = formattedToday
  formData.tgl_surat = formattedToday
  formData.pengirim = ''
  formData.isi_perihal = ''
  formData.terusan = '-'
  formData.disposisi = '-'
  formData.keterangan = ''
  isModalOpen.value = true
}

function openEditModal(item: SuratMasuk) {
  isEditMode.value = true
  formData.no = item.no
  formData.jenis_pengarsipan = item.jenis_pengarsipan
  formData.nomor_surat = item.nomor_surat
  formData.tgl_diterima = item.tgl_diterima
  formData.tgl_surat = item.tgl_surat
  formData.pengirim = item.pengirim
  formData.isi_perihal = item.isi_perihal
  formData.terusan = item.terusan
  formData.disposisi = item.disposisi
  formData.keterangan = item.keterangan
  isModalOpen.value = true
}

function openDetailModal(item: SuratMasuk) {
  selectedItem.value = item
  isDetailModalOpen.value = true
}

function openDeleteModal(item: SuratMasuk) {
  selectedItem.value = item
  isDeleteModalOpen.value = true
}

async function handleSubmit() {
  if (!formData.nomor_surat || !formData.pengirim || !formData.isi_perihal) {
    showToast('Nomor surat, pengirim, dan isi perihal wajib diisi!', 'danger')
    return
  }

  try {
    if (isEditMode.value && formData.no !== undefined) {
      await suratMasukStore.updateItem({
        no: formData.no,
        jenis_pengarsipan: formData.jenis_pengarsipan,
        nomor_surat: formData.nomor_surat,
        tgl_diterima: formData.tgl_diterima,
        pengirim: formData.pengirim,
        isi_perihal: formData.isi_perihal,
        tgl_surat: formData.tgl_surat,
        terusan: formData.terusan || '-',
        disposisi: formData.disposisi || '-',
        keterangan: formData.keterangan || '-',
      })
      showToast('Data surat masuk berhasil diperbarui.', 'success')
    } else {
      await suratMasukStore.createItem({
        jenis_pengarsipan: formData.jenis_pengarsipan,
        nomor_surat: formData.nomor_surat,
        tgl_diterima: formData.tgl_diterima,
        pengirim: formData.pengirim,
        isi_perihal: formData.isi_perihal,
        tgl_surat: formData.tgl_surat,
        terusan: formData.terusan || '-',
        disposisi: formData.disposisi || '-',
        keterangan: formData.keterangan || '-',
      })
      showToast('Surat masuk baru berhasil ditambahkan.', 'success')
    }
    isModalOpen.value = false
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
    showToast(msg, 'danger')
  }
}

async function confirmDelete() {
  if (!selectedItem.value) return

  try {
    await suratMasukStore.deleteItem(selectedItem.value.no)
    showToast(`Surat nomor urut ${selectedItem.value.no} berhasil dihapus.`, 'success')
    isDeleteModalOpen.value = false
    selectedItem.value = null
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus data surat masuk.'
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
          <Sparkles :size="16" />
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
          <Sparkles :size="20" class="logo-icon" />
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
          <RouterLink to="/kegiatan-internal" class="menu-item" @click="isMobileMenuOpen = false">
            <Calendar :size="18" />
            <span>Kegiatan Internal</span>
            <span class="item-badge" v-if="kegiatanInternalStore.totalKegiatan">{{ kegiatanInternalStore.totalKegiatan }}</span>
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
          <RouterLink to="/surat-masuk" class="menu-item active" @click="isMobileMenuOpen = false">
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
          <RouterLink to="/api-docs" class="menu-item superadmin-link" @click="isMobileMenuOpen = false">
            <BookOpen :size="18" />
            <span>Dokumentasi API</span>
          </RouterLink>
          <RouterLink to="/dashboard#gas-technical-panel" class="menu-item superadmin-link" @click="isMobileMenuOpen = false">
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

    <!-- MAIN DASHBOARD CONTENT AREA -->
    <div class="main-wrapper">
      <!-- TOP NAVIGATION BAR -->
      <header class="topbar">
        <div class="search-bar">
          <Search :size="17" class="search-icon" />
          <input
            v-model="suratMasukStore.searchQuery"
            type="text"
            placeholder="Cari nomor surat, perihal, pengirim, atau disposisi..."
            class="search-input"
          />
        </div>

        <div class="topbar-right">
          <!-- Role Pill -->
          <div class="role-preview-box">
            <span class="badge" :class="authStore.isSuperAdmin ? 'badge-purple' : 'badge-info'">
              <ShieldAlert :size="13" />
              <span>{{ authStore.userRole }}</span>
            </span>
          </div>

          <!-- User Profile -->
          <div class="user-profile-badge">
            <div class="avatar-circle">
              {{ (authStore.user?.full_name || authStore.user?.username || 'A')[0].toUpperCase() }}
            </div>
            <div class="user-names">
              <span class="full-name">{{ authStore.user?.full_name || authStore.user?.username }}</span>
              <span class="user-email-text">{{ authStore.user?.email || 'admin@pac-buaran.or.id' }}</span>
            </div>
          </div>

          <!-- Logout Button -->
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

        <!-- Page Header Row -->
        <div class="page-header-row">
          <div>
            <div class="breadcrumb-pill">
              <Inbox :size="13" />
              <span>DATA & KEARSIPAN</span>
            </div>
            <h1 class="page-title">Pengarsipan Surat Masuk</h1>
            <p class="page-desc">
              Kelola nomor surat, tanggal penerimaan, perihal, instansi pengirim, dan disposisi (Sheet: <code>surat-masuk</code>)
            </p>
          </div>
          <div class="header-action-group">
            <button
              class="btn btn-secondary btn-sm"
              @click="suratMasukStore.fetchItems"
              :disabled="suratMasukStore.loading"
            >
              <RefreshCw :size="15" :class="{ 'spin-anim': suratMasukStore.loading }" />
              <span>Segarkan</span>
            </button>
            <button class="btn btn-primary add-btn" @click="openCreateModal">
              <Plus :size="16" />
              <span>Tambah Surat Masuk</span>
            </button>
          </div>
        </div>

        <!-- 4 PASTEL METRIC CARDS (Consistent with DashboardView) -->
        <section class="cards-grid">
          <!-- Card 1: Pastel Lime (Total Surat) -->
          <div class="pastel-card lime">
            <div class="card-top">
              <div class="icon-circle lime">
                <Inbox :size="16" />
              </div>
            </div>
            <span class="card-category">Total Surat Masuk</span>
            <div class="card-middle">
              <div class="card-value">{{ suratMasukStore.totalSuratMasuk }}</div>
              <div class="sparkline-bars">
                <span class="bar h-40"></span>
                <span class="bar h-65"></span>
                <span class="bar h-85 dark"></span>
                <span class="bar h-60"></span>
              </div>
            </div>
            <div class="card-footer">
              <span>Arsip terdaftar di sheet</span>
            </div>
          </div>

          <!-- Card 2: Pastel Teal (Kode Klasifikasi) -->
          <div class="pastel-card teal">
            <div class="card-top">
              <div class="icon-circle teal">
                <Tag :size="16" />
              </div>
            </div>
            <span class="card-category">Kode Klasifikasi</span>
            <div class="card-middle">
              <div class="card-value">{{ suratMasukStore.jenisList.length || '0' }}</div>
              <div class="sparkline-bars">
                <span class="bar h-50"></span>
                <span class="bar h-75"></span>
                <span class="bar h-95 dark"></span>
                <span class="bar h-40"></span>
              </div>
            </div>
            <div class="card-footer">
              <span>Kode aktif (D4, D5, dll.)</span>
            </div>
          </div>

          <!-- Card 3: Pastel Blue (Instansi Pengirim) -->
          <div class="pastel-card blue">
            <div class="card-top">
              <div class="icon-circle blue">
                <Building2 :size="16" />
              </div>
            </div>
            <span class="card-category">Instansi / Pengirim</span>
            <div class="card-middle">
              <div class="card-value">{{ suratMasukStore.pengirimList.length || '0' }}</div>
              <div class="sparkline-bars">
                <span class="bar h-30"></span>
                <span class="bar h-55"></span>
                <span class="bar h-75 dark"></span>
                <span class="bar h-90"></span>
              </div>
            </div>
            <div class="card-footer">
              <span>Organisasi & Lembaga</span>
            </div>
          </div>

          <!-- Card 4: Pastel Purple (Terbaru) -->
          <div class="pastel-card purple">
            <div class="card-top">
              <div class="icon-circle purple">
                <Calendar :size="16" />
              </div>
            </div>
            <span class="card-category">Surat Terbaru</span>
            <div class="card-middle">
              <div class="card-value text-compact">{{ suratMasukStore.recentSuratMasuk[0]?.tgl_diterima || '-' }}</div>
            </div>
            <div class="card-footer">
              <span>Penerimaan terakhir</span>
            </div>
          </div>
        </section>

        <!-- TOOLBAR: FILTER & SEARCH -->
        <section class="white-card toolbar-card">
          <div class="search-box">
            <Search :size="16" class="search-icon-sm" />
            <input
              v-model="suratMasukStore.searchQuery"
              type="text"
              class="form-input search-input-sm"
              placeholder="Cari nomor surat, pengirim, perihal, keterangan, atau disposisi..."
            />
          </div>

          <div class="filters-row">
            <div class="filter-box">
              <label class="filter-label">Kode Arsip:</label>
              <select v-model="suratMasukStore.selectedJenis" class="filter-select">
                <option value="all">Semua Kode</option>
                <option v-for="j in suratMasukStore.jenisList" :key="j" :value="j">
                  {{ j }}
                </option>
              </select>
            </div>

            <div class="filter-box">
              <label class="filter-label">Pengirim:</label>
              <select v-model="suratMasukStore.selectedPengirim" class="filter-select">
                <option value="all">Semua Pengirim</option>
                <option v-for="p in suratMasukStore.pengirimList" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </div>

            <button
              v-if="suratMasukStore.searchQuery || suratMasukStore.selectedJenis !== 'all' || suratMasukStore.selectedPengirim !== 'all'"
              class="btn btn-secondary btn-sm"
              @click="suratMasukStore.searchQuery = ''; suratMasukStore.selectedJenis = 'all'; suratMasukStore.selectedPengirim = 'all'"
              title="Reset Filter"
            >
              Reset
            </button>
          </div>
        </section>

        <!-- DATA TABLE CARD -->
        <section class="white-card table-card">
          <div class="table-header-row">
            <div class="table-title">
              <FileSpreadsheet :size="18" class="text-teal" />
              <h3>Daftar Arsip Surat Masuk</h3>
            </div>
            <span class="badge badge-info">
              {{ suratMasukStore.filteredItems.length }} dari {{ suratMasukStore.totalSuratMasuk }} Surat
            </span>
          </div>

          <!-- Loading State -->
          <div v-if="suratMasukStore.loading && suratMasukStore.items.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Memuat data surat masuk dari Google Sheets...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="suratMasukStore.filteredItems.length === 0" class="empty-state">
            <Inbox :size="48" class="empty-icon" />
            <h4>Tidak ada data surat masuk ditemukan</h4>
            <p>Coba sesuaikan kata kunci pencarian atau tambahkan surat masuk baru.</p>
            <button class="btn btn-primary btn-sm" @click="openCreateModal">
              <Plus :size="15" /> Tambah Surat Masuk
            </button>
          </div>

          <!-- Responsive Table Container -->
          <div v-else class="table-container">
            <table class="styled-table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">No</th>
                  <th style="width: 85px;">Kode</th>
                  <th style="min-width: 220px;">Nomor Surat</th>
                  <th style="width: 120px;">Tgl Terima</th>
                  <th style="min-width: 180px;">Pengirim</th>
                  <th style="min-width: 200px;">Perihal & Ringkasan</th>
                  <th style="width: 130px;">Disposisi / Terusan</th>
                  <th style="width: 110px; text-align: center;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in suratMasukStore.filteredItems" :key="item.no">
                  <td class="font-mono text-center text-dim">{{ item.no }}</td>
                  <td>
                    <span class="badge-arsip" :class="item.jenis_pengarsipan === 'D4' ? 'arsip-d4' : item.jenis_pengarsipan === 'D5' ? 'arsip-d5' : 'arsip-default'">
                      {{ item.jenis_pengarsipan || '-' }}
                    </span>
                  </td>
                  <td>
                    <div class="nomor-surat-box">
                      <span class="nomor-text font-bold">{{ item.nomor_surat }}</span>
                      <button
                        class="btn-copy-sm"
                        @click="copyToClipboard(item.nomor_surat, `no-${item.no}`)"
                        title="Salin Nomor Surat"
                      >
                        <Check v-if="copiedNo === `no-${item.no}`" :size="12" class="text-success" />
                        <Copy v-else :size="12" />
                      </button>
                    </div>
                    <span class="tgl-surat-hint">Tgl Surat: {{ item.tgl_surat || '-' }}</span>
                  </td>
                  <td>
                    <span class="date-chip">
                      <Calendar :size="12" />
                      {{ item.tgl_diterima }}
                    </span>
                  </td>
                  <td>
                    <div class="pengirim-cell">
                      <Building2 :size="14" class="text-dim" />
                      <span class="pengirim-text">{{ item.pengirim }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="perihal-cell">
                      <span class="perihal-title">{{ item.isi_perihal }}</span>
                      <span v-if="item.keterangan && item.keterangan !== '-'" class="keterangan-sub">
                        {{ item.keterangan }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="disposisi-cell">
                      <span v-if="item.disposisi && item.disposisi !== '-'" class="badge badge-warning" title="Disposisi">
                        {{ item.disposisi }}
                      </span>
                      <span v-else class="text-dim">-</span>

                      <span v-if="item.terusan && item.terusan !== '-'" class="terusan-tag" title="Diteruskan">
                        &rarr; {{ item.terusan }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn-icon"
                        title="Lihat Detail Surat"
                        @click="openDetailModal(item)"
                      >
                        <Eye :size="15" />
                      </button>
                      <button
                        class="btn-icon"
                        title="Ubah Surat"
                        @click="openEditModal(item)"
                      >
                        <Edit2 :size="15" />
                      </button>
                      <button
                        class="btn-icon delete"
                        title="Hapus Surat"
                        @click="openDeleteModal(item)"
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
    </div>

    <!-- MODAL FORM CREATE / EDIT -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="isModalOpen = false">
      <div class="modal-card white-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon-circle">
              <FileText :size="18" />
            </div>
            <div>
              <h3>{{ isEditMode ? 'Ubah Data Surat Masuk' : 'Tambah Surat Masuk Baru' }}</h3>
              <p class="modal-subtitle">Isi data surat masuk ke dalam Sheet <code>surat-masuk</code></p>
            </div>
          </div>
          <button class="btn-close" @click="isModalOpen = false">
            <X :size="18" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-row two-cols">
            <div class="form-group">
              <label class="form-label">Jenis Pengarsipan (Kode Arsip) <span class="req">*</span></label>
              <input
                v-model="formData.jenis_pengarsipan"
                type="text"
                class="form-input"
                placeholder="Contoh: D4, D5"
                required
              />
              <div class="quick-chips">
                <span class="chip-suggest" @click="formData.jenis_pengarsipan = 'D4'">+ D4 (Undangan)</span>
                <span class="chip-suggest" @click="formData.jenis_pengarsipan = 'D5'">+ D5 (Pengesahan)</span>
                <span class="chip-suggest" @click="formData.jenis_pengarsipan = 'D1'">+ D1 (SK)</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Resmi Surat <span class="req">*</span></label>
              <input
                v-model="formData.nomor_surat"
                type="text"
                class="form-input font-mono"
                placeholder="264/PC/A/XXIV/7354/IV/26"
                required
              />
            </div>
          </div>

          <div class="form-row two-cols">
            <div class="form-group">
              <label class="form-label">Tanggal Diterima PAC <span class="req">*</span></label>
              <input
                v-model="formData.tgl_diterima"
                type="text"
                class="form-input font-mono"
                placeholder="dd/MM/yyyy (misal: 14/04/2026)"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Tertulis Surat <span class="req">*</span></label>
              <input
                v-model="formData.tgl_surat"
                type="text"
                class="form-input font-mono"
                placeholder="dd/MM/yyyy (misal: 13/04/2026)"
                required
              />
            </div>
          </div>

          <div class="form-row two-cols">
            <div class="form-group">
              <label class="form-label">Instansi / Lembaga Pengirim <span class="req">*</span></label>
              <input
                v-model="formData.pengirim"
                type="text"
                class="form-input"
                placeholder="PC IPNU Kab. Pekalongan"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Isi Perihal Surat <span class="req">*</span></label>
              <input
                v-model="formData.isi_perihal"
                type="text"
                class="form-input"
                placeholder="Undangan / Pengantar SP / Pemberitahuan"
                required
              />
            </div>
          </div>

          <div class="form-row two-cols">
            <div class="form-group">
              <label class="form-label">Terusan Surat (Jika Ada)</label>
              <input
                v-model="formData.terusan"
                type="text"
                class="form-input"
                placeholder="Departemen Kaderisasi / PR Simbang Wetan / -"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Disposisi Pimpinan (Jika Ada)</label>
              <input
                v-model="formData.disposisi"
                type="text"
                class="form-input"
                placeholder="Hadiri 2 pengurus / agendakan / -"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Keterangan / Catatan Agenda</label>
            <textarea
              v-model="formData.keterangan"
              rows="2"
              class="form-input textarea"
              placeholder="Undangan Koordinasi LAKUT dan DIKLATMAD..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="isModalOpen = false"
              :disabled="suratMasukStore.submitting"
            >
              Batal
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="suratMasukStore.submitting"
            >
              <span v-if="suratMasukStore.submitting" class="spinner"></span>
              <span v-else>{{ isEditMode ? 'Simpan Perubahan' : 'Tambah Surat' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DETAIL SURAT -->
    <div v-if="isDetailModalOpen && selectedItem" class="modal-backdrop" @click.self="isDetailModalOpen = false">
      <div class="modal-card detail-dialog white-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon-circle teal">
              <Inbox :size="18" />
            </div>
            <div>
              <h3>Lembar Informasi Surat Masuk</h3>
              <p class="modal-subtitle">No Urut: {{ selectedItem.no }} &bull; Kode Arsip: {{ selectedItem.jenis_pengarsipan }}</p>
            </div>
          </div>
          <button class="btn-close" @click="isDetailModalOpen = false">
            <X :size="18" />
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-header-card">
            <span class="detail-label">NOMOR RESMI SURAT</span>
            <div class="detail-nomor-row">
              <span class="detail-nomor-val font-mono">{{ selectedItem.nomor_surat }}</span>
              <button
                class="btn-copy-sm"
                @click="copyToClipboard(selectedItem.nomor_surat, 'detail-no')"
              >
                <Check v-if="copiedNo === 'detail-no'" :size="14" class="text-success" />
                <Copy v-else :size="14" />
              </button>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">PENGIRIM</span>
              <span class="detail-value font-semibold">{{ selectedItem.pengirim }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ISI PERIHAL</span>
              <span class="detail-value font-semibold text-primary">{{ selectedItem.isi_perihal }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">TANGGAL SURAT</span>
              <span class="detail-value font-mono">{{ selectedItem.tgl_surat || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">TANGGAL DITERIMA</span>
              <span class="detail-value font-mono">{{ selectedItem.tgl_diterima }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">DITERUSKAN KEPADA</span>
              <span class="detail-value">{{ selectedItem.terusan || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">DISPOSISI PIMPINAN</span>
              <span class="detail-value text-amber font-semibold">{{ selectedItem.disposisi || '-' }}</span>
            </div>
          </div>

          <div class="detail-full-item">
            <span class="detail-label">KETERANGAN / RINGKASAN AGENDA</span>
            <p class="detail-keterangan">{{ selectedItem.keterangan || '-' }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isDetailModalOpen = false">
            Tutup
          </button>
          <button class="btn btn-primary" @click="isDetailModalOpen = false; openEditModal(selectedItem)">
            <Edit2 :size="14" />
            <span>Ubah Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DELETE CONFIRMATION -->
    <div v-if="isDeleteModalOpen && selectedItem" class="modal-backdrop" @click.self="isDeleteModalOpen = false">
      <div class="modal-card modal-sm delete-card white-card">
        <div class="delete-icon-box">
          <Trash2 :size="28" />
        </div>
        <h3>Hapus Surat Masuk?</h3>
        <p class="modal-body-text">
          Apakah Anda yakin ingin menghapus surat masuk nomor:
        </p>
        <div class="delete-target-card">
          <span class="target-no font-mono">{{ selectedItem.nomor_surat }}</span>
          <span class="target-sub">{{ selectedItem.pengirim }} &bull; {{ selectedItem.isi_perihal }}</span>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="isDeleteModalOpen = false"
            :disabled="suratMasukStore.submitting"
          >
            Batal
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="confirmDelete"
            :disabled="suratMasukStore.submitting"
          >
            <span v-if="suratMasukStore.submitting" class="spinner"></span>
            <span v-else>Hapus Surat</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* APP SHELL LAYOUT (Identical to DashboardView) */
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-canvas);
  color: var(--text-main);
}

/* MOBILE NAVBAR */
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
  background: var(--primary-dark);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* SIDEBAR (Identical to DashboardView) */
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-dark);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(9, 44, 43, 0.25);
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
  text-decoration: none;
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
  font-weight: 700;
}

.menu-item.active .item-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
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

/* MAIN WRAPPER */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* TOPBAR */
.topbar {
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: transparent;
}

.search-bar {
  position: relative;
  width: 100%;
  max-width: 420px;
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
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary-dark);
  box-shadow: 0 0 0 3px rgba(9, 44, 43, 0.1);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.role-preview-box {
  display: flex;
  align-items: center;
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
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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

/* CONTENT BODY */
.content-body {
  padding: 0 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Toast */
.toast-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.25rem;
  border-radius: var(--radius-pill);
  box-shadow: 0 10px 25px -5px rgba(9, 44, 43, 0.2);
  font-size: 0.85rem;
  font-weight: 600;
}

/* Header Row */
.page-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.breadcrumb-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary-accent);
  background: var(--primary-light);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill);
  margin-bottom: 0.4rem;
  letter-spacing: 0.04em;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.page-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.page-desc code {
  background: rgba(9, 44, 43, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.header-action-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.add-btn {
  background: var(--primary-dark);
  color: #ffffff;
  padding: 0.65rem 1.25rem;
}

.add-btn:hover {
  background: var(--primary-dark-hover);
}

/* 4 PASTEL METRIC CARDS */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.pastel-card {
  padding: 1.35rem 1.25rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.pastel-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
}

.pastel-card.lime {
  background-color: var(--pastel-lime-bg);
  color: var(--pastel-lime-text);
}

.pastel-card.teal {
  background-color: var(--pastel-teal-bg);
  color: var(--pastel-teal-text);
}

.pastel-card.purple {
  background-color: var(--pastel-purple-bg);
  color: var(--pastel-purple-text);
}

.pastel-card.blue {
  background-color: #eff6ff;
  color: #1e40af;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.icon-circle.blue { background: #dbeafe; color: #2563eb; }

.card-category {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.85;
}

.card-middle {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 0.25rem 0;
}

.card-value {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
}

.card-value.text-compact {
  font-size: 1.35rem;
  font-family: var(--font-mono);
}

.sparkline-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
}

.sparkline-bars .bar {
  width: 6px;
  border-radius: 4px;
  background: currentColor;
  opacity: 0.35;
}

.sparkline-bars .bar.dark {
  opacity: 0.85;
}

.h-30 { height: 30%; }
.h-40 { height: 40%; }
.h-50 { height: 50%; }
.h-55 { height: 55%; }
.h-60 { height: 60%; }
.h-65 { height: 65%; }
.h-75 { height: 75%; }
.h-85 { height: 85%; }
.h-90 { height: 90%; }
.h-95 { height: 95%; }

.card-footer {
  font-size: 0.725rem;
  font-weight: 600;
  opacity: 0.9;
}

/* TOOLBAR & FILTER */
.toolbar-card {
  padding: 1.15rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon-sm {
  position: absolute;
  left: 0.9rem;
  color: var(--text-dim);
}

.search-input-sm {
  padding: 0.6rem 1rem 0.6rem 2.4rem;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

.filter-select {
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  font-size: 0.825rem;
  background-color: #ffffff;
  color: var(--text-main);
  outline: none;
  font-family: inherit;
}

.filter-select:focus {
  border-color: var(--primary-dark);
}

/* TABLE CARD */
.table-card {
  padding: 1.5rem;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-title h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  padding: 0.95rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.styled-table tr:hover td {
  background-color: #fcfefe;
}

/* Badges & Chips */
.badge-arsip {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-pill);
  font-size: 0.725rem;
  font-weight: 800;
  font-family: var(--font-mono);
}

.arsip-d4 {
  background: var(--pastel-purple-bg);
  color: var(--pastel-purple-text);
}

.arsip-d5 {
  background: var(--pastel-teal-bg);
  color: var(--pastel-teal-text);
}

.arsip-default {
  background: #eff6ff;
  color: #1e40af;
}

.nomor-surat-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nomor-text {
  color: var(--text-main);
}

.btn-copy-sm {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-dim);
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.btn-copy-sm:hover {
  background: #f1f5f9;
  color: var(--primary-dark);
}

.tgl-surat-hint {
  display: block;
  font-size: 0.725rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  font-family: var(--font-mono);
}

.date-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  background: #f1f5f9;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-sm);
  color: var(--text-main);
  white-space: nowrap;
  font-family: var(--font-mono);
}

.pengirim-cell {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pengirim-text {
  font-weight: 600;
  color: var(--text-main);
}

.perihal-cell {
  display: flex;
  flex-direction: column;
}

.perihal-title {
  font-weight: 700;
  color: var(--text-main);
}

.keterangan-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.disposisi-cell {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.terusan-tag {
  font-size: 0.725rem;
  color: #4338ca;
  background: #e0e7ff;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-pill);
  display: inline-block;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.btn-icon {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: #f1f8f7;
  color: var(--primary-dark);
  border-color: var(--primary-accent);
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

/* MODALS */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(9, 44, 43, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
}

.modal-card {
  width: 100%;
  max-width: 660px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-card.modal-sm {
  max-width: 440px;
}

.modal-card.detail-dialog {
  max-width: 620px;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-circle.teal {
  background: var(--pastel-teal-bg);
  color: var(--pastel-teal-text);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary-dark);
}

.modal-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
}

.btn-close:hover {
  background: #f1f8f7;
  color: var(--primary-dark);
}

.modal-form {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.req {
  color: #ef4444;
}

.quick-chips {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.chip-suggest {
  font-size: 0.7rem;
  background: #f1f8f7;
  color: var(--primary-dark);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-weight: 700;
  border: 1px solid rgba(9, 44, 43, 0.08);
}

.chip-suggest:hover {
  background: var(--primary-dark);
  color: #ffffff;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Detail Modal */
.detail-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}

.detail-header-card {
  background: #f8fbfa;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.detail-nomor-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.detail-nomor-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-main);
}

.detail-keterangan {
  font-size: 0.85rem;
  color: var(--text-main);
  background: #f8fbfa;
  padding: 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  margin-top: 0.35rem;
  line-height: 1.5;
}

/* Delete Modal */
.delete-card {
  padding: 1.75rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.delete-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-card h3 {
  font-size: 1.2rem;
  color: #881337;
}

.modal-body-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.delete-target-card {
  width: 100%;
  background: #fff5f5;
  border: 1px solid #fed7aa;
  border-radius: var(--radius-md);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.target-no {
  font-weight: 800;
  color: #be123c;
  font-size: 0.95rem;
}

.target-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  width: 100%;
  margin-top: 0.5rem;
}

/* States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: var(--text-dim);
  margin-bottom: 0.75rem;
}

.empty-state h4 {
  font-size: 1.05rem;
  margin-bottom: 0.35rem;
}

.empty-state p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

/* RESPONSIVE BREAKPOINTS (Mobile Friendly) */
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

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-row {
    width: 100%;
    justify-content: space-between;
  }

  .filter-box {
    flex: 1;
  }

  .filter-select {
    width: 100%;
  }

  .form-row.two-cols,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-card {
    max-width: 95vw;
  }
}

@media (min-width: 520px) and (max-width: 860px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
