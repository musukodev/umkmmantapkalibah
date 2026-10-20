"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

const KUNCI = "terakhir-dilihat-terpal-b-v1";

export default function TerakhirDilihat() {
  const [daftar, setDaftar] = useState([]);

  useEffect(() => {
    try {
      const data = JSON.parse(window.localStorage.getItem(KUNCI));
      if (Array.isArray(data)) {
        setDaftar(
          data
            .filter(
              (item) =>
                item &&
                item.nama &&
                (typeof item.id === "string" || typeof item.id === "number")
            )
            .slice(0, 6)
        );
      }
    } catch {
      setDaftar([]);
    }
  }, []);

  if (daftar.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="mb-8">
      <h2 id="judul-terakhir-dilihat" className="mb-4 text-xl font-bold">
        Terakhir dilihat
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftar.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
