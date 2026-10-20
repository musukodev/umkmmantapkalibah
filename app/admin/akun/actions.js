"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";

function emailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function tambahAdmin(_keadaan, formData) {
  await wajibAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (!email || !emailValid(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  if (password !== konfirmasi) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const admin = buatKlienServer();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error) {
    if (
      error.code === "email_exists" ||
      /already registered|already exists/i.test(error.message)
    ) {
      return { error: "Email ini sudah terdaftar sebagai admin." };
    }

    console.error("Gagal menambah admin:", error.message);
    return { error: "Admin baru belum bisa ditambahkan. Coba lagi." };
  }

  if (!data?.user) {
    return { error: "Admin baru belum bisa ditambahkan. Coba lagi." };
  }

  revalidatePath("/admin/akun");
  return {
    sukses: `Admin ${email} berhasil ditambahkan. Minta pemilik masuk dengan password yang baru dibuat.`,
  };
}

export async function hapusAdmin(formData) {
  const { user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/admin/akun?pesan=gagal");
  }

  if (id === user.id) {
    redirect("/admin/akun?pesan=sendiri");
  }

  const admin = buatKlienServer();
  const { data, error: errorPengguna } = await admin.auth.admin.getUserById(id);

  if (errorPengguna || data?.user?.app_metadata?.role !== "admin") {
    redirect("/admin/akun?pesan=gagal");
  }

  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) {
    console.error("Gagal menghapus admin:", error.message);
    redirect("/admin/akun?pesan=gagal");
  }

  revalidatePath("/admin/akun");
  redirect("/admin/akun?pesan=dihapus");
}
