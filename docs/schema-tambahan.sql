-- Skema Tambahan Database Katalog UMKM untuk fitur bonus.
-- Jalankan docs/schema.sql lebih dahulu.
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
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- Pastikan instalasi lama juga memiliki kolom urutan.
alter table public.varian_produk
  add column if not exists urutan integer not null default 0;

-- Bucket publik hanya membuka pembacaan objek; tidak ada policy upload publik.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produk', 'produk', true, 2097152, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 10. Aktifkan RLS di semua tabel baru
alter table public.foto_produk enable row level security;
alter table public.kategori enable row level security;
alter table public.ulasan enable row level security;
alter table public.klik_whatsapp enable row level security;
alter table public.banner enable row level security;
alter table public.pengaturan_toko enable row level security;
alter table public.log_admin enable row level security;
alter table public.varian_produk enable row level security;

-- 11. Kebijakan RLS (hanya akun dengan app_metadata.role=admin yang boleh mengubah)
drop policy if exists "admin_role_produk" on public.produk;
create policy "admin_role_produk" on public.produk
  as restrictive for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_semua_foto_produk" on public.foto_produk;
create policy "admin_semua_foto_produk" on public.foto_produk for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_semua_kategori" on public.kategori;
create policy "admin_semua_kategori" on public.kategori for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.ubah_kategori_dan_produk(
  p_id bigint,
  p_nama text,
  p_slug text
) returns void
language plpgsql
set search_path = public
as $$
declare
  nama_lama text;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Akses admin diperlukan';
  end if;
  select nama into nama_lama from public.kategori where id = p_id;
  if nama_lama is null then
    raise exception 'Kategori tidak ditemukan';
  end if;

  update public.produk set kategori = p_nama where kategori = nama_lama;
  update public.kategori set nama = p_nama, slug = p_slug where id = p_id;
end;
$$;
revoke all on function public.ubah_kategori_dan_produk(bigint, text, text) from public, anon;
grant execute on function public.ubah_kategori_dan_produk(bigint, text, text) to authenticated;

drop policy if exists "admin_semua_ulasan" on public.ulasan;
create policy "admin_semua_ulasan" on public.ulasan for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "pengunjung_kirim_ulasan" on public.ulasan;
create policy "pengunjung_kirim_ulasan" on public.ulasan
  for insert to anon with check (tampil = false);

drop policy if exists "admin_semua_klik_whatsapp" on public.klik_whatsapp;
create policy "admin_semua_klik_whatsapp" on public.klik_whatsapp for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Penulisan klik dilakukan route server yang membatasi laju, bukan klien anon.
drop policy if exists "pengunjung_catat_klik_whatsapp" on public.klik_whatsapp;

create or replace view public.ringkasan_klik_whatsapp
with (security_invoker = true) as
select produk_id, count(*)::bigint as jumlah_klik
from public.klik_whatsapp
group by produk_id;
grant select on public.ringkasan_klik_whatsapp to authenticated;

drop policy if exists "admin_semua_banner" on public.banner;
create policy "admin_semua_banner" on public.banner for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_semua_pengaturan_toko" on public.pengaturan_toko;
create policy "admin_semua_pengaturan_toko" on public.pengaturan_toko for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_semua_log_admin" on public.log_admin;
create policy "admin_semua_log_admin" on public.log_admin for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_semua_varian_produk" on public.varian_produk;
create policy "admin_semua_varian_produk" on public.varian_produk for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_upload_foto_produk" on storage.objects;
create policy "admin_upload_foto_produk" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'produk'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Batas kiriman bersama lintas serverless instance. Hanya sidik jari hash yang disimpan.
-- RPC hanya dapat dipanggil server dengan SUPABASE_SECRET_KEY.
create table if not exists public.rate_limit (
  sidik_jari text not null,
  aksi text not null,
  dibuat_pada timestamptz not null default now()
);
create index if not exists rate_limit_aksi_waktu_idx
  on public.rate_limit (aksi, dibuat_pada);
alter table public.rate_limit enable row level security;

create or replace function public.izinkan_laju(
  p_sidik_jari text,
  p_aksi text,
  p_batas integer,
  p_jendela_detik integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  jumlah integer;
  aksi_saat_ini text;
begin
  if p_batas < 1 or p_batas > 100
    or p_jendela_detik < 1 or p_jendela_detik > 86400
    or length(p_sidik_jari) <> 64
    or p_aksi not in ('login', 'ulasan', 'tanya_produk', 'klik_wa') then
    return false;
  end if;

  aksi_saat_ini := p_aksi;
  perform pg_advisory_xact_lock(hashtextextended(aksi_saat_ini || ':' || p_sidik_jari, 0));
  delete from public.rate_limit
    where dibuat_pada < now() - interval '1 day';
  select count(*) into jumlah
    from public.rate_limit
    where aksi = aksi_saat_ini
      and sidik_jari = p_sidik_jari
      and dibuat_pada >= now() - make_interval(secs => p_jendela_detik);
  if jumlah >= p_batas then
    return false;
  end if;
  insert into public.rate_limit (sidik_jari, aksi) values (p_sidik_jari, aksi_saat_ini);
  return true;
end;
$$;
revoke all on function public.izinkan_laju(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.izinkan_laju(text, text, integer, integer)
  to service_role;
