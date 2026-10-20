-- Ganti placeholder dengan email pengguna yang dibuat di Supabase Auth.
-- Jalankan sekali sebelum login pertama. Aman dijalankan ulang untuk akun yang sama.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where lower(email) = lower('GANTI_DENGAN_EMAIL_ADMIN');
