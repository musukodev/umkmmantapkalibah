import IsiKeranjang from "@/components/IsiKeranjang";
import { ambilPengaturanToko } from "@/lib/pengaturan";

export const metadata = {
  title: "Keranjang",
  description: "Periksa produk pilihanmu sebelum memesan lewat WhatsApp.",
};

export default async function HalamanKeranjang() {
  const toko = await ambilPengaturanToko();

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Keranjang</h1>
        <p className="mt-2 text-sm text-teks-lembut">
          Atur jumlah produk, lalu kirim rincian pesanan lewat WhatsApp.
        </p>
      </div>
      <IsiKeranjang nomorWhatsApp={toko.nomorWhatsApp} />
    </div>
  );
}
