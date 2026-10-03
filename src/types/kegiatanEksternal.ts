export interface KegiatanEksternal {
  no: number
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana: string
  keterangan: string
  delegasi_pac: string
  _rowNumber?: number
}

export interface CreateKegiatanEksternalPayload {
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana?: string
  keterangan?: string
  delegasi_pac?: string
}

export interface UpdateKegiatanEksternalPayload {
  no: number
  tanggal: string
  tempat: string
  nama_kegiatan: string
  pelaksana?: string
  keterangan?: string
  delegasi_pac?: string
}

export interface DeleteKegiatanEksternalPayload {
  no: number
}
