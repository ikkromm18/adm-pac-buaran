import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { kegiatanService } from '@/services/kegiatanService'
import { GasApiError } from '@/services/gasClient'
import type {
  KegiatanInternal,
  CreateKegiatanPayload,
  UpdateKegiatanPayload,
} from '@/types/kegiatan'

export const useKegiatanStore = defineStore('kegiatan', () => {
  const items = ref<KegiatanInternal[]>([])
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
        item.keterangan.toLowerCase().includes(q)

      const matchPelaksana =
        selectedPelaksana.value === 'all' || item.pelaksana === selectedPelaksana.value

      return matchSearch && matchPelaksana
    })
  })

  const totalKegiatan = computed(() => items.value.length)

  const totalPeserta = computed(() => {
    return items.value.reduce((acc, curr) => {
      const num = typeof curr.jumlah_peserta === 'number' ? curr.jumlah_peserta : Number(curr.jumlah_peserta)
      return acc + (!isNaN(num) && num > 0 ? num : 0)
    }, 0)
  })

  // Actions
  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const res = await kegiatanService.list()
      items.value = res.data || []
    } catch (err: unknown) {
      if (err instanceof GasApiError) {
        error.value = err.message
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal memuat daftar kegiatan internal.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createItem(payload: CreateKegiatanPayload): Promise<KegiatanInternal> {
    submitting.value = true
    error.value = null

    try {
      const res = await kegiatanService.create(payload)
      if (res.data) {
        // Tambahkan ke local state atau refresh
        items.value.push(res.data)
      } else {
        await fetchItems()
      }
      return res.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal menambahkan kegiatan internal.'
      }
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateItem(payload: UpdateKegiatanPayload): Promise<KegiatanInternal> {
    submitting.value = true
    error.value = null

    try {
      const res = await kegiatanService.update(payload)
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
        error.value = 'Gagal memperbarui kegiatan internal.'
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
      await kegiatanService.delete(no)
      items.value = items.value.filter((i) => i.no !== no)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal menghapus kegiatan internal.'
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
    totalPeserta,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
