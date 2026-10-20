import NavAdmin from "@/components/NavAdmin";
import { wajibAdmin } from "@/lib/auth";

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "medium",
});

export default async function HalamanAdminLog() {
  const { supabase } = await wajibAdmin();

  let daftarLog = [];
  try {
    const { data, error } = await supabase
      .from("log_admin")
      .select("id, email, aksi, target, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    daftarLog = data ?? [];
  } catch (err) {
    console.error("Gagal mengambil log admin:", err.message);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Log Aktivitas Admin</h1>
        <p className="text-sm text-teks-lembut">
          {daftarLog.length} riwayat aktivitas terakhir
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Waktu</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
              <th className="px-4 py-3 font-semibold">Target / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {daftarLog.length === 0 ? (
              <tr className="border-t border-garis">
                <td colSpan={4} className="px-4 py-8 text-center text-teks-lembut">
                  Belum ada catatan aktivitas.
                </td>
              </tr>
            ) : (
              daftarLog.map((log) => {
                const waktu = log.created_at
                  ? formatTanggal.format(new Date(log.created_at))
                  : "—";

                return (
                  <tr key={log.id} className="border-t border-garis">
                    <td className="px-4 py-3 text-xs text-teks-lembut">{waktu}</td>
                    <td className="px-4 py-3 font-medium">{log.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-utama/10 px-2 py-0.5 text-xs font-semibold text-utama">
                        {log.aksi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-teks-lembut">{log.target || "—"}</td>
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
