<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertTriangle, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="not-found-wrapper">
    <div class="not-found-card white-card">
      <div class="icon-circle">
        <AlertTriangle :size="36" />
      </div>
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>Halaman yang Anda tuju tidak tersedia atau Anda tidak memiliki hak akses.</p>
      <button class="btn btn-primary" @click="router.push('/dashboard')">
        <Home :size="16" />
        <span>Kembali ke Dashboard</span>
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
  background-color: var(--bg-canvas);
}

.not-found-card {
  max-width: 440px;
  width: 100%;
  padding: 2.75rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef3c7;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 3.25rem;
  font-weight: 800;
  color: var(--primary-dark);
  line-height: 1;
}

h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

p {
  font-size: 0.875rem;
  color: var(--text-muted);
}
</style>
