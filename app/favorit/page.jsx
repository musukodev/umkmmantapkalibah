import DaftarFavorit from "@/components/DaftarFavorit";

export const metadata = {
  title: "Favorit",
  description: "Produk yang kamu simpan untuk dilihat lagi nanti.",
};

export default function HalamanFavorit() {
  return (
    <div className="py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Favorit</h1>
        <p className="mt-2 text-sm text-teks-lembut">
          Produk yang kamu simpan tersimpan di browser ini.
        </p>
      </div>
      <DaftarFavorit />
    </div>
  );
}
