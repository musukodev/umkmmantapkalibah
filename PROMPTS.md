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

## US-15 Urutkan produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-15. Tambahkan pilihan urutan di halaman katalog: terbaru, termurah, dan termahal. Urutan diterapkan di query database Supabase, bukan di browser. Pertahankan filter pencarian dan kategori yang sudah ada.

**Hasil:**

Katalog menerima parameter `urut` (`terbaru`, `termurah`, `termahal`). PostgREST query menerapkan urutan langsung pada kolom `harga` atau `created_at`. Dropdown urutan terintegrasi rapi pada formulir filter katalog.

**Perbaikan:**

Ditambahkan secondary sort pada kolom `id` agar urutan konsisten saat beberapa produk memiliki harga yang sama.

## US-16 Paginasi atau muat lebih banyak

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-16. Buat paginasi server di katalog dengan batas produk per halaman. Query database memakai range dan count exact. Buat komponen navigasi halaman yang mempertahankan kata kunci pencarian, kategori, dan pilihan urutan.

**Hasil:**

Katalog membatasi 12 produk per halaman dengan `.range(dari, sampai)`. Komponen `Paginasi` menampilkan tombol sebelumnya/berikutnya dan nomor halaman. Menampilkan pesan ramah jika nomor halaman di luar batas.

**Perbaikan:**

Query hitung total dan query kategori dijalankan bersamaan dengan `Promise.all` untuk meminimalkan latensi.

## US-17 Produk terkait di halaman detail

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-17. Pada halaman detail produk, tampilkan hingga 3 produk lain dari kategori yang sama dari database. Produk yang sedang dibuka tidak boleh ikut tampil.

**Hasil:**

Halaman detail menampilkan bagian "Produk terkait" di bawah artikel utama, memuat maksimal 3 produk dari kategori yang sama dengan `neq("id", id)`.

**Perbaikan:**

Disediakan tautan langsung menuju halaman kategori terkait di atas daftar produk rekomendasi.

## US-21 Keranjang, pesan semua via WhatsApp

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-21. Buat sistem keranjang belanja berbasis browser (localStorage). Pengunjung bisa menambah produk dari halaman detail, mengatur jumlah, menghapus produk, dan melihat total harga. Sediakan halaman /keranjang dan satu tombol untuk mengirim seluruh pesanan dalam satu pesan WhatsApp ke nomor toko.

**Hasil:**

Dibuat `KeranjangProvider` di root layout dan halaman `/keranjang`. Tombol detail produk dapat menambahkan barang ke keranjang. Halaman keranjang menyusun seluruh item secara berurutan dan menghasilkan tautan WhatsApp dengan format rincian pesanan dan total harga.

**Perbaikan:**

Jumlah item ditampilkan sebagai badge di bilah navigasi Header. Batas kuantitas diatur 1–99 per item.

## US-22 Halaman Tentang dan kontak toko

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-22. Buat halaman /tentang yang menampilkan identitas toko dari lib/toko.js: profil, alamat, jam buka, dan tombol kontak WhatsApp. Tautkan halaman dari Header dan Footer.

**Hasil:**

Halaman `/tentang` memuat informasi toko Terpal B, alamat Politeknik Negeri Batam, jam buka, dan tombol chat WhatsApp. Tautan "Tentang" tersedia di Header dan Footer.

**Perbaikan:**

Layout responsif dengan kartu informasi terpisah untuk lokasi dan jadwal operasional.

## US-23 Bagikan atau salin link produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-23. Tambahkan tombol "Bagikan produk" di halaman detail produk. Gunakan Web Share API jika tersedia, atau salin link ke clipboard dengan umpan balik status "Link tersalin".

**Hasil:**

Komponen `BagikanProduk` memanggil `navigator.share` pada perangkat pendukung atau menyalin tautan saat ini ke `navigator.clipboard`. Menampilkan pesan konfirmasi status saat tautan berhasil disalin.

**Perbaikan:**

Ditambahkan fallback `window.prompt` jika browser memblokir clipboard API di konteks tertentu.

## US-24 Favorit tersimpan di browser

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-24. Buat fitur simpan produk favorit di browser menggunakan localStorage. Sediakan tombol simpan/hapus di halaman detail dan halaman khusus /favorit untuk melihat semua produk yang ditandai.

**Hasil:**

Dibuat hook `useFavorit`, tombol `TombolFavorit` pada halaman detail, dan halaman `/favorit`. Produk favorit disimpan ke localStorage dan bertahan setelah refresh. Bilah Header memiliki navigasi ke `/favorit`.

**Perbaikan:**

State sinkronisasi siap ditangani secara asinkron agar tidak terjadi perbedaan render SSR/klien.

## US-25 Mode gelap

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-25 dan DESIGN.md. Buat fitur mode gelap dengan toggle di Header. Simpan preferensi pengguna di localStorage dan terapkan tema tanpa kedipan (flash). Pastikan kontras warna tetap nyaman dan teks terbaca jelas.

**Hasil:**

Token warna diatur lewat variabel CSS di `app/globals.css` dengan kelas `.dark`. Komponen `ThemeToggle` di Header beralih antara terang dan gelap. Script inline di `<head>` membaca localStorage sebelum render untuk mencegah efek flash.

**Perbaikan:**

Kontras teks pada tombol utama disesuaikan menggunakan token `text-latar` agar tombol tetap kontras dan terbaca di kedua mode.

## US-26 Metadata SEO dan Open Graph

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-26. Gunakan generateMetadata pada halaman detail produk untuk menghasilkan title, description, dan Open Graph image absolut sesuai produk dari database.

**Hasil:**

`app/produk/[id]/page.jsx` mengekspor `generateMetadata` yang membaca nama, deskripsi, dan gambar produk dari database. `metadataBase` dikonfigurasi di root layout menggunakan `SITE_URL`. Kartu Twitter dan Open Graph terisi lengkap.

**Perbaikan:**

Fungsi `ambilProduk` dibungkus dengan `React.cache` sehingga metadata dan halaman utama hanya menjalankan 1 kali query database per permintaan.

## US-27 sitemap.xml dan robots.txt

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-27. Buat rute metadata sitemap.xml dan robots.txt dinamis dari database Supabase. Sertakan halaman utama, tentang, kategori, dan semua produk.

**Hasil:**

`app/sitemap.js` membaca seluruh produk dan kategori unik dari Supabase dan menghasilkan sitemap XML. `app/robots.js` mengizinkan crawling publik, memblokir area `/admin`, dan menunjuk ke URL sitemap.

**Perbaikan:**

Konfigurasi `dynamic = "force-dynamic"` memastikan produk baru langsung muncul di sitemap.

## US-28 Halaman 404 dan loading kustom

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-28. Buat app/loading.jsx dengan animasi skeleton yang rapi untuk halaman yang memuat data. Pastikan app/not-found.jsx memiliki tautan kembali ke beranda.

**Hasil:**

`app/loading.jsx` menampilkan animasi kerangka (pulse skeleton) untuk judul dan kartu katalog. `app/not-found.jsx` menangani rute tidak ditemukan dengan tombol kembali ke katalog.

**Perbaikan:**

Aria label dan role status disematkan pada komponen loading agar aksesibel bagi pembaca layar.

## US-29 Upload foto ke Supabase Storage

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-29 dan aturan keamanan. Tambahkan fitur upload foto produk langsung ke Supabase Storage di FormProduk admin. Upload dilakukan di server memakai kunci server, dengan validasi format gambar (JPG/PNG/WebP) dan ukuran maksimal 2 MB. Masukkan URL hasil upload ke kolom link foto.

**Hasil:**

Server Action `unggahFotoProduk` memvalidasi tipe MIME dan ukuran, membuat bucket `produk` publik jika belum ada, lalu mengunggah file ke Storage. URL publik otomatis mengisi kolom input foto produk. Kunci rahasia aman di server.

**Perbaikan:**

Nama file di-generate acak dengan timestamp dan ekstensi yang divalidasi agar tidak terjadi tabrakan nama file.

## US-30 Dashboard ringkasan admin

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-30. Tampilkan ringkasan katalog di halaman /admin: total jumlah produk dan jumlah produk per kategori dari database. Pastikan halaman terlindungi login.

**Hasil:**

Bagian "Ringkasan" di `/admin` menampilkan kartu total produk dan kartu jumlah produk untuk setiap kategori dari tabel `produk`. Akses dilindungi oleh `wajibAdmin()`.

**Perbaikan:**

Kategori diurutkan berdasarkan jumlah produk terbanyak untuk mempermudah pemantauan stok kategori.

## US-33 Cari dan paginasi di list admin

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-33. Tambahkan fitur pencarian nama produk dan paginasi di tabel admin /admin. Kata kunci dan halaman disimpan di URL query parameters.

**Hasil:**

Form pencarian di `/admin` memfilter nama produk via `ilike` di Supabase. Tabel membatasi 10 produk per halaman dan menyediakan navigasi `Paginasi`. Parameter `q` dan `halaman` tersimpan di URL.

**Perbaikan:**

Karakter wildcard di-escape agar pencarian aman, dan tombol "Hapus pencarian" tampil saat ada filter aktif.

## US-34 Validasi form admin di server

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-34. Perketat validasi simpan produk di server: nama wajib diisi dan harga harus angka positif lebih dari 0. Tampilkan pesan kesalahan di bawah field terkait dan pertahankan isian yang sudah diketik.

**Hasil:**

Server Action `simpanProduk` memvalidasi `harga <= 0` ditolak dengan pesan "Harga harus angka bulat lebih dari 0". Input HTML menggunakan `min="1"`. Nilai form dikembalikan ke form melalui `useActionState`.

**Perbaikan:**

Validasi mendeteksi tipe integer secara ketat dan mencegah angka floating point atau bilangan nol.

## US-35 Ekspor produk ke CSV

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-35. Buat route handler /admin/produk/export untuk mengunduh seluruh produk dalam format CSV. Escape tanda kutip dan koma dengan benar, beri UTF-8 BOM, dan lindungi endpoint agar hanya bisa diakses admin yang login.

**Hasil:**

Route handler GET di `/admin/produk/export` memverifikasi sesi admin lewat `wajibAdmin()`. Menghasilkan file CSV ber-BOM `\uFEFF` dengan header lengkap dan escaping kutip ganda. Link ekspor tersedia di halaman `/admin`.

**Perbaikan:**

Header respons menyertakan `Content-Disposition: attachment` dengan nama file dinamis menyertakan tanggal hari ini.

## US-36 Terakhir dilihat

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-36. Simpan riwayat produk yang dibuka pengunjung di browser (localStorage) hingga maksimal 6 produk. Tampilkan bagian "Terakhir dilihat" di beranda jika riwayat tersedia.

**Hasil:**

Komponen `CatatTerakhirDilihat` mencatat produk saat halaman detail dibuka. Komponen `TerakhirDilihat` di beranda membaca riwayat dan menampilkan grid kartu produk. Jika kosong, bagian tersebut tidak tampil.

**Perbaikan:**

Penyimpanan menghapus duplikat id produk lama dan menaruh produk terbaru di posisi awal.

## US-37 Bandingkan 2 produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-37. Buat halaman /bandingkan di mana pengunjung bisa memilih dua produk dari dropdown dan membandingkannya berdampingan (foto, kategori, harga, deskripsi). Tangani kondisi jika memilih produk yang sama atau tidak valid.

**Hasil:**

Halaman `/bandingkan` menyediakan form pemilihan dua produk. Hasil perbandingan menampilkan kartu produk berdampingan lengkap dengan harga dan deskripsi. Tautan "Bandingkan" tersedia di Header dan halaman detail produk.

**Perbaikan:**

Validasi menolak jika produk pertama dan kedua sama dengan pesan "Pilih dua produk yang berbeda".

## US-44 Kelola akun admin

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-44. Buat halaman /admin/akun untuk melihat daftar akun admin Supabase Auth, menambah admin baru dengan email dan password, serta menghapus admin lain (kecuali akun sendiri). Semua aksi diperiksa di server.

**Hasil:**

Halaman `/admin/akun` menampilkan tabel admin dari `supabase.auth.admin.listUsers`. Form `FormTambahAdmin` mendaftarkan admin baru terkonfirmasi. Tombol hapus menghapus akun target, namun akun yang sedang login diproteksi dan tidak menampilkan tombol hapus untuk dirinya sendiri.

**Perbaikan:**

NavAdmin memiliki tautan langsung ke "Akun admin". Konfirmasi password divalidasi minimal 8 karakter.

## US-46 Impor produk dari CSV

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-46. Buat halaman /admin/produk/impor untuk mengunggah file CSV produk. Server memvalidasi setiap baris, melaporkan nomor baris yang salah, dan menyimpan baris valid sekaligus ke database. Lindungi aksi dengan login server.

**Hasil:**

Halaman `/admin/produk/impor` menerima file CSV (maksimal 2 MB). Parser server membaca header `nama,harga,kategori,deskripsi,foto_url`, memvalidasi setiap baris, melaporkan baris yang dilewati beserta nomor barisnya, dan menyimpan seluruh baris valid dengan 1 kali batch insert ke Supabase.

**Perbaikan:**

Parser CSV mandiri menangani nilai berkoma di dalam tanda kutip dan baris kosong dengan akurat tanpa memerlukan paket npm tambahan.

## US-49 Halaman per kategori

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-49. Buat rute dinamis /kategori/[slug] yang menampilkan semua produk dalam kategori tersebut dari database. Tautkan nama kategori di halaman detail ke halaman kategori ini, dan tampilkan pesan jika kategori tidak ditemukan.

**Hasil:**

Halaman `/kategori/[slug]` memetakan slug URL ke kategori database, menampilkan daftar produk terkait, dan menyertakan metadata SEO dinamis. Nama kategori di halaman detail ditautkan langsung ke rute ini.

**Perbaikan:**

Helper `slugify` menormalisasi karakter aksen dan spasi menjadi slug URL yang bersih.

## US-50 Asisten AI tanya jawab produk

**Prompt [SENDIRI]:**

> Baca docs/user-stories.md bagian US-50. Tambahkan kotak tanya jawab berbasis Gemini AI di halaman detail produk. LLM dipanggil dari server tanpa mengirim kunci ke browser. Jawaban hanya boleh berdasarkan data produk (nama, harga, kategori, deskripsi). Batasi panjang pertanyaan dan pasang pembatasan kiriman dasar.

**Hasil:**

Komponen `TanyaProduk` pada detail produk mengirim pertanyaan ke Server Action `tanyaProduk`. Prompt menginstruksikan Gemini untuk menjawab secara ketat hanya dari data produk database dan menolak halusinasi informasi yang tidak tercatat.

**Perbaikan:**

Dipasang honeypot anti-bot dan pembatas laju (rate limiting) berbasis IP (maksimal 5 pertanyaan per 10 menit) di sisi server.


## US-18 hingga US-48 (Batch Skema Database Lengkap)

### US-18 Galeri beberapa foto produk
- Menambahkan tabel `foto_produk` (`produk_id, url, urutan`).
- Komponen `GaleriFoto` di halaman detail produk menampilkan foto utama dan daftar thumbnail interaktif.

### US-19 Status stok produk
- Menambahkan kolom `stok` pada tabel `produk`.
- Produk dengan stok habis (0) menampilkan badge "Habis", menonaktifkan tombol WhatsApp dan tombol keranjang belanja.

### US-20 Harga diskon dan badge produk
- Menambahkan kolom `harga_diskon` dan `badge` pada tabel `produk`.
- Menampilkan harga coret dan harga diskon khusus serta label badge kustom di kartu katalog dan detail produk.

### US-31 Manajemen kategori admin
- Menambahkan tabel `kategori` dan halaman `/admin/kategori` untuk menambah, mengubah, dan menghapus kategori dengan otentikasi admin server.

### US-32 Nonaktifkan produk
- Menambahkan kolom `aktif` pada tabel `produk`.
- Produk nonaktif disembunyikan dari katalog publik dan mengembalikan respons 404 (Not Found) jika tautannya diakses langsung.

### US-38 Ulasan dan rating produk
- Menambahkan tabel `ulasan` (`produk_id, nama, rating, komentar, tampil`).
- Form ulasan di halaman detail produk dilengkapi validasi server, proteksi honeypot spam, dan pembatasan laju IP.

### US-39 Moderasi ulasan di admin
- Menambahkan halaman `/admin/ulasan` untuk melihat semua ulasan, menyembunyikan/menampilkan ulasan, serta menghapus ulasan yang tidak pantas.

### US-40 Statistik klik tombol WhatsApp
- Menambahkan tabel `klik_whatsapp` dan endpoint `POST /api/klik-wa` untuk mencatat metrik konversi klik pesanan tanpa mengganggu alur pengunjung dan tanpa menyimpan data pribadi.

### US-41 Produk terpopuler di admin
- Dashboard admin `/admin` menampilkan 5 produk paling banyak diklik ke WhatsApp beserta total klik. Menampilkan pesan informatif jika belum ada klik.

### US-42 Banner promosi beranda
- Menambahkan tabel `banner` dan halaman manajemen `/admin/banner`.
- Banner aktif otomatis tampil di bagian atas katalog beranda publik.

### US-43 Pengaturan toko dari database
- Menambahkan tabel `pengaturan_toko` dan halaman `/admin/pengaturan`.
- Nama usaha, nomor WhatsApp, jam buka, dan alamat tersinkronisasi dinamis ke Header, Footer, Halaman Tentang, dan link WhatsApp.

### US-45 Log aktivitas admin
- Menambahkan tabel `log_admin` dan halaman `/admin/log`.
- Setiap aksi modifikasi produk, kategori, ulasan, banner, dan pengaturan toko dicatat beserta identitas admin dan stempel waktu.

### US-47 Urutan produk manual
- Menambahkan kolom `urutan` pada tabel `produk`.
- Admin dapat mengatur prioritas urutan tampil produk di katalog beranda dan halaman kategori.

### US-48 Varian produk
- Menambahkan tabel `varian_produk` (`produk_id, nama, harga, urutan`).
- Pengunjung dapat memilih ukuran/varian pada halaman detail produk, harga terbarui otomatis, dan nama varian disertakan ke pesan WhatsApp.

## Debugging dan fitur bonus

Pengujian US-07 sampai US-10 memakai akun uji sementara di Supabase Auth: menambah produk, mengubahnya, menghapusnya, dan memastikan aksi tanpa login ditolak. Produk dan akun uji sudah dihapus kembali; akun admin asli tidak diubah.

US-11 diuji dengan pencarian “kopi”, filter kategori “Minuman”, kombinasi keduanya, dan kata kunci tanpa hasil. US-12 diuji dari HTML detail produk: jumlah awal 1, total harga, dan pesan WhatsApp sudah memuat jumlah. US-13 diuji dengan memastikan `/manifest.webmanifest` bertipe `application/manifest+json`, ikon 192/512 dapat diakses, service worker dapat diakses, dan `<link rel="manifest">` ada di halaman. US-14 diuji sampai jalur error `GEMINI_API_KEY` kosong; generasi sungguhan perlu diuji setelah key diisi di server. Seluruh 14 fitur skema (US-18, 19, 20, 31, 32, 38, 39, 40, 41, 42, 43, 45, 47, 48) teruji dan lulus build Next.js 16 tanpa error.
