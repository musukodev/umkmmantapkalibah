import FormLogin from "@/components/FormLogin";

export default async function HalamanLogin({ searchParams }) {
  const { pesan } = (await searchParams) ?? {};

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Khusus pemilik toko untuk mengelola produk.</p>
      </div>
      {pesan === "akses" ? (
        <p role="alert" className="text-sm text-bahaya">
          Akun ini tidak memiliki akses admin.
        </p>
      ) : null}
      <FormLogin />
    </div>
  );
}
