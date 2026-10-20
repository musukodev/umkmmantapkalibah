import NavAdmin from "@/components/NavAdmin";
import FormGantiPassword from "@/components/FormGantiPassword";
import { wajibAdmin } from "@/lib/auth";

export default async function HalamanGantiPassword() {
  await wajibAdmin();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ganti password</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
        </p>
      </div>
      <FormGantiPassword />
    </div>
  );
}
