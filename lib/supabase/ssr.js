import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Koneksi sesi admin. Memakai kunci publishable dan cookie login,
// sehingga aturan RLS tetap berlaku untuk aksi yang mengubah data.
export async function buatKlienSesi() {
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diisi.");
  }

  return createServerClient(url, kunci, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component tidak boleh menulis cookie. Pembaruan sesi
          // ditangani oleh proxy.js pada permintaan berikutnya.
        }
      },
    },
  });
}
