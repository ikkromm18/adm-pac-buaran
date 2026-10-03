import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { kegiatanEksternalService } from '@/services/kegiatanEksternalService'
import { GasApiError } from '@/services/gasClient'
import type {
  KegiatanEksternal,
  CreateKegiatanEksternalPayload,
  UpdateKegiatanEksternalPayload,
} from '@/types/kegiatanEksternal'

export const useKegiatanEksternalStore = defineStore('kegiatanEksternal', () => {
  const items = ref<KegiatanEksternal[]>([])
  const loading = ref<boolean>(false)
  const submitting = ref<boolean>(false)
  const error = ref<string | null>(null)
  const searchQuery = ref<string>('')
  const selectedPelaksana = ref<string>('all')

  // Getters
  const pelaksanaList = computed(() => {
    const set = new Set<string>()
    items.value.forEach((item) => {
      if (item.pelaksana && item.pelaksana !== '-') {
        set.add(item.pelaksana)
      }
    })
    return Array.from(set)
  })

  const filteredItems = computed(() => {
    return items.value.filter((item) => {
      const q = searchQuery.value.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.nama_kegiatan.toLowerCase().includes(q) ||
        item.tempat.toLowerCase().includes(q) ||
        item.pelaksana.toLowerCase().includes(q) ||
        item.tanggal.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        item.delegasi_pac.toLowerCase().includes(q)

      const matchPelaksana =
        selectedPelaksana.value === 'all' || item.pelaksana === selectedPelaksana.value

      return matchSearch && matchPelaksana
    })
  })

  const totalKegiatan = computed(() => items.value.length)

  // Estimasi jumlah kehadiran delegasi terutus
  const totalDelegasiTerutus = computed(() => {
    let count = 0
    items.value.forEach((item) => {
      if (item.delegasi_pac && item.delegasi_pac !== '-') {
        const names = item.delegasi_pac.split(',').filter((n) => n.trim().length > 0)
        count += names.length || 1
      }
    })
    return count
  })

  // Actions
  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const res = await kegiatanEksternalService.list()
      items.value = res.data || []
    } catch (err: unknown) {
      if (err instanceof GasApiError) {
        error.value = err.message
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal memuat daftar kegiatan eksternal.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createItem(payload: CreateKegiatanEksternalPayload): Promise<KegiatanEksternal> {
    submitting.value = true
    error.value = null

    try {
      const res = await kegiatanEksternalService.create(payload)
      if (res.data) {
        items.value.push(res.data)
      } else {
        await fetchItems()
      }
      return res.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal menambahkan kegiatan eksternal.'
      }
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateItem(payload: UpdateKegiatanEksternalPayload): Promise<KegiatanEksternal> {
    submitting.value = true
    error.value = null

    try {
      const res = await kegiatanEksternalService.update(payload)
      const index = items.value.findIndex((i) => i.no === payload.no)
      if (index !== -1 && res.data) {
        items.value[index] = res.data
      } else {
        await fetchItems()
      }
      return res.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal memperbarui kegiatan eksternal.'
      }
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deleteItem(no: number): Promise<void> {
    submitting.value = true
    error.value = null

    try {
      await kegiatanEksternalService.delete(no)
      items.value = items.value.filter((i) => i.no !== no)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal menghapus kegiatan eksternal.'
      }
      throw err
    } finally {
      submitting.value = false
    }
  }

  return {
    items,
    loading,
    submitting,
    error,
    searchQuery,
    selectedPelaksana,
    pelaksanaList,
    filteredItems,
    totalKegiatan,
    totalDelegasiTerutus,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
