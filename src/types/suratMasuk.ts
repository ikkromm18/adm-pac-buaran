export interface SuratMasuk {
  no: number
  jenis_pengarsipan: string
  nomor_surat: string
  tgl_diterima: string
  pengirim: string
  isi_perihal: string
  tgl_surat: string
  terusan: string
  disposisi: string
  keterangan: string
  _rowNumber?: number
}

export interface CreateSuratMasukPayload {
  jenis_pengarsipan: string
  nomor_surat: string
  tgl_diterima: string
  pengirim: string
  isi_perihal: string
  tgl_surat: string
  terusan?: string
  disposisi?: string
  keterangan?: string
}

export interface UpdateSuratMasukPayload {
  no: number
  jenis_pengarsipan: string
  nomor_surat: string
  tgl_diterima: string
  pengirim: string
  isi_perihal: string
  tgl_surat: string
  terusan?: string
  disposisi?: string
  keterangan?: string
}

export interface DeleteSuratMasukPayload {
  no: number
}
