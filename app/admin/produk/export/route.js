import { wajibAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function bungkusCsv(nilai) {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  return `"${teks.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { supabase } = await wajibAdmin();
  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori, deskripsi, foto_url, created_at")
    .order("id", { ascending: true });

  if (error) {
    console.error("Gagal mengekspor produk:", error.message);
    return new Response("Produk belum bisa diekspor. Coba lagi.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const baris = [
    ["id", "nama", "harga", "kategori", "deskripsi", "foto_url", "created_at"],
    ...(data ?? []).map((produk) => [
      produk.id,
      produk.nama,
      produk.harga,
      produk.kategori,
      produk.deskripsi,
      produk.foto_url,
      produk.created_at,
    ]),
  ];

  const csv =
    "\uFEFF" + baris.map((kolom) => kolom.map(bungkusCsv).join(",")).join("\r\n");
  const tanggal = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produk-terpal-b-${tanggal}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
