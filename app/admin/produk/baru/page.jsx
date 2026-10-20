import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { wajibAdmin } from "@/lib/auth";

export default async function HalamanTambahProduk() {
  await wajibAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk labelTombol="Simpan produk" />
    </div>
  );
}
