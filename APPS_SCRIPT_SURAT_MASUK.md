# 📋 KODE GOOGLE APPS SCRIPT SIAP TEMPEL (CRUD SURAT MASUK)

Dokumen ini berisi kode Google Apps Script siap salin-tempel (copy-paste) untuk mengelola sheet baru **`surat-masuk`** dengan fitur CRUD lengkap (Create, Read, Update, Delete) yang terhubung langsung dengan front-end ADM PAC Buaran.

---

## 1. Struktur Kolom Sheet `surat-masuk`

Pastikan sheet di Google Spreadsheet Anda memiliki nama sheet **`surat-masuk`** dengan header di Baris 1:

| Kolom | Nama Kolom | Contoh Data | Keterangan |
|---|---|---|---|
| A (1) | `No` | 1 | Nomor urut angka (otomatis bertambah) |
| B (2) | `jenis_pengarsipan` | D4 | Kode klasifikasi arsip (misal: D4, D5, dll.) |
| C (3) | `nomor_surat` | 264/PC/A/XXIV/7354/IV/26 | Nomor resmi surat yang tertera pada surat |
| D (4) | `tgl_diterima` | 13/04/2026 | Tanggal surat diterima oleh pengurus PAC |
| E (5) | `pengirim` | PC IPNU Kab. Pekalongan | Instansi / lembaga / perorangan pengirim |
| F (6) | `isi_perihal` | Undangan | Pokok / perihal surat |
| G (7) | `tgl_surat` | 13/04/2026 | Tanggal penulisan surat |
| H (8) | `terusan` | - | Diteruskan kepada siapa (Departemen/Lembaga) |
| I (9) | `disposisi` | - | Instruksi / disposisi Ketua / Sekretaris |
| J (10) | `keterangan` | Undangan Koordinasi LAKUT dan DIKLATMAD | Catatan tambahan ringkasan agenda |

---

## 2. Pembaruan pada `Config.gs`

Buka file **`Config.gs`** di Google Apps Script Editor dan tambahkan konfigurasi `SURAT_MASUK_SHEET`:

```javascript
const CONFIG = {
  USERS_SHEET: 'users',
  SESSION_SHEET: 'session',
  KEGIATAN_INTERNAL_SHEET: 'kegiatan-internal',
  KEGIATAN_EKSTERNAL_SHEET: 'kegiatan-eksternal',
  SURAT_MASUK_SHEET: 'surat-masuk', // <--- TAMBAHKAN INI

  SESSION_DURATION_HOURS: 24,

  USER_STATUS_ACTIVE: 'Active',

  SESSION_STATUS_ACTIVE: 'Active',
  SESSION_STATUS_EXPIRED: 'Expired',
  SESSION_STATUS_LOGGED_OUT: 'Logged Out',

  TIMEZONE: 'Asia/Jakarta'
};
```

---

## 3. Pembaruan pada `Code.gs`

Buka file **`Code.gs`** di Apps Script Editor, cari fungsi `handleRequest_(e)` pada blok `switch (action)`, lalu tambahkan 4 case router untuk modul surat masuk berikut:

```javascript
      // ==========================================
      // ROUTER CRUD: SURAT MASUK (TAMBAHKAN INI)
      // ==========================================
      case 'surat_masuk_list':

        return jsonResponse_(
          getSuratMasukList_(e)
        );

      case 'surat_masuk_create':

        return jsonResponse_(
          createSuratMasuk_(e)
        );

      case 'surat_masuk_update':

        return jsonResponse_(
          updateSuratMasuk_(e)
        );

      case 'surat_masuk_delete':

        return jsonResponse_(
          deleteSuratMasuk_(e)
        );
      // ==========================================
```

---

## 4. File Baru: `SuratMasuk.gs`

Di Google Apps Script Editor:
1. Klik tanda **+** di sebelah tulisan **Files** > pilih **Script**.
2. Beri nama file: `SuratMasuk` (akan otomatis menjadi `SuratMasuk.gs`).
3. Hapus function bawaan `myFunction()`, lalu tempel seluruh kode di bawah ini:

```javascript
/**
 * ============================================================================
 * MODUL SURAT MASUK - ADM PAC BUARAN
 * Sheet: "surat-masuk"
 * Kolom:
 * 1: No
 * 2: jenis_pengarsipan
 * 3: nomor_surat
 * 4: tgl_diterima
 * 5: pengirim
 * 6: isi_perihal
 * 7: tgl_surat
 * 8: terusan
 * 9: disposisi
 * 10: keterangan
 * ============================================================================
 */

/**
 * Mendapatkan referensi Sheet surat-masuk
 */
function getSuratMasukSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SURAT_MASUK_SHEET || 'surat-masuk');

  if (!sheet) {
    throw new Error(
      'Sheet "' + (CONFIG.SURAT_MASUK_SHEET || 'surat-masuk') + '" tidak ditemukan.'
    );
  }

  return sheet;
}

/**
 * Helper format tanggal dari cell Spreadsheet menjadi string 'dd/MM/yyyy'
 */
function formatSuratDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, CONFIG.TIMEZONE || 'Asia/Jakarta', 'dd/MM/yyyy');
  }
  return String(value || '').trim();
}

/**
 * 1. GET LIST: Mengambil seluruh data surat masuk
 * Action: ?action=surat_masuk_list
 * Method: GET / POST
 */
function getSuratMasukList_(e) {
  try {
    const sheet = getSuratMasukSheet_();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return responseSuccess_([], 'Data surat masuk masih kosong.');
    }

    const items = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Abaikan baris jika No dan nomor_surat kosong
      if (!row[0] && !row[2]) continue;

      const formattedTglDiterima = formatSuratDate_(row[3]);
      const formattedTglSurat = formatSuratDate_(row[6]);

      items.push({
        no: Number(row[0]) || i,
        jenis_pengarsipan: String(row[1] || '').trim(),
        nomor_surat: String(row[2] || '').trim(),
        tgl_diterima: formattedTglDiterima,
        pengirim: String(row[4] || '').trim(),
        isi_perihal: String(row[5] || '').trim(),
        tgl_surat: formattedTglSurat,
        terusan: String(row[7] || '-').trim(),
        disposisi: String(row[8] || '-').trim(),
        keterangan: String(row[9] || '-').trim(),
        _rowNumber: i + 1
      });
    }

    return responseSuccess_(items, 'Data surat masuk berhasil diambil.');
  } catch (error) {
    console.error('Error in getSuratMasukList_:', error);
    return responseError_('Gagal memuat data surat masuk: ' + error.message, 500);
  }
}

/**
 * 2. CREATE: Menambah data surat masuk baru
 * Action: POST ?action=surat_masuk_create
 * Body JSON:
 * {
 *   "jenis_pengarsipan": "D4",
 *   "nomor_surat": "264/PC/A/XXIV/7354/IV/26",
 *   "tgl_diterima": "13/04/2026",
 *   "pengirim": "PC IPNU Kab. Pekalongan",
 *   "isi_perihal": "Undangan",
 *   "tgl_surat": "13/04/2026",
 *   "terusan": "-",
 *   "disposisi": "-",
 *   "keterangan": "Undangan Koordinasi LAKUT dan DIKLATMAD"
 * }
 */
function createSuratMasuk_(e) {
  try {
    const body = parseRequestBody_(e);

    const jenisPengarsipan = String(body.jenis_pengarsipan || '').trim();
    const nomorSurat = String(body.nomor_surat || '').trim();
    const tglDiterima = String(body.tgl_diterima || '').trim();
    const pengirim = String(body.pengirim || '').trim();
    const isiPerihal = String(body.isi_perihal || '').trim();
    const tglSurat = String(body.tgl_surat || '').trim();
    const terusan = String(body.terusan || '-').trim();
    const disposisi = String(body.disposisi || '-').trim();
    const keterangan = String(body.keterangan || '-').trim();

    if (!nomorSurat || !pengirim || !isiPerihal) {
      return responseError_('Nomor surat, pengirim, dan isi perihal wajib diisi.', 422);
    }

    const sheet = getSuratMasukSheet_();
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
      jenisPengarsipan,
      nomorSurat,
      tglDiterima,
      pengirim,
      isiPerihal,
      tglSurat,
      terusan,
      disposisi,
      keterangan
    ]);

    const createdItem = {
      no: nextNo,
      jenis_pengarsipan: jenisPengarsipan,
      nomor_surat: nomorSurat,
      tgl_diterima: tglDiterima,
      pengirim: pengirim,
      isi_perihal: isiPerihal,
      tgl_surat: tglSurat,
      terusan: terusan,
      disposisi: disposisi,
      keterangan: keterangan
    };

    return responseSuccess_(createdItem, 'Surat masuk berhasil ditambahkan.');
  } catch (error) {
    console.error('Error in createSuratMasuk_:', error);
    return responseError_('Gagal menambah surat masuk: ' + error.message, 500);
  }
}

/**
 * 3. UPDATE: Mengubah data surat masuk berdasarkan nomor urut (no)
 * Action: POST ?action=surat_masuk_update
 * Body JSON:
 * {
 *   "no": 1,
 *   "jenis_pengarsipan": "D4",
 *   "nomor_surat": "264/PC/A/XXIV/7354/IV/26",
 *   "tgl_diterima": "13/04/2026",
 *   "pengirim": "PC IPNU Kab. Pekalongan",
 *   "isi_perihal": "Undangan",
 *   "tgl_surat": "13/04/2026",
 *   "terusan": "Departemen Kaderisasi",
 *   "disposisi": "Harap dihadiri 2 delegasi",
 *   "keterangan": "Undangan Koordinasi LAKUT dan DIKLATMAD (Revisi)"
 * }
 */
function updateSuratMasuk_(e) {
  try {
    const body = parseRequestBody_(e);

    const targetNo = Number(body.no);
    if (!targetNo || isNaN(targetNo)) {
      return responseError_('Nomor surat (no) valid wajib disertakan.', 422);
    }

    const jenisPengarsipan = String(body.jenis_pengarsipan || '').trim();
    const nomorSurat = String(body.nomor_surat || '').trim();
    const tglDiterima = String(body.tgl_diterima || '').trim();
    const pengirim = String(body.pengirim || '').trim();
    const isiPerihal = String(body.isi_perihal || '').trim();
    const tglSurat = String(body.tgl_surat || '').trim();
    const terusan = String(body.terusan || '-').trim();
    const disposisi = String(body.disposisi || '-').trim();
    const keterangan = String(body.keterangan || '-').trim();

    if (!nomorSurat || !pengirim || !isiPerihal) {
      return responseError_('Nomor surat, pengirim, dan isi perihal wajib diisi.', 422);
    }

    const sheet = getSuratMasukSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1; // 1-based row index
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Surat masuk nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    // Update Kolom B (2) sampai Kolom J (10)
    sheet.getRange(targetRowIndex, 2).setValue(jenisPengarsipan);
    sheet.getRange(targetRowIndex, 3).setValue(nomorSurat);
    sheet.getRange(targetRowIndex, 4).setValue(tglDiterima);
    sheet.getRange(targetRowIndex, 5).setValue(pengirim);
    sheet.getRange(targetRowIndex, 6).setValue(isiPerihal);
    sheet.getRange(targetRowIndex, 7).setValue(tglSurat);
    sheet.getRange(targetRowIndex, 8).setValue(terusan);
    sheet.getRange(targetRowIndex, 9).setValue(disposisi);
    sheet.getRange(targetRowIndex, 10).setValue(keterangan);

    const updatedItem = {
      no: targetNo,
      jenis_pengarsipan: jenisPengarsipan,
      nomor_surat: nomorSurat,
      tgl_diterima: tglDiterima,
      pengirim: pengirim,
      isi_perihal: isiPerihal,
      tgl_surat: tglSurat,
      terusan: terusan,
      disposisi: disposisi,
      keterangan: keterangan
    };

    return responseSuccess_(updatedItem, 'Surat masuk berhasil diperbarui.');
  } catch (error) {
    console.error('Error in updateSuratMasuk_:', error);
    return responseError_('Gagal memperbarui surat masuk: ' + error.message, 500);
  }
}

/**
 * 4. DELETE: Menghapus data surat masuk berdasarkan nomor (no)
 * Action: POST ?action=surat_masuk_delete
 * Body JSON:
 * {
 *   "no": 1
 * }
 */
function deleteSuratMasuk_(e) {
  try {
    const body = parseRequestBody_(e);

    const targetNo = Number(body.no);
    if (!targetNo || isNaN(targetNo)) {
      return responseError_('Nomor surat (no) valid wajib disertakan.', 422);
    }

    const sheet = getSuratMasukSheet_();
    const data = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (Number(data[i][0]) === targetNo) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return responseError_('Surat masuk nomor ' + targetNo + ' tidak ditemukan.', 404);
    }

    sheet.deleteRow(targetRowIndex);

    return responseSuccess_(null, 'Surat masuk nomor ' + targetNo + ' berhasil dihapus.');
  } catch (error) {
    console.error('Error in deleteSuratMasuk_:', error);
    return responseError_('Gagal menghapus surat masuk: ' + error.message, 500);
  }
}
```

---

## 5. Langkah-Langkah Penerapan di Google Apps Script Editor

1. Buka [script.google.com](https://script.google.com) lalu buka project Apps Script ADM PAC Buaran Anda.
2. Pastikan di Google Spreadsheet terkait sudah ada sheet dengan nama persis **`surat-masuk`** beserta 10 kolom header di Baris 1:
   ```
   No | jenis_pengarsipan | nomor_surat | tgl_diterima | pengirim | isi_perihal | tgl_surat | terusan | disposisi | keterangan
   ```
3. Buka **`Config.gs`**, tambahkan baris `SURAT_MASUK_SHEET: 'surat-masuk',` ke dalam objek `CONFIG`. Simpan (**Ctrl + S**).
4. Buka **`Code.gs`**, tambahkan 4 case `surat_masuk_list`, `surat_masuk_create`, `surat_masuk_update`, dan `surat_masuk_delete` di dalam `switch (action)`. Simpan (**Ctrl + S**).
5. Buat file baru di Apps Script dengan nama **`SuratMasuk`**, tempel seluruh kode dari Bagian 4 di atas, lalu Simpan (**Ctrl + S**).
6. **Deploy Versi Baru**:
   - Klik tombol **Deploy** di kanan atas &rarr; pilih **Manage deployments**.
   - Klik ikon pensil (**Edit**) pada deployment aktif Anda.
   - Pada dropdown **Version**, pilih **New version**.
   - Berikan deskripsi (misal: `"Menambahkan CRUD Surat Masuk"`).
   - Klik tombol **Deploy**.
7. Sekarang front-end web ADM PAC Buaran sudah dapat langsung membaca, menambah, mengubah, dan menghapus surat masuk secara real-time!
