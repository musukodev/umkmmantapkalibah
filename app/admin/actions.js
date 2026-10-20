"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { buatKlienSesi } from "@/lib/supabase/ssr";
import { wajibAdmin } from "@/lib/auth";
import { buatDeskripsiDenganGemini } from "@/lib/gemini";
import { catatLogAdmin } from "@/lib/log";
import { bolehLakukanAksi } from "@/lib/rate-limit";


const TIPE_FOTO = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const UKURAN_FOTO_MAKS = 2 * 1024 * 1024;

function bacaNilaiProduk(formData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    nama: String(formData.get("nama") ?? "").trim(),
    harga: String(formData.get("harga") ?? "").trim(),
    harga_diskon: String(formData.get("harga_diskon") ?? "").trim(),
    stok: String(formData.get("stok") ?? "").trim(),
    badge: String(formData.get("badge") ?? "").trim(),
    urutan: String(formData.get("urutan") ?? "").trim(),
    aktif: formData.get("aktif") === "on" || formData.get("aktif") === "true",
    kategori: String(formData.get("kategori") ?? "").trim(),
    foto_url: String(formData.get("foto_url") ?? "").trim(),
    foto_tambahan: String(formData.get("foto_tambahan") ?? "").trim(),
    varian_teks: String(formData.get("varian_teks") ?? "").trim(),
    deskripsi: String(formData.get("deskripsi") ?? "").trim(),
  };
}

export async function masuk(_keadaan, formData) {
  const kepala = await headers();
  try {
    if (!(await bolehLakukanAksi(kepala, "login", 5, 300))) {
      return {
        error: "Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.",
      };
    }
  } catch {
    return { error: "Login sementara tidak tersedia. Coba lagi beberapa saat lagi." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienSesi();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Akun ini belum dikonfirmasi. Hubungi pemilik toko." };
    }

    if (error.status === 400 || error.code === "invalid_credentials") {
      return { error: "Email atau password salah. Periksa lagi lalu coba." };
    }

    return { error: "Login belum bisa diproses. Coba lagi beberapa saat lagi." };
  }

  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Akun ini tidak memiliki akses admin." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();

  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasi) {
    return { error: "Konfirmasi password tidak sama. Ketik ulang password baru." };
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    if (error.code === "same_password") {
      return { error: "Password baru harus berbeda dari password lama." };
    }

    return { error: "Password belum bisa diganti. Coba lagi beberapa saat lagi." };
  }

  await catatLogAdmin(supabase, user, "GANTI_PASSWORD", "Password akun diubah");
  return { sukses: "Password berhasil diganti. Gunakan password baru saat masuk berikutnya." };
}

export async function buatDeskripsiProduk(formData) {
  await wajibAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();

  if (!nama) {
    return { error: "Isi nama produk dulu sebelum membuat deskripsi." };
  }

  try {
    const deskripsi = await buatDeskripsiDenganGemini({ nama, kategori });
    return { deskripsi };
  } catch (error) {
    if (error.code === "KUNCI_KOSONG") {
      return {
        error: "Fitur AI belum dikonfigurasi. Isi GEMINI_API_KEY di server.",
      };
    }

    if (error.code === "TIMEOUT") {
      return { error: "Gemini terlalu lama merespons. Coba lagi." };
    }

    if (error.code === "KUOTA") {
      return {
        error: "Kuota Gemini sedang habis. Coba lagi nanti atau isi deskripsi manual.",
      };
    }

    if (error.code === "MODEL") {
      return {
        error: "Model Gemini belum tersedia. Periksa GEMINI_MODEL di server.",
      };
    }

    if (error.code === "DIBLOKIR") {
      return {
        error: "Permintaan diblokir Gemini. Ubah nama atau kategori produk.",
      };
    }

    console.error("Gagal membuat deskripsi AI:", error.message);
    return {
      error: "Deskripsi belum bisa dibuat. Coba lagi atau isi deskripsi manual.",
    };
  }
}

export async function unggahFotoProduk(formData) {
  const { supabase } = await wajibAdmin();

  const file = formData.get("foto");

  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "Pilih file foto yang mau diunggah." };
  }

  if (!TIPE_FOTO[file.type]) {
    return { error: "Format foto harus JPG, PNG, atau WebP." };
  }

  if (file.size > UKURAN_FOTO_MAKS) {
    return { error: "Ukuran foto maksimal 2 MB." };
  }

  const ekstensi = TIPE_FOTO[file.type];
  const namaFile = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ekstensi}`;
  const isi = new Blob([await file.arrayBuffer()], { type: file.type });
  const opsi = {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  };

  const hasil = await supabase.storage.from("produk").upload(namaFile, isi, opsi);

  if (hasil.error) {
    console.error("Gagal mengunggah foto produk:", hasil.error.message);
    return {
      error:
        "Foto belum bisa diunggah. Pastikan skema tambahan dan izin Storage sudah diterapkan, lalu coba lagi.",
    };
  }

  const { data } = supabase.storage.from("produk").getPublicUrl(namaFile);

  if (!data?.publicUrl) {
    return { error: "Foto terunggah, tetapi link publiknya belum tersedia." };
  }

  return { url: data.publicUrl };
}

export async function simpanProduk(_keadaan, formData) {
  const { supabase, user } = await wajibAdmin();
  const nilai = bacaNilaiProduk(formData);
  const fieldErrors = {};

  if (!nilai.nama) {
    fieldErrors.nama = "Nama produk wajib diisi.";
  } else if (nilai.nama.length > 200) {
    fieldErrors.nama = "Nama produk maksimal 200 karakter.";
  }

  if (!nilai.harga) {
    fieldErrors.harga = "Harga wajib diisi.";
  } else {
    const harga = Number(nilai.harga);

    if (!Number.isSafeInteger(harga) || harga <= 0 || harga > 2147483647) {
      fieldErrors.harga = "Harga harus angka bulat lebih dari 0.";
    }
  }

  if (nilai.harga_diskon) {
    const diskon = Number(nilai.harga_diskon);
    if (!Number.isSafeInteger(diskon) || diskon <= 0 || diskon >= Number(nilai.harga) || diskon > 2147483647) {
      fieldErrors.harga_diskon = "Harga diskon harus angka positif dan lebih kecil dari harga normal.";
    }
  }

  if (nilai.stok) {
    const stok = Number(nilai.stok);
    if (!Number.isSafeInteger(stok) || stok < 0 || stok > 2147483647) {
      fieldErrors.stok = "Stok harus angka bulat 0 atau lebih.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Periksa kembali isian yang ditandai.",
      fieldErrors,
      nilai,
    };
  }

  const barisFoto = (nilai.foto_tambahan || "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  const barisVarian = (nilai.varian_teks || "")
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
  const recordsVarian = [];
  const varianError = [];

  barisVarian.forEach((baris, idx) => {
    const pemisah = baris.indexOf(":");
    const nama = pemisah >= 0 ? baris.slice(0, pemisah).trim() : "";
    const hargaTeks = pemisah >= 0 ? baris.slice(pemisah + 1).trim() : "";
    const harga = Number(hargaTeks);

    if (!nama || !/^\d+$/.test(hargaTeks) || !Number.isSafeInteger(harga) || harga <= 0 || harga > 2147483647) {
      varianError.push(`Baris ${idx + 1} harus berformat Nama: harga positif.`);
      return;
    }

    recordsVarian.push({
      nama: nama.slice(0, 100),
      harga,
      urutan: idx,
    });
  });

  if (varianError.length > 0) {
    return {
      error: `Periksa varian produk. ${varianError.join(" ")}`,
      nilai,
    };
  }

  const data = {
    nama: nilai.nama,
    harga: Number(nilai.harga),
    harga_diskon: nilai.harga_diskon ? Number(nilai.harga_diskon) : null,
    stok: nilai.stok ? Number(nilai.stok) : 0,
    badge: nilai.badge ? nilai.badge.slice(0, 30) : null,
    urutan: nilai.urutan && !isNaN(Number(nilai.urutan)) ? Number(nilai.urutan) : 0,
    aktif: Boolean(nilai.aktif),
    kategori: nilai.kategori || null,
    foto_url: nilai.foto_url || null,
    deskripsi: nilai.deskripsi || null,
  };

  let idProduk = nilai.id;

  if (nilai.id) {
    if (!/^\d+$/.test(nilai.id)) {
      return { error: "Produk yang mau diubah tidak valid.", nilai };
    }

    const { data: hasil, error } = await supabase
      .from("produk")
      .update(data)
      .eq("id", nilai.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        error: "Produk belum bisa disimpan. Coba lagi beberapa saat lagi.",
        nilai,
      };
    }

    if (!hasil) {
      return { error: "Produk tidak ditemukan. Mungkin sudah dihapus.", nilai };
    }

    await catatLogAdmin(
      supabase,
      user,
      "UBAH_PRODUK",
      `${data.nama} (ID: ${nilai.id})`
    );
  } else {
    const { data: hasil, error } = await supabase
      .from("produk")
      .insert(data)
      .select("id")
      .single();

    if (error) {
      return {
        error: "Produk belum bisa disimpan. Coba lagi beberapa saat lagi.",
        nilai,
      };
    }

    idProduk = hasil.id;
    await catatLogAdmin(
      supabase,
      user,
      "TAMBAH_PRODUK",
      `${data.nama} (ID: ${idProduk})`
    );
  }

  const recordsFoto = barisFoto.map((url, idx) => ({
    produk_id: Number(idProduk),
    url: url.slice(0, 1000),
    urutan: idx,
  }));
  const recordsVarianProduk = recordsVarian.map((varian) => ({
    ...varian,
    produk_id: Number(idProduk),
  }));

  const { error: errorHapusFoto } = await supabase
    .from("foto_produk")
    .delete()
    .eq("produk_id", idProduk);
  const { error: errorFoto } = recordsFoto.length
    ? await supabase.from("foto_produk").insert(recordsFoto)
    : { error: null };
  const { error: errorHapusVarian } = await supabase
    .from("varian_produk")
    .delete()
    .eq("produk_id", idProduk);
  const { error: errorVarian } = recordsVarianProduk.length
    ? await supabase.from("varian_produk").insert(recordsVarianProduk)
    : { error: null };

  if (errorHapusFoto || errorFoto || errorHapusVarian || errorVarian) {
    console.error("Gagal memperbarui galeri atau varian produk:", {
      foto: errorHapusFoto?.message || errorFoto?.message,
      varian: errorHapusVarian?.message || errorVarian?.message,
    });
    return {
      error: "Produk tersimpan, tetapi foto tambahan atau varian belum diperbarui. Pastikan skema tambahan sudah dijalankan.",
      nilai: { ...nilai, id: String(idProduk) },
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${idProduk}`);
  redirect("/admin?pesan=disimpan");
}

export async function hapusProduk(formData) {
  const { supabase, user } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!/^\d+$/.test(id)) {
    redirect("/admin?pesan=gagal-hapus");
  }

  // Ambil nama sebelum dihapus untuk log
  const { data: p } = await supabase
    .from("produk")
    .select("nama")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    redirect("/admin?pesan=gagal-hapus");
  }

  await catatLogAdmin(
    supabase,
    user,
    "HAPUS_PRODUK",
    `${p?.nama || "Produk"} (ID: ${id})`
  );

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?pesan=dihapus");
}
