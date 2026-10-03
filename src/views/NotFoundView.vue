<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertTriangle, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="not-found-wrapper">
    <div class="not-found-card glass-panel">
      <div class="icon-circle">
        <AlertTriangle :size="40" />
      </div>
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.</p>
      <button class="btn btn-primary" @click="router.push('/')">
        <Home :size="18" />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: var(--bg-main);
}

.not-found-card {
  max-width: 440px;
  width: 100%;
  padding: 2.5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--accent-amber);
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
}

p {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>
