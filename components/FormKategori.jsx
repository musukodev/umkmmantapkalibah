"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahKategori } from "@/app/admin/kategori/actions";

export default function FormKategori() {
  const [keadaan, aksi, sedangProses] = useActionState(tambahKategori, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (keadaan?.sukses) {
      formRef.current?.reset();
    }
  }, [keadaan?.sukses]);

  return (
    <form
      ref={formRef}
      action={aksi}
      className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="Tambah kategori baru"
          name="nama"
          placeholder="Contoh: Terpal Kolam, Tenda"
          required
        />
      </div>
      <Tombol type="submit" disabled={sedangProses} className="disabled:opacity-60">
        {sedangProses ? "Menyimpan..." : "Tambah"}
      </Tombol>
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
    </form>
  );
}
