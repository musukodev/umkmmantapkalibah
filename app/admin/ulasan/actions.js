"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { catatLogAdmin } from "@/lib/log";

export async function toggleTampilUlasan(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const tampilSekarang = formData.get("tampil") === "true";

  if (!id) return;

  const nilaiBaru = !tampilSekarang;
  await supabase.from("ulasan").update({ tampil: nilaiBaru }).eq("id", id);
  await catatLogAdmin(
    supabase,
    user,
    "MODERASI_ULASAN",
    `Ulasan #${id} diubah status tampil ke ${nilaiBaru}`
  );

  revalidatePath("/admin/ulasan");
  revalidatePath("/");
}

export async function hapusUlasan(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) return;

  await supabase.from("ulasan").delete().eq("id", id);
  await catatLogAdmin(supabase, user, "HAPUS_ULASAN", `Ulasan #${id}`);

  revalidatePath("/admin/ulasan");
  revalidatePath("/");
}
