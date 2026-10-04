import { gasRequest } from './gasClient'
import type { ApiResponse } from '@/types/api'
import type {
  SuratMasuk,
  CreateSuratMasukPayload,
  UpdateSuratMasukPayload,
  DeleteSuratMasukPayload,
} from '@/types/suratMasuk'

/**
 * Service untuk operasi CRUD data surat masuk di Google Sheets (sheet: surat-masuk)
 */
export const suratMasukService = {
  /**
   * Mengambil seluruh data surat masuk
   */
  async list(): Promise<ApiResponse<SuratMasuk[]>> {
    return gasRequest<SuratMasuk[]>({
      action: 'surat_masuk_list',
      method: 'POST',
      body: {},
    })
  },

  /**
   * Menambah surat masuk baru
   */
  async create(payload: CreateSuratMasukPayload): Promise<ApiResponse<SuratMasuk>> {
    return gasRequest<SuratMasuk>({
      action: 'surat_masuk_create',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Mengubah data surat masuk berdasarkan nomor (no)
   */
  async update(payload: UpdateSuratMasukPayload): Promise<ApiResponse<SuratMasuk>> {
    return gasRequest<SuratMasuk>({
      action: 'surat_masuk_update',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },

  /**
   * Menghapus surat masuk dari sheet berdasarkan nomor (no)
   */
  async delete(no: number): Promise<ApiResponse<null>> {
    const payload: DeleteSuratMasukPayload = { no }
    return gasRequest<null>({
      action: 'surat_masuk_delete',
      method: 'POST',
      body: payload as unknown as Record<string, unknown>,
    })
  },
}
