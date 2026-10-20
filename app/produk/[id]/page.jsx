import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import BagianPesanDetail from "@/components/BagianPesanDetail";
import BagianUlasan from "@/components/BagianUlasan";
import BagikanProduk from "@/components/BagikanProduk";
import CatatTerakhirDilihat from "@/components/CatatTerakhirDilihat";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import TanyaProduk from "@/components/TanyaProduk";
import TombolFavorit from "@/components/TombolFavorit";
import { ambilPengaturanToko } from "@/lib/pengaturan";
import { slugify } from "@/lib/slug";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ambilProduk = cache(async (id) => {
  const supabase = buatKlienServer();
  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, aktif")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const toko = await ambilPengaturanToko();

  if (!/^\d+$/.test(id)) {
    return { title: `Produk tidak ditemukan — ${toko.nama}` };
  }

  try {
    const produk = await ambilProduk(id);

    if (!produk || produk.aktif === false) {
      return { title: `Produk tidak ditemukan — ${toko.nama}` };
    }

    const deskripsi =
      produk.deskripsi ||
      `Lihat ${produk.nama} di katalog ${toko.nama}. ${toko.tagline}.`;

    return {
      title: `${produk.nama} — ${toko.nama}`,
      description: deskripsi,
      alternates: {
        canonical: `/produk/${produk.id}`,
      },
      openGraph: {
        type: "website",
        title: `${produk.nama} — ${toko.nama}`,
        description: deskripsi,
        url: `/produk/${produk.id}`,
        images: [
          {
            url: produk.foto_url || "/produk/tanpa-foto.svg",
            alt: produk.nama,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${produk.nama} — ${toko.nama}`,
        description: deskripsi,
        images: [produk.foto_url || "/produk/tanpa-foto.svg"],
      },
    };
  } catch (error) {
    console.error("Gagal membuat metadata produk:", error.message);
    return { title: `${toko.nama} — ${toko.tagline}` };
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let produk = null;
  let daftarFoto = [];
  let daftarVarian = [];
  let daftarUlasan = [];
  let produkTerkait = [];
  let pesanError = "";
  let toko = { nama: "Terpal B", nomorWhatsApp: "6281378280892" };

  try {
    const [dataProduk, dataToko] = await Promise.all([
      ambilProduk(id),
      ambilPengaturanToko(),
    ]);

    produk = dataProduk;
    toko = dataToko;

    if (produk && produk.aktif !== false) {
      const supabase = buatKlienServer();
      const [hasilFoto, hasilVarian, hasilUlasan] = await Promise.all([
        supabase
          .from("foto_produk")
          .select("id, url, urutan")
          .eq("produk_id", produk.id)
          .order("urutan", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("varian_produk")
          .select("id, nama, harga, urutan")
          .eq("produk_id", produk.id)
          .order("urutan", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("ulasan")
          .select("id, nama, rating, komentar, created_at")
          .eq("produk_id", produk.id)
          .eq("tampil", true)
          .order("created_at", { ascending: false }),
      ]);

      daftarFoto = hasilFoto.data ?? [];
      daftarVarian = hasilVarian.data ?? [];
      daftarUlasan = hasilUlasan.data ?? [];
    }
  } catch (error) {
    console.error("Gagal mengambil detail produk:", error.message);
    pesanError = "Detail produk belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  if (pesanError) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <h1 className="text-2xl font-extrabold">Produk belum bisa dibuka</h1>
        <p role="alert" className="text-teks-lembut">
          {pesanError}
        </p>
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  if (!produk || produk.aktif === false) {
    notFound();
  }

  if (produk.kategori) {
    try {
      const supabase = buatKlienServer();
      const { data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, aktif")
        .eq("kategori", produk.kategori)
        .eq("aktif", true)
        .neq("id", produk.id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .limit(3);

      if (error) {
        throw error;
      }

      produkTerkait = data ?? [];
    } catch (error) {
      console.error("Gagal mengambil produk terkait:", error.message);
    }
  }

  const stokHabis =
    produk.stok !== undefined &&
    produk.stok !== null &&
    Number(produk.stok) <= 0;

  return (
    <>
      <CatatTerakhirDilihat produk={produk} />
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriFoto
          fotoUtama={produk.foto_url}
          daftarFoto={daftarFoto}
          alt={produk.nama}
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {produk.kategori ? (
              <Link
                href={`/kategori/${slugify(produk.kategori)}`}
                className="self-start text-sm font-semibold text-utama underline underline-offset-4"
              >
                {produk.kategori}
              </Link>
            ) : (
              <p className="text-sm text-teks-lembut">Tanpa kategori</p>
            )}

            {stokHabis ? (
              <span className="rounded bg-bahaya px-2 py-0.5 text-xs font-bold text-white">
                Stok Habis
              </span>
            ) : produk.badge ? (
              <span className="rounded bg-utama px-2 py-0.5 text-xs font-bold text-latar">
                {produk.badge}
              </span>
            ) : null}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>

          {produk.stok !== undefined && produk.stok !== null ? (
            <p className="text-xs text-teks-lembut">
              Sisa stok: <span className="font-semibold text-teks">{produk.stok} unit</span>
            </p>
          ) : null}

          <BagianPesanDetail
            produk={produk}
            daftarVarian={daftarVarian}
            nomorWhatsApp={toko.nomorWhatsApp}
          />

          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <TombolFavorit produk={produk} />
            <BagikanProduk judul={produk.nama} />
            <Link
              href={`/bandingkan?a=${produk.id}`}
              className="text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
            >
              Bandingkan dengan produk lain
            </Link>
          </div>
        </div>
      </article>

      <TanyaProduk produkId={produk.id} />

      <BagianUlasan produkId={produk.id} daftarUlasan={daftarUlasan} />

      {produkTerkait.length > 0 ? (
        <section
          aria-labelledby="judul-produk-terkait"
          className="border-t border-garis py-8"
        >
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="judul-produk-terkait" className="text-xl font-bold">
              Produk terkait
            </h2>
            {produk.kategori ? (
              <Link
                href={`/kategori/${slugify(produk.kategori)}`}
                className="text-sm font-semibold text-utama hover:underline"
              >
                Lihat semua {produk.kategori}
              </Link>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
