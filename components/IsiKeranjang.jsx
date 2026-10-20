"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangProvider";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function IsiKeranjang() {
  const { items, siap, jumlahItem, totalHarga, aturJumlah, hapus, kosongkan } =
    useKeranjang();

  if (!siap) {
    return (
      <div className="flex flex-col gap-3" aria-label="Memuat keranjang">
        <div className="h-24 animate-pulse rounded-2xl bg-permukaan" />
        <div className="h-24 animate-pulse rounded-2xl bg-permukaan" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-garis bg-permukaan p-6">
        <p className="text-teks-lembut">
          Keranjang masih kosong. Tambahkan produk dari halaman detail produk.
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

  const rincian = items
    .map((item, indeks) => {
      const subtotal = formatRupiah(item.harga * item.jumlah).replace(
        /\u00a0/g,
        " "
      );
      return `${indeks + 1}. ${item.nama} x ${item.jumlah} = ${subtotal}`;
    })
    .join("\n");
  const totalTeks = formatRupiah(totalHarga).replace(/\u00a0/g, " ");
  const pesan = `Halo, saya mau pesan:\n${rincian}\n\nTotal: ${totalTeks}`;
  const tautan = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  function kosongkanKeranjang() {
    if (window.confirm("Kosongkan semua produk dari keranjang?")) {
      kosongkan();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const subtotal = item.harga * item.jumlah;

          return (
            <li
              key={item.id}
              className="flex gap-3 rounded-2xl border border-garis bg-latar p-3"
            >
              <img
                src={item.foto_url || "/produk/tanpa-foto.svg"}
                alt={item.nama}
                className="h-20 w-20 shrink-0 rounded-xl bg-permukaan object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/produk/${item.id}`}
                      className="font-semibold leading-snug hover:text-utama"
                    >
                      {item.nama}
                    </Link>
                    <p className="mt-0.5 text-xs text-teks-lembut">
                      {item.kategori || "Tanpa kategori"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => hapus(item.id)}
                    className="shrink-0 text-sm text-teks-lembut hover:text-bahaya"
                  >
                    Hapus
                  </button>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <p className="text-sm text-teks-lembut">
                    {formatRupiah(item.harga)} / item
                  </p>

                  <div className="flex items-center overflow-hidden rounded-lg border border-garis bg-latar">
                    <button
                      type="button"
                      aria-label={`Kurangi jumlah ${item.nama}`}
                      onClick={() => aturJumlah(item.id, item.jumlah - 1)}
                      disabled={item.jumlah <= 1}
                      className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 border-x border-garis py-1.5 text-center text-sm font-semibold">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      aria-label={`Tambah jumlah ${item.nama}`}
                      onClick={() => aturJumlah(item.id, item.jumlah + 1)}
                      disabled={item.jumlah >= 99}
                      className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold text-harga">
                    {formatRupiah(subtotal)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5">
        <div>
          <h2 className="font-bold">Ringkasan pesanan</h2>
          <p className="mt-1 text-sm text-teks-lembut">
            {jumlahItem} item dalam keranjang.
          </p>
        </div>
        <div className="flex items-baseline justify-between border-t border-garis pt-4">
          <span className="text-sm text-teks-lembut">Total</span>
          <span className="text-xl font-extrabold text-harga">
            {formatRupiah(totalHarga)}
          </span>
        </div>
        <a
          href={tautan}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-3 text-sm font-semibold text-latar hover:bg-utama-gelap"
        >
          Pesan semua via WhatsApp
        </a>
        <button
          type="button"
          onClick={kosongkanKeranjang}
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-bahaya"
        >
          Kosongkan keranjang
        </button>
        <p className="text-xs leading-relaxed text-teks-lembut">
          Keranjang disimpan di browser ini. Rincian pesanan akan dikirim lewat
          WhatsApp sebelum diproses penjual.
        </p>
      </aside>
    </div>
  );
}
