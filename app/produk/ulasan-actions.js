"use server";

import { revalidatePath } from "next/cache";
import { buatKlienPublik } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { bolehLakukanAksi } from "@/lib/rate-limit";

export async function kirimUlasan(_keadaan, formData) {
  const produkId = String(formData.get("produk_id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const komentar = String(formData.get("komentar") ?? "").trim();
  const jebakan = String(formData.get("situs_web") ?? "").trim();

  if (jebakan) {
    return { error: "Ulasan tidak bisa dikirim." };
  }

  if (!/^\d+$/.test(produkId)) {
    return { error: "Produk tidak valid." };
  }

  if (nama.length < 2 || nama.length > 60) {
    return { error: "Nama pengulas harus antara 2 sampai 60 karakter." };
  }

  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Pilih rating bintang 1 sampai 5." };
  }

  if (komentar.length > 500) {
    return { error: "Komentar maksimal 500 karakter." };
  }

  try {
    const kepala = await headers();

    if (!(await bolehLakukanAksi(kepala, "ulasan", 3, 600))) {
      return {
        error: "Terlalu banyak ulasan dalam waktu singkat. Coba lagi nanti.",
      };
    }

    const supabase = buatKlienPublik();
    const { error } = await supabase.from("ulasan").insert({
      produk_id: Number(produkId),
      nama,
      rating,
      komentar: komentar || null,
      tampil: false,
    });

    if (error) {
      console.error("Gagal menyimpan ulasan:", error.message);
      return { error: "Ulasan belum bisa disimpan. Coba lagi beberapa saat lagi." };
    }

    revalidatePath(`/produk/${produkId}`);
    return { sukses: "Terima kasih! Ulasan dikirim dan akan tampil setelah diperiksa." };
  } catch (error) {
    if (error.message === "Pemeriksaan batas kiriman belum bisa dilakukan.") {
      return { error: "Ulasan sementara tidak tersedia. Coba lagi beberapa saat lagi." };
    }
    console.error("Error kirim ulasan:", error.message);
    return { error: "Ulasan belum bisa dikirim. Coba lagi." };
  }
}
