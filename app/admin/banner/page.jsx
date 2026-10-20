import NavAdmin from "@/components/NavAdmin";
import FormBanner from "@/components/FormBanner";
import { wajibAdmin } from "@/lib/auth";
import { hapusBanner, toggleAktifBanner } from "@/app/admin/banner/actions";

export default async function HalamanAdminBanner({ searchParams }) {
  const { supabase } = await wajibAdmin();
  const { pesan } = (await searchParams) ?? {};

  let daftarBanner = [];
  try {
    const { data } = await supabase
      .from("banner")
      .select("id, judul, teks, gambar_url, tautan, aktif, created_at")
      .order("created_at", { ascending: false });
    daftarBanner = data ?? [];
  } catch (err) {
    console.error("Gagal mengambil banner:", err.message);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Banner Promosi Beranda</h1>
        <p className="text-sm text-teks-lembut">
          {daftarBanner.length} banner terdaftar
        </p>
      </div>

      {pesan === "gagal" ? (
        <p role="alert" className="text-sm text-bahaya">
          Status banner belum bisa diperbarui. Coba lagi.
        </p>
      ) : null}

      <FormBanner />

      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Judul & Keterangan</th>
              <th className="px-4 py-3 font-semibold">Tautan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarBanner.length === 0 ? (
              <tr className="border-t border-garis">
                <td colSpan={4} className="px-4 py-8 text-center text-teks-lembut">
                  Belum ada banner promosi. Buat banner baru di atas.
                </td>
              </tr>
            ) : (
              daftarBanner.map((b) => (
                <tr key={b.id} className="border-t border-garis">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{b.judul}</p>
                    {b.teks ? (
                      <p className="text-xs text-teks-lembut">{b.teks}</p>
                    ) : null}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-utama">
                        Ubah banner
                      </summary>
                      <div className="mt-3 min-w-[280px]">
                        <FormBanner banner={b} />
                      </div>
                    </details>
                  </td>
                  <td className="px-4 py-3 text-xs text-teks-lembut">
                    {b.tautan || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {b.aktif ? (
                      <span className="rounded bg-utama/15 px-2 py-0.5 text-xs font-semibold text-utama">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded bg-garis px-2 py-0.5 text-xs font-semibold text-teks-lembut">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <form action={toggleAktifBanner}>
                        <input type="hidden" name="id" value={b.id} />
                        <input
                          type="hidden"
                          name="aktif"
                          value={String(b.aktif)}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold hover:border-utama hover:text-utama"
                        >
                          {b.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                      <form action={hapusBanner}>
                        <input type="hidden" name="id" value={b.id} />
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
