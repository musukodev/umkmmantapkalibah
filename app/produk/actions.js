"use server";

import { headers } from "next/headers";
import { jawabPertanyaanProduk } from "@/lib/gemini";
import { buatKlienServer } from "@/lib/supabase/server";
import { bolehLakukanAksi } from "@/lib/rate-limit";

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
    if (!(await bolehLakukanAksi(kepala, "tanya_produk", 5, 600))) {
      return {
        error: "Terlalu banyak pertanyaan. Coba lagi beberapa menit lagi.",
      };
    }

    const supabase = buatKlienServer();
    const { data: produk, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, deskripsi")
      .eq("id", id)
      .eq("aktif", true)
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
    if (error.message === "Pemeriksaan batas kiriman belum bisa dilakukan.") {
      return { error: "Asisten sementara tidak tersedia. Coba lagi beberapa saat lagi." };
    }
    if (error.code) {
      return { error: pesanKesalahanGemini(error) };
    }

    console.error("Gagal menjawab pertanyaan produk:", error.message);
    return {
      error: "Pertanyaan belum bisa dijawab. Coba lagi beberapa saat lagi.",
    };
  }
}
