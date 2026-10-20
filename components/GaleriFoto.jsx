"use client";

import { useState } from "react";

export default function GaleriFoto({ fotoUtama, daftarFoto = [], alt }) {
  const semuaFoto = [
    fotoUtama || "/produk/tanpa-foto.svg",
    ...daftarFoto.map((f) => f.url).filter(Boolean),
  ];
  const unik = [...new Set(semuaFoto)];
  const [fotoAktif, setFotoAktif] = useState(unik[0]);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-garis bg-permukaan">
        <img
          src={fotoAktif}
          alt={alt}
          className="aspect-square w-full object-cover"
        />
      </div>

      {unik.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Foto produk">
          {unik.map((url, indeks) => {
            const terpilih = url === fotoAktif;
            return (
              <button
                key={url + indeks}
                type="button"
                role="tab"
                aria-selected={terpilih}
                aria-label={`Lihat foto ${indeks + 1}`}
                onClick={() => setFotoAktif(url)}
                className={`h-16 w-16 overflow-hidden rounded-xl border bg-permukaan transition-all ${
                  terpilih
                    ? "border-utama ring-2 ring-utama ring-offset-2"
                    : "border-garis opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
