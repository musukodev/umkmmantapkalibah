"use client";

import { useFavorit } from "@/lib/useFavorit";

export default function TombolFavorit({ produk }) {
  const { daftar, siap, toggle } = useFavorit();
  const aktif = daftar.some((item) => item.id === String(produk.id));

  return (
    <button
      type="button"
      onClick={() => toggle(produk)}
      aria-pressed={aktif}
      disabled={!siap}
      className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        aktif
          ? "border-utama bg-utama text-latar hover:bg-utama-gelap"
          : "border-garis bg-latar text-teks hover:border-utama hover:text-utama"
      }`}
    >
      {aktif ? "Hapus dari favorit" : "Simpan ke favorit"}
    </button>
  );
}
