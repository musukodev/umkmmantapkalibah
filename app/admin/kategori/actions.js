"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  if (!/^\d+$/.test(id) || !nama) {
    return { error: "ID dan nama kategori wajib diisi." };
  }

  const slug = slugify(nama);

  if (!slug || nama.length > 80) {
    return { error: "Nama kategori harus memuat huruf atau angka.", nilai: { id, nama } };
  }

  const { data: kategoriLama, error: errorBaca } = await supabase
    .from("kategori")
    .select("nama")
    .eq("id", id)
    .maybeSingle();

  if (errorBaca || !kategoriLama) {
    return { error: "Kategori tidak ditemukan. Muat ulang halaman lalu coba lagi.", nilai: { id, nama } };
  }

  const { error } = await supabase.rpc("ubah_kategori_dan_produk", {
    p_id: Number(id),
    p_nama: nama,
    p_slug: slug,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Kategori dengan nama atau slug ini sudah ada.", nilai: { id, nama } };
    }
    console.error("Gagal mengubah kategori:", error.message);
    return { error: "Kategori belum bisa diubah. Coba lagi.", nilai: { id, nama } };
  }

  await catatLogAdmin(supabase, user, "UBAH_KATEGORI", `${kategoriLama.nama} menjadi ${nama} (#${id})`);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  return { sukses: "Kategori berhasil diperbarui.", nilai: { id, nama } };
}

export async function hapusKategori(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!/^\d+$/.test(id)) {
    redirect("/admin/kategori?pesan=gagal-hapus");
  }

  const { data: kategori, error: errorKategori } = await supabase
    .from("kategori")
    .select("nama")
    .eq("id", id)
    .maybeSingle();

  if (errorKategori || !kategori) {
    redirect("/admin/kategori?pesan=gagal-hapus");
  }

  const { count, error: errorHitung } = await supabase
    .from("produk")
    .select("id", { count: "exact", head: true })
    .eq("kategori", kategori.nama);

  if (errorHitung) {
    console.error("Gagal memeriksa penggunaan kategori:", errorHitung.message);
    redirect("/admin/kategori?pesan=gagal-hapus");
  }

  if (count > 0) {
    redirect("/admin/kategori?pesan=kategori-dipakai");
  }

  const { error } = await supabase.from("kategori").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus kategori:", error.message);
    redirect("/admin/kategori?pesan=gagal-hapus");
  }

  await catatLogAdmin(supabase, user, "HAPUS_KATEGORI", `${kategori.nama} (#${id})`);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  redirect("/admin/kategori?pesan=dihapus");
}
