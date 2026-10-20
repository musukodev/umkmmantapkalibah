import NavAdmin from "@/components/NavAdmin";
import FormPengaturan from "@/components/FormPengaturan";
import { wajibAdmin } from "@/lib/auth";
import { ambilPengaturanToko } from "@/lib/pengaturan";

export default async function HalamanAdminPengaturan() {
  await wajibAdmin();
  const pengaturan = await ambilPengaturanToko();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Pengaturan Toko</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Atur nama usaha, kontak WhatsApp, jam buka, dan alamat toko yang
          ditampilkan di seluruh website.
        </p>
      </div>

      <FormPengaturan pengaturan={pengaturan} />
    </div>
  );
}
