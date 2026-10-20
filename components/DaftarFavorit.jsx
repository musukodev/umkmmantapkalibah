"use client";

import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/lib/useFavorit";

export default function DaftarFavorit() {
  const { daftar, siap, hapus } = useFavorit();

  if (!siap) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-label="Memuat favorit">
        {Array.from({ length: 3 }).map((_, indeks) => (
          <div
            key={indeks}
            className="h-64 animate-pulse rounded-2xl bg-permukaan"
          />
        ))}
      </div>
    );
  }

  if (daftar.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-garis bg-permukaan p-6">
        <p className="text-teks-lembut">
          Belum ada produk favorit. Buka detail produk lalu tekan “Simpan ke
          favorit”.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-latar hover:bg-utama-gelap"
        >
          Lihat katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {daftar.map((produk) => (
        <div key={produk.id} className="flex flex-col gap-2">
          <KartuProduk produk={produk} />
          <button
            type="button"
            onClick={() => hapus(produk.id)}
            className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-bahaya"
          >
            Hapus dari favorit
          </button>
        </div>
      ))}
    </div>
  );
}
