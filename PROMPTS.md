# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:**

> Baca AGENTS.md dan docs/user-stories.md bagian US-01. Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase. Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**

Katalog di `/` sekarang membaca 60 produk dari tabel `produk` lewat Server Component. Data contoh dan `CatatanBelumAktif` dihapus. Halaman menampilkan pesan error jika query gagal dan “Belum ada produk” jika tabel kosong.

**Perbaikan:**

Tidak ada. `npm run build` berhasil dan jumlah kartu di localhost sesuai jumlah baris tabel.

## US-02 Detail produk

**Prompt:**

> Baca docs/user-stories.md bagian US-02. Ubah app/produk/[id]/page.jsx supaya mengambil satu produk dari tabel "produk" di Supabase berdasarkan id di URL, di sisi server, memakai koneksi Supabase yang sudah dibuat di lib/supabase. Kalau produk tidak ditemukan, panggil notFound(). Jangan ubah tampilannya. Hapus CatatanBelumAktif dari halaman ini, tapi biarkan tombol WhatsApp.

**Hasil:**

Halaman detail mengambil satu produk dari database. ID yang bukan angka atau produk yang tidak ada memakai `notFound()` dan menampilkan halaman “Halaman tidak ditemukan”. `CatatanBelumAktif` dihapus, tombol WhatsApp tetap ada.

**Perbaikan:**

Query memakai `maybeSingle()` supaya produk yang tidak ada tidak dianggap error database. Error koneksi ditampilkan terpisah dari halaman “tidak ditemukan”.

## US-03 Pesan via WhatsApp

**Prompt:**

> Baca docs/rancangan-teknis.md bagian "Pesan WhatsApp (US-03)". Ubah components/TombolWhatsApp.jsx menjadi tautan yang membuka https://wa.me/ ke nomor di lib/toko.js, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah. Pesan di-encode dengan encodeURIComponent dan dibuka di tab baru. Pertahankan tampilan tombolnya. Hapus CatatanBelumAktif yang menyebut US-03 di halaman detail produk.

**Hasil:**

Tombol “Pesan via WhatsApp” membuka `https://wa.me/6281378280892` dengan pesan “Halo, saya mau pesan <nama produk> (Rp ...)”. Tautan memakai `encodeURIComponent`, `target="_blank"`, dan `rel="noopener noreferrer"`. Tampilan tombol tidak berubah.

**Perbaikan:**

Harga dinormalisasi dari spasi non-breaking bawaan `Intl.NumberFormat` menjadi spasi biasa agar pesan dan URL lebih rapi.

## US-04 Login admin

**Prompt:**

> Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04. Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**

Login memakai Server Action `masuk` dan koneksi sesi `@supabase/ssr`. Password salah menampilkan “Email atau password salah. Periksa lagi lalu coba.” Login benar mengarah ke `/admin`. Tombol Keluar menjalankan `keluar`, menghapus sesi, dan kembali ke `/admin/login`.

**Perbaikan:**

Form login dipindah ke komponen client `FormLogin` agar bisa memakai `useActionState` untuk pesan error dan status proses, tanpa mengubah susunan tampilan.

## US-05 Ganti password

**Prompt:**

> Baca docs/user-stories.md bagian US-05. Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**

Server Action `gantiPassword` memeriksa sesi admin, memvalidasi minimal 8 karakter dan kecocokan konfirmasi, lalu memanggil `supabase.auth.updateUser`. Pesan berhasil dan pesan error tampil di halaman. Form memakai `FormGantiPassword` dengan `useActionState`.

**Perbaikan:**

Pemeriksaan sesi memakai helper `wajibAdmin()` supaya aksi tetap ditolak di server jika sesi sudah berakhir, bukan hanya mengandalkan tampilan.

## US-06 Proteksi halaman admin

**Prompt:**

> Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06. Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**

`proxy.js` memakai `createServerClient` dan `supabase.auth.getUser()` untuk semua rute `/admin/:path*`. Tanpa sesi, pengunjung dialihkan ke `/admin/login`; admin yang sudah login dan membuka halaman login dialihkan ke `/admin`. Halaman admin juga memanggil `wajibAdmin()`, dan Server Action ganti password memeriksa sesi. `CatatanBelumAktif` di `/admin` dihapus.

**Perbaikan:**

Cookie sesi yang diperbarui saat pengecekan ikut disalin ke respons redirect agar sesi tidak hilang. Pengujian lokal: `/admin`, `/admin/password`, `/admin/produk/baru`, dan `/admin/produk/1/ubah` semuanya 307 ke `/admin/login` tanpa sesi.

## US-07 List produk admin

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-07 dan AGENTS.md. Ubah app/admin/page.jsx supaya daftar produk diambil dari tabel "produk" memakai koneksi sesi admin, bukan lib/data-contoh.js. Tampilkan pesan error yang jelas dan tulisan "Belum ada produk" kalau tabel kosong. Jangan ubah tampilan tabel.

**Hasil:**

`/admin` membaca 60 produk dari database lewat koneksi sesi admin (RLS tetap berlaku). Tabel menampilkan pesan kosong dan pesan error bila query gagal.

**Perbaikan:**

Tidak ada.

## US-08 Tambah produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-08 dan AGENTS.md aturan keamanan. Buat Server Action simpanProduk di app/admin/actions.js untuk menambah produk ke database, dengan validasi nama dan harga di server. Setelah menyimpan, kembali ke /admin. Aksi wajib memeriksa login di server. Sambungkan ke components/FormProduk.jsx tanpa mengubah tampilan.

**Hasil:**

Form `/admin/produk/baru` menyimpan produk ke tabel `produk`, menampilkan error per field, lalu mengarahkan ke `/admin?pesan=disimpan`. Aksi memakai `wajibAdmin()` sehingga ditolak tanpa sesi.

**Perbaikan:**

`components/Input.jsx` diberi dukungan pesan error per field. Nilai yang sudah diketik dikembalikan lewat state `useActionState` supaya tidak hilang saat validasi gagal.

## US-09 Ubah produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-09. Ubah app/admin/produk/[id]/ubah/page.jsx supaya mengambil produk dari database memakai koneksi sesi admin, memanggil notFound() kalau tidak ada, dan mengisi FormProduk dengan data lama. Simpan perubahan lewat Server Action simpanProduk yang memeriksa login. Hapus CatatanBelumAktif.

**Hasil:**

Form ubah terisi data lama dan menyimpan perubahan ke database, lalu kembali ke `/admin?pesan=disimpan`. Produk yang tidak ada memakai halaman “tidak ditemukan”.

**Perbaikan:**

Aksi memakai `update(...).select("id").maybeSingle()` supaya produk yang sudah dihapus tidak dilaporkan berhasil.

## US-10 Hapus produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-10. Tambahkan tombol Hapus di components/TabelProduk.jsx dengan konfirmasi sebelum menghapus. Buat Server Action hapusProduk di app/admin/actions.js yang memeriksa login di server, lalu kembali ke /admin dengan pesan hasil.

**Hasil:**

Tombol Hapus memakai `window.confirm`, mengirim id produk lewat form ke Server Action, dan produk terhapus dari database. Setelah dihapus muncul pesan “Produk berhasil dihapus” di `/admin`.

**Perbaikan:**

Ditambahkan gambar cadangan `public/produk/tanpa-foto.svg` untuk produk yang tidak punya `foto_url`, dipakai di katalog, tabel admin, dan halaman detail.

## US-11 Filter kategori atau pencarian

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-11 dan DESIGN.md. Tambahkan pencarian nama produk dan filter kategori di halaman katalog. Query ke Supabase di server, bukan di browser. Pertahankan tampilan kartu dan grid yang ada, tampilkan pesan kalau tidak ada hasil, dan sediakan tombol untuk menghapus filter.

**Hasil:**

Form filter memakai method GET sehingga hasil bisa dibagikan lewat URL. Daftar kategori diambil dari database, pencarian memakai `ilike`, dan hasil menampilkan jumlah produk yang cocok. Kombinasi kata kunci dan kategori juga berfungsi.

**Perbaikan:**

Karakter `%`, `_`, dan `\` di kata kunci di-escape supaya tidak diperlakukan sebagai wildcard SQL. Kategori yang sedang dipilih tetap muncul di dropdown walaupun datanya baru berubah.

## US-12 Pilih jumlah atau varian

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-12. Tambahkan pemilih jumlah pada halaman detail produk. Jumlah dan total harga harus ikut tertulis di pesan WhatsApp. Pertahankan tombol WhatsApp dan susunan halaman yang ada.

**Hasil:**

Halaman detail punya tombol kurang/tambah, kolom jumlah 1 sampai 99, dan total harga yang berubah mengikuti jumlah. Pesan WhatsApp berisi nama produk, jumlah, harga satuan, dan total. Tautan memakai `encodeURIComponent` dan tetap membuka tab baru.

**Perbaikan:**

Kolom jumlah boleh dikosongkan sementara saat mengetik, lalu kembali ke 1 saat kehilangan fokus. Nilai di luar 1–99 tidak diterima.

## US-13 PWA

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-13. Buat web app manifest yang memakai nama toko dan ikon di public/icons (192 dan 512). Tautkan manifest di halaman, pakai tampilan standalone, dan tambahkan service worker supaya katalog bisa dipasang ke layar utama HP.

**Hasil:**

`app/manifest.js` menghasilkan `/manifest.webmanifest` dengan nama, deskripsi, warna, `start_url`, `scope`, `display: standalone`, dan dua ikon. Next.js menautkannya otomatis di `<head>`. Service worker `public/sw.js` didaftarkan oleh komponen client dan tidak menyimpan cache agar data selalu baru.

**Perbaikan:**

Ditambahkan ikon Apple Touch dan `theme-color` agar pemasangan di iOS/Android lebih rapi.

## US-14 Deskripsi produk dibuat AI

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-14 dan aturan keamanan AGENTS.md. Tambahkan tombol “Buat deskripsi dengan AI” di FormProduk. Panggil Gemini API dari server memakai GEMINI_API_KEY, jangan pernah mengirim kunci ke browser. Hasilnya mengisi kolom deskripsi sebelum produk disimpan. Tangani error, timeout, dan kuota. Jangan memasang paket npm baru.

**Hasil:**

`lib/gemini.js` memanggil endpoint `generateContent` memakai `fetch` dan header `x-goog-api-key`. Server Action `buatDeskripsiProduk` memeriksa `wajibAdmin()`, memvalidasi nama, lalu mengembalikan deskripsi. Tombol di form menampilkan status proses dan mengisi textarea tanpa menghapus isian lain. Key hanya ada di server.

**Perbaikan:**

Ditambahkan batas panjang input, timeout 20 detik, pemetaan pesan untuk key kosong, kuota, model tidak ditemukan, dan permintaan yang diblokir. Deskripsi tetap bisa diisi manual kalau AI gagal.

## Debugging dan fitur bonus

Pengujian US-07 sampai US-10 memakai akun uji sementara di Supabase Auth: menambah produk, mengubahnya, menghapusnya, dan memastikan aksi tanpa login ditolak. Produk dan akun uji sudah dihapus kembali; akun admin asli tidak diubah.

US-11 diuji dengan pencarian “kopi”, filter kategori “Minuman”, kombinasi keduanya, dan kata kunci tanpa hasil. US-12 diuji dari HTML detail produk: jumlah awal 1, total harga, dan pesan WhatsApp sudah memuat jumlah. US-13 diuji dengan memastikan `/manifest.webmanifest` bertipe `application/manifest+json`, ikon 192/512 dapat diakses, service worker dapat diakses, dan `<link rel="manifest">` ada di halaman. US-14 diuji sampai jalur error `GEMINI_API_KEY` kosong; generasi sungguhan perlu diuji setelah key diisi di server.
