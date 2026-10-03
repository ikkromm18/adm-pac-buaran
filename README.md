# ADM PAC Buaran - Front-End Portal

Sistem Administrasi Terpadu Pimpinan Anak Cabang (PAC) Buaran berbasis **Vue 3 + TypeScript (Vite)** yang terintegrasi langsung dengan backend serverless **Google Apps Script (GAS)** dan Google Sheets.

---

## 🚀 Fitur Utama
- **Autentikasi Aman:** Terintegrasi dengan endpoint Google Apps Script (`action=login`, `action=logout`, `action=me`).
- **Session Management:** Masa berlaku sesi 24 jam dengan update aktivitas otomatis.
- **CORS Mitigation:** Client HTTP khusus untuk mengatasi batasan CORS & preflight OPTIONS pada Google Apps Script.
- **State Management:** Pinia store terstruktur dengan TypeScript type safety penuh.
- **Routing & Guard:** Vue Router 4 dengan proteksi rute (`requiresAuth`, `guestOnly`).
- **Dokumentasi Lengkap:** Dokumen `PRD.md` dan halaman in-app `/api-docs`.

---

## 🛠️ Persyaratan Sistem
- Node.js `>= 18.x`
- npm `>= 9.x`

---

## 📦 Panduan Instalasi & Menjalankan

1. **Clone & Masuk ke Direktori:**
   ```bash
   cd adm-pac-buaran
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   File `.env` sudah dikonfigurasi:
   ```env
   VITE_GAS_DEPLOYMENT_ID=AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6
   VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbxMdrB-lsAMOFU4qdVg7ZTs88gPI8vGck-C9Y41zDx6/dev
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```

5. **Build Produksi:**
   ```bash
   npm run build
   ```

---

## 📚 Dokumentasi API & Backend
Dokumentasi lengkap skema database Google Sheets (`users`, `session`), parameter request, envelope response, dan panduan penambahan action baru tersedia di file [PRD.md](file:///home/muhammad-ikrom/adm-pac-buaran/PRD.md).
