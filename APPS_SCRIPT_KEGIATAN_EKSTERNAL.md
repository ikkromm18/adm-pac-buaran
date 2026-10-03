# 📋 KODE GOOGLE APPS SCRIPT SIAP TEMPEL (CRUD KEGIATAN EKSTERNAL)

Dokumen ini berisi kode Google Apps Script siap salin-tempel (copy-paste) untuk mengelola sheet baru **`kegiatan-eksternal`** dengan fitur CRUD lengkap (Create, Read, Update, Delete).

---

## 1. Pembaruan pada `Config.gs`
Tambahkan baris `KEGIATAN_EKSTERNAL_SHEET` di dalam objek `CONFIG`:

```javascript
const CONFIG = {
  USERS_SHEET: 'users',
  SESSION_SHEET: 'session',
  KEGIATAN_INTERNAL_SHEET: 'kegiatan-internal',
  KEGIATAN_EKSTERNAL_SHEET: 'kegiatan-eksternal', // <--- TAMBAHKAN INI

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
      // ==========================================
      // ROUTER CRUD: KEGIATAN EKSTERNAL (TAMBAHKAN INI)
      // ==========================================
      case 'kegiatan_eksternal_list':

        return jsonResponse_(
          getKegiatanEksternalList_(e)
        );

      case 'kegiatan_eksternal_create':

        return jsonResponse_(
          createKegiatanEksternal_(e)
        );

      case 'kegiatan_eksternal_update':

        return jsonResponse_(
          updateKegiatanEksternal_(e)
        );

      case 'kegiatan_eksternal_delete':

        return jsonResponse_(
          deleteKegiatanEksternal_(e)
        );
      // ==========================================
```

---

## 3. File Baru di Apps Script: `KegiatanEksternal.gs`
Buat file baru di Google Apps Script Editor (**+ > Script**) beri nama `KegiatanEksternal` dan tempel seluruh kode berikut:

```javascript
/**
 * ============================================================================
 * MODUL KEGIATAN EKSTERNAL - PAC BUARAN
 * Sheet: "kegiatan-eksternal"
 * Kolom:
 * 1: No
 * 2: Tanggal
 * 3: Tempat
 * 4: Nama Kegiatan
 * 5: Pelaksana
 * 6: Keterangan
 * 7: Delegasi PAC
 * ============================================================================
 */

/**
 * Mendapatkan referensi Sheet kegiatan-eksternal
 */
function getKegiatanEksternalSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.KEGIATAN_EKSTERNAL_SHEET || 'kegiatan-eksternal');

  if (!sheet) {
    throw new Error(
      'Sheet "' + (CONFIG.KEGIATAN_EKSTERNAL_SHEET || 'kegiatan-eksternal') + '" tidak ditemukan.'
    );
  }

  return sheet;
}

/**
 * 1. GET LIST: Mengambil seluruh data kegiatan eksternal
 * Action: ?action=kegiatan_eksternal_list
 * Method: GET / POST
 */
function getKegiatanEksternalList_(e) {
  try {
    const sheet = getKegiatanEksternalSheet_();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return responseSuccess_([], 'Data kegiatan eksternal masih kosong.');
    }

    const items = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Abaikan baris kosong jika kolom No dan Nama Kegiatan kosong
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
        no: Number(row[0]) || i,
        tanggal: formattedTanggal,
        tempat: String(row[2] || '').trim(),
        nama_kegiatan: String(row[3] || '').trim(),
        pelaksana: String(row[4] || '').trim(),
        keterangan: String(row[5] || '').trim(),
        delegasi_pac: String(row[6] || '').trim(),
        _rowNumber: i + 1
      });
    }

    return responseSuccess_(items, 'Data kegiatan eksternal berhasil diambil.');
  } catch (error) {
    console.error('Error in getKegiatanEksternalList_:', error);
    return responseError_('Gagal memuat data kegiatan eksternal: ' + error.message, 500);
  }
}

/**
 * 2. CREATE: Menambah kegiatan eksternal baru
 * Action: POST ?action=kegiatan_eksternal_create
 * Body: {
 *   "tanggal": "14/04/2026",
 *   "tempat": "Gedung PC NU Kab Pekalongan",
 *   "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD",
 *   "pelaksana": "PC IPNU Kab. Pekalongan",
 *   "keterangan": "Menghadiri",
 *   "delegasi_pac": "Heri, Lintang"
 * }
 */
function createKegiatanEksternal_(e) {
  try {
    const body = parseRequestBody_(e);

    const namaKegiatan = String(body.nama_kegiatan || '').trim();
    const tanggal = String(body.tanggal || '').trim();
    const tempat = String(body.tempat || '').trim();
    const pelaksana = String(body.pelaksana || '-').trim();
    const keterangan = String(body.keterangan || '-').trim();
    const delegasiPac = String(body.delegasi_pac || '-').trim();

    if (!namaKegiatan || !tanggal || !tempat) {
      return responseError_('Nama kegiatan, tanggal, dan tempat wajib diisi.', 422);
    }

    const sheet = getKegiatanEksternalSheet_();
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
      delegasiPac
    ]);

    const createdItem = {
      no: nextNo,
      tanggal: tanggal,
      tempat: tempat,
      nama_kegiatan: namaKegiatan,
      pelaksana: pelaksana,
      keterangan: keterangan,
      delegasi_pac: delegasiPac
    };

    return responseSuccess_(createdItem, 'Kegiatan eksternal berhasil ditambahkan.');
  } catch (error) {
    console.error('Error in createKegiatanEksternal_:', error);
    return responseError_('Gagal menambah kegiatan eksternal: ' + error.message, 500);
  }
}

/**
 * 3. UPDATE: Mengubah data kegiatan eksternal berdasarkan nomor
 * Action: POST ?action=kegiatan_eksternal_update
 * Body: {
 *   "no": 1,
 *   "tanggal": "14/04/2026",
 *   "tempat": "Gedung PC NU Kab Pekalongan",
 *   "nama_kegiatan": "Rapat Koordinasi LAKUT dan DIKLATMAD (Revisi)",
 *   "pelaksana": "PC IPNU Kab. Pekalongan",
 *   "keterangan": "Menghadiri",
 *   "delegasi_pac": "Heri, Lintang, M. Ikrom"
 * }
 */
function updateKegiatanEksternal_(e) {
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
    const delegasiPac = String(body.delegasi_pac || '-').trim();

    if (!namaKegiatan || !tanggal || !tempat) {
      return responseError_('Nama kegiatan, tanggal, dan tempat wajib diisi.', 422);
    }

    const sheet = getKegiatanEksternalSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1; // 1-based index
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Kegiatan eksternal nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    // Update Kolom 2 sampai Kolom 7
    sheet.getRange(targetRowIndex, 2).setValue(tanggal);
    sheet.getRange(targetRowIndex, 3).setValue(tempat);
    sheet.getRange(targetRowIndex, 4).setValue(namaKegiatan);
    sheet.getRange(targetRowIndex, 5).setValue(pelaksana);
    sheet.getRange(targetRowIndex, 6).setValue(keterangan);
    sheet.getRange(targetRowIndex, 7).setValue(delegasiPac);

    const updatedItem = {
      no: targetNo,
      tanggal: tanggal,
      tempat: tempat,
      nama_kegiatan: namaKegiatan,
      pelaksana: pelaksana,
      keterangan: keterangan,
      delegasi_pac: delegasiPac
    };

    return responseSuccess_(updatedItem, 'Kegiatan eksternal berhasil diperbarui.');
  } catch (error) {
    console.error('Error in updateKegiatanEksternal_:', error);
    return responseError_('Gagal memperbarui kegiatan eksternal: ' + error.message, 500);
  }
}

/**
 * 4. DELETE: Menghapus data kegiatan eksternal berdasarkan nomor
 * Action: POST ?action=kegiatan_eksternal_delete
 * Body: {
 *   "no": 1
 * }
 */
function deleteKegiatanEksternal_(e) {
  try {
    const body = parseRequestBody_(e);

    const targetNo = Number(body.no);
    if (!targetNo || isNaN(targetNo)) {
      return responseError_('Nomor kegiatan (no) valid wajib disertakan.', 422);
    }

    const sheet = getKegiatanEksternalSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Kegiatan eksternal nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    sheet.deleteRow(targetRowIndex);

    return responseSuccess_(null, 'Kegiatan eksternal nomor ' + targetNo + ' berhasil dihapus.');
  } catch (error) {
    console.error('Error in deleteKegiatanEksternal_:', error);
    return responseError_('Gagal menghapus kegiatan eksternal: ' + error.message, 500);
  }
}
```

---

## 4. Langkah Penerapan di Apps Script Editor
1. Buka [script.google.com](https://script.google.com).
2. Tambahkan `KEGIATAN_EKSTERNAL_SHEET: 'kegiatan-eksternal'` di `Config.gs`.
3. Tambahkan 4 router case di `Code.gs`.
4. Buat file baru `KegiatanEksternal.gs` dan tempel kode di atas.
5. Klik **Deploy** &rarr; **Manage deployments** &rarr; edit Web App aktif &rarr; pilih **New version** &rarr; klik **Deploy**.
