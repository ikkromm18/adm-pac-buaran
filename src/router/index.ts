import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      guestOnly: true,
      title: 'Login Administrasi - PAC Buaran',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard - ADM PAC Buaran',
    },
  },
  {
    path: '/kegiatan-internal',
    name: 'KegiatanInternal',
    component: () => import('@/views/KegiatanInternalView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Kegiatan Internal - ADM PAC Buaran',
    },
  },
  {
    path: '/api-docs',
    name: 'ApiDocs',
    component: () => import('@/views/ApiDocsView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperAdmin: true,
      title: 'Dokumentasi API - ADM PAC Buaran',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Halaman Tidak Ditemukan - PAC Buaran',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Pastikan inisialisasi session check dari storage selesai
  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  // Update Page Title
  if (to.meta.title) {
    document.title = String(to.meta.title)
  }

  // Cek apakah route memerlukan auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  }

  // Cek jika route khusus guest (seperti login) tapi user sudah authenticated
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Cek jika route khusus superadmin tapi role user bukan superadmin
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
