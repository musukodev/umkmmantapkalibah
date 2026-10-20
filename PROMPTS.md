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

## Debugging dan fitur bonus

Belum ada fitur bonus yang dikerjakan. Fokus penyelesaian: US-01 sampai US-06 dan pemeriksaan Langkah 15.

Catatan pengujian: login, ganti password, validasi password pendek/konfirmasi berbeda, dan logout diuji memakai akun uji sementara di Supabase Auth. Akun uji dihapus kembali setelah pengujian; akun admin asli tidak diubah.
