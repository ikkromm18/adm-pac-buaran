import { gasRequest } from './gasClient'
import type { ApiResponse } from '@/types/api'
import type {
  KegiatanInternal,
  CreateKegiatanPayload,
  UpdateKegiatanPayload,
  DeleteKegiatanPayload,
} from '@/types/kegiatan'

/**
 * Service untuk operasi CRUD data kegiatan internal di Google Sheets
 */
export const kegiatanService = {
  /**
   * Mengambil seluruh data kegiatan internal
   */
  async list(): Promise<ApiResponse<KegiatanInternal[]>> {
    return gasRequest<KegiatanInternal[]>({
      action: 'kegiatan_internal_list',
      method: 'POST',
      body: {},
    })
  },

  /**
   * Menambah kegiatan internal baru
   */
  async create(payload: CreateKegiatanPayload): Promise<ApiResponse<KegiatanInternal>> {
    return gasRequest<KegiatanInternal>({
      action: 'kegiatan_internal_create',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Mengubah data kegiatan internal berdasarkan nomor kegiatan
   */
  async update(payload: UpdateKegiatanPayload): Promise<ApiResponse<KegiatanInternal>> {
    return gasRequest<KegiatanInternal>({
      action: 'kegiatan_internal_update',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Menghapus kegiatan internal dari sheet berdasarkan nomor kegiatan
   */
  async delete(no: number): Promise<ApiResponse<null>> {
    const payload: DeleteKegiatanPayload = { no }
    return gasRequest<null>({
      action: 'kegiatan_internal_delete',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },
}
