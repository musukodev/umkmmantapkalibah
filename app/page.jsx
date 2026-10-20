import Link from "next/link";
import BannerBeranda from "@/components/BannerBeranda";
import FilterProduk from "@/components/FilterProduk";
import KartuProduk from "@/components/KartuProduk";
import Paginasi from "@/components/Paginasi";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import { ambilPengaturanToko } from "@/lib/pengaturan";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PRODUK_PER_HALAMAN = 12;

function terapkanFilter(query, { kategoriDipilih, kataKunci }) {
  let hasil = query.eq("aktif", true);

  if (kategoriDipilih) {
    hasil = hasil.eq("kategori", kategoriDipilih);
  }

  if (kataKunci) {
    const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
    hasil = hasil.ilike("nama", `%${pola}%`);
  }

  return hasil;
}

function terapkanUrutan(query, urutDipilih) {
  if (urutDipilih === "termurah") {
    return query
      .order("harga", { ascending: true })
      .order("id", { ascending: true });
  }

  if (urutDipilih === "termahal") {
    return query
      .order("harga", { ascending: false })
      .order("id", { ascending: true });
  }

  return query
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
}

export default async function HalamanKatalog({ searchParams }) {
  const { q, kategori, urut, halaman: halamanParam } =
    (await searchParams) ?? {};
  const kataKunci = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const kategoriDipilih = (typeof kategori === "string" ? kategori : "").trim().slice(0, 80);
  const urutDipilih = ["termurah", "termahal"].includes(urut)
    ? urut
    : "terbaru";
  const halaman =
    /^\d+$/.test(String(halamanParam ?? "")) && Number(halamanParam) > 0
      ? Math.min(Number(halamanParam), 1000)
      : 1;
  const adaFilter = Boolean(kataKunci || kategoriDipilih);

  let daftarProduk = [];
  let kategoriList = [];
  let daftarBanner = [];
  let jumlahTotal = 0;
  let totalHalaman = 0;
  let halamanTidakAda = false;
  let pesanError = "";
  let toko = { nama: "Terpal B", tagline: "Go Open Source", jamBuka: "Buka pukul 08.00" };

  try {
    const supabase = buatKlienServer();
    const filter = { kategoriDipilih, kataKunci };

    const [hasilHitung, hasilKategori, hasilBanner, dataToko] = await Promise.all([
      terapkanFilter(
        supabase.from("produk").select("id", { count: "exact", head: true }),
        filter
      ),
      supabase
        .from("produk")
        .select("kategori")
        .eq("aktif", true)
        .not("kategori", "is", null),
      supabase
        .from("banner")
        .select("id, judul, teks, gambar_url, tautan")
        .eq("aktif", true)
        .order("created_at", { ascending: false }),
      ambilPengaturanToko(),
    ]);

    toko = dataToko;
    daftarBanner = hasilBanner.data ?? [];

    if (hasilHitung.error) {
      throw hasilHitung.error;
    }

    jumlahTotal = hasilHitung.count ?? 0;
    totalHalaman = Math.ceil(jumlahTotal / PRODUK_PER_HALAMAN);
    halamanTidakAda = totalHalaman > 0 && halaman > totalHalaman;

    if (hasilKategori.error) {
      console.error("Gagal mengambil daftar kategori:", hasilKategori.error.message);
    } else {
      kategoriList = [
        ...new Set(
          (hasilKategori.data ?? [])
            .map((produk) => produk.kategori)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, "id"));
    }

    if (kategoriDipilih && !kategoriList.includes(kategoriDipilih)) {
      kategoriList.unshift(kategoriDipilih);
    }

    if (!halamanTidakAda && jumlahTotal > 0) {
      const dari = (halaman - 1) * PRODUK_PER_HALAMAN;
      const sampai = dari + PRODUK_PER_HALAMAN - 1;
      const queryProduk = terapkanUrutan(
        terapkanFilter(
          supabase
            .from("produk")
            .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, aktif, urutan"),
          filter
        ),
        urutDipilih
      );
      const { data, error } = await queryProduk.range(dari, sampai);

      if (error) {
        throw error;
      }

      daftarProduk = data ?? [];
    }
  } catch (error) {
    console.error("Gagal mengambil produk:", error.message);
    pesanError = "Katalog belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      {daftarBanner.length > 0 ? (
        <section aria-label="Banner promosi" className="mb-10">
          <BannerBeranda bannerList={daftarBanner} />
        </section>
      ) : null}

      <TerakhirDilihat />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        <FilterProduk
          kategoriList={kategoriList}
          kataKunci={kataKunci}
          kategoriDipilih={kategoriDipilih}
          urutDipilih={urutDipilih}
        />

        {pesanError ? (
          <p
            role="alert"
            className="rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut"
          >
            {pesanError}
          </p>
        ) : halamanTidakAda ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-garis bg-permukaan px-4 py-4 text-sm text-teks-lembut">
            <p>Halaman ini tidak tersedia. Katalog hanya sampai halaman {totalHalaman}.</p>
            <Link
              href="/"
              className="font-semibold text-utama underline underline-offset-4"
            >
              Kembali ke halaman pertama
            </Link>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut">
            {adaFilter
              ? "Tidak ada produk yang cocok dengan filter. Coba kata kunci atau kategori lain."
              : "Belum ada produk."}
          </p>
        ) : (
          <>
            <p className="text-sm text-teks-lembut" aria-live="polite">
              {jumlahTotal} produk
              {adaFilter ? " cocok dengan filter." : " tersedia."}
              {totalHalaman > 1
                ? ` Halaman ${halaman} dari ${totalHalaman}.`
                : ""}
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>
            <div className="pt-2">
              <Paginasi
                basePath="/"
                halaman={halaman}
                totalHalaman={totalHalaman}
                params={{
                  q: kataKunci,
                  kategori: kategoriDipilih,
                  urut: urutDipilih,
                }}
              />
            </div>
          </>
        )}
      </section>
    </>
  );
}
