"use server";

import { headers } from "next/headers";
import { jawabPertanyaanProduk } from "@/lib/gemini";
import { buatKlienServer } from "@/lib/supabase/server";

const JENDELA_MS = 10 * 60 * 1000;
const MAKS_PERTANYAAN = 5;
const riwayatTanya = new Map();

function ambilIp(kepala) {
  const diteruskan = kepala.get("x-forwarded-for");

  if (diteruskan) {
    return diteruskan.split(",")[0].trim();
  }

  return kepala.get("x-real-ip") || "lokal";
}

function bolehBertanya(ip) {
  const sekarang = Date.now();
  const daftar = (riwayatTanya.get(ip) ?? []).filter(
    (waktu) => sekarang - waktu < JENDELA_MS
  );

  if (daftar.length >= MAKS_PERTANYAAN) {
    riwayatTanya.set(ip, daftar);
    return false;
  }

  daftar.push(sekarang);
  riwayatTanya.set(ip, daftar);

  if (riwayatTanya.size > 500) {
    for (const [kunci, nilai] of riwayatTanya) {
      if (!nilai.some((waktu) => sekarang - waktu < JENDELA_MS)) {
        riwayatTanya.delete(kunci);
      }
    }
  }

  return true;
}

function pesanKesalahanGemini(error) {
  if (error.code === "KUNCI_KOSONG") {
    return "Fitur tanya AI belum dikonfigurasi oleh pemilik toko.";
  }

  if (error.code === "TIMEOUT") {
    return "Asisten terlalu lama menjawab. Coba lagi.";
  }

  if (error.code === "KUOTA") {
    return "Kuota asisten sedang habis. Coba lagi nanti.";
  }

  if (error.code === "MODEL") {
    return "Model AI belum tersedia. Hubungi pemilik toko.";
  }

  if (error.code === "DIBLOKIR") {
    return "Pertanyaan ini tidak bisa dijawab. Coba tulis dengan cara lain.";
  }

  return "Pertanyaan belum bisa dijawab. Coba lagi beberapa saat lagi.";
}

export async function tanyaProduk(_keadaan, formData) {
  const id = String(formData.get("id") ?? "").trim();
  const pertanyaan = String(formData.get("pertanyaan") ?? "").trim();
  const jebakan = String(formData.get("situs_web") ?? "").trim();

  if (jebakan) {
    return { error: "Pertanyaan tidak bisa diproses." };
  }

  if (!/^\d+$/.test(id)) {
    return { error: "Produk tidak ditemukan." };
  }

  if (pertanyaan.length < 3) {
    return { error: "Tulis pertanyaan minimal 3 karakter." };
  }

  if (pertanyaan.length > 300) {
    return { error: "Pertanyaan maksimal 300 karakter." };
  }

  try {
    const kepala = await headers();
    const ip = ambilIp(kepala);

    if (!bolehBertanya(ip)) {
      return {
        error: "Terlalu banyak pertanyaan. Coba lagi beberapa menit lagi.",
      };
    }

    const supabase = buatKlienServer();
    const { data: produk, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, deskripsi")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!produk) {
      return { error: "Produk tidak ditemukan." };
    }

    const jawaban = await jawabPertanyaanProduk({ produk, pertanyaan });
    return { jawaban };
  } catch (error) {
    if (error.code) {
      return { error: pesanKesalahanGemini(error) };
    }

    console.error("Gagal menjawab pertanyaan produk:", error.message);
    return {
      error: "Pertanyaan belum bisa dijawab. Coba lagi beberapa saat lagi.",
    };
  }
}
