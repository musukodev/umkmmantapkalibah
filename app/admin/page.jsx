import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { wajibAdmin } from "@/lib/auth";

export default async function HalamanAdmin({ searchParams }) {
  const { supabase } = await wajibAdmin();
  const { pesan } = (await searchParams) ?? {};

  let daftarProduk = [];
  let pesanError = "";

  try {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, foto_url")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    daftarProduk = data ?? [];
  } catch (error) {
    console.error("Gagal mengambil daftar produk admin:", error.message);
    pesanError = "Daftar produk belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
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

      {pesanError ? (
        <p role="alert" className="text-sm text-bahaya">
          {pesanError}
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
