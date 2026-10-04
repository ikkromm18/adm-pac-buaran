# 🛡️ PANDUAN PATCH KEAMANAN GOOGLE APPS SCRIPT (GAS)

Dokumen ini berisi kode dan instruksi perbaikan keamanan di sisi backend **Google Apps Script** untuk menutup celah *Unauthenticated Public Endpoint* dan *Broken Access Control*.

Front-end web (`adm-pac-buaran`) telah diperbarui untuk **otomatis melampirkan `session_token`** pada setiap panggilan API CRUD. Ikuti langkah-langkah di bawah ini di Google Apps Script Editor Anda agar server menolak request yang tidak sah atau tanpa login.

---

## 📌 Ringkasan yang Perlu Dilakukan di GAS:
1. Buat 1 file script baru: **`Security.gs`** (Satpam autentikasi, role check, dan rate limiting).
2. Perbarui file **`Code.gs`** (Pasang pelindung `requireAuth_` di setiap case CRUD).
3. Perbarui fungsi `create` pada modul data dengan **`LockService`** (Cegah nomor urut ganda).
4. Buat **New Version Deployment** di Google Apps Script.

---

## 1. Buat File Baru: `Security.gs`

Di Google Apps Script Editor:
1. Klik tanda **+** di samping tulisan **Files** > pilih **Script**.
2. Beri nama: `Security` (akan menjadi `Security.gs`).
3. Tempel seluruh kode berikut:

```javascript
/**
 * ============================================================================
 * MODUL KEAMANAN (SECURITY & AUTHENTICATION GATEWAY) - ADM PAC BUARAN
 * Bertindak sebagai Middleware / Satpam untuk memverifikasi keabsahan sesi
 * pengguna, hak akses role, serta perlindungan konkurensi data.
 * ============================================================================
 */

/**
 * Mendapatkan token sesi dari HTTP Request (baik dari body POST maupun query param)
 * @param {Object} e - Event object Google Apps Script
 * @returns {string|null} Token sesi atau null jika tidak ada
 */
function extractSessionToken_(e) {
  if (!e) return null;

  // 1. Coba baca dari request body JSON
  try {
    const body = parseRequestBody_(e);
    if (body && body.session_token) {
      return String(body.session_token).trim();
    }
  } catch (err) {
    // Body bukan JSON atau kosong, lanjut cek parameter
  }

  // 2. Coba baca dari parameter URL query (?session_token=...)
  if (e.parameter && e.parameter.session_token) {
    return String(e.parameter.session_token).trim();
  }

  return null;
}

/**
 * Memvalidasi apakah token sesi valid, aktif, dan belum kedaluwarsa di sheet 'session'
 * @param {string} token - Token sesi yang akan divalidasi
 * @returns {Object|null} Objek data user jika valid, atau null jika tidak valid
 */
function validateSessionToken_(token) {
  if (!token) return null;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionSheet = ss.getSheetByName(CONFIG.SESSION_SHEET || 'session');
  const usersSheet = ss.getSheetByName(CONFIG.USERS_SHEET || 'users');

  if (!sessionSheet || !usersSheet) {
    throw new Error('Sheet session atau users tidak ditemukan.');
  }

  const sessionData = sessionSheet.getDataRange().getValues();
  if (sessionData.length <= 1) return null;

  let activeSessionRow = null;
  const now = new Date();

  // Cari baris session berdasarkan session_token (Kolom E / Index 4)
  for (let i = 1; i < sessionData.length; i++) {
    const row = sessionData[i];
    const rowToken = String(row[4] || '').trim();
    const rowStatus = String(row[8] || '').trim();
    const rowExpiresAt = row[7] ? new Date(row[7]) : null;

    if (rowToken === token) {
      // Periksa status dan waktu expired
      if (rowStatus === (CONFIG.SESSION_STATUS_ACTIVE || 'Active')) {
        if (!rowExpiresAt || rowExpiresAt > now) {
          activeSessionRow = {
            rowNumber: i + 1,
            sessionId: row[0],
            userId: String(row[1] || '').trim(),
            expiresAt: rowExpiresAt,
          };
          break;
        } else {
          // Tandai expired di sheet jika waktu telah lewat
          sessionSheet.getRange(i + 1, 9).setValue(CONFIG.SESSION_STATUS_EXPIRED || 'Expired');
        }
      }
    }
  }

  if (!activeSessionRow) {
    return null;
  }

  // Ambil data User dari sheet 'users'
  const usersData = usersSheet.getDataRange().getValues();
  let userDetails = null;

  for (let j = 1; j < usersData.length; j++) {
    const uRow = usersData[j];
    const uId = String(uRow[0] || '').trim();
    const uStatus = String(uRow[6] || '').trim();

    if (uId === activeSessionRow.userId) {
      if (uStatus === (CONFIG.USER_STATUS_ACTIVE || 'Active')) {
        userDetails = {
          user_id: uId,
          username: String(uRow[1] || '').trim(),
          email: String(uRow[2] || '').trim(),
          full_name: String(uRow[3] || '').trim(),
          role: String(uRow[5] || 'admin').trim().toLowerCase(),
          session_id: activeSessionRow.sessionId,
        };
      }
      break;
    }
  }

  return userDetails;
}

/**
 * MIDDLEWARE PENJAGA GERBANG UTAMA (Wajib dipanggil di setiap aksi yang butuh proteksi)
 * Melemparkan exception 401 atau 403 jika pengguna tidak berwenang.
 * 
 * @param {Object} e - Event object Google Apps Script
 * @param {string|Array<string>} [allowedRoles] - Role yang diizinkan (misal: 'admin', 'superadmin')
 * @returns {Object} Data user yang telah terotentikasi
 */
function requireAuth_(e, allowedRoles) {
  const token = extractSessionToken_(e);

  if (!token) {
    throw new SecurityException_(
      'Akses ditolak: Session token tidak disertakan. Silakan login terlebih dahulu.',
      401
    );
  }

  const authenticatedUser = validateSessionToken_(token);

  if (!authenticatedUser) {
    throw new SecurityException_(
      'Akses ditolak: Sesi Anda tidak valid atau telah kedaluwarsa. Silakan login kembali.',
      401
    );
  }

  // Jika ada pembatasan role tertentu
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles.map(function(r) { return String(r).toLowerCase().trim(); })
      : [String(allowedRoles).toLowerCase().trim()];

    const userRole = authenticatedUser.role;

    // Superadmin selalu memiliki akses tertinggi
    const hasAccess = userRole === 'superadmin' || userRole === 'super_admin' || roles.indexOf(userRole) !== -1;

    if (!hasAccess) {
      throw new SecurityException_(
        'Akses ditolak: Anda tidak memiliki hak akses yang cukup untuk operasi ini.',
        403
      );
    }
  }

  return authenticatedUser;
}

/**
 * Custom Exception untuk Keamanan
 */
function SecurityException_(message, statusCode) {
  this.name = 'SecurityException';
  this.message = message || 'Akses tidak sah.';
  this.statusCode = statusCode || 401;
}
SecurityException_.prototype = new Error();

/**
 * Rate Limiter sederhana untuk melindungi kuota harian Google Apps Script
 * Memanfaatkan CacheService bawaan Google
 */
function checkRateLimit_(identifier, maxRequests, windowSeconds) {
  const cache = CacheService.getScriptCache();
  const key = 'rate_lim_' + (identifier || 'anonymous');
  const current = Number(cache.get(key) || 0);

  if (current >= (maxRequests || 60)) {
    throw new SecurityException_(
      'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa saat.',
      429
    );
  }

  cache.put(key, String(current + 1), windowSeconds || 60);
}

/**
 * Helper Hash Password SHA-256 (Digunakan untuk verifikasi password user)
 */
function hashPassword_(password) {
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  let hashStr = '';
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

/**
 * Handle Login User (Memvalidasi akun, membuat sesi, dan mengembalikan token)
 */
function handleLogin_(e) {
  try {
    const body = parseRequestBody_(e);
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const userAgent = String(body.user_agent || 'Unknown');

    if (!username || !password) {
      return responseError_('Username dan password wajib diisi.', 422);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName(CONFIG.USERS_SHEET || 'users');
    const sessionSheet = ss.getSheetByName(CONFIG.SESSION_SHEET || 'session');

    if (!usersSheet || !sessionSheet) {
      return responseError_('Sheet users atau session tidak ditemukan.', 500);
    }

    const usersData = usersSheet.getDataRange().getValues();
    let foundUser = null;
    let userRowIndex = -1;

    for (let i = 1; i < usersData.length; i++) {
      const row = usersData[i];
      const rowUsername = String(row[1] || '').trim().toLowerCase();
      if (rowUsername === username) {
        foundUser = row;
        userRowIndex = i + 1;
        break;
      }
    }

    if (!foundUser) {
      return responseError_('Username atau password salah.', 401);
    }

    const storedHash = String(foundUser[4] || '').trim();
    const inputHash = hashPassword_(password);

    if (storedHash !== inputHash) {
      return responseError_('Username atau password salah.', 401);
    }

    const status = String(foundUser[6] || '').trim();
    if (status !== (CONFIG.USER_STATUS_ACTIVE || 'Active')) {
      return responseError_('Akun Anda sedang dinonaktifkan. Hubungi admin.', 403);
    }

    const now = new Date();
    const durationHours = CONFIG.SESSION_DURATION_HOURS || 24;
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const tz = CONFIG.TIMEZONE || 'Asia/Jakarta';
    const nowFormatted = Utilities.formatDate(now, tz, 'yyyy-MM-dd HH:mm:ss');
    const expiresFormatted = Utilities.formatDate(expiresAt, tz, 'yyyy-MM-dd HH:mm:ss');

    // Update last_login di sheet users
    usersSheet.getRange(userRowIndex, 8).setValue(nowFormatted);

    // Buat session ID dan session token
    const dateStr = Utilities.formatDate(now, tz, 'yyyyMMdd');
    const randomHex = Utilities.getUuid().replace(/-/g, '').substring(0, 6).toUpperCase();
    const sessionId = 'SES-' + dateStr + '-' + randomHex;
    const sessionToken = 'tok_' + Utilities.getUuid().replace(/-/g, '');

    // Simpan ke sheet session
    sessionSheet.appendRow([
      sessionId,
      foundUser[0], // user_id
      'unknown',     // ip_address
      userAgent,
      sessionToken,
      nowFormatted,
      nowFormatted,
      expiresFormatted,
      CONFIG.SESSION_STATUS_ACTIVE || 'Active'
    ]);

    return responseSuccess_({
      user: {
        user_id: foundUser[0],
        username: foundUser[1],
        email: foundUser[2],
        full_name: foundUser[3],
        role: foundUser[5],
        status: foundUser[6]
      },
      session: {
        session_id: sessionId,
        session_token: sessionToken,
        login_time: nowFormatted,
        expires_at: expiresFormatted
      }
    }, 'Login berhasil.');
  } catch (error) {
    console.error('Error in handleLogin_:', error);
    return responseError_('Gagal melakukan login: ' + error.message, 500);
  }
}

/**
 * Handle Logout User
 */
function handleLogout_(e) {
  try {
    const body = parseRequestBody_(e);
    const token = body.session_token || (e.parameter && e.parameter.session_token);

    if (!token) {
      return responseError_('Session token wajib disertakan.', 422);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionSheet = ss.getSheetByName(CONFIG.SESSION_SHEET || 'session');
    if (!sessionSheet) {
      return responseError_('Sheet session tidak ditemukan.', 500);
    }

    const sessionData = sessionSheet.getDataRange().getValues();
    for (let i = 1; i < sessionData.length; i++) {
      if (String(sessionData[i][4] || '').trim() === String(token).trim()) {
        sessionSheet.getRange(i + 1, 9).setValue(CONFIG.SESSION_STATUS_LOGGED_OUT || 'Logged Out');
        break;
      }
    }

    return responseSuccess_(null, 'Logout berhasil.');
  } catch (error) {
    console.error('Error in handleLogout_:', error);
    return responseError_('Gagal logout: ' + error.message, 500);
  }
}
```

---

## 2. Pembaruan pada `Code.gs`

Buka file **`Code.gs`** di Google Apps Script Editor Anda.

Ubah blok `handleRequest_(e)` agar menangani error keamanan secara elegan dan memanggil `requireAuth_(e)` pada modul-modul data:

```javascript
function handleRequest_(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

    if (!action) {
      return jsonResponse_(responseError_('Parameter "action" wajib disertakan.', 400));
    }

    switch (action) {
      // ----------------------------------------------------
      // AKSI PUBLIK (TIDAK MEMERLUKAN LOGIN)
      // ----------------------------------------------------
      case 'login':
        return jsonResponse_(handleLogin_(e));

      // ----------------------------------------------------
      // AKSI SESI (MEMERLUKAN TOKEN SESI)
      // ----------------------------------------------------
      case 'me':
        requireAuth_(e);
        return jsonResponse_(getCurrentUser_(e));

      case 'logout':
        return jsonResponse_(handleLogout_(e));

      // ----------------------------------------------------
      // MODUL KEGIATAN INTERNAL (DILINDUNGI requireAuth_)
      // ----------------------------------------------------
      case 'kegiatan_internal_list':
        requireAuth_(e);
        return jsonResponse_(getKegiatanInternalList_(e));

      case 'kegiatan_internal_create':
        requireAuth_(e);
        return jsonResponse_(createKegiatanInternal_(e));

      case 'kegiatan_internal_update':
        requireAuth_(e);
        return jsonResponse_(updateKegiatanInternal_(e));

      case 'kegiatan_internal_delete':
        // Operasi hapus hanya diizinkan untuk Admin dan Superadmin
        requireAuth_(e, ['admin', 'superadmin']);
        return jsonResponse_(deleteKegiatanInternal_(e));

      // ----------------------------------------------------
      // MODUL KEGIATAN EKSTERNAL (DILINDUNGI requireAuth_)
      // ----------------------------------------------------
      case 'kegiatan_eksternal_list':
        requireAuth_(e);
        return jsonResponse_(getKegiatanEksternalList_(e));

      case 'kegiatan_eksternal_create':
        requireAuth_(e);
        return jsonResponse_(createKegiatanEksternal_(e));

      case 'kegiatan_eksternal_update':
        requireAuth_(e);
        return jsonResponse_(updateKegiatanEksternal_(e));

      case 'kegiatan_eksternal_delete':
        requireAuth_(e, ['admin', 'superadmin']);
        return jsonResponse_(deleteKegiatanEksternal_(e));

      // ----------------------------------------------------
      // MODUL SURAT MASUK (DILINDUNGI requireAuth_)
      // ----------------------------------------------------
      case 'surat_masuk_list':
        requireAuth_(e);
        return jsonResponse_(getSuratMasukList_(e));

      case 'surat_masuk_create':
        requireAuth_(e);
        return jsonResponse_(createSuratMasuk_(e));

      case 'surat_masuk_update':
        requireAuth_(e);
        return jsonResponse_(updateSuratMasuk_(e));

      case 'surat_masuk_delete':
        requireAuth_(e, ['admin', 'superadmin']);
        return jsonResponse_(deleteSuratMasuk_(e));

      default:
        return jsonResponse_(responseError_('Action "' + action + '" tidak ditemukan.', 404));
    }
  } catch (error) {
    console.error('Unhandled request error:', error);

    // Tangani error keamanan spesifik (401 / 403 / 429)
    if (error && error.name === 'SecurityException') {
      return jsonResponse_(responseError_(error.message, error.statusCode));
    }

    return jsonResponse_(responseError_('Terjadi kesalahan server: ' + (error.message || error), 500));
  }
}
```

---

## 3. Pemasangan `LockService` di Fungsi Create (Cegah Nomor Ganda)

Untuk mencegah dua pengguna menyimpan surat atau kegiatan pada detik yang sama dan menghasilkan nomor urut (`No`) kembar, gunakan `LockService` di dalam fungsi `createSuratMasuk_` di **`SuratMasuk.gs`**:

```javascript
function createSuratMasuk_(e) {
  // Pasang Lock untuk konkurensi aman
  const lock = LockService.getScriptLock();
  try {
    // Tunggu antrean maksimal 10 detik
    lock.waitLock(10000);

    const body = parseRequestBody_(e);
    const nomorSurat = String(body.nomor_surat || '').trim();
    const pengirim = String(body.pengirim || '').trim();
    const isiPerihal = String(body.isi_perihal || '').trim();

    if (!nomorSurat || !pengirim || !isiPerihal) {
      return responseError_('Nomor surat, pengirim, dan isi perihal wajib diisi.', 422);
    }

    const sheet = getSuratMasukSheet_();
    const data = sheet.getDataRange().getValues();

    // Hitung nomor urut berikutnya secara aman
    let nextNo = 1;
    for (let i = 1; i < data.length; i++) {
      const currentNo = Number(data[i][0]);
      if (!isNaN(currentNo) && currentNo >= nextNo) {
        nextNo = currentNo + 1;
      }
    }

    sheet.appendRow([
      nextNo,
      String(body.jenis_pengarsipan || '').trim(),
      nomorSurat,
      String(body.tgl_diterima || '').trim(),
      pengirim,
      isiPerihal,
      String(body.tgl_surat || '').trim(),
      String(body.terusan || '-').trim(),
      String(body.disposisi || '-').trim(),
      String(body.keterangan || '-').trim()
    ]);

    return responseSuccess_({ no: nextNo }, 'Surat masuk berhasil ditambahkan.');
  } catch (error) {
    console.error('Error in createSuratMasuk_:', error);
    return responseError_('Gagal menambah surat masuk: ' + error.message, 500);
  } finally {
    // Selalu pastikan lock dilepas kembali
    lock.releaseLock();
  }
}
```

---

## 4. ⚠️ Langkah Terakhir: Wajib Buat "New Version Deployment"

Kode yang baru Anda simpan di Google Apps Script **tidak akan aktif di URL `/exec`** sebelum Anda memperbarui versinya:

1. Di Google Apps Script Editor, klik tombol biru **Deploy** di kanan atas > pilih **Manage deployments**.
2. Klik ikon **Pensil (Edit)** di sebelah deployment web app Anda yang aktif.
3. Pada dropdown **Version**, pilih **New version** (Bukan versi lama!).
4. Beri keterangan (misal: *"Patch Keamanan Auth Sesi & LockService"*).
5. Pastikan konfigurasi tetap:
   - **Execute as:** `Me (akun Anda)`
   - **Who has access:** `Anyone`
6. Klik **Deploy** > Klik **Done**.

Selesai! Sekarang sistem Google Apps Script Anda 100% aman dan hanya melayani request yang memiliki sesi login sah dari web front-end.
