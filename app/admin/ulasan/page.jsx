import NavAdmin from "@/components/NavAdmin";
import { wajibAdmin } from "@/lib/auth";
import { hapusUlasan, toggleTampilUlasan } from "@/app/admin/ulasan/actions";

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function HalamanAdminUlasan() {
  const { supabase } = await wajibAdmin();

  let daftarUlasan = [];
  try {
    const { data } = await supabase
      .from("ulasan")
      .select("id, produk_id, nama, rating, komentar, tampil, created_at, produk(nama)")
      .order("created_at", { ascending: false });
    daftarUlasan = data ?? [];
  } catch (err) {
    console.error("Gagal mengambil ulasan:", err.message);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Moderasi Ulasan</h1>
        <p className="text-sm text-teks-lembut">
          {daftarUlasan.length} ulasan masuk
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Pengulas</th>
              <th className="px-4 py-3 font-semibold">Rating & Komentar</th>
              <th className="px-4 py-3 font-semibold">Waktu</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarUlasan.length === 0 ? (
              <tr className="border-t border-garis">
                <td colSpan={6} className="px-4 py-8 text-center text-teks-lembut">
                  Belum ada ulasan yang masuk.
                </td>
              </tr>
            ) : (
              daftarUlasan.map((u) => {
                const namaProduk = u.produk?.nama || `Produk #${u.produk_id}`;
                const waktu = u.created_at
                  ? formatTanggal.format(new Date(u.created_at))
                  : "—";

                return (
                  <tr key={u.id} className="border-t border-garis">
                    <td className="px-4 py-3 font-medium">{namaProduk}</td>
                    <td className="px-4 py-3 font-semibold">{u.nama}</td>
                    <td className="px-4 py-3">
                      <div className="text-harga">
                        {"★".repeat(u.rating)}
                        {"☆".repeat(5 - u.rating)}
                      </div>
                      {u.komentar ? (
                        <p className="mt-1 max-w-xs text-xs text-teks-lembut">
                          {u.komentar}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-teks-lembut">{waktu}</td>
                    <td className="px-4 py-3">
                      {u.tampil ? (
                        <span className="rounded bg-utama/15 px-2 py-0.5 text-xs font-semibold text-utama">
                          Tampil
                        </span>
                      ) : (
                        <span className="rounded bg-garis px-2 py-0.5 text-xs font-semibold text-teks-lembut">
                          Disembunyikan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={toggleTampilUlasan}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="tampil"
                            value={String(u.tampil)}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold hover:border-utama hover:text-utama"
                          >
                            {u.tampil ? "Sembunyikan" : "Tampilkan"}
                          </button>
                        </form>
                        <form action={hapusUlasan}>
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold text-bahaya hover:bg-bahaya/10"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
