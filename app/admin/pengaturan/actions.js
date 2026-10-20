"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { catatLogAdmin } from "@/lib/log";

export async function simpanPengaturanToko(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const nomorWa = String(formData.get("nomor_whatsapp") ?? "")
    .trim()
    .replace(/[^\d]/g, "");
  const jamBuka = String(formData.get("jam_buka") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();

  if (!nama) {
    return { error: "Nama toko wajib diisi." };
  }

  if (!/^62\d{8,14}$/.test(nomorWa)) {
    return {
      error:
        "Nomor WhatsApp harus angka format 62xxx dengan panjang 10–16 digit.",
    };
  }

  const payload = {
    nama,
    nomor_whatsapp: nomorWa,
    jam_buka: jamBuka || null,
    alamat: alamat || null,
  };

  // Cek apakah ada record di pengaturan_toko
  const { data: ada } = await supabase
    .from("pengaturan_toko")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (ada?.id) {
    const { error } = await supabase
      .from("pengaturan_toko")
      .update(payload)
      .eq("id", ada.id);

    if (error) {
      return { error: "Pengaturan belum bisa diperbarui. Coba lagi." };
    }
  } else {
    const { error } = await supabase.from("pengaturan_toko").insert(payload);
    if (error) {
      return { error: "Pengaturan belum bisa disimpan. Coba lagi." };
    }
  }

  await catatLogAdmin(
    supabase,
    user,
    "UBAH_PENGATURAN_TOKO",
    `${nama} (${nomorWa})`
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pengaturan");
  revalidatePath("/tentang");
  revalidatePath("/keranjang");

  return { sukses: "Pengaturan identitas toko berhasil disimpan." };
}
