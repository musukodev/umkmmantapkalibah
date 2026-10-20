"use server";

import { revalidatePath } from "next/cache";
import { wajibAdmin } from "@/lib/auth";

function parseCsv(teks) {
  const bersih = String(teks ?? "").replace(/^\uFEFF/, "");
  const baris = [];
  let barisKini = [];
  let sel = "";
  let dalamKutip = false;

  for (let i = 0; i < bersih.length; i += 1) {
    const huruf = bersih[i];

    if (dalamKutip) {
      if (huruf === '"' && bersih[i + 1] === '"') {
        sel += '"';
        i += 1;
      } else if (huruf === '"') {
        dalamKutip = false;
      } else {
        sel += huruf;
      }
      continue;
    }

    if (huruf === '"') {
      dalamKutip = true;
    } else if (huruf === ",") {
      barisKini.push(sel);
      sel = "";
    } else if (huruf === "\n") {
      barisKini.push(sel);
      baris.push(barisKini);
      barisKini = [];
      sel = "";
    } else if (huruf === "\r") {
      if (bersih[i + 1] !== "\n") {
        barisKini.push(sel);
        baris.push(barisKini);
        barisKini = [];
        sel = "";
      }
    } else {
      sel += huruf;
    }
  }

  if (sel !== "" || barisKini.length > 0) {
    barisKini.push(sel);
    baris.push(barisKini);
  }

  return baris.filter((item) => item.some((kolom) => kolom.trim() !== ""));
}

export async function imporProduk(_keadaan, formData) {
  const { supabase } = await wajibAdmin();
  const file = formData.get("file");

  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "Pilih file CSV yang mau diimpor." };
  }

  if (
    !/\.csv$/i.test(file.name) &&
    file.type !== "text/csv" &&
    file.type !== "application/vnd.ms-excel"
  ) {
    return { error: "File harus berformat CSV." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 2 MB." };
  }

  let baris;
  try {
    baris = parseCsv(await file.text());
  } catch {
    return { error: "File CSV tidak bisa dibaca." };
  }

  if (baris.length < 2) {
    return { error: "File CSV harus berisi header dan minimal satu baris produk." };
  }

  const header = baris[0].map((kolom) => kolom.trim().toLowerCase());
  const indeksNama = header.indexOf("nama");
  const indeksHarga = header.indexOf("harga");

  if (indeksNama === -1 || indeksHarga === -1) {
    return {
      error: "Header CSV wajib memuat kolom nama dan harga.",
    };
  }

  const indeksKategori = header.indexOf("kategori");
  const indeksDeskripsi = header.indexOf("deskripsi");
  const indeksFoto = header.indexOf("foto_url");
  const valid = [];
  const dilewati = [];

  for (let i = 1; i < baris.length; i += 1) {
    const kolom = baris[i];
    const nomorBaris = i + 1;
    const nama = String(kolom[indeksNama] ?? "").trim();
    const hargaTeks = String(kolom[indeksHarga] ?? "").trim();
    const harga = Number(hargaTeks);

    if (!nama) {
      dilewati.push(`Baris ${nomorBaris}: nama produk kosong.`);
      continue;
    }

    if (
      !/^\d+$/.test(hargaTeks) ||
      !Number.isSafeInteger(harga) ||
      harga <= 0 ||
      harga > 2147483647 ||
      nama.length > 200
    ) {
      dilewati.push(
        `Baris ${nomorBaris}: nama maksimal 200 karakter dan harga harus angka bulat 1 sampai 2147483647.`
      );
      continue;
    }

    valid.push({
      nama: nama.slice(0, 200),
      harga,
      kategori:
        indeksKategori >= 0
          ? String(kolom[indeksKategori] ?? "").trim().slice(0, 80) || null
          : null,
      deskripsi:
        indeksDeskripsi >= 0
          ? String(kolom[indeksDeskripsi] ?? "").trim().slice(0, 2000) || null
          : null,
      foto_url:
        indeksFoto >= 0
          ? String(kolom[indeksFoto] ?? "").trim().slice(0, 500) || null
          : null,
    });
  }

  if (valid.length === 0) {
    return {
      error: "Tidak ada baris valid yang bisa diimpor.",
      dilewati,
    };
  }

  const { error } = await supabase.from("produk").insert(valid);

  if (error) {
    console.error("Gagal mengimpor produk:", error.message);
    return {
      error: "Produk belum bisa diimpor. Coba lagi beberapa saat lagi.",
      dilewati,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    sukses: `${valid.length} produk berhasil diimpor${
      dilewati.length > 0
        ? `, ${dilewati.length} baris dilewati.`
        : "."
    }`,
    dilewati,
  };
}
