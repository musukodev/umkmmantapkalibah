import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FilterProduk({
  kategoriList,
  kataKunci,
  kategoriDipilih,
  urutDipilih = "terbaru",
}) {
  const adaFilter = Boolean(kataKunci || kategoriDipilih);

  return (
    <form
      action="/"
      method="get"
      className="rounded-2xl border border-garis bg-permukaan p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px_170px_auto] sm:items-end">
        <Input
          label="Cari produk"
          name="q"
          type="search"
          placeholder="Ketik nama produk..."
          defaultValue={kataKunci}
        />

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Kategori
          <select
            name="kategori"
            defaultValue={kategoriDipilih}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Semua kategori</option>
            {kategoriList.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Urutkan
          <select
            name="urut"
            defaultValue={urutDipilih}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga terendah</option>
            <option value="termahal">Harga tertinggi</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <Tombol type="submit">Cari</Tombol>
          {adaFilter ? (
            <Tombol href="/" varian="garis">
              Hapus filter
            </Tombol>
          ) : null}
        </div>
      </div>
    </form>
  );
}
