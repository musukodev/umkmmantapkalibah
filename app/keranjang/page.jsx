import IsiKeranjang from "@/components/IsiKeranjang";

export const metadata = {
  title: "Keranjang",
  description: "Periksa produk pilihanmu sebelum memesan lewat WhatsApp.",
};

export default function HalamanKeranjang() {
  return (
    <div className="py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Keranjang</h1>
        <p className="mt-2 text-sm text-teks-lembut">
          Atur jumlah produk, lalu kirim rincian pesanan lewat WhatsApp.
        </p>
      </div>
      <IsiKeranjang />
    </div>
  );
}
