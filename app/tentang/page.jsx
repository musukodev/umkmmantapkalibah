import Link from "next/link";
import Tombol from "@/components/Tombol";
import { ambilPengaturanToko } from "@/lib/pengaturan";

export async function generateMetadata() {
  const toko = await ambilPengaturanToko();
  return {
    title: `Tentang ${toko.nama}`,
    description: `Kenali ${toko.nama}, ${toko.tagline}. ${toko.alamat}.`,
  };
}

export default async function HalamanTentang() {
  const toko = await ambilPengaturanToko();

  return (
    <div className="mx-auto max-w-3xl py-10 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-wide text-utama">
        Tentang kami
      </p>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        {toko.nama}
      </h1>
      <p className="mt-3 text-lg text-teks-lembut">{toko.tagline}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-garis bg-permukaan p-5">
          <h2 className="font-bold">Tempat kami</h2>
          <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
            {toko.nama} melayani pembelian langsung di {toko.alamat}. Silakan
            datang, lihat produk, dan tanyakan stok terbaru kepada kami.
          </p>
        </section>
        <section className="rounded-2xl border border-garis bg-permukaan p-5">
          <h2 className="font-bold">Jam buka</h2>
          <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
            {toko.jamBuka}. Untuk memastikan produk tersedia, hubungi kami
            lewat WhatsApp sebelum berkunjung.
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-garis bg-latar p-5">
        <h2 className="font-bold">Hubungi kami</h2>
        <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
          Tanya produk, harga, atau ketersediaan lewat WhatsApp. Kami akan
          membalas saat jam buka.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Tombol
            href={`https://wa.me/${toko.nomorWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat WhatsApp
          </Tombol>
          <Tombol href="/" varian="garis">
            Lihat katalog
          </Tombol>
        </div>
      </section>

      <p className="mt-8 text-sm text-teks-lembut">
        Ingin kembali ke beranda?{" "}
        <Link href="/" className="font-semibold text-utama underline underline-offset-4">
          Buka katalog produk
        </Link>
        .
      </p>
    </div>
  );
}
