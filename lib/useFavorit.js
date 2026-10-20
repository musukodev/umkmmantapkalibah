"use client";

import { useEffect, useState } from "react";

const KUNCI_FAVORIT = "favorit-terpal-b-v1";
const MAKS_FAVORIT = 50;

function ringkasProduk(produk) {
  return {
    id: String(produk.id),
    nama: produk.nama,
    harga: Number(produk.harga),
    foto_url: produk.foto_url || "",
    kategori: produk.kategori || "",
  };
}

export function bacaFavorit() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = JSON.parse(window.localStorage.getItem(KUNCI_FAVORIT));

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item) =>
          item &&
          (typeof item.id === "string" || typeof item.id === "number") &&
          typeof item.nama === "string" &&
          Number.isFinite(Number(item.harga))
      )
      .slice(0, MAKS_FAVORIT)
      .map((item) => ({
        id: String(item.id),
        nama: item.nama,
        harga: Number(item.harga),
        foto_url: item.foto_url || "",
        kategori: item.kategori || "",
      }));
  } catch {
    return [];
  }
}

export function useFavorit() {
  const [daftar, setDaftar] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setDaftar(bacaFavorit());
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!siap) {
      return;
    }

    try {
      window.localStorage.setItem(KUNCI_FAVORIT, JSON.stringify(daftar));
    } catch {
      // Favorit tetap berfungsi selama halaman ini terbuka.
    }
  }, [daftar, siap]);

  function toggle(produk) {
    const ringkasan = ringkasProduk(produk);

    setDaftar((sebelumnya) => {
      const sudahAda = sebelumnya.some((item) => item.id === ringkasan.id);

      if (sudahAda) {
        return sebelumnya.filter((item) => item.id !== ringkasan.id);
      }

      return [ringkasan, ...sebelumnya].slice(0, MAKS_FAVORIT);
    });
  }

  function hapus(id) {
    setDaftar((sebelumnya) =>
      sebelumnya.filter((item) => item.id !== String(id))
    );
  }

  return { daftar, siap, toggle, hapus };
}
