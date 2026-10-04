import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { suratMasukService } from '@/services/suratMasukService'
import { GasApiError } from '@/services/gasClient'
import type {
  SuratMasuk,
  CreateSuratMasukPayload,
  UpdateSuratMasukPayload,
} from '@/types/suratMasuk'

export const useSuratMasukStore = defineStore('suratMasuk', () => {
  const items = ref<SuratMasuk[]>([])
  const loading = ref<boolean>(false)
  const submitting = ref<boolean>(false)
  const error = ref<string | null>(null)
  const searchQuery = ref<string>('')
  const selectedJenis = ref<string>('all')
  const selectedPengirim = ref<string>('all')

  // Getters
  const jenisList = computed(() => {
    const set = new Set<string>()
    items.value.forEach((item) => {
      if (item.jenis_pengarsipan && item.jenis_pengarsipan.trim()) {
        set.add(item.jenis_pengarsipan.trim())
      }
    })
    return Array.from(set).sort()
  })

  const pengirimList = computed(() => {
    const set = new Set<string>()
    items.value.forEach((item) => {
      if (item.pengirim && item.pengirim.trim()) {
        set.add(item.pengirim.trim())
      }
    })
    return Array.from(set).sort()
  })

  const filteredItems = computed(() => {
    return items.value.filter((item) => {
      const q = searchQuery.value.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.nomor_surat.toLowerCase().includes(q) ||
        item.pengirim.toLowerCase().includes(q) ||
        item.isi_perihal.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        item.jenis_pengarsipan.toLowerCase().includes(q) ||
        item.tgl_diterima.toLowerCase().includes(q) ||
        item.tgl_surat.toLowerCase().includes(q) ||
        item.terusan.toLowerCase().includes(q) ||
        item.disposisi.toLowerCase().includes(q)

      const matchJenis =
        selectedJenis.value === 'all' || item.jenis_pengarsipan === selectedJenis.value

      const matchPengirim =
        selectedPengirim.value === 'all' || item.pengirim === selectedPengirim.value

      return matchSearch && matchJenis && matchPengirim
    })
  })

  const totalSuratMasuk = computed(() => items.value.length)

  // 5 surat masuk terbaru berdasarkan urutan No descending
  const recentSuratMasuk = computed(() => {
    return [...items.value].sort((a, b) => b.no - a.no).slice(0, 5)
  })

  // Statistik jumlah surat per jenis arsip
  const statByJenis = computed(() => {
    const map: Record<string, number> = {}
    items.value.forEach((item) => {
      const j = item.jenis_pengarsipan || 'Lainnya'
      map[j] = (map[j] || 0) + 1
    })
    return map
  })

  // Actions
  async function fetchItems(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const res = await suratMasukService.list()
      items.value = res.data || []
    } catch (err: unknown) {
      if (err instanceof GasApiError) {
        error.value = err.message
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal memuat daftar surat masuk.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createItem(payload: CreateSuratMasukPayload): Promise<SuratMasuk> {
    submitting.value = true
    error.value = null

    try {
      const res = await suratMasukService.create(payload)
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
        error.value = 'Gagal menambahkan surat masuk.'
      }
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateItem(payload: UpdateSuratMasukPayload): Promise<SuratMasuk> {
    submitting.value = true
    error.value = null

    try {
      const res = await suratMasukService.update(payload)
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
        error.value = 'Gagal memperbarui surat masuk.'
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
      await suratMasukService.delete(no)
      items.value = items.value.filter((i) => i.no !== no)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Gagal menghapus surat masuk.'
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
    selectedJenis,
    selectedPengirim,
    jenisList,
    pengirimList,
    filteredItems,
    totalSuratMasuk,
    recentSuratMasuk,
    statByJenis,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
