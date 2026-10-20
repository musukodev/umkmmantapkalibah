-- Skema Tambahan Database Katalog UMKM untuk Bonus US-18 sampai US-48
-- Cara pakai: Supabase > SQL Editor > New query > tempel isi file ini > Run.
-- Aman dijalankan ulang.

-- 1. Tambah kolom di tabel produk (US-19, US-20, US-32, US-47)
alter table public.produk
  add column if not exists stok integer not null default 10,
  add column if not exists harga_diskon integer check (harga_diskon is null or harga_diskon >= 0),
  add column if not exists badge text,
  add column if not exists aktif boolean not null default true,
  add column if not exists urutan integer not null default 0;

-- 2. Tabel foto produk tambahan (US-18 Galeri foto)
create table if not exists public.foto_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  url text not null,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Tabel kategori (US-31 Kelola kategori)
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Isi kategori awal dari data produk yang sudah ada jika tabel kategori masih kosong
insert into public.kategori (nama, slug)
select distinct kategori, lower(regexp_replace(kategori, '[^a-zA-Z0-9]+', '-', 'g'))
from public.produk
where kategori is not null
on conflict (nama) do nothing;

-- 4. Tabel ulasan produk (US-38 Ulasan & US-39 Moderasi ulasan)
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  komentar text,
  tampil boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. Tabel catatan klik WhatsApp (US-40 & US-41 Produk terlaris)
create table if not exists public.klik_whatsapp (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 6. Tabel banner promo di beranda (US-42 Banner promo)
create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text,
  tautan text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. Tabel pengaturan toko dari admin (US-43 Pengaturan toko)
create table if not exists public.pengaturan_toko (
  id bigint generated always as identity primary key,
  nama text not null,
  nomor_whatsapp text not null,
  jam_buka text,
  alamat text,
  created_at timestamptz not null default now()
);

-- Isi pengaturan toko awal jika masih kosong
insert into public.pengaturan_toko (nama, nomor_whatsapp, jam_buka, alamat)
select 'Terpal B', '6281378280892', 'Buka pukul 08.00', 'Politeknik Negeri Batam'
where not exists (select 1 from public.pengaturan_toko);

-- 8. Tabel log aktivitas admin (US-45 Log aktivitas)
create table if not exists public.log_admin (
  id bigint generated always as identity primary key,
  user_id uuid,
  email text,
  aksi text not null,
  target text,
  created_at timestamptz not null default now()
);

-- 9. Tabel varian harga per ukuran (US-48 Varian)
create table if not exists public.varian_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  harga integer not null check (harga >= 0),
  created_at timestamptz not null default now()
);

-- 10. Aktifkan RLS di semua tabel baru
alter table public.foto_produk enable row level security;
alter table public.kategori enable row level security;
alter table public.ulasan enable row level security;
alter table public.klik_whatsapp enable row level security;
alter table public.banner enable row level security;
alter table public.pengaturan_toko enable row level security;
alter table public.log_admin enable row level security;
alter table public.varian_produk enable row level security;

-- 11. Kebijakan RLS (hanya admin authenticated yang boleh ubah)
drop policy if exists "admin_semua_foto_produk" on public.foto_produk;
create policy "admin_semua_foto_produk" on public.foto_produk for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_kategori" on public.kategori;
create policy "admin_semua_kategori" on public.kategori for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_ulasan" on public.ulasan;
create policy "admin_semua_ulasan" on public.ulasan for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_klik_whatsapp" on public.klik_whatsapp;
create policy "admin_semua_klik_whatsapp" on public.klik_whatsapp for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_banner" on public.banner;
create policy "admin_semua_banner" on public.banner for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_pengaturan_toko" on public.pengaturan_toko;
create policy "admin_semua_pengaturan_toko" on public.pengaturan_toko for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_log_admin" on public.log_admin;
create policy "admin_semua_log_admin" on public.log_admin for all to authenticated using (true) with check (true);

drop policy if exists "admin_semua_varian_produk" on public.varian_produk;
create policy "admin_semua_varian_produk" on public.varian_produk for all to authenticated using (true) with check (true);
