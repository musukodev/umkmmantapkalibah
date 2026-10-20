import { redirect } from "next/navigation";
import { buatKlienSesi } from "@/lib/supabase/ssr";

// Dipakai halaman dan Server Action admin. Proxy.js menjaga rute /admin,
// lalu pemeriksaan ini memastikan aksi tetap ditolak tanpa sesi yang sah.
export async function wajibAdmin() {
  const supabase = await buatKlienSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return { supabase, user };
}
