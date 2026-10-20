import Link from "next/link";
import FormImporCsv from "@/components/FormImporCsv";
import NavAdmin from "@/components/NavAdmin";
import { wajibAdmin } from "@/lib/auth";

export const metadata = {
  title: "Impor produk",
};

export default async function HalamanImporProduk() {
  await wajibAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <Link
          href="/admin"
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Kembali ke daftar produk
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold">Impor produk</h1>
        <p className="mt-1 max-w-2xl text-sm text-teks-lembut">
          Tambahkan banyak produk sekaligus dari file CSV. Baris yang tidak
          valid akan dilewati dan ditampilkan nomornya.
        </p>
      </div>
      <FormImporCsv />
    </div>
  );
}
