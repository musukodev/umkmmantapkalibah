"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKlienSesi } from "@/lib/supabase/ssr";
import { wajibAdmin } from "@/lib/auth";
import { buatDeskripsiDenganGemini } from "@/lib/gemini";

function bacaNilaiProduk(formData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    nama: String(formData.get("nama") ?? "").trim(),
    harga: String(formData.get("harga") ?? "").trim(),
    kategori: String(formData.get("kategori") ?? "").trim(),
    foto_url: String(formData.get("foto_url") ?? "").trim(),
    deskripsi: String(formData.get("deskripsi") ?? "").trim(),
  };
}

export async function masuk(_keadaan, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienSesi();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Akun ini belum dikonfirmasi. Hubungi pemilik toko." };
    }

    if (error.status === 400 || error.code === "invalid_credentials") {
      return { error: "Email atau password salah. Periksa lagi lalu coba." };
    }

    return { error: "Login belum bisa diproses. Coba lagi beberapa saat lagi." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(_keadaan, formData) {
  const { supabase } = await wajibAdmin();

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

export async function simpanProduk(_keadaan, formData) {
  const { supabase } = await wajibAdmin();
  const nilai = bacaNilaiProduk(formData);
  const fieldErrors = {};

  if (!nilai.nama) {
    fieldErrors.nama = "Nama produk wajib diisi.";
  }

  if (!nilai.harga) {
    fieldErrors.harga = "Harga wajib diisi.";
  } else {
    const harga = Number(nilai.harga);

    if (!Number.isInteger(harga) || harga < 0) {
      fieldErrors.harga = "Harga harus angka bulat 0 atau lebih.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Periksa kembali isian yang ditandai.",
      fieldErrors,
      nilai,
    };
  }

  const data = {
    nama: nilai.nama,
    harga: Number(nilai.harga),
    kategori: nilai.kategori || null,
    foto_url: nilai.foto_url || null,
    deskripsi: nilai.deskripsi || null,
  };

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
  } else {
    const { error } = await supabase.from("produk").insert(data);

    if (error) {
      return {
        error: "Produk belum bisa disimpan. Coba lagi beberapa saat lagi.",
        nilai,
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?pesan=disimpan");
}

export async function hapusProduk(formData) {
  const { supabase } = await wajibAdmin();
  const id = String(formData.get("id") ?? "").trim();

  if (!/^\d+$/.test(id)) {
    redirect("/admin?pesan=gagal-hapus");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    redirect("/admin?pesan=gagal-hapus");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?pesan=dihapus");
}
