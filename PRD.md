# Product Requirements Document (PRD) & API Documentation
**Project Name:** ADM PAC Buaran - Administration Portal  
**Document Version:** 1.0.0  
**Status:** In Progress / Initial Setup  
**Last Updated:** 2026-10-04  

---

## 1. Executive Summary & Architecture Overview

### 1.1 Purpose
Aplikasi Front-End Web berbasis **Vue 3 + TypeScript** untuk sistem administrasi PAC Buaran. Sistem ini menggunakan **Google Apps Script (GAS)** sebagai backend serverless dengan Google Sheets sebagai database persistensi.

### 1.2 Tech Stack
- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Build Tool:** Vite + TypeScript
- **State Management:** Pinia (Typed state & actions)
- **Routing:** Vue Router 4 (dengan Navigation Guard Auth & Role-based Access)
- **HTTP Client:** Fetch API / Axios dengan custom wrapper untuk kompatibilitas Google Apps Script
- **CSS / UI:** Modern CSS (Design Tokens, Responsive Grid/Flexbox, Glassmorphism, Micro-animations)
- **Icons:** Lucide Icons / Heroicons

---

## 2. Google Apps Script Integration & Technical Constraints

Sebagai Senior Engineer, integrasi Front-End SPA dengan Google Apps Script Web App memiliki karakteristik khusus yang wajib ditangani dengan tepat:

### 2.1 Critical Caveat: CORS & Preflight (OPTIONS Request)
1. **Masalah:** Google Apps Script **tidak mendukung HTTP OPTIONS preflight request**. Jika Front-End mengirim header `Content-Type: application/json`, browser akan memicu CORS preflight `OPTIONS` yang akan gagal (405 Method Not Allowed / CORS blocked).
2. **Solusi Standar Industri:**
   - Gunakan `Content-Type: text/plain;charset=utf-8` saat mengirim POST request.
   - Script backend pada `Utility.gs` membaca `e.postData.contents` dan memanggil `JSON.parse()`. Karena backend hanya membaca raw string, `text/plain` akan melewati CORS preflight tanpa error dan body tetap ter-parse sebagai JSON utuh.

### 2.2 HTTP 302 Redirect Handling
- Google Apps Script mengeksekusi request dan mengembalikan respons melalui redirect HTTP 302 ke domain `script.googleusercontent.com`.
- Client HTTP (`fetch` atau `axios`) harus mendukung penelusuran redirect (`redirect: 'follow'`).

### 2.3 Perbedaan Krusial `/dev` vs `/exec` & Cara Deployment yang Benar
- **URL `/dev` (Test Deployment):**
  - Hanya dapat diakses oleh akun Google pemilik script yang sedang login di sesi browser yang sama.
  - **DIBLOKIR untuk akses CORS / Fetch dari aplikasi web eksternal (termasuk localhost)**. Google akan merespons dengan HTTP `401 Unauthorized` yang memicu browser memblokir request karena tidak adanya header CORS.
- **URL `/exec` (Production / Versioned Deployment):**
  - **Wajib digunakan untuk API Front-End**.
  - Agar dapat dipanggil oleh browser tanpa 401 / CORS block, konfigurasi deployment di Apps Script **HARUS**:
    1. Klik tombol **Deploy** (Terapkan) -> **New deployment** (Penerapan baru).
    2. Pilih tipe: **Web app** (Aplikasi web).
    3. **Execute as**: `Me (email Anda)`
    4. **Who has access**: `Anyone` (Siapa saja, bahkan anonim) &larr; **KUNCI UTAMA!**
    5. Klik **Deploy** dan salin URL berakhiran `/exec`.
  - Format endpoint query: `${API_BASE_URL}?action=${action}`

---

## 3. Database Schema (Google Sheets)

Aplikasi backend menggunakan dua sheet utama pada Google Spreadsheet:

### 3.1 Sheet `users`
| Index / Kolom | Field Name | Data Type | Keterangan |
|---|---|---|---|
| Kolom 1 | `user_id` | String | Unique Identifier user |
| Kolom 2 | `username` | String | Username login (case-insensitive) |
| Kolom 3 | `email` | String | Alamat email user |
| Kolom 4 | `full_name` | String | Nama lengkap user |
| Kolom 5 | `password_hash`| String | SHA-256 hash password |
| Kolom 6 | `role` | String | Peran user (misal: `admin`, `pengurus`, dll.) |
| Kolom 7 | `status` | String | Status user (`Active`, `Inactive`) |
| Kolom 8 | `last_login` | Datetime | Format `yyyy-MM-dd HH:mm:ss` (WIB) |
| Kolom 9 | `created_at` | Datetime | Format `yyyy-MM-dd HH:mm:ss` (WIB) |
| Kolom 10| `updated_at` | Datetime | Format `yyyy-MM-dd HH:mm:ss` (WIB) |

### 3.2 Sheet `session`
| Index / Kolom | Field Name | Data Type | Keterangan |
|---|---|---|---|
| Kolom 1 | `session_id` | String | Format: `SES-YYYYMMDD-XXXXXX` |
| Kolom 2 | `user_id` | String | Relasi ke `users.user_id` |
| Kolom 3 | `ip_address` | String | IP client (default 'unknown' pada GAS) |
| Kolom 4 | `user_agent` | String | User Agent browser |
| Kolom 5 | `session_token`| String | Token autentikasi: `tok_<uuid1><uuid2>` |
| Kolom 6 | `login_time` | Datetime | Format `yyyy-MM-dd HH:mm:ss` (WIB) |
| Kolom 7 | `last_activity`| Datetime | Waktu interaksi terakhir |
| Kolom 8 | `expires_at` | Datetime | Expired (Default: 24 jam) |
| Kolom 9 | `status` | String | `Active`, `Expired`, `Logged Out` |

### 3.3 Sheet `kegiatan-internal`
| Index / Kolom | Field Name | Data Type | Keterangan |
|---|---|---|---|
| Kolom 1 | `No` | Number | Nomor urut kegiatan (Auto-increment / ID) |
| Kolom 2 | `Tanggal` | String / Date | Format tanggal kegiatan: `DD/MM/YYYY` |
| Kolom 3 | `Tempat` | String | Lokasi pelaksanaan kegiatan |
| Kolom 4 | `Nama Kegiatan` | String | Judul / nama kegiatan resmi |
| Kolom 5 | `Pelaksana` | String | Tim / bagian pelaksana (contoh: `Pengurus Harian`, `Tim Formatur`) |
| Kolom 6 | `Keterangan` | String | Catatan atau deskripsi kegiatan |
| Kolom 7 | `Jumlah Peserta`| Number / String | Estimasi / realisasi jumlah peserta hadir |

### 3.4 Sheet `kegiatan-eksternal`
| Index / Kolom | Field Name | Data Type | Keterangan |
|---|---|---|---|
| Kolom 1 | `No` | Number | Nomor urut kegiatan (Auto-increment / ID) |
| Kolom 2 | `Tanggal` | String / Date | Format tanggal kegiatan: `DD/MM/YYYY` |
| Kolom 3 | `Tempat` | String | Lokasi pelaksanaan kegiatan |
| Kolom 4 | `Nama Kegiatan` | String | Judul kegiatan yang diselenggarakan pihak luar |
| Kolom 5 | `Pelaksana` | String | Instansi / organisasi penyelenggara eksternal (contoh: `PC IPNU Kab. Pekalongan`) |
| Kolom 6 | `Keterangan` | String | Catatan kegiatan / delegasi (contoh: `Menghadiri`) |
| Kolom 7 | `Delegasi PAC` | String | Nama pengurus PAC yang diutus hadir (contoh: `Heri, Lintang`) |

---

## 4. API Specification & Documentation

Base URL format:
```
{VITE_GAS_API_URL}?action={ACTION_NAME}
```

Format Envelope Standard Response:
```json
// Berhasil
{
  "success": true,
  "message": "Deskripsi pesan sukses",
  "data": { ... }
}

// Gagal
{
  "success": false,
  "message": "Deskripsi pesan kesalahan",
  "statusCode": 400,
  "data": null
}
```

---

### Endpoint 1: Login
Melakukan verifikasi akun user dan membuat sesi aktif baru selama 24 jam.

- **Method:** `POST`
- **Query Parameter:** `action=login`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "username": "ikrom.admin",
  "password": "admin123",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "user_id": "USR-001",
      "username": "ikrom.admin",
      "email": "ikrom@example.com",
      "full_name": "Muhammad Ikrom",
      "role": "admin",
      "status": "Active"
    },
    "session": {
      "session_id": "SES-20261004-984321",
      "session_token": "tok_e2b9c3f4a1...9b2d",
      "login_time": "2026-10-04 02:30:00",
      "expires_at": "2026-10-05 02:30:00"
    }
  }
}
```

#### Response Error Kemungkinan:
- `422`: Username dan password wajib diisi.
- `401`: Username atau password salah.
- `403`: Akun tidak aktif.

---

### Endpoint 2: Get Current User / Verify Session (`me`)
Memvalidasi session token yang tersimpan di client, memperbarui `last_activity`, dan mengembalikan profil pengguna aktif.

- **Method:** `POST`
- **Query Parameter:** `action=me`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "session_token": "tok_e2b9c3f4a1...9b2d"
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Session valid.",
  "data": {
    "user": {
      "user_id": "USR-001",
      "username": "ikrom.admin",
      "email": "ikrom@example.com",
      "full_name": "Muhammad Ikrom",
      "role": "admin",
      "status": "Active"
    },
    "session": {
      "session_id": "SES-20261004-984321",
      "login_time": "2026-10-04 02:30:00",
      "last_activity": "2026-10-04 03:15:22",
      "expires_at": "2026-10-05 02:30:00"
    }
  }
}
```

#### Response Error Kemungkinan:
- `401`: Session token wajib diisi / Session tidak aktif / Session telah expired.
- `404`: Session tidak ditemukan / User tidak ditemukan.

---

### Endpoint 3: Logout
Mengakhiri sesi pengguna aktif dan menandai status session menjadi `Logged Out`.

- **Method:** `POST`
- **Query Parameter:** `action=logout`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "session_token": "tok_e2b9c3f4a1...9b2d"
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}
```

#### Response Error Kemungkinan:
- `401`: Session token wajib diisi.
- `404`: Session tidak ditemukan.

---

### Endpoint 4: List Kegiatan Internal
Mengambil daftar seluruh agenda kegiatan internal dari sheet `kegiatan-internal`.

- **Method:** `GET` atau `POST`
- **Query Parameter:** `action=kegiatan_internal_list`
- **Headers:** `Content-Type: text/plain;charset=utf-8`

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Data kegiatan internal berhasil diambil.",
  "data": [
    {
      "no": 1,
      "tanggal": "12/04/2026",
      "tempat": "Gedung NU Simbang Kulon",
      "nama_kegiatan": "Rapat Tim Formatur",
      "pelaksana": "Tim Formatur",
      "keterangan": "-",
      "jumlah_peserta": null
    },
    {
      "no": 2,
      "tanggal": "28/04/2026",
      "tempat": "MWC NU Kecamatan Buaran",
      "nama_kegiatan": "Rapat Harian",
      "pelaksana": "Pengurus Harian",
      "keterangan": "Perkenalan Pengurus Harian dan Penyatuan Visi ke depan",
      "jumlah_peserta": null
    }
  ]
}
```

---

### Endpoint 5: Tambah Kegiatan Internal (Create)
Menambahkan baris kegiatan baru pada sheet `kegiatan-internal`. Nomor urut (`No`) akan digenerate otomatis.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_internal_create`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "tanggal": "15/08/2026",
  "tempat": "Kantor MWC NU Buaran",
  "nama_kegiatan": "Pendidikan Kader Pertama",
  "pelaksana": "Pengurus Harian",
  "keterangan": "Wajib diikuti calon kader",
  "jumlah_peserta": 45
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan internal berhasil ditambahkan.",
  "data": {
    "no": 5,
    "tanggal": "15/08/2026",
    "tempat": "Kantor MWC NU Buaran",
    "nama_kegiatan": "Pendidikan Kader Pertama",
    "pelaksana": "Pengurus Harian",
    "keterangan": "Wajib diikuti calon kader",
    "jumlah_peserta": 45
  }
}
```

---

### Endpoint 6: Ubah Kegiatan Internal (Update)
Memperbarui rincian kegiatan berdasarkan `no`.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_internal_update`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "no": 1,
  "tanggal": "12/04/2026",
  "tempat": "Gedung NU Simbang Kulon",
  "nama_kegiatan": "Rapat Tim Formatur (Revisi)",
  "pelaksana": "Tim Formatur",
  "keterangan": "Selesai dilaksanakan",
  "jumlah_peserta": 15
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan internal berhasil diperbarui.",
  "data": {
    "no": 1,
    "tanggal": "12/04/2026",
    "tempat": "Gedung NU Simbang Kulon",
    "nama_kegiatan": "Rapat Tim Formatur (Revisi)",
    "pelaksana": "Tim Formatur",
    "keterangan": "Selesai dilaksanakan",
    "jumlah_peserta": 15
  }
}
```

---

### Endpoint 7: Hapus Kegiatan Internal (Delete)
Menghapus baris kegiatan dari spreadsheet berdasarkan `no`.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_internal_delete`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "no": 1
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan internal nomor 1 berhasil dihapus.",
  "data": null
}
```

---

### Endpoint 8: List Kegiatan Eksternal
Mengambil daftar seluruh agenda kegiatan eksternal dari sheet `kegiatan-eksternal`.

- **Method:** `GET` atau `POST`
- **Query Parameter:** `action=kegiatan_eksternal_list`
- **Headers:** `Content-Type: text/plain;charset=utf-8`

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Data kegiatan eksternal berhasil diambil.",
  "data": [
    {
      "no": 1,
      "tanggal": "14/04/2026",
      "tempat": "Gedung PC NU Kab Pekalongan",
      "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
      "pelaksana": "PC IPNU Kab. Pekalongan",
      "keterangan": "Menghadiri",
      "delegasi_pac": "Heri, Lintang"
    }
  ]
}
```

---

### Endpoint 9: Tambah Kegiatan Eksternal (Create)
Menambahkan kegiatan eksternal baru ke dalam sheet `kegiatan-eksternal`. Nomor urut (`no`) digenerate otomatis.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_eksternal_create`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "tanggal": "14/04/2026",
  "tempat": "Gedung PC NU Kab Pekalongan",
  "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
  "pelaksana": "PC IPNU Kab. Pekalongan",
  "keterangan": "Menghadiri",
  "delegasi_pac": "Heri, Lintang"
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan eksternal berhasil ditambahkan.",
  "data": {
    "no": 1,
    "tanggal": "14/04/2026",
    "tempat": "Gedung PC NU Kab Pekalongan",
    "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
    "pelaksana": "PC IPNU Kab. Pekalongan",
    "keterangan": "Menghadiri",
    "delegasi_pac": "Heri, Lintang"
  }
}
```

---

### Endpoint 10: Ubah Kegiatan Eksternal (Update)
Memperbarui baris kegiatan eksternal berdasarkan `no`.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_eksternal_update`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "no": 1,
  "tanggal": "14/04/2026",
  "tempat": "Gedung PC NU Kab Pekalongan",
  "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD (Revisi)",
  "pelaksana": "PC IPNU Kab. Pekalongan",
  "keterangan": "Menghadiri",
  "delegasi_pac": "Heri, Lintang, M. Ikrom"
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan eksternal berhasil diperbarui.",
  "data": {
    "no": 1,
    "tanggal": "14/04/2026",
    "tempat": "Gedung PC NU Kab Pekalongan",
    "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD (Revisi)",
    "pelaksana": "PC IPNU Kab. Pekalongan",
    "keterangan": "Menghadiri",
    "delegasi_pac": "Heri, Lintang, M. Ikrom"
  }
}
```

---

### Endpoint 11: Hapus Kegiatan Eksternal (Delete)
Menghapus baris kegiatan eksternal berdasarkan `no`.

- **Method:** `POST`
- **Query Parameter:** `action=kegiatan_eksternal_delete`
- **Headers:** `Content-Type: text/plain;charset=utf-8`
- **Request Body (JSON string):**
```json
{
  "no": 1
}
```

#### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Kegiatan eksternal nomor 1 berhasil dihapus.",
  "data": null
}
```

---

## 5. Panduan Menambahkan Endpoint Baru (Untuk Developer / User)

Setiap ada penambahan fitur di Google Apps Script (misalnya CRUD surat, keuangan, anggota, kegiatan), silakan ikuti template berikut untuk mendokumentasikannya di bagian bawah dokumen ini:

```markdown
### Endpoint: [Nama Action / Fitur]
[Deskripsi singkat fungsi endpoint]

- **Method:** `GET` / `POST`
- **Query Parameter:** `action=[nama_action]`
- **Headers:** `Content-Type: text/plain;charset=utf-8` (untuk POST)
- **Request Body / Parameters:**
```json
{
  "session_token": "tok_xxx",
  "payload_field": "value"
}
```
- **Response Structure:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```
```

---

## 6. Environment Variables Configuration

File `.env` di front-end akan dikonfigurasi dengan format:
```env
# Google Apps Script Deployment ID
VITE_GAS_DEPLOYMENT_ID=AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6

# Full Base API URL Google Apps Script
VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6/dev

# Production Base API URL (Gunakan jika sudah deploy versioned /exec)
# VITE_GAS_API_URL_PROD=https://script.google.com/macros/s/AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6/exec
```

---

## 7. Frontend Architecture Plan

```
src/
├── assets/             # Brand identity, icons, SVG
├── components/         # Reusable UI components (Modal, Button, Input, Card, Navbar)
├── layouts/            # AuthLayout, DashboardLayout
├── router/             # Vue Router index + navigation guards
├── services/           # GAS API client & modules (api.ts, authService.ts)
├── stores/             # Pinia stores (useAuthStore.ts)
├── types/              # TypeScript definitions (auth.ts, api.ts, user.ts)
├── views/              # Pages (LoginView.vue, DashboardView.vue, NotFoundView.vue)
├── App.vue             # Root component
├── main.ts             # App entry point
└── style.css           # Design tokens, variables & typography
```
