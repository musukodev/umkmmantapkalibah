import NavAdmin from "@/components/NavAdmin";
import Paginasi from "@/components/Paginasi";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import Input from "@/components/Input";
import { wajibAdmin } from "@/lib/auth";

const PRODUK_PER_HALAMAN = 10;

export default async function HalamanAdmin({ searchParams }) {
  const { supabase } = await wajibAdmin();
  const { pesan, q, halaman: halamanParam } = (await searchParams) ?? {};
  const kataKunci = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const halaman =
    /^\d+$/.test(String(halamanParam ?? "")) && Number(halamanParam) > 0
      ? Math.min(Number(halamanParam), 1000)
      : 1;

  let daftarProduk = [];
  let kategoriRingkas = [];
  let totalProduk = 0;
  let jumlahTotal = 0;
  let totalHalaman = 0;
  let halamanTidakAda = false;
  let pesanError = "";

  try {
    let queryHitung = supabase
      .from("produk")
      .select("id", { count: "exact", head: true });

    if (kataKunci) {
      const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
      queryHitung = queryHitung.ilike("nama", `%${pola}%`);
    }

    const [hasilHitung, hasilRingkasan] = await Promise.all([
      queryHitung,
      supabase.from("produk").select("kategori"),
    ]);

    if (hasilHitung.error) {
      throw hasilHitung.error;
    }

    jumlahTotal = hasilHitung.count ?? 0;
    totalHalaman = Math.ceil(jumlahTotal / PRODUK_PER_HALAMAN);
    halamanTidakAda = totalHalaman > 0 && halaman > totalHalaman;

    if (hasilRingkasan.error) {
      console.error(
        "Gagal mengambil ringkasan produk:",
        hasilRingkasan.error.message
      );
    } else {
      const ringkasan = new Map();
      totalProduk = (hasilRingkasan.data ?? []).length;

      for (const produk of hasilRingkasan.data ?? []) {
        const kategori = produk.kategori || "Tanpa kategori";
        ringkasan.set(kategori, (ringkasan.get(kategori) ?? 0) + 1);
      }

      kategoriRingkas = [...ringkasan.entries()]
        .map(([nama, jumlah]) => ({ nama, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama, "id"));
    }

    if (!halamanTidakAda && jumlahTotal > 0) {
      const dari = (halaman - 1) * PRODUK_PER_HALAMAN;
      const sampai = dari + PRODUK_PER_HALAMAN - 1;

      let queryProduk = supabase
        .from("produk")
        .select("id, nama, harga, kategori, foto_url");

      if (kataKunci) {
        const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
        queryProduk = queryProduk.ilike("nama", `%${pola}%`);
      }

      const { data, error } = await queryProduk
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(dari, sampai);

      if (error) {
        throw error;
      }

      daftarProduk = data ?? [];
    }
  } catch (error) {
    console.error("Gagal mengambil daftar produk admin:", error.message);
    pesanError = "Daftar produk belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  const tautanHalamanPertama = kataKunci
    ? `/admin?q=${encodeURIComponent(kataKunci)}`
    : "/admin";

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="flex flex-wrap gap-2">
          <Tombol href="/admin/produk/impor" varian="garis">
            Impor CSV
          </Tombol>
          <Tombol href="/admin/produk/export" varian="garis">
            Ekspor CSV
          </Tombol>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
      </div>

      {pesan === "disimpan" ? (
        <p role="status" className="text-sm text-utama">
          Produk berhasil disimpan.
        </p>
      ) : null}

      {pesan === "dihapus" ? (
        <p role="status" className="text-sm text-utama">
          Produk berhasil dihapus.
        </p>
      ) : null}

      {pesan === "gagal-hapus" ? (
        <p role="alert" className="text-sm text-bahaya">
          Produk belum bisa dihapus. Coba lagi beberapa saat lagi.
        </p>
      ) : null}

      <section aria-labelledby="ringkasan-produk" className="flex flex-col gap-3">
        <h2
          id="ringkasan-produk"
          className="text-sm font-semibold uppercase tracking-wide text-teks-lembut"
        >
          Ringkasan
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-garis bg-latar p-4">
            <p className="text-sm text-teks-lembut">Total produk</p>
            <p className="mt-1 text-3xl font-extrabold text-utama">
              {totalProduk}
            </p>
          </div>
          {kategoriRingkas.map((kategori) => (
            <div
              key={kategori.nama}
              className="rounded-2xl border border-garis bg-permukaan p-4"
            >
              <p className="text-sm text-teks-lembut">{kategori.nama}</p>
              <p className="mt-1 text-2xl font-bold">{kategori.jumlah}</p>
            </div>
          ))}
        </div>
      </section>

      <form
        action="/admin"
        method="get"
        className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Cari produk"
            name="q"
            type="search"
            placeholder="Ketik nama produk..."
            defaultValue={kataKunci}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Tombol type="submit">Cari</Tombol>
          {kataKunci ? (
            <Tombol href="/admin" varian="garis">
              Hapus pencarian
            </Tombol>
          ) : null}
        </div>
      </form>

      {pesanError ? (
        <p role="alert" className="text-sm text-bahaya">
          {pesanError}
        </p>
      ) : halamanTidakAda ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-garis bg-permukaan px-4 py-4 text-sm text-teks-lembut">
          <p>
            Halaman ini tidak tersedia. Daftar produk hanya sampai halaman{" "}
            {totalHalaman}.
          </p>
          <Tombol href={tautanHalamanPertama} varian="garis">
            Kembali ke halaman pertama
          </Tombol>
        </div>
      ) : (
        <>
          <p className="text-sm text-teks-lembut" aria-live="polite">
            {jumlahTotal} produk
            {kataKunci ? " cocok dengan pencarian." : " tersedia."}
            {totalHalaman > 1
              ? ` Halaman ${halaman} dari ${totalHalaman}.`
              : ""}
          </p>
          <TabelProduk
            daftarProduk={daftarProduk}
            adaPencarian={Boolean(kataKunci)}
          />
          <Paginasi
            basePath="/admin"
            halaman={halaman}
            totalHalaman={totalHalaman}
            params={{ q: kataKunci }}
          />
        </>
      )}
    </div>
  );
}
