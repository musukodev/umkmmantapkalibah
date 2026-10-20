import NavAdmin from "@/components/NavAdmin";
import FormKategori from "@/components/FormKategori";
import Tombol from "@/components/Tombol";
import { wajibAdmin } from "@/lib/auth";
import { hapusKategori, ubahKategori } from "@/app/admin/kategori/actions";

export default async function HalamanAdminKategori() {
  const { supabase } = await wajibAdmin();

  let daftarKategori = [];
  try {
    const { data } = await supabase
      .from("kategori")
      .select("id, nama, slug, created_at")
      .order("nama", { ascending: true });
    daftarKategori = data ?? [];
  } catch (err) {
    console.error("Gagal mengambil kategori:", err.message);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Manajemen Kategori</h1>
        <p className="text-sm text-teks-lembut">
          {daftarKategori.length} kategori terdaftar
        </p>
      </div>

      <FormKategori />

      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Kategori</th>
              <th className="px-4 py-3 font-semibold">Slug URL</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarKategori.length === 0 ? (
              <tr className="border-t border-garis">
                <td colSpan={3} className="px-4 py-8 text-center text-teks-lembut">
                  Belum ada kategori yang ditambahkan.
                </td>
              </tr>
            ) : (
              daftarKategori.map((kategori) => (
                <tr key={kategori.id} className="border-t border-garis">
                  <td className="px-4 py-3 font-semibold">{kategori.nama}</td>
                  <td className="px-4 py-3 text-teks-lembut">{kategori.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={hapusKategori}
                      className="inline-block"
                      onSubmit={undefined}
                    >
                      <input type="hidden" name="id" value={kategori.id} />
                      <input type="hidden" name="nama" value={kategori.nama} />
                      <button
                        type="submit"
                        className="rounded-lg border border-garis px-3 py-1.5 text-xs font-semibold text-bahaya hover:bg-bahaya/10"
                      >
                        Hapus
                      </button>
                    </form>
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
