export interface KegiatanInternal {
  no: number
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana: string
  keterangan: string
  jumlah_peserta: number | string | null
  _rowNumber?: number
}

export interface CreateKegiatanPayload {
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana?: string
  keterangan?: string
  jumlah_peserta?: number | string | null
}

export interface UpdateKegiatanPayload {
  no: number
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana?: string
  keterangan?: string
  jumlah_peserta?: number | string | null
}

export interface DeleteKegiatanPayload {
  no: number
}
