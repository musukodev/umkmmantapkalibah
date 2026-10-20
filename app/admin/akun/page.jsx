import FormTambahAdmin from "@/components/FormTambahAdmin";
import NavAdmin from "@/components/NavAdmin";
import TombolHapusAdmin from "@/components/TombolHapusAdmin";
import { wajibAdmin } from "@/lib/auth";
import { buatKlienServer } from "@/lib/supabase/server";

export const metadata = {
  title: "Akun admin",
};

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function tampilkanTanggal(nilai) {
  if (!nilai) {
    return "Belum pernah";
  }

  const tanggal = new Date(nilai);
  return Number.isNaN(tanggal.getTime()) ? "Tidak diketahui" : formatTanggal.format(tanggal);
}

export default async function HalamanAkunAdmin({ searchParams }) {
  const { user } = await wajibAdmin();
  const { pesan } = (await searchParams) ?? {};

  let daftarAdmin = [];
  let pesanError = "";

  try {
    const admin = buatKlienServer();
    const semuaPengguna = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 100,
      });

      if (error) throw error;
      const batch = data?.users ?? [];
      semuaPengguna.push(...batch);
      if (batch.length < 100) break;
    }

    daftarAdmin = semuaPengguna
      .filter((pengguna) => pengguna.app_metadata?.role === "admin")
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  } catch (error) {
    console.error("Gagal mengambil daftar admin:", error.message);
    pesanError = "Daftar admin belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Akun admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Kelola akun yang boleh masuk ke halaman admin. Akun yang sedang
          dipakai tidak bisa dihapus dari halaman ini.
        </p>
      </div>

      {pesan === "dihapus" ? (
        <p role="status" className="text-sm text-utama">
          Akun admin berhasil dihapus.
        </p>
      ) : null}

      {pesan === "sendiri" ? (
        <p role="alert" className="text-sm text-bahaya">
          Kamu tidak bisa menghapus akun yang sedang dipakai.
        </p>
      ) : null}

      {pesan === "gagal" ? (
        <p role="alert" className="text-sm text-bahaya">
          Akun admin belum bisa dihapus. Coba lagi beberapa saat lagi.
        </p>
      ) : null}

      <FormTambahAdmin />

      {pesanError ? (
        <p role="alert" className="text-sm text-bahaya">
          {pesanError}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-garis">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-permukaan text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Dibuat</th>
                <th className="px-4 py-3 font-semibold">Terakhir masuk</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {daftarAdmin.length === 0 ? (
                <tr className="border-t border-garis">
                  <td colSpan={4} className="px-4 py-8 text-center text-teks-lembut">
                    Belum ada akun admin.
                  </td>
                </tr>
              ) : (
                daftarAdmin.map((admin) => {
                  const akunSendiri = admin.id === user.id;

                  return (
                    <tr key={admin.id} className="border-t border-garis">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">
                            {admin.email || "Tanpa email"}
                          </span>
                          {akunSendiri ? (
                            <span className="rounded-full bg-permukaan px-2 py-0.5 text-xs font-semibold text-teks-lembut">
                              Akun kamu
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-teks-lembut">
                        {tampilkanTanggal(admin.created_at)}
                      </td>
                      <td className="px-4 py-3 text-teks-lembut">
                        {tampilkanTanggal(admin.last_sign_in_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {akunSendiri ? (
                            <span className="text-xs text-teks-lembut">—</span>
                          ) : (
                            <TombolHapusAdmin
                              id={admin.id}
                              email={admin.email || "tanpa email"}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
