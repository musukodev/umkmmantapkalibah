import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import KartuProduk from "@/components/KartuProduk";
import { slugify } from "@/lib/slug";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

const ambilKategori = cache(async (slug) => {
  const supabase = buatKlienServer();
  const { data, error } = await supabase
    .from("produk")
    .select("kategori")
    .eq("aktif", true)
    .not("kategori", "is", null);

  if (error) {
    throw error;
  }

  const daftar = [
    ...new Set((data ?? []).map((item) => item.kategori).filter(Boolean)),
  ];

  return daftar.find((nama) => slugify(nama) === slug) ?? null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const kategori = await ambilKategori(slug);

    if (!kategori) {
      return { title: `Kategori tidak ditemukan — ${toko.nama}` };
    }

    return {
      title: `${kategori} — ${toko.nama}`,
      description: `Lihat produk kategori ${kategori} di katalog ${toko.nama}.`,
      alternates: {
        canonical: `/kategori/${slug}`,
      },
      openGraph: {
        title: `${kategori} — ${toko.nama}`,
        description: `Lihat produk kategori ${kategori} di katalog ${toko.nama}.`,
      },
    };
  } catch (error) {
    console.error("Gagal membuat metadata kategori:", error.message);
    return { title: `${toko.nama} — ${toko.tagline}` };
  }
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;

  let kategori = null;
  let daftarProduk = [];
  let pesanError = "";

  try {
    kategori = await ambilKategori(slug);

    if (kategori) {
      const supabase = buatKlienServer();
      const { data, error } = await supabase
        .from("produk")
        .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, aktif")
        .eq("kategori", kategori)
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      daftarProduk = data ?? [];
    }
  } catch (error) {
    console.error("Gagal mengambil kategori:", error.message);
    pesanError = "Kategori belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  if (pesanError) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <h1 className="text-2xl font-extrabold">Kategori belum bisa dibuka</h1>
        <p role="alert" className="text-teks-lembut">
          {pesanError}
        </p>
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  if (!kategori) {
    notFound();
  }

  return (
    <div className="py-8 sm:py-12">
      <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
        Kembali ke katalog
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-utama">
        Kategori
      </p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        {kategori}
      </h1>
      <p className="mt-3 text-sm text-teks-lembut" aria-live="polite">
        {daftarProduk.length} produk tersedia.
      </p>

      {daftarProduk.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftarProduk.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut">
          Belum ada produk di kategori ini.
        </p>
      )}
    </div>
  );
}
