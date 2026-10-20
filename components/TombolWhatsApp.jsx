"use client";

import { useState } from "react";
import { useKeranjang } from "@/components/KeranjangProvider";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

const JUMLAH_MAKS = 99;

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [pesanKeranjang, setPesanKeranjang] = useState("");
  const { tambah } = useKeranjang();
  const jumlahAman =
    typeof jumlah === "number" && jumlah >= 1 ? Math.min(jumlah, JUMLAH_MAKS) : 1;
  const total = produk.harga * jumlahAman;
  const hargaSatuan = formatRupiah(produk.harga).replace(/\u00a0/g, " ");
  const totalTeks = formatRupiah(total).replace(/\u00a0/g, " ");
  const pesan = `Halo, saya mau pesan ${produk.nama} sebanyak ${jumlahAman} (${hargaSatuan} per item, total ${totalTeks})`;
  const tautan = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  function tambahKeKeranjang() {
    tambah(produk, jumlahAman);
    setPesanKeranjang(
      `${jumlahAman} ${produk.nama} ditambahkan ke keranjang.`
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <label htmlFor="jumlah-pesanan" className="text-sm font-semibold">
          Jumlah
        </label>
        <div className="flex w-fit items-center overflow-hidden rounded-lg border border-garis bg-latar">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            onClick={() => setJumlah(Math.max(1, jumlahAman - 1))}
            disabled={jumlahAman <= 1}
            className="px-3 py-2.5 text-lg font-semibold text-teks-lembut transition-colors hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            id="jumlah-pesanan"
            name="jumlah"
            type="number"
            min="1"
            max={JUMLAH_MAKS}
            inputMode="numeric"
            value={jumlah}
            onChange={(event) => {
              const mentah = event.target.value;

              if (mentah === "") {
                setJumlah("");
                return;
              }

              const angka = Number(mentah);

              if (Number.isInteger(angka) && angka >= 1 && angka <= JUMLAH_MAKS) {
                setJumlah(angka);
              }
            }}
            onBlur={() => {
              if (jumlah === "" || jumlah < 1) {
                setJumlah(1);
              }
            }}
            className="w-14 border-x border-garis bg-transparent py-2.5 text-center text-base font-semibold text-teks focus:outline-none"
          />
          <button
            type="button"
            aria-label="Tambah jumlah"
            onClick={() => setJumlah(Math.min(JUMLAH_MAKS, jumlahAman + 1))}
            disabled={jumlahAman >= JUMLAH_MAKS}
            className="px-3 py-2.5 text-lg font-semibold text-teks-lembut transition-colors hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <p className="text-sm text-teks-lembut">
          Total <span className="text-base font-bold text-harga">{totalTeks}</span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={tambahKeKeranjang}
            className="inline-flex w-full items-center justify-center rounded-lg border border-garis bg-latar px-4 py-3 font-semibold text-teks transition-colors hover:border-utama hover:text-utama sm:w-auto"
          >
            Tambah ke keranjang
          </button>
          <a
            href={tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-latar hover:bg-utama-gelap sm:w-auto"
          >
            Pesan via WhatsApp
          </a>
        </div>
        {pesanKeranjang ? (
          <p role="status" aria-live="polite" className="text-sm text-utama">
            {pesanKeranjang}
          </p>
        ) : null}
      </div>
    </div>
  );
}
