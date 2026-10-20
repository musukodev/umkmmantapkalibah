import Link from "next/link";
import Tombol from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Produk",
  description: `Bandingkan dua produk ${toko.nama} berdasarkan harga, kategori, dan deskripsi.`,
};

export default async function HalamanBandingkan({ searchParams }) {
  const params = (await searchParams) ?? {};
  const a = Array.isArray(params.a) ? params.a[0] : params.a;
  const b = Array.isArray(params.b) ? params.b[0] : params.b;
  const idA = /^\d+$/.test(String(a ?? "")) ? String(a) : "";
  const idB = /^\d+$/.test(String(b ?? "")) ? String(b) : "";
  const lebihDariDua = Array.isArray(params.a) || Array.isArray(params.b);

  let daftarProduk = [];
  let produkA = null;
  let produkB = null;
  let pesanError = "";

  try {
    const supabase = buatKlienServer();
    const { data: semua, error: errorSemua } = await supabase
      .from("produk")
      .select("id, nama")
      .order("nama", { ascending: true });

    if (errorSemua) {
      throw errorSemua;
    }

    daftarProduk = semua ?? [];

    if (idA || idB) {
      const ids = [...new Set([idA, idB].filter(Boolean))];
      const { data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori")
        .in("id", ids);

      if (error) {
        throw error;
      }

      const peta = new Map((data ?? []).map((produk) => [String(produk.id), produk]));
      produkA = idA ? peta.get(idA) ?? null : null;
      produkB = idB ? peta.get(idB) ?? null : null;
    }
  } catch (error) {
    console.error("Gagal memuat perbandingan produk:", error.message);
    pesanError = "Perbandingan produk belum bisa dimuat. Coba lagi beberapa saat lagi.";
  }

  const perluDuaProduk = idA && idB && idA === idB;
  const adaYangTidakDitemukan =
    (idA && !produkA) || (idB && !produkB);

  return (
    <div className="py-8 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-utama">
        Bandingkan
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Bandingkan produk
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-teks-lembut">
        Pilih dua produk untuk melihat harga, kategori, dan deskripsinya
        berdampingan.
      </p>

      <form
        action="/bandingkan"
        method="get"
        className="mt-6 grid gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Produk pertama
          <select
            name="a"
            defaultValue={idA}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Pilih produk</option>
            {daftarProduk.map((produk) => (
              <option key={produk.id} value={produk.id}>
                {produk.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Produk kedua
          <select
            name="b"
            defaultValue={idB}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Pilih produk</option>
            {daftarProduk.map((produk) => (
              <option key={produk.id} value={produk.id}>
                {produk.nama}
              </option>
            ))}
          </select>
        </label>
        <Tombol type="submit">Bandingkan</Tombol>
      </form>

      {pesanError ? (
        <p role="alert" className="mt-6 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : lebihDariDua ? (
        <p role="alert" className="mt-6 text-sm text-bahaya">
          Hanya dua produk yang bisa dibandingkan sekaligus.
        </p>
      ) : perluDuaProduk ? (
        <p role="alert" className="mt-6 text-sm text-bahaya">
          Pilih dua produk yang berbeda.
        </p>
      ) : adaYangTidakDitemukan ? (
        <p role="alert" className="mt-6 text-sm text-bahaya">
          Salah satu produk tidak ditemukan. Pilih produk lain.
        </p>
      ) : idA && idB && produkA && produkB ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[produkA, produkB].map((produk) => (
            <article
              key={produk.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
            >
              <img
                src={produk.foto_url || "/produk/tanpa-foto.svg"}
                alt={produk.nama}
                className="aspect-square w-full bg-permukaan object-cover"
              />
              <div className="flex flex-1 flex-col gap-3 p-4">
                {produk.kategori ? (
                  <Link
                    href={`/kategori/${slugify(produk.kategori)}`}
                    className="self-start text-xs font-semibold text-utama underline underline-offset-4"
                  >
                    {produk.kategori}
                  </Link>
                ) : (
                  <p className="text-xs text-teks-lembut">Tanpa kategori</p>
                )}
                <h2 className="text-xl font-bold">{produk.nama}</h2>
                <p className="self-start rounded-md bg-harga-latar px-3 py-1 font-bold text-harga">
                  {formatRupiah(produk.harga)}
                </p>
                <p className="text-sm leading-relaxed text-teks-lembut">
                  {produk.deskripsi || "Belum ada deskripsi."}
                </p>
                <Tombol
                  href={`/produk/${produk.id}`}
                  varian="garis"
                  className="mt-auto self-start"
                >
                  Lihat detail
                </Tombol>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut">
          Pilih dua produk di atas, lalu tekan “Bandingkan”.
        </p>
      )}
    </div>
  );
}
