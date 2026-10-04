<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useKegiatanStore } from '@/stores/kegiatan'
import { useKegiatanEksternalStore } from '@/stores/kegiatanEksternal'
import { useSuratMasukStore } from '@/stores/suratMasuk'
import logoPacBuaran from '@/assets/logopacbuaran.webp'
import {
  LayoutDashboard,
  Calendar,
  Compass,
  Users,
  FileText,
  DollarSign,
  Settings,
  BookOpen,
  LogOut,
  Search,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Server,
  Key,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Inbox,
  Menu,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const kegiatanStore = useKegiatanStore()
const kegiatanEksternalStore = useKegiatanEksternalStore()
const suratMasukStore = useSuratMasukStore()

const isMobileMenuOpen = ref(false)
const tokenCopied = ref(false)
const selectedMonth = ref('Bulan Ini')
const searchQuery = ref('')

const gasApiUrl = import.meta.env.VITE_GAS_API_URL || ''
const gasDeploymentId = import.meta.env.VITE_GAS_DEPLOYMENT_ID || ''

onMounted(async () => {
  try {
    await Promise.all([
      kegiatanStore.fetchItems(),
      kegiatanEksternalStore.fetchItems(),
      suratMasukStore.fetchItems(),
    ])
  } catch (err) {
    console.error('Error fetching data:', err)
  }
})

// Role switcher for testing/demo
function toggleRolePreview() {
  if (authStore.isSuperAdmin) {
    authStore.setPreviewRole('admin')
  } else {
    authStore.setPreviewRole('superadmin')
  }
}

function resetRolePreview() {
  authStore.setPreviewRole(null)
}

function copyToken() {
  if (!authStore.token) return
  navigator.clipboard.writeText(authStore.token)
  tokenCopied.value = true
  setTimeout(() => {
    tokenCopied.value = false
  }, 2000)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

// 5 Kegiatan Terbaru
const recentKegiatan = computed(() => {
  const list = [...kegiatanStore.items]
  if (!searchQuery.value) return list.slice(0, 5)
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(
    (k) =>
      k.nama_kegiatan.toLowerCase().includes(q) ||
      k.tempat.toLowerCase().includes(q) ||
      k.pelaksana.toLowerCase().includes(q)
  ).slice(0, 5)
})
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
          <RouterLink to="/dashboard" class="menu-item active" @click="isMobileMenuOpen = false">
            <LayoutDashboard :size="18" />
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/kegiatan-internal" class="menu-item" @click="isMobileMenuOpen = false">
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
          <a href="#" class="menu-item disabled" title="Modul Pengurus">
            <Users :size="18" />
            <span>Data Pengurus</span>
          </a>
          <RouterLink to="/surat-masuk" class="menu-item" title="Modul Surat Masuk" @click="isMobileMenuOpen = false">
            <FileText :size="18" />
            <span>Surat Masuk</span>
            <span class="item-badge" v-if="suratMasukStore.totalSuratMasuk">{{ suratMasukStore.totalSuratMasuk }}</span>
          </RouterLink>
          <a href="#" class="menu-item disabled" title="Modul Keuangan">
            <DollarSign :size="18" />
            <span>Laporan Keuangan</span>
          </a>
        </div>

        <!-- SUPERADMIN ONLY MENU SECTION -->
        <div class="menu-group" v-if="authStore.isSuperAdmin">
          <span class="group-title superadmin-group">
            SISTEM & API (SUPERADMIN)
          </span>
          <RouterLink to="/api-docs" class="menu-item superadmin-link" @click="isMobileMenuOpen = false">
            <BookOpen :size="18" />
            <span>Dokumentasi API</span>
          </RouterLink>
          <a href="#gas-technical-panel" class="menu-item superadmin-link" @click="isMobileMenuOpen = false">
            <Server :size="18" />
            <span>Status Server GAS</span>
          </a>
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
        <!-- Search bar -->
        <div class="search-bar">
          <Search :size="17" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kegiatan, tanggal, atau pelaksana..."
            class="search-input"
          />
        </div>

        <!-- Right utility actions -->
        <div class="topbar-right">
          <!-- Role Switcher Pill for Preview / Testing -->
          <div class="role-preview-box">
            <span class="preview-label">Role Aktif:</span>
            <button
              class="btn-role-switch"
              :class="authStore.isSuperAdmin ? 'badge-purple' : 'badge-info'"
              @click="toggleRolePreview"
              title="Klik untuk beralih mode preview Superadmin vs Admin"
            >
              <ShieldAlert :size="14" />
              <span>{{ authStore.isSuperAdmin ? 'Superadmin' : 'Admin' }}</span>
              <span class="switch-hint">(Ganti)</span>
            </button>
            <button
              v-if="authStore.previewRoleOverride"
              class="btn-reset-preview"
              @click="resetRolePreview"
              title="Reset ke role asli spreadsheet"
            >
              Reset
            </button>
          </div>

          <!-- User badge -->
          <div class="user-profile-badge">
            <div class="avatar-circle">
              <span class="avatar-letter">
                {{ (authStore.user?.full_name || authStore.user?.username || 'U')[0].toUpperCase() }}
              </span>
            </div>
            <div class="user-names">
              <span class="full-name">{{ authStore.user?.full_name || authStore.user?.username }}</span>
              <span class="user-email-text">{{ authStore.user?.email || 'admin@pac-buaran.or.id' }}</span>
            </div>
          </div>

          <!-- Logout button -->
          <button class="btn btn-outline-danger btn-sm" @click="handleLogout" title="Keluar">
            <LogOut :size="16" />
          </button>
        </div>
      </header>

      <!-- DASHBOARD BODY CONTENT -->
      <main class="content-body">
        <!-- Welcome banner -->
        <div class="welcome-header">
          <div>
            <h1 class="welcome-title">
              Welcome {{ authStore.user?.full_name || authStore.user?.username }}!
            </h1>
            <p class="welcome-desc">
              Portal administrasi terpadu PAC IPNU IPPNU Kecamatan Buaran.
            </p>
          </div>
          <RouterLink to="/kegiatan-internal" class="btn btn-primary add-kegiatan-btn">
            <Plus :size="16" />
            <span>Tambah Kegiatan</span>
          </RouterLink>
        </div>

        <!-- 4 PASTEL METRIC CARDS (Matching Reference Layout) -->
        <section class="metrics-section">
          <div class="section-title-row">
            <h2>Statistik & Ikhtisar Kegiatan</h2>
            <div class="month-pill">
              <Calendar :size="14" />
              <span>{{ selectedMonth }}</span>
              <ChevronDown :size="14" />
            </div>
          </div>

          <div class="cards-grid">
            <!-- Card 1: Pastel Lime (Total Kegiatan) -->
            <div class="pastel-card lime">
              <div class="card-top">
                <div class="icon-circle lime">
                  <Calendar :size="16" />
                </div>
                <button class="more-btn"><MoreHorizontal :size="16" /></button>
              </div>
              <span class="card-category">Total Kegiatan</span>
              <div class="card-middle">
                <div class="card-value">{{ kegiatanStore.totalKegiatan }}</div>
                <!-- Mini Bar Sparkline SVG -->
                <div class="sparkline-bars">
                  <span class="bar h-40"></span>
                  <span class="bar h-60"></span>
                  <span class="bar h-75"></span>
                  <span class="bar h-100 dark"></span>
                </div>
              </div>
              <div class="card-footer">
                <TrendingUp :size="13" />
                <span>+2.5% Periode Ini</span>
              </div>
            </div>

            <!-- Card 2: Pastel Teal (Total Peserta) -->
            <div class="pastel-card teal">
              <div class="card-top">
                <div class="icon-circle teal">
                  <Users :size="16" />
                </div>
                <button class="more-btn"><MoreHorizontal :size="16" /></button>
              </div>
              <span class="card-category">Total Partisipan</span>
              <div class="card-middle">
                <div class="card-value">{{ kegiatanStore.totalPeserta || '125+' }}</div>
                <div class="sparkline-bars">
                  <span class="bar h-30"></span>
                  <span class="bar h-55"></span>
                  <span class="bar h-70"></span>
                  <span class="bar h-95 dark"></span>
                </div>
              </div>
              <div class="card-footer">
                <TrendingUp :size="13" />
                <span>Peserta Terdata</span>
              </div>
            </div>

            <!-- Card 3: Pastel Coral (Agenda Terjadwal) -->
            <div class="pastel-card pink">
              <div class="card-top">
                <div class="icon-circle pink">
                  <Clock :size="16" />
                </div>
                <button class="more-btn"><MoreHorizontal :size="16" /></button>
              </div>
              <span class="card-category">Agenda Terjadwal</span>
              <div class="card-middle">
                <div class="card-value">{{ kegiatanStore.totalKegiatan }}</div>
                <div class="sparkline-bars">
                  <span class="bar h-50"></span>
                  <span class="bar h-65"></span>
                  <span class="bar h-85 dark"></span>
                  <span class="bar h-40"></span>
                </div>
              </div>
              <div class="card-footer">
                <span>Sheet <code>kegiatan-internal</code></span>
              </div>
            </div>

            <!-- Card 4: Pastel Lavender (Pelaksana & Pengurus) -->
            <div class="pastel-card purple">
              <div class="card-top">
                <div class="icon-circle purple">
                  <Sparkles :size="16" />
                </div>
                <button class="more-btn"><MoreHorizontal :size="16" /></button>
              </div>
              <span class="card-category">Entitas Pelaksana</span>
              <div class="card-middle">
                <div class="card-value">{{ kegiatanStore.pelaksanaList.length || '3' }}</div>
                <div class="sparkline-bars">
                  <span class="bar h-40"></span>
                  <span class="bar h-60"></span>
                  <span class="bar h-80"></span>
                  <span class="bar h-100 dark"></span>
                </div>
              </div>
              <div class="card-footer">
                <span>Pengurus & Formatur</span>
              </div>
            </div>

            <!-- Card 5: Pastel Amber (Kegiatan Eksternal) -->
            <div class="pastel-card amber">
              <div class="card-top">
                <div class="icon-circle amber">
                  <Compass :size="16" />
                </div>
                <button class="more-btn" @click="router.push('/kegiatan-eksternal')" title="Buka Kegiatan Eksternal">
                  <ExternalLink :size="16" />
                </button>
              </div>
              <span class="card-category">Kegiatan Eksternal</span>
              <div class="card-middle">
                <div class="card-value">{{ kegiatanEksternalStore.totalKegiatan }}</div>
                <div class="sparkline-bars">
                  <span class="bar h-40"></span>
                  <span class="bar h-65"></span>
                  <span class="bar h-85 dark"></span>
                  <span class="bar h-55"></span>
                </div>
              </div>
              <div class="card-footer">
                <span>Delegasi PAC Buaran</span>
              </div>
            </div>

            <!-- Card 6: Pastel Sky Blue (Surat Masuk) -->
            <div class="pastel-card blue">
              <div class="card-top">
                <div class="icon-circle blue">
                  <Inbox :size="16" />
                </div>
                <button class="more-btn" @click="router.push('/surat-masuk')" title="Buka Surat Masuk">
                  <ExternalLink :size="16" />
                </button>
              </div>
              <span class="card-category">Surat Masuk</span>
              <div class="card-middle">
                <div class="card-value">{{ suratMasukStore.totalSuratMasuk }}</div>
                <div class="sparkline-bars">
                  <span class="bar h-50"></span>
                  <span class="bar h-70"></span>
                  <span class="bar h-95 dark"></span>
                  <span class="bar h-60"></span>
                </div>
              </div>
              <div class="card-footer">
                <span>Sheet <code>surat-masuk</code></span>
              </div>
            </div>
          </div>
        </section>

        <!-- ANALYTICS SECTION (Donut Chart & Bar Chart as in Reference) -->
        <section class="analytics-grid">
          <!-- Left: Donut Chart Report -->
          <div class="white-card chart-card">
            <div class="card-header">
              <h3>Distribusi Pelaksana Kegiatan</h3>
              <button class="more-btn"><MoreHorizontal :size="18" /></button>
            </div>

            <div class="donut-chart-container">
              <!-- SVG Donut Chart with callout labels matching reference -->
              <div class="donut-svg-wrapper">
                <svg viewBox="0 0 240 240" class="donut-svg">
                  <!-- Segments -->
                  <!-- Segment 1: Pengurus Harian (42%) -->
                  <circle
                    cx="120" cy="120" r="75"
                    fill="none"
                    stroke="#d9f5bd"
                    stroke-width="26"
                    stroke-dasharray="197 274"
                    stroke-dashoffset="0"
                  />
                  <!-- Segment 2: Tim Formatur (28%) -->
                  <circle
                    cx="120" cy="120" r="75"
                    fill="none"
                    stroke="#b8ede6"
                    stroke-width="26"
                    stroke-dasharray="131 340"
                    stroke-dashoffset="-197"
                  />
                  <!-- Segment 3: Rapat Pleno (18%) -->
                  <circle
                    cx="120" cy="120" r="75"
                    fill="none"
                    stroke="#ffdada"
                    stroke-width="26"
                    stroke-dasharray="84 387"
                    stroke-dashoffset="-328"
                  />
                  <!-- Segment 4: Lainnya (12%) -->
                  <circle
                    cx="120" cy="120" r="75"
                    fill="none"
                    stroke="#e1deff"
                    stroke-width="26"
                    stroke-dasharray="56 415"
                    stroke-dashoffset="-412"
                  />
                </svg>

                <!-- Center text in donut -->
                <div class="donut-center-text">
                  <span class="center-sub">Total</span>
                  <span class="center-val">{{ kegiatanStore.totalKegiatan || '4' }}</span>
                </div>

                <!-- Callout percentage badge pills -->
                <div class="callout-badge p-42">42%</div>
                <div class="callout-badge p-28">28%</div>
                <div class="callout-badge p-18">18%</div>
                <div class="callout-badge p-12">12%</div>
              </div>

              <!-- Donut Legend -->
              <div class="donut-legend">
                <div class="legend-item">
                  <span class="legend-dot lime"></span>
                  <span>Pengurus Harian</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot teal"></span>
                  <span>Tim Formatur</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot pink"></span>
                  <span>Pleno Gabungan</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot purple"></span>
                  <span>Lainnya</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bar Chart Overview -->
          <div class="white-card chart-card">
            <div class="card-header">
              <h3>Ikhtisar Aktivitas Kegiatan</h3>
              <div class="month-pill sm">
                <span>2026</span>
              </div>
            </div>

            <div class="barchart-container">
              <!-- Bar chart illustration with striped patterns and active tooltip -->
              <div class="bars-wrapper">
                <!-- SVG Patterns for striped bars -->
                <svg width="0" height="0">
                  <defs>
                    <pattern id="stripe-orange" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#fbd38d" stroke-width="3" />
                    </pattern>
                    <pattern id="stripe-purple" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#d6bcfa" stroke-width="3" />
                    </pattern>
                    <pattern id="stripe-green" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#9ae6b4" stroke-width="3" />
                    </pattern>
                    <pattern id="stripe-teal" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#81e6d9" stroke-width="3" />
                    </pattern>
                    <pattern id="stripe-pink" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#feb2b2" stroke-width="3" />
                    </pattern>
                  </defs>
                </svg>

                <!-- Floating Tooltip Pill (as in reference) -->
                <div class="floating-tooltip">
                  <span class="tooltip-date">Apr 2026</span>
                  <span class="tooltip-amount">4 Kegiatan</span>
                </div>

                <!-- Vertical Pill Bars -->
                <div class="bar-col">
                  <div class="pill-track">
                    <div class="pill-fill bar-striped-orange" style="height: 40%;"></div>
                  </div>
                  <span class="col-label">Jan</span>
                </div>

                <div class="bar-col">
                  <div class="pill-track">
                    <div class="pill-fill bar-striped-purple" style="height: 55%;"></div>
                  </div>
                  <span class="col-label">Feb</span>
                </div>

                <div class="bar-col">
                  <div class="pill-track">
                    <div class="pill-fill bar-striped-pink" style="height: 65%;"></div>
                  </div>
                  <span class="col-label">Mar</span>
                </div>

                <div class="bar-col active-col">
                  <div class="pill-track active-track">
                    <div class="pill-fill bar-striped-green" style="height: 85%;"></div>
                  </div>
                  <span class="col-label font-bold">Apr</span>
                </div>

                <div class="bar-col">
                  <div class="pill-track">
                    <div class="pill-fill bar-striped-teal" style="height: 70%;"></div>
                  </div>
                  <span class="col-label">Mei</span>
                </div>

                <div class="bar-col">
                  <div class="pill-track">
                    <div class="pill-fill bar-striped-pink" style="height: 75%;"></div>
                  </div>
                  <span class="col-label">Jun</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- RECENT KEGIATAN LIST (Matching reference "Recent Sales List") -->
        <section class="white-card recent-list-card">
          <div class="list-header">
            <div>
              <h3>Daftar Kegiatan Terbaru</h3>
              <p class="list-sub">Agenda rapat dan kegiatan kepengurusan PAC</p>
            </div>
            <div class="list-header-actions">
              <RouterLink to="/kegiatan-internal" class="btn btn-secondary btn-sm">
                <span>Kelola Semua (CRUD)</span>
                <ArrowRight :size="14" />
              </RouterLink>
            </div>
          </div>

          <div class="table-container">
            <table class="styled-table">
              <thead>
                <tr>
                  <th style="width: 50px;">No</th>
                  <th style="width: 120px;">Tanggal</th>
                  <th>Nama Kegiatan</th>
                  <th>Tempat</th>
                  <th>Pelaksana</th>
                  <th style="width: 110px; text-align: center;">Peserta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recentKegiatan" :key="item.no">
                  <td class="font-mono text-dim">{{ item.no }}</td>
                  <td>
                    <span class="date-chip">
                      <Calendar :size="12" />
                      {{ item.tanggal }}
                    </span>
                  </td>
                  <td>
                    <span class="activity-name">{{ item.nama_kegiatan }}</span>
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
                  <td style="text-align: center;">
                    <span v-if="item.jumlah_peserta" class="badge badge-info">
                      {{ item.jumlah_peserta }} org
                    </span>
                    <span v-else class="text-dim">-</span>
                  </td>
                </tr>
                <tr v-if="recentKegiatan.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    Belum ada data kegiatan internal.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- RECENT SURAT MASUK LIST -->
        <section class="white-card recent-list-card">
          <div class="list-header">
            <div>
              <h3>Daftar Surat Masuk Terbaru</h3>
              <p class="list-sub">Arsip nomor surat, instansi pengirim, dan disposisi terdaftar</p>
            </div>
            <div class="list-header-actions">
              <RouterLink to="/surat-masuk" class="btn btn-secondary btn-sm">
                <span>Kelola Surat Masuk</span>
                <ArrowRight :size="14" />
              </RouterLink>
            </div>
          </div>

          <div class="table-container">
            <table class="styled-table">
              <thead>
                <tr>
                  <th style="width: 50px;">No</th>
                  <th style="width: 80px;">Kode</th>
                  <th>Nomor Surat</th>
                  <th style="width: 120px;">Tgl Terima</th>
                  <th>Pengirim</th>
                  <th>Perihal</th>
                  <th>Disposisi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="surat in suratMasukStore.recentSuratMasuk" :key="surat.no">
                  <td class="font-mono text-dim">{{ surat.no }}</td>
                  <td>
                    <span class="badge badge-info font-mono">{{ surat.jenis_pengarsipan || '-' }}</span>
                  </td>
                  <td>
                    <span class="font-bold text-main">{{ surat.nomor_surat }}</span>
                  </td>
                  <td>{{ surat.tgl_diterima }}</td>
                  <td>{{ surat.pengirim }}</td>
                  <td>{{ surat.isi_perihal }}</td>
                  <td>
                    <span v-if="surat.disposisi && surat.disposisi !== '-'" class="badge badge-warning">
                      {{ surat.disposisi }}
                    </span>
                    <span v-else class="text-dim">-</span>
                  </td>
                </tr>
                <tr v-if="suratMasukStore.recentSuratMasuk.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">
                    Belum ada data surat masuk dari sheet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ============================================================ -->
        <!-- SUPERADMIN ONLY TECHNICAL SECTION                            -->
        <!-- Sembunyikan sepenuhnya dari role 'admin'                     -->
        <!-- ============================================================ -->
        <section
          v-if="authStore.isSuperAdmin"
          id="gas-technical-panel"
          class="superadmin-section white-card"
        >
          <div class="superadmin-header">
            <div class="superadmin-badge-title">
              <Server :size="20" class="text-purple" />
              <div>
                <h3>Informasi Teknis & Backend GAS</h3>
                <span class="superadmin-sub">
                  Panel khusus <strong>Superadmin</strong>. Disembunyikan sepenuhnya dari user role Admin biasa.
                </span>
              </div>
            </div>
            <RouterLink to="/api-docs" class="btn btn-secondary btn-sm">
              <BookOpen :size="14" />
              <span>Buka Dokumentasi API Lengkap</span>
            </RouterLink>
          </div>

          <div class="superadmin-grid">
            <!-- GAS Deployment Info -->
            <div class="tech-box">
              <div class="tech-box-title">
                <Server :size="16" />
                <span>Endpoint Google Apps Script</span>
              </div>
              <div class="tech-row">
                <span class="tech-label">Deployment ID:</span>
                <span class="tech-value font-mono">{{ gasDeploymentId || 'Belum diatur' }}</span>
              </div>
              <div class="tech-row">
                <span class="tech-label">Base API URL:</span>
                <a :href="gasApiUrl" target="_blank" rel="noopener noreferrer" class="tech-link">
                  <span class="url-text">{{ gasApiUrl }}</span>
                  <ExternalLink :size="12" />
                </a>
              </div>
              <div class="tech-row">
                <span class="tech-label">CORS Mitigation:</span>
                <span class="badge badge-success">text/plain;charset=utf-8</span>
              </div>
            </div>

            <!-- Active Session Token Technical -->
            <div class="tech-box">
              <div class="tech-box-title">
                <Key :size="16" />
                <span>Autentikasi Session Aktif</span>
              </div>
              <div class="tech-row">
                <span class="tech-label">Session ID:</span>
                <span class="tech-value font-mono">{{ authStore.session?.session_id || 'SES-ACTIVE' }}</span>
              </div>
              <div class="tech-row">
                <span class="tech-label">Session Token:</span>
                <div class="token-container">
                  <span class="token-text font-mono">
                    {{ authStore.token ? authStore.token.slice(0, 18) + '...' : 'Tidak ada token' }}
                  </span>
                  <button v-if="authStore.token" class="btn-copy-token" @click="copyToken" title="Salin Token">
                    <Check v-if="tokenCopied" :size="13" />
                    <Copy v-else :size="13" />
                  </button>
                </div>
              </div>
              <div class="tech-row">
                <span class="tech-label">Kedaluwarsa:</span>
                <span class="tech-value">{{ authStore.session?.expires_at || '24 Jam' }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* APP SHELL LAYOUT */
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-canvas);
  color: var(--text-main);
}

/* LEFT SIDEBAR */
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

/* Active Menu Pill matching reference */
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
  gap: 0.45rem;
  font-size: 0.8rem;
}

.preview-label {
  color: var(--text-muted);
  font-weight: 500;
}

.btn-role-switch {
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  font-family: inherit;
  transition: transform 0.15s;
}

.btn-role-switch:hover {
  transform: scale(1.03);
}

.switch-hint {
  font-size: 0.65rem;
  opacity: 0.7;
}

.btn-reset-preview {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.725rem;
  text-decoration: underline;
  cursor: pointer;
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
  gap: 2rem;
}

.welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.welcome-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.add-kegiatan-btn {
  background: var(--primary-dark);
  color: #ffffff;
  padding: 0.7rem 1.4rem;
}

/* 4 PASTEL CARDS SECTION */
.metrics-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title-row h2 {
  font-size: 1.15rem;
  font-weight: 700;
}

.month-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  background: #ffffff;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.month-pill.sm {
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
}

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

.pastel-card.pink {
  background-color: var(--pastel-pink-bg);
  color: var(--pastel-pink-text);
}

.pastel-card.purple {
  background-color: var(--pastel-purple-bg);
  color: var(--pastel-purple-text);
}

.pastel-card.amber {
  background-color: var(--pastel-amber-bg);
  color: var(--pastel-amber-text);
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
.icon-circle.pink { background: var(--pastel-pink-accent); color: var(--pastel-pink-text); }
.icon-circle.purple { background: var(--pastel-purple-accent); color: var(--pastel-purple-text); }
.icon-circle.amber { background: var(--pastel-amber-accent); color: var(--pastel-amber-text); }
.icon-circle.blue { background: #dbeafe; color: #2563eb; }

.more-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  color: inherit;
  display: flex;
  align-items: center;
}

.more-btn:hover {
  opacity: 1;
}

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

.sparkline-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 32px;
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
.h-70 { height: 70%; }
.h-75 { height: 75%; }
.h-80 { height: 80%; }
.h-85 { height: 85%; }
.h-95 { height: 95%; }
.h-100 { height: 100%; }

.card-footer {
  font-size: 0.725rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.9;
}

/* ANALYTICS SECTION (Donut & Bar Chart) */
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.card-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
}

/* Donut Chart Layout */
.donut-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
  justify-content: center;
}

.donut-svg-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.center-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.center-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
}

/* Floating Percentage Badges */
.callout-badge {
  position: absolute;
  background: #ffffff;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.725rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.callout-badge.p-42 { top: 75%; left: 15%; color: #27561a; }
.callout-badge.p-28 { top: 22%; left: 10%; color: #0e544d; }
.callout-badge.p-18 { top: 15%; right: 15%; color: #7d2424; }
.callout-badge.p-12 { top: 65%; right: 10%; color: #393478; }

.donut-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.lime { background: #a3e635; }
.legend-dot.teal { background: #2dd4bf; }
.legend-dot.pink { background: #fb7185; }
.legend-dot.purple { background: #c084fc; }

/* Bar Chart Layout */
.barchart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem 0.5rem 0.5rem;
}

.bars-wrapper {
  position: relative;
  width: 100%;
  height: 190px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

/* Floating Tooltip Pill */
.floating-tooltip {
  position: absolute;
  top: -20px;
  left: 60%;
  transform: translateX(-50%);
  background: var(--primary-dark);
  color: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 18px rgba(9, 44, 43, 0.25);
  z-index: 10;
}

.floating-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: var(--primary-dark) transparent transparent;
}

.tooltip-date {
  font-size: 0.65rem;
  opacity: 0.75;
}

.tooltip-amount {
  font-size: 0.85rem;
  font-weight: 800;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  justify-content: flex-end;
}

.pill-track {
  width: 100%;
  max-width: 48px;
  height: 160px;
  background: #f1f8f7;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  padding: 2px;
}

.pill-track.active-track {
  background: #e6f6f3;
  box-shadow: 0 0 0 2px var(--primary-dark);
}

.pill-fill {
  width: 100%;
  border-radius: var(--radius-pill);
  transition: height 0.3s ease;
}

/* Diagonal Striped Patterns */
.bar-striped-orange { background: url(#stripe-orange), #fef3c7; }
.bar-striped-purple { background: url(#stripe-purple), #f3e8ff; }
.bar-striped-green  { background: url(#stripe-green), #dcfce7; }
.bar-striped-teal   { background: url(#stripe-teal), #ccfbf1; }
.bar-striped-pink   { background: url(#stripe-pink), #ffe4e6; }

.col-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.font-bold {
  font-weight: 800;
  color: var(--primary-dark);
}

/* RECENT LIST CARD */
.recent-list-card {
  padding: 1.5rem;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.list-header h3 {
  font-size: 1.1rem;
}

.list-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.table-container {
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
  padding: 0.95rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.styled-table tr:hover td {
  background-color: #fcfefe;
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

.activity-name {
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

/* SUPERADMIN TECHNICAL PANEL */
.superadmin-section {
  padding: 1.75rem;
  border: 1px solid #ddd6fe;
  background: #faf5ff;
}

.superadmin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ede9fe;
  flex-wrap: wrap;
  gap: 1rem;
}

.superadmin-badge-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.superadmin-badge-title h3 {
  font-size: 1.15rem;
  color: #5b21b6;
}

.superadmin-sub {
  font-size: 0.8rem;
  color: #7c3aed;
}

.superadmin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.tech-box {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid #ede9fe;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.tech-box-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: #5b21b6;
  border-bottom: 1px solid #f3e8ff;
  padding-bottom: 0.5rem;
}

.tech-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.825rem;
}

.tech-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.tech-value {
  color: var(--text-main);
  text-align: right;
  word-break: break-all;
}

.tech-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #7c3aed;
  max-width: 200px;
}

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-container {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.token-text {
  background: #f3e8ff;
  color: #6b21a8;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.btn-copy-token {
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  color: #6b21a8;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-copy-token:hover {
  background: #ddd6fe;
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

  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-header .add-kegiatan-btn {
    width: 100%;
    justify-content: center;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .recent-list-card {
    padding: 1.15rem;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .list-header-actions {
    width: 100%;
  }

  .list-header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .superadmin-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 520px) and (max-width: 860px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
