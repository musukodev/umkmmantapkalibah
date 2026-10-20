"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { imporProduk } from "@/app/admin/produk/impor/actions";

export default function FormImporCsv() {
  const [keadaan, aksi, sedangProses] = useActionState(imporProduk, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (keadaan?.sukses) {
      formRef.current?.reset();
    }
  }, [keadaan?.sukses]);

  const dilewati = keadaan?.dilewati ?? [];

  return (
    <form
      ref={formRef}
      action={aksi}
      encType="multipart/form-data"
      className="flex max-w-2xl flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-4"
    >
      <div>
        <h2 className="font-bold">Unggah file CSV</h2>
        <p className="mt-1 text-sm text-teks-lembut">
          Baris pertama harus berisi header. Kolom wajib: nama dan harga.
          Kolom opsional: kategori, deskripsi, foto_url.
        </p>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-garis bg-latar p-3 text-xs text-teks-lembut">
        {`nama,harga,kategori,deskripsi,foto_url
Contoh Produk,25000,Makanan,Deskripsi singkat,/produk/contoh.svg`}
      </pre>

      <Input
        label="File CSV (maksimal 2 MB)"
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
      />

      {keadaan?.error ? (
        <p role="alert" className="text-sm text-bahaya">
          {keadaan.error}
        </p>
      ) : null}

      {keadaan?.sukses ? (
        <p role="status" className="text-sm text-utama">
          {keadaan.sukses}
        </p>
      ) : null}

      {dilewati.length > 0 ? (
        <div className="rounded-lg border border-garis bg-latar p-3">
          <p className="text-sm font-semibold">Baris yang dilewati</p>
          <ul className="mt-2 list-inside list-disc text-sm text-teks-lembut">
            {dilewati.slice(0, 20).map((pesan) => (
              <li key={pesan}>{pesan}</li>
            ))}
          </ul>
          {dilewati.length > 20 ? (
            <p className="mt-2 text-xs text-teks-lembut">
              Dan {dilewati.length - 20} baris lainnya.
            </p>
          ) : null}
        </div>
      ) : null}

      <Tombol
        type="submit"
        className="self-start disabled:cursor-not-allowed disabled:opacity-60"
        disabled={sedangProses}
      >
        {sedangProses ? "Mengimpor..." : "Impor produk"}
      </Tombol>
    </form>
  );
}
