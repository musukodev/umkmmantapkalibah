import FilterProduk from "@/components/FilterProduk";
import KartuProduk from "@/components/KartuProduk";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const { q, kategori } = (await searchParams) ?? {};
  const kataKunci = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const kategoriDipilih = (typeof kategori === "string" ? kategori : "").trim().slice(0, 80);
  const adaFilter = Boolean(kataKunci || kategoriDipilih);

  let daftarProduk = [];
  let kategoriList = [];
  let pesanError = "";

  try {
    const supabase = buatKlienServer();

    let queryProduk = supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (kategoriDipilih) {
      queryProduk = queryProduk.eq("kategori", kategoriDipilih);
    }

    if (kataKunci) {
      const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
      queryProduk = queryProduk.ilike("nama", `%${pola}%`);
    }

    const [hasilProduk, hasilKategori] = await Promise.all([
      queryProduk,
      supabase.from("produk").select("kategori").not("kategori", "is", null),
    ]);

    if (hasilProduk.error) {
      throw hasilProduk.error;
    }

    daftarProduk = hasilProduk.data ?? [];

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

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        <FilterProduk
          kategoriList={kategoriList}
          kataKunci={kataKunci}
          kategoriDipilih={kategoriDipilih}
        />

        {pesanError ? (
          <p
            role="alert"
            className="rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut"
          >
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-3 text-sm text-teks-lembut">
            {adaFilter
              ? "Tidak ada produk yang cocok dengan filter. Coba kata kunci atau kategori lain."
              : "Belum ada produk."}
          </p>
        ) : (
          <>
            <p className="text-sm text-teks-lembut" aria-live="polite">
              {daftarProduk.length} produk
              {adaFilter ? " cocok dengan filter." : " tersedia."}
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
