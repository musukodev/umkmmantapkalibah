"use server";

import { redirect } from "next/navigation";
import { buatKlienSesi } from "@/lib/supabase/ssr";
import { wajibAdmin } from "@/lib/auth";

export async function masuk(_keadaan, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienSesi();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Akun ini belum dikonfirmasi. Hubungi pemilik toko." };
    }

    if (error.status === 400 || error.code === "invalid_credentials") {
      return { error: "Email atau password salah. Periksa lagi lalu coba." };
    }

    return { error: "Login belum bisa diproses. Coba lagi beberapa saat lagi." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(_keadaan, formData) {
  const { supabase } = await wajibAdmin();

  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasi) {
    return { error: "Konfirmasi password tidak sama. Ketik ulang password baru." };
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    if (error.code === "same_password") {
      return { error: "Password baru harus berbeda dari password lama." };
    }

    return { error: "Password belum bisa diganti. Coba lagi beberapa saat lagi." };
  }

  return { sukses: "Password berhasil diganti. Gunakan password baru saat masuk berikutnya." };
}
