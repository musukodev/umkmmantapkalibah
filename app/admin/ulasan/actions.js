"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { catatLogAdmin } from "@/lib/log";
import { redirect } from "next/navigation";

export async function toggleTampilUlasan(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const tampilSekarang = formData.get("tampil") === "true";

  if (!/^\d+$/.test(id)) redirect("/admin/ulasan?pesan=gagal");

  const nilaiBaru = !tampilSekarang;
  const { data, error } = await supabase
    .from("ulasan")
    .update({ tampil: nilaiBaru })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("Gagal mengubah status ulasan:", error?.message || "Ulasan tidak ditemukan.");
    redirect("/admin/ulasan?pesan=gagal");
  }
  await catatLogAdmin(
    supabase,
    user,
    "MODERASI_ULASAN",
    `Ulasan #${id} diubah status tampil ke ${nilaiBaru}`
  );

  revalidatePath("/admin/ulasan");
  revalidatePath("/");
  redirect("/admin/ulasan?pesan=diperbarui");
}

export async function hapusUlasan(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!/^\d+$/.test(id)) redirect("/admin/ulasan?pesan=gagal");

  const { data, error } = await supabase
    .from("ulasan")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("Gagal menghapus ulasan:", error?.message || "Ulasan tidak ditemukan.");
    redirect("/admin/ulasan?pesan=gagal");
  }
  await catatLogAdmin(supabase, user, "HAPUS_ULASAN", `Ulasan #${id}`);

  revalidatePath("/admin/ulasan");
  revalidatePath("/");
  redirect("/admin/ulasan?pesan=dihapus");
}
