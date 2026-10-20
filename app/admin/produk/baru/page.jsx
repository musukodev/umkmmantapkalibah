import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { wajibAdmin } from "@/lib/auth";

export default async function HalamanTambahProduk() {
  const { supabase } = await wajibAdmin();

  let kategoriList = [];
  try {
    const { data } = await supabase.from("kategori").select("nama").order("nama");
    if (data && data.length > 0) {
      kategoriList = data.map((k) => k.nama);
    } else {
      const { data: dataProduk } = await supabase.from("produk").select("kategori");
      kategoriList = [...new Set((dataProduk ?? []).map((p) => p.kategori).filter(Boolean))];
    }
  } catch {}

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk labelTombol="Simpan produk" kategoriList={kategoriList} />
    </div>
  );
}
