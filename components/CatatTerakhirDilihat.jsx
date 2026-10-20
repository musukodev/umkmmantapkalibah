"use client";

import { useEffect } from "react";

const KUNCI = "terakhir-dilihat-terpal-b-v1";
const MAKS = 6;

export default function CatatTerakhirDilihat({ produk }) {
  useEffect(() => {
    try {
      const data = JSON.parse(window.localStorage.getItem(KUNCI));
      const sebelumnya = Array.isArray(data) ? data : [];
      const ringkasan = {
        id: String(produk.id),
        nama: produk.nama,
        harga: Number(produk.harga),
        foto_url: produk.foto_url || "",
        kategori: produk.kategori || "",
      };
      const berikutnya = [
        ringkasan,
        ...sebelumnya.filter(
          (item) => item && String(item.id) !== ringkasan.id
        ),
      ].slice(0, MAKS);

      window.localStorage.setItem(KUNCI, JSON.stringify(berikutnya));
    } catch {
      // Riwayat kunjungan tidak wajib; abaikan bila localStorage tidak tersedia.
    }
  }, [produk]);

  return null;
}
