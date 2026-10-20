import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import TombolHapus from "@/components/TombolHapus";
import { toggleAktifProduk } from "@/app/admin/status-actions";

export default function TabelProduk({ daftarProduk, adaPencarian = false }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Urutan</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.length === 0 ? (
            <tr className="border-t border-garis">
              <td colSpan={7} className="px-4 py-8 text-center text-teks-lembut">
                {adaPencarian
                  ? "Tidak ada produk yang cocok dengan pencarian."
                  : "Belum ada produk."}
              </td>
            </tr>
          ) : (
            daftarProduk.map((produk) => (
              <tr key={produk.id} className="border-t border-garis">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={produk.foto_url || "/produk/tanpa-foto.svg"}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div>
                      <span className="font-semibold">{produk.nama}</span>
                      {produk.badge ? (
                        <span className="ml-2 rounded bg-utama/10 px-1.5 py-0.5 text-xs font-semibold text-utama">
                          {produk.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "—"}</td>
                <td className="px-4 py-3">
                  {produk.harga_diskon ? (
                    <div>
                      <span className="font-semibold text-harga">
                        {formatRupiah(produk.harga_diskon)}
                      </span>
                      <span className="ml-1 text-xs text-teks-lembut line-through">
                        {formatRupiah(produk.harga)}
                      </span>
                    </div>
                  ) : (
                    formatRupiah(produk.harga)
                  )}
                </td>
                <td className="px-4 py-3">
                  {produk.stok !== undefined && produk.stok !== null ? (
                    Number(produk.stok) <= 0 ? (
                      <span className="font-bold text-bahaya">Habis (0)</span>
                    ) : (
                      produk.stok
                    )
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {produk.aktif === false ? (
                    <span className="rounded bg-garis px-2 py-0.5 text-xs font-semibold text-teks-lembut">
                      Nonaktif
                    </span>
                  ) : (
                    <span className="rounded bg-utama/15 px-2 py-0.5 text-xs font-semibold text-utama">
                      Aktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-teks-lembut">{produk.urutan ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={toggleAktifProduk}>
                      <input type="hidden" name="id" value={produk.id} />
                      <input
                        type="hidden"
                        name="aktif"
                        value={String(produk.aktif !== false)}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-garis px-3 py-2 text-xs font-semibold hover:border-utama hover:text-utama"
                      >
                        {produk.aktif === false ? "Aktifkan" : "Nonaktifkan"}
                      </button>
                    </form>
                    <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                      Ubah
                    </Tombol>
                    <TombolHapus id={produk.id} nama={produk.nama} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
