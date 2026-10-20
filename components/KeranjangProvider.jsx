"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KUNCI_PENYIMPANAN = "keranjang-terpal-b-v1";
const JUMLAH_MAKS = 99;
const KeranjangContext = createContext(null);

function batasiJumlah(nilai) {
  const angka = Number(nilai);

  if (!Number.isInteger(angka)) {
    return 1;
  }

  return Math.min(JUMLAH_MAKS, Math.max(1, angka));
}

function bacaKeranjang() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = JSON.parse(window.localStorage.getItem(KUNCI_PENYIMPANAN));

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
      .slice(0, 50)
      .map((item) => ({
        id: String(item.id),
        keranjangId: String(item.keranjangId || item.id),
        nama: item.nama,
        harga: Number(item.harga),
        foto_url: item.foto_url || "",
        kategori: item.kategori || "",
        jumlah: batasiJumlah(item.jumlah),
      }));
  } catch {
    return [];
  }
}

function ringkasProduk(produk) {
  return {
    id: String(produk.id),
    keranjangId: String(produk.keranjangId || produk.id),
    nama: produk.nama,
    harga: Number(produk.harga),
    foto_url: produk.foto_url || "",
    kategori: produk.kategori || "",
  };
}

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setItems(bacaKeranjang());
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!siap) {
      return;
    }

    try {
      window.localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(items));
    } catch {
      // Keranjang tetap berfungsi selama halaman ini terbuka.
    }
  }, [items, siap]);

  function tambah(produk, jumlah = 1) {
    const ringkasan = ringkasProduk(produk);
    const tambahan = batasiJumlah(jumlah);

    setItems((sebelumnya) => {
      const ada = sebelumnya.find(
        (item) => item.keranjangId === ringkasan.keranjangId
      );

      if (ada) {
        return sebelumnya.map((item) =>
          item.keranjangId === ringkasan.keranjangId
            ? { ...item, jumlah: batasiJumlah(item.jumlah + tambahan) }
            : item
        );
      }

      return [...sebelumnya, { ...ringkasan, jumlah: tambahan }].slice(-50);
    });
  }

  function aturJumlah(id, jumlah) {
    setItems((sebelumnya) =>
      sebelumnya.map((item) =>
        item.keranjangId === String(id)
          ? { ...item, jumlah: batasiJumlah(jumlah) }
          : item
      )
    );
  }

  function hapus(id) {
    setItems((sebelumnya) =>
      sebelumnya.filter((item) => item.keranjangId !== String(id))
    );
  }

  function kosongkan() {
    setItems([]);
  }

  const jumlahItem = items.reduce((total, item) => total + item.jumlah, 0);
  const totalHarga = items.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0
  );

  const nilai = useMemo(
    () => ({
      items,
      siap,
      jumlahItem,
      totalHarga,
      tambah,
      aturJumlah,
      hapus,
      kosongkan,
    }),
    [items, siap, jumlahItem, totalHarga]
  );

  return (
    <KeranjangContext.Provider value={nilai}>
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const nilai = useContext(KeranjangContext);

  if (!nilai) {
    throw new Error("useKeranjang harus dipakai di dalam KeranjangProvider.");
  }

  return nilai;
}
