"use client";

import { useState } from "react";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";

export default function BagianPesanDetail({
  produk,
  daftarVarian = [],
  nomorWhatsApp,
}) {
  const [varianDipilih, setVarianDipilih] = useState(
    daftarVarian.length > 0 ? daftarVarian[0] : null
  );

  const adaDiskon =
    !varianDipilih &&
    produk.harga_diskon !== undefined &&
    produk.harga_diskon !== null &&
    Number(produk.harga_diskon) > 0 &&
    Number(produk.harga_diskon) < Number(produk.harga);

  const hargaTampil = varianDipilih
    ? Number(varianDipilih.harga)
    : adaDiskon
    ? Number(produk.harga_diskon)
    : Number(produk.harga);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-extrabold text-harga">
          {formatRupiah(hargaTampil)}
        </p>
        {adaDiskon ? (
          <p className="text-base text-teks-lembut line-through">
            {formatRupiah(produk.harga)}
          </p>
        ) : null}
      </div>

      {daftarVarian.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-garis bg-permukaan p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teks-lembut">
            Pilih Ukuran / Varian
          </p>
          <div className="flex flex-wrap gap-2">
            {daftarVarian.map((varian) => {
              const aktif = varianDipilih?.id === varian.id;
              return (
                <button
                  key={varian.id}
                  type="button"
                  onClick={() => setVarianDipilih(varian)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    aktif
                      ? "border-utama bg-utama text-latar"
                      : "border-garis bg-latar text-teks hover:border-utama"
                  }`}
                >
                  {varian.nama} — {formatRupiah(varian.harga)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <TombolWhatsApp
        produk={produk}
        nomorWhatsApp={nomorWhatsApp}
        varianDipilih={varianDipilih}
      />
    </div>
  );
}
