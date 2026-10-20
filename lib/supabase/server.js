import { createClient } from "@supabase/supabase-js";

// Koneksi server untuk membaca data publik (katalog dan detail produk).
// Kunci rahasia hanya dipakai di server dan tidak pernah dikirim ke browser.
export function buatKlienServer() {
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_SECRET_KEY;

  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_SECRET_KEY belum diisi.");
  }

  return createClient(url, kunci, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Koneksi tanpa sesi untuk aksi publik yang diizinkan secara terbatas oleh RLS.
export function buatKlienPublik() {
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diisi.");
  }

  return createClient(url, kunci, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
