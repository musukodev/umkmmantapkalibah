import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { wajibAdmin } from "@/lib/auth";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const { supabase } = await wajibAdmin();

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let produk = null;
  let pesanError = "";

  try {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    produk = data;
  } catch (error) {
    console.error("Gagal mengambil produk untuk diubah:", error.message);
    pesanError = "Data produk belum bisa dimuat. Coba muat ulang halaman ini.";
  }

  if (pesanError) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <NavAdmin />
        <h1 className="text-2xl font-extrabold">Ubah produk</h1>
        <p role="alert" className="text-sm text-bahaya">
          {pesanError}
        </p>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} labelTombol="Simpan perubahan" />
    </div>
  );
}
