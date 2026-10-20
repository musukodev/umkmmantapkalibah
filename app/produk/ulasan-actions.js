"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { buatKlienServer } from "@/lib/supabase/server";

const batasUlasan = new Map();
const JENDELA_MS = 10 * 60 * 1000;

function ambilIp(kepala) {
  const diteruskan = kepala.get("x-forwarded-for");
  if (diteruskan) {
    return diteruskan.split(",")[0].trim();
  }
  return kepala.get("x-real-ip") || "lokal";
}

function bolehKirimUlasan(ip) {
  const sekarang = Date.now();
  const riwayat = (batasUlasan.get(ip) ?? []).filter(
    (waktu) => sekarang - waktu < JENDELA_MS
  );

  if (riwayat.length >= 3) {
    return false;
  }

  riwayat.push(sekarang);
  batasUlasan.set(ip, riwayat);
  return true;
}

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
    const ip = ambilIp(kepala);

    if (!bolehKirimUlasan(ip)) {
      return {
        error: "Terlalu banyak ulasan dalam waktu singkat. Coba lagi nanti.",
      };
    }

    const supabase = buatKlienServer();
    const { error } = await supabase.from("ulasan").insert({
      produk_id: Number(produkId),
      nama,
      rating,
      komentar: komentar || null,
      tampil: true,
    });

    if (error) {
      console.error("Gagal menyimpan ulasan:", error.message);
      return { error: "Ulasan belum bisa disimpan. Coba lagi beberapa saat lagi." };
    }

    revalidatePath(`/produk/${produkId}`);
    return { sukses: "Terima kasih! Ulasan kamu berhasil dikirim." };
  } catch (error) {
    console.error("Error kirim ulasan:", error.message);
    return { error: "Ulasan belum bisa dikirim. Coba lagi." };
  }
}
