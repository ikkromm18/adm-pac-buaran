import { gasRequest } from './gasClient'
import type { ApiResponse } from '@/types/api'
import type {
  KegiatanEksternal,
  CreateKegiatanEksternalPayload,
  UpdateKegiatanEksternalPayload,
  DeleteKegiatanEksternalPayload,
} from '@/types/kegiatanEksternal'

/**
 * Service untuk operasi CRUD data kegiatan eksternal di Google Sheets (sheet: kegiatan-eksternal)
 */
export const kegiatanEksternalService = {
  /**
   * Mengambil seluruh data kegiatan eksternal
   */
  async list(): Promise<ApiResponse<KegiatanEksternal[]>> {
    return gasRequest<KegiatanEksternal[]>({
      action: 'kegiatan_eksternal_list',
      method: 'POST',
      body: {},
    })
  },

  /**
   * Menambah kegiatan eksternal baru
   */
  async create(payload: CreateKegiatanEksternalPayload): Promise<ApiResponse<KegiatanEksternal>> {
    return gasRequest<KegiatanEksternal>({
      action: 'kegiatan_eksternal_create',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Mengubah data kegiatan eksternal berdasarkan nomor kegiatan (no)
   */
  async update(payload: UpdateKegiatanEksternalPayload): Promise<ApiResponse<KegiatanEksternal>> {
    return gasRequest<KegiatanEksternal>({
      action: 'kegiatan_eksternal_update',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Menghapus kegiatan eksternal dari sheet berdasarkan nomor kegiatan (no)
   */
  async delete(no: number): Promise<ApiResponse<null>> {
    const payload: DeleteKegiatanEksternalPayload = { no }
    return gasRequest<null>({
      action: 'kegiatan_eksternal_delete',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },
}
