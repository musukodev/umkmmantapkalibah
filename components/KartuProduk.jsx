import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  const foto = produk.foto_url || "/produk/tanpa-foto.svg";
  const stokHabis =
    produk.stok !== undefined &&
    produk.stok !== null &&
    Number(produk.stok) <= 0;
  const adaDiskon =
    produk.harga_diskon !== undefined &&
    produk.harga_diskon !== null &&
    Number(produk.harga_diskon) > 0 &&
    Number(produk.harga_diskon) < Number(produk.harga);

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
    >
      <div className="relative aspect-square w-full bg-permukaan">
        <img
          src={foto}
          alt={produk.nama}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {stokHabis ? (
            <span className="rounded-md bg-bahaya px-2 py-0.5 text-xs font-bold text-white shadow">
              Habis
            </span>
          ) : produk.badge ? (
            <span className="rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-latar shadow">
              {produk.badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-utama">
          {produk.nama}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          {adaDiskon ? (
            <>
              <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
                {formatRupiah(produk.harga_diskon)}
              </p>
              <p className="text-xs text-teks-lembut line-through">
                {formatRupiah(produk.harga)}
              </p>
            </>
          ) : (
            <p className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
              {formatRupiah(produk.harga)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
