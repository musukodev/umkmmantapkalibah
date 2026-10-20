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
  let kategoriList = [];
  let pesanError = "";

  try {
    const [resProduk, resFoto, resVarian, resKategori] = await Promise.all([
      supabase.from("produk").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("foto_produk")
        .select("url")
        .eq("produk_id", id)
        .order("urutan", { ascending: true }),
      supabase
        .from("varian_produk")
        .select("nama, harga")
        .eq("produk_id", id)
        .order("urutan", { ascending: true }),
      supabase.from("kategori").select("nama").order("nama"),
    ]);

    if (resProduk.error) {
      throw resProduk.error;
    }

    if (resProduk.data) {
      produk = {
        ...resProduk.data,
        foto_tambahan: (resFoto.data ?? []).map((f) => f.url).join("\n"),
        varian_teks: (resVarian.data ?? [])
          .map((v) => `${v.nama}: ${v.harga}`)
          .join("\n"),
      };
    }

    if (resKategori.data && resKategori.data.length > 0) {
      kategoriList = resKategori.data.map((k) => k.nama);
    }
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
      <FormProduk
        produk={produk}
        labelTombol="Simpan perubahan"
        kategoriList={kategoriList}
      />
    </div>
  );
}
