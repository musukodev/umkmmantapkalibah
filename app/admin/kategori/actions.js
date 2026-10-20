"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { catatLogAdmin } from "@/lib/log";

export async function tambahKategori(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();
  const nama = String(formData.get("nama") ?? "").trim();

  if (!nama) {
    return { error: "Nama kategori wajib diisi." };
  }

  const slug = slugify(nama);

  const { error } = await supabase.from("kategori").insert({ nama, slug });

  if (error) {
    if (error.code === "23505") {
      return { error: "Kategori dengan nama atau slug ini sudah ada." };
    }
    return { error: "Kategori belum bisa ditambahkan. Coba lagi." };
  }

  await catatLogAdmin(supabase, user, "TAMBAH_KATEGORI", nama);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  return { sukses: "Kategori berhasil ditambahkan." };
}

export async function ubahKategori(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();

  if (!id || !nama) {
    return { error: "ID dan nama kategori wajib diisi." };
  }

  const slug = slugify(nama);

  const { error } = await supabase
    .from("kategori")
    .update({ nama, slug })
    .eq("id", id);

  if (error) {
    return { error: "Kategori belum bisa diubah. Coba lagi." };
  }

  await catatLogAdmin(supabase, user, "UBAH_KATEGORI", `${nama} (#${id})`);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  return { sukses: "Kategori berhasil diperbarui." };
}

export async function hapusKategori(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();

  if (!id) return;

  const { error } = await supabase.from("kategori").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus kategori:", error.message);
    return;
  }

  await catatLogAdmin(supabase, user, "HAPUS_KATEGORI", `${nama} (#${id})`);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
}
