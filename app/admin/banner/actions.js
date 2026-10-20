"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { catatLogAdmin } from "@/lib/log";

export async function simpanBanner(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const judul = String(formData.get("judul") ?? "").trim();
  const teks = String(formData.get("teks") ?? "").trim();
  const gambar_url = String(formData.get("gambar_url") ?? "").trim();
  const tautan = String(formData.get("tautan") ?? "").trim();
  const aktif = formData.get("aktif") === "on" || formData.get("aktif") === "true";

  if (!judul) {
    return { error: "Judul banner wajib diisi." };
  }

  const payload = {
    judul,
    teks: teks || null,
    gambar_url: gambar_url || null,
    tautan: tautan || null,
    aktif,
  };

  if (id) {
    const { error } = await supabase.from("banner").update(payload).eq("id", id);
    if (error) {
      return { error: "Banner belum bisa diperbarui. Coba lagi." };
    }
    await catatLogAdmin(supabase, user, "UBAH_BANNER", `${judul} (#${id})`);
  } else {
    const { error } = await supabase.from("banner").insert(payload);
    if (error) {
      return { error: "Banner belum bisa disimpan. Coba lagi." };
    }
    await catatLogAdmin(supabase, user, "TAMBAH_BANNER", judul);
  }

  revalidatePath("/admin/banner");
  revalidatePath("/");
  return { sukses: "Banner berhasil disimpan." };
}

export async function toggleAktifBanner(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const aktifSekarang = formData.get("aktif") === "true";

  if (!id) return;

  const nilaiBaru = !aktifSekarang;
  await supabase.from("banner").update({ aktif: nilaiBaru }).eq("id", id);
  await catatLogAdmin(
    supabase,
    user,
    "MODERASI_BANNER",
    `Banner #${id} aktif diubah ke ${nilaiBaru}`
  );

  revalidatePath("/admin/banner");
  revalidatePath("/");
}

export async function hapusBanner(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!id) return;

  await supabase.from("banner").delete().eq("id", id);
  await catatLogAdmin(supabase, user, "HAPUS_BANNER", `Banner #${id}`);

  revalidatePath("/admin/banner");
  revalidatePath("/");
}
