import NavAdmin from "@/components/NavAdmin";
import Paginasi from "@/components/Paginasi";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import Input from "@/components/Input";
import { formatRupiah } from "@/lib/format";
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
  let produkTerpopuler = [];
  let totalKlikWa = 0;

  try {
    let queryHitung = supabase
      .from("produk")
      .select("id", { count: "exact", head: true });

    if (kataKunci) {
      const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
      queryHitung = queryHitung.ilike("nama", `%${pola}%`);
    }

    const [hasilHitung, hasilRingkasan, hasilKlik] = await Promise.all([
      queryHitung,
      supabase.from("produk").select("id, nama, kategori"),
      supabase.from("klik_whatsapp").select("produk_id"),
    ]);

    if (hasilHitung.error) {
      throw hasilHitung.error;
    }

    jumlahTotal = hasilHitung.count ?? 0;
    totalHalaman = Math.ceil(jumlahTotal / PRODUK_PER_HALAMAN);
    halamanTidakAda = totalHalaman > 0 && halaman > totalHalaman;

    const mapProduk = new Map();
    if (hasilRingkasan.data) {
      totalProduk = hasilRingkasan.data.length;
      const ringkasan = new Map();

      for (const p of hasilRingkasan.data) {
        mapProduk.set(p.id, p);
        const k = p.kategori || "Tanpa kategori";
        ringkasan.set(k, (ringkasan.get(k) ?? 0) + 1);
      }

      kategoriRingkas = [...ringkasan.entries()]
        .map(([nama, jumlah]) => ({ nama, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah || a.nama.localeCompare(b.nama, "id"));
    }

    if (hasilKlik.data) {
      totalKlikWa = hasilKlik.data.length;
      const frekuensi = new Map();
      for (const klik of hasilKlik.data) {
        frekuensi.set(klik.produk_id, (frekuensi.get(klik.produk_id) ?? 0) + 1);
      }

      produkTerpopuler = [...frekuensi.entries()]
        .map(([produkId, jumlahKlik]) => ({
          produkId,
          jumlahKlik,
          nama: mapProduk.get(produkId)?.nama || `Produk #${produkId}`,
        }))
        .sort((a, b) => b.jumlahKlik - a.jumlahKlik)
        .slice(0, 5);
    }

    if (!halamanTidakAda && jumlahTotal > 0) {
      const dari = (halaman - 1) * PRODUK_PER_HALAMAN;
      const sampai = dari + PRODUK_PER_HALAMAN - 1;

      let queryProduk = supabase
        .from("produk")
        .select("id, nama, harga, kategori, foto_url, stok, harga_diskon, badge, aktif, urutan");

      if (kataKunci) {
        const pola = kataKunci.replace(/[\\%_]/g, "\\$&");
        queryProduk = queryProduk.ilike("nama", `%${pola}%`);
      }

      const { data, error } = await queryProduk
        .order("urutan", { ascending: true })
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

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="ringkasan-produk" className="flex flex-col gap-3 lg:col-span-2">
          <h2
            id="ringkasan-produk"
            className="text-sm font-semibold uppercase tracking-wide text-teks-lembut"
          >
            Ringkasan Produk ({totalProduk})
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-garis bg-latar p-4">
              <p className="text-sm text-teks-lembut">Total produk</p>
              <p className="mt-1 text-3xl font-extrabold text-utama">
                {totalProduk}
              </p>
            </div>
            {kategoriRingkas.slice(0, 5).map((kategori) => (
              <div
                key={kategori.nama}
                className="rounded-2xl border border-garis bg-permukaan p-4"
              >
                <p className="text-sm text-teks-lembut truncate">{kategori.nama}</p>
                <p className="mt-1 text-2xl font-bold">{kategori.jumlah}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="populer-wa" className="flex flex-col gap-3">
          <h2
            id="populer-wa"
            className="text-sm font-semibold uppercase tracking-wide text-teks-lembut"
          >
            Produk Terpopuler (Klik WhatsApp: {totalKlikWa})
          </h2>
          <div className="flex flex-col gap-2 rounded-2xl border border-garis bg-permukaan p-4">
            {produkTerpopuler.length === 0 ? (
              <p className="py-4 text-center text-sm text-teks-lembut">
                Belum ada data klik WhatsApp.
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-garis text-sm">
                {produkTerpopuler.map((item, indeks) => (
                  <li key={item.produkId} className="flex items-center justify-between py-2">
                    <span className="truncate pr-2 font-semibold">
                      {indeks + 1}. {item.nama}
                    </span>
                    <span className="shrink-0 rounded bg-utama/15 px-2 py-0.5 text-xs font-bold text-utama">
                      {item.jumlahKlik} klik
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>

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
          <TabelProduk
            daftarProduk={daftarProduk}
            adaPencarian={Boolean(kataKunci)}
          />

          <Paginasi
            halaman={halaman}
            totalHalaman={totalHalaman}
            bangunTautan={(target) => {
              const params = new URLSearchParams();
              if (kataKunci) params.set("q", kataKunci);
              if (target > 1) params.set("halaman", String(target));
              const string = params.toString();
              return string ? `/admin?${string}` : "/admin";
            }}
          />
        </>
      )}
    </div>
  );
}
