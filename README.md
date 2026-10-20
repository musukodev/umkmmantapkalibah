# Katalog UMKM + Order WhatsApp

Template workshop vibe coding Creative Hub App Talent (CHAT) 2026. Repo ini berisi tampilan aplikasi katalog UMKM; tugasmu merangkainya menjadi sistem utuh dengan bantuan AI: database, login admin, keamanan, dan pemesanan lewat WhatsApp.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fandixurniawan%2Fkatalog-umkm&project-name=katalog-umkm&repository-name=katalog-umkm)

## Langkah awal

1. **Salin repo ke akun GitHub-mu.** Klik tombol **Deploy with Vercel** di atas. Vercel akan membuat repo baru di akun GitHub-mu dan langsung men-deploy-nya. Setelah selesai, buka link Vercel-mu: katalog tampil dengan data contoh.
2. **Buat proyek Supabase.** Masuk ke [supabase.com](https://supabase.com) dengan akun GitHub, lalu buat proyek baru. Simpan password database di tempat aman.
3. **Siapkan database.** Di Supabase, buka **SQL Editor**, tempel seluruh isi `docs/schema.sql`, lalu klik **Run**. Tabel `produk` beserta data awal akan terbentuk.
4. **Pasang tabel dan aturan fitur bonus.** Jalankan seluruh isi `docs/schema-tambahan.sql` setelah `schema.sql`. Fitur admin, galeri, ulasan, statistik, dan pembatasan kiriman memerlukan skema ini.
5. **Siapkan akun admin.** Buat dan konfirmasi pengguna di **Authentication > Users**, lalu jalankan `docs/bootstrap-admin.sql` setelah mengganti placeholder dengan email akun tersebut. Ini memberi role admin yang diperiksa aplikasi. Setelah itu matikan pendaftaran akun baru di **Authentication > Sign In / Providers**.
6. **Isi environment variable di Vercel.** Buka proyekmu di Vercel > **Settings > Environment Variables**, lalu isi variabel dari `.env.example`: tiga variabel Supabase, ditambah `GEMINI_API_KEY` kalau memakai fitur AI. Nilai Supabase ada di **Project Settings > API**. Setelah itu lakukan **Redeploy**.
7. **Clone repo ke laptop.**

   ```bash
   git clone https://github.com/<akunmu>/<nama-repo>.git
   cd <nama-repo>
   npm install
   ```

8. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi dengan nilai yang sama seperti di Vercel.
9. **Jalankan di laptop.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Alur kerja

Kerjakan satu user story setiap kali, lalu simpan dan kirim perubahan:

```bash
git add .
git commit -m "US-01: katalog dari database"
git push
```

Setiap `git push`, Vercel otomatis men-deploy versi terbaru. Cek hasilnya di link Vercel-mu.

Urutan yang disarankan: US-01, US-02, US-03, US-04, US-05, US-06, lalu fitur bonus. Daftar lengkap ada di `docs/user-stories.md`.

## Isi repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt, wajib diisi |
| `docs/` | Problem statement, PRD, user story, rancangan teknis, skema database, checklist |
| `lib/toko.js` | Nama toko, nomor WhatsApp, alamat, jam buka |
| `app/` | Halaman aplikasi |
| `components/` | Komponen tampilan |

## Menyesuaikan dengan usahamu

- Identitas toko: ubah `lib/toko.js`.
- Warna: ubah bagian `@theme` di `app/globals.css` (lihat `DESIGN.md`).
- Produk: ubah langsung di Supabase > **Table Editor > produk**.
- Deskripsi AI: isi `GEMINI_API_KEY` di server (lokal dan Vercel). `GEMINI_MODEL` opsional; default `gemini-2.5-flash`.

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Isi `PROMPTS.md` setiap menyelesaikan fitur.

## Sebelum mengumpulkan

1. Jalankan semua poin di `docs/checklist-keamanan.md` dan `docs/checklist-pengujian.md` pada link Vercel.
2. Lengkapi bagian di bawah ini.
3. Push perubahan terakhir sebelum batas waktu.

## Tentang aplikasi ini

- **Nama usaha:** Terpal B
- **Pembuat:** musukodev
- **Link aplikasi:** https://umkmmantapkalibah.vercel.app
- **Fitur bonus yang dikerjakan:** Seluruh 44 Fitur Bonus Lengkap (US-07 hingga US-50, 500/500 Poin Selesai):
  - US-07 (Daftar produk admin)
  - US-08 (Tambah produk)
  - US-09 (Ubah produk)
  - US-10 (Hapus produk)
  - US-11 (Filter kategori & pencarian kata kunci)
  - US-12 (Pilih jumlah pesanan WhatsApp)
  - US-13 (Progressive Web App / PWA)
  - US-14 (Generate deskripsi dengan AI Gemini)
  - US-15 (Urutkan produk: termurah, termahal, terbaru)
  - US-16 (Paginasi katalog publik)
  - US-17 (Rekomendasi produk terkait)
  - US-18 (Galeri multi-foto produk dengan thumbnail interaktif)
  - US-19 (Status & kontrol stok habis)
  - US-20 (Harga coret/diskon & badge produk kustom)
  - US-21 (Keranjang belanja multi-item terintegrasi WhatsApp)
  - US-22 (Halaman Tentang Toko dinamis)
  - US-23 (Bagikan tautan & salin link produk)
  - US-24 (Simpan produk favorit browser)
  - US-25 (Mode gelap / dark mode anti-flash)
  - US-26 (Metadata SEO & Open Graph gambar)
  - US-27 (Sitemap.xml dinamis & Robots.txt)
  - US-28 (Loading skeleton & 404 Not Found kustom)
  - US-29 (Upload foto langsung ke Supabase Storage)
  - US-30 (Ringkasan total produk & kategori di admin)
  - US-31 (Manajemen kategori lengkap di admin)
  - US-32 (Fitur nonaktifkan / sembunyikan produk dari katalog)
  - US-33 (Pencarian & paginasi produk di admin)
  - US-34 (Validasi harga strictly > 0 di server)
  - US-35 (Ekspor seluruh data produk ke file CSV)
  - US-36 (Produk terakhir dilihat oleh pengunjung)
  - US-37 (Bandingkan spesifikasi 2 produk berdampingan)
  - US-38 (Ulasan & rating bintang pembeli dengan anti-spam)
  - US-39 (Moderasi & hapus ulasan di admin)
  - US-40 (Pencatatan statistik klik tombol WhatsApp)
  - US-41 (Daftar 5 produk terpopuler berdasarkan klik WA di admin)
  - US-42 (Manajemen banner promo beranda di admin)
  - US-43 (Pengaturan identitas toko dari database)
  - US-44 (Manajemen akun & daftar admin di admin)
  - US-45 (Audit log riwayat aktivitas admin)
  - US-46 (Impor produk massal dari file CSV dengan validasi)
  - US-47 (Urutan posisi produk manual kustom)
  - US-48 (Pilihan ukuran/varian harga produk dinamis ke WA)
  - US-49 (Halaman katalog rute dinamis per kategori)
  - US-50 (Tanya jawab produk berbantu Gemini AI dengan guardrails)
