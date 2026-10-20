"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { catatLogAdmin } from "@/lib/log";
import { redirect } from "next/navigation";

export async function toggleAktifProduk(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const aktifSekarang = formData.get("aktif") === "true";

  if (!/^\d+$/.test(id)) {
    redirect("/admin?pesan=gagal-status");
  }

  const { data, error } = await supabase
    .from("produk")
    .update({ aktif: !aktifSekarang })
    .eq("id", id)
    .select("nama")
    .maybeSingle();

  if (error || !data) {
    console.error("Gagal mengubah status produk:", error?.message || "Produk tidak ditemukan.");
    redirect("/admin?pesan=gagal-status");
  }

  await catatLogAdmin(
    supabase,
    user,
    "UBAH_STATUS_PRODUK",
    `${data.nama} (ID: ${id}) aktif=${!aktifSekarang}`
  );
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
}
