# 📋 KODE GOOGLE APPS SCRIPT SIAP TEMPEL (CRUD KEGIATAN INTERNAL)

Dokumen ini berisi kode Google Apps Script siap salin-tempel (copy-paste) untuk mengelola sheet `kegiatan-internal` dengan fitur CRUD lengkap (Create, Read, Update, Delete).

---

## 1. Pembaruan pada `Config.gs`
Tambahkan konfigurasi nama sheet `kegiatan-internal` di dalam objek `CONFIG`.

```javascript
// Tambahkan baris KEGIATAN_INTERNAL_SHEET di dalam Config.gs
const CONFIG = {
  USERS_SHEET: 'users',
  SESSION_SHEET: 'session',
  KEGIATAN_INTERNAL_SHEET: 'kegiatan-internal', // <--- TAMBAHKAN INI

  SESSION_DURATION_HOURS: 24,

  USER_STATUS_ACTIVE: 'Active',

  SESSION_STATUS_ACTIVE: 'Active',
  SESSION_STATUS_EXPIRED: 'Expired',
  SESSION_STATUS_LOGGED_OUT: 'Logged Out',

  TIMEZONE: 'Asia/Jakarta'
};
```

---

## 2. Pembaruan pada `Code.gs`
Tambahkan 4 case baru di dalam fungsi `handleRequest_(e)` pada bagian `switch (action)`:

```javascript
      case 'me':

        return jsonResponse_(
          getCurrentUser_(e)
        );

      // ==========================================
      // ROUTER CRUD: KEGIATAN INTERNAL (TAMBAHKAN INI)
      // ==========================================
      case 'kegiatan_internal_list':

        return jsonResponse_(
          getKegiatanInternalList_(e)
        );

      case 'kegiatan_internal_create':

        return jsonResponse_(
          createKegiatanInternal_(e)
        );

      case 'kegiatan_internal_update':

        return jsonResponse_(
          updateKegiatanInternal_(e)
        );

      case 'kegiatan_internal_delete':

        return jsonResponse_(
          deleteKegiatanInternal_(e)
        );
      // ==========================================

      default:

        return jsonResponse_(
          responseError_(
            'Action tidak ditemukan.',
            404
          )
        );
```

---

## 3. File Baru: `KegiatanInternal.gs`
Buat file baru di Google Apps Script Editor bernama `KegiatanInternal.gs` dan tempel seluruh kode berikut:

```javascript
/**
 * ============================================================================
 * MODUL KEGIATAN INTERNAL - PAC BUARAN
 * Sheet: "kegiatan-internal"
 * Kolom:
 * 1: No
 * 2: Tanggal
 * 3: Tempat
 * 4: Nama Kegiatan
 * 5: Pelaksana
 * 6: Keterangan
 * 7: Jumlah Peserta
 * ============================================================================
 */

/**
 * Mendapatkan referensi Sheet kegiatan-internal
 */
function getKegiatanInternalSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.KEGIATAN_INTERNAL_SHEET || 'kegiatan-internal');

  if (!sheet) {
    throw new Error(
      'Sheet "' + (CONFIG.KEGIATAN_INTERNAL_SHEET || 'kegiatan-internal') + '" tidak ditemukan.'
    );
  }

  return sheet;
}

/**
 * 1. GET LIST: Mengambil seluruh data kegiatan internal
 * Action: ?action=kegiatan_internal_list
 * Method: GET / POST
 */
function getKegiatanInternalList_(e) {
  try {
    const sheet = getKegiatanInternalSheet_();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return responseSuccess_([], 'Data kegiatan internal masih kosong.');
    }

    const headers = data[0];
    const items = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Abaikan baris kosong jika kolom No atau Nama Kegiatan kosong
      if (!row[0] && !row[3]) continue;

      let formattedTanggal = row[1];
      if (row[1] instanceof Date) {
        formattedTanggal = Utilities.formatDate(
          row[1],
          CONFIG.TIMEZONE,
          'dd/MM/yyyy'
        );
      } else {
        formattedTanggal = String(row[1] || '').trim();
      }

      items.push({
        no: Number(row[0]) || (i),
        tanggal: formattedTanggal,
        tempat: String(row[2] || '').trim(),
        nama_kegiatan: String(row[3] || '').trim(),
        pelaksana: String(row[4] || '').trim(),
        keterangan: String(row[5] || '').trim(),
        jumlah_peserta: (row[6] !== '' && !isNaN(row[6])) ? Number(row[6]) : (row[6] ? String(row[6]).trim() : null),
        _rowNumber: i + 1
      });
    }

    return responseSuccess_(items, 'Data kegiatan internal berhasil diambil.');
  } catch (error) {
    console.error('Error in getKegiatanInternalList_:', error);
    return responseError_('Gagal memuat data kegiatan: ' + error.message, 500);
  }
}

/**
 * 2. CREATE: Menambah kegiatan internal baru
 * Action: POST ?action=kegiatan_internal_create
 * Body: {
 *   "tanggal": "15/08/2026",
 *   "tempat": "Kantor MWC NU Buaran",
 *   "nama_kegiatan": "Pendidikan Kader Pertama",
 *   "pelaksana": "Pengurus Harian",
 *   "keterangan": "Wajib diikuti calon kader",
 *   "jumlah_peserta": 45
 * }
 */
function createKegiatanInternal_(e) {
  try {
    const body = parseRequestBody_(e);

    const namaKegiatan = String(body.nama_kegiatan || '').trim();
    const tanggal = String(body.tanggal || '').trim();
    const tempat = String(body.tempat || '').trim();
    const pelaksana = String(body.pelaksana || '-').trim();
    const keterangan = String(body.keterangan || '-').trim();
    const jumlahPeserta = (body.jumlah_peserta !== undefined && body.jumlah_peserta !== '') ? body.jumlah_peserta : '';

    if (!namaKegiatan || !tanggal || !tempat) {
      return responseError_('Nama kegiatan, tanggal, dan tempat wajib diisi.', 422);
    }

    const sheet = getKegiatanInternalSheet_();
    const data = sheet.getDataRange().getValues();

    // Hitung nomor urut berikutnya berdasarkan nilai max kolom No
    let nextNo = 1;
    for (let i = 1; i < data.length; i++) {
      const currentNo = Number(data[i][0]);
      if (!isNaN(currentNo) && currentNo >= nextNo) {
        nextNo = currentNo + 1;
      }
    }

    sheet.appendRow([
      nextNo,
      tanggal,
      tempat,
      namaKegiatan,
      pelaksana,
      keterangan,
      jumlahPeserta
    ]);

    const createdItem = {
      no: nextNo,
      tanggal: tanggal,
      tempat: tempat,
      nama_kegiatan: namaKegiatan,
      pelaksana: pelaksana,
      keterangan: keterangan,
      jumlah_peserta: jumlahPeserta !== '' ? Number(jumlahPeserta) : null
    };

    return responseSuccess_(createdItem, 'Kegiatan internal berhasil ditambahkan.');
  } catch (error) {
    console.error('Error in createKegiatanInternal_:', error);
    return responseError_('Gagal menambah kegiatan: ' + error.message, 500);
  }
}

/**
 * 3. UPDATE: Mengubah data kegiatan internal
 * Action: POST ?action=kegiatan_internal_update
 * Body: {
 *   "no": 1,
 *   "tanggal": "12/04/2026",
 *   "tempat": "Gedung NU Simbang Kulon",
 *   "nama_kegiatan": "Rapat Tim Formatur Revisi",
 *   "pelaksana": "Tim Formatur",
 *   "keterangan": "Selesai",
 *   "jumlah_peserta": 12
 * }
 */
function updateKegiatanInternal_(e) {
  try {
    const body = parseRequestBody_(e);

    const targetNo = Number(body.no);
    if (!targetNo || isNaN(targetNo)) {
      return responseError_('Nomor kegiatan (no) valid wajib disertakan.', 422);
    }

    const namaKegiatan = String(body.nama_kegiatan || '').trim();
    const tanggal = String(body.tanggal || '').trim();
    const tempat = String(body.tempat || '').trim();
    const pelaksana = String(body.pelaksana || '-').trim();
    const keterangan = String(body.keterangan || '-').trim();
    const jumlahPeserta = (body.jumlah_peserta !== undefined && body.jumlah_peserta !== '') ? body.jumlah_peserta : '';

    if (!namaKegiatan || !tanggal || !tempat) {
      return responseError_('Nama kegiatan, tanggal, dan tempat wajib diisi.', 422);
    }

    const sheet = getKegiatanInternalSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1; // 1-based index di Google Sheets
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Kegiatan dengan nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    // Update Kolom 2 sampai Kolom 7
    sheet.getRange(targetRowIndex, 2).setValue(tanggal);
    sheet.getRange(targetRowIndex, 3).setValue(tempat);
    sheet.getRange(targetRowIndex, 4).setValue(namaKegiatan);
    sheet.getRange(targetRowIndex, 5).setValue(pelaksana);
    sheet.getRange(targetRowIndex, 6).setValue(keterangan);
    sheet.getRange(targetRowIndex, 7).setValue(jumlahPeserta);

    const updatedItem = {
      no: targetNo,
      tanggal: tanggal,
      tempat: tempat,
      nama_kegiatan: namaKegiatan,
      pelaksana: pelaksana,
      keterangan: keterangan,
      jumlah_peserta: jumlahPeserta !== '' ? Number(jumlahPeserta) : null
    };

    return responseSuccess_(updatedItem, 'Kegiatan internal berhasil diperbarui.');
  } catch (error) {
    console.error('Error in updateKegiatanInternal_:', error);
    return responseError_('Gagal memperbarui kegiatan: ' + error.message, 500);
  }
}

/**
 * 4. DELETE: Menghapus data kegiatan internal berdasarkan nomor
 * Action: POST ?action=kegiatan_internal_delete
 * Body: {
 *   "no": 1
 * }
 */
function deleteKegiatanInternal_(e) {
  try {
    const body = parseRequestBody_(e);

    const targetNo = Number(body.no);
    if (!targetNo || isNaN(targetNo)) {
      return responseError_('Nomor kegiatan (no) valid wajib disertakan.', 422);
    }

    const sheet = getKegiatanInternalSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Kegiatan dengan nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    sheet.deleteRow(targetRowIndex);

    return responseSuccess_(null, 'Kegiatan internal nomor ' + targetNo + ' berhasil dihapus.');
  } catch (error) {
    console.error('Error in deleteKegiatanInternal_:', error);
    return responseError_('Gagal menghapus kegiatan: ' + error.message, 500);
  }
}
```

---

## 4. Langkah Penerapan di Google Apps Script Editor
1. Buka [script.google.com](https://script.google.com).
2. Tambahkan `KEGIATAN_INTERNAL_SHEET: 'kegiatan-internal'` pada file `Config.gs`.
3. Tambahkan 4 case baru di dalam `switch (action)` pada file `Code.gs`.
4. Klik tombol **+ (Add a file)** &rarr; pilih **Script** &rarr; beri nama `KegiatanInternal`.
5. Tempel seluruh isi kode di atas ke dalam file `KegiatanInternal.gs`.
6. Simpan project (Ctrl+S / Cmd+S).
7. Klik **Deploy** &rarr; **Manage deployments** &rarr; edit versi aktif & pilih **New version** &rarr; klik **Deploy** (atau buat New Deployment Web app jika belum pernah).
