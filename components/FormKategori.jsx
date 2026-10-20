"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahKategori, ubahKategori } from "@/app/admin/kategori/actions";

export default function FormKategori({ kategori }) {
  const sedangEdit = Boolean(kategori);
  const action = sedangEdit ? ubahKategori : tambahKategori;
  const [keadaan, aksi, sedangProses] = useActionState(action, {});
  const formRef = useRef(null);
  const nilaiNama = keadaan?.nilai?.nama ?? kategori?.nama ?? "";

  useEffect(() => {
    if (keadaan?.sukses && !sedangEdit) {
      formRef.current?.reset();
    }
  }, [keadaan?.sukses, sedangEdit]);

  return (
    <form
      ref={formRef}
      action={aksi}
      className={`flex flex-col gap-3 ${sedangEdit ? "" : "rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-end"}`}
    >
      {sedangEdit ? <input type="hidden" name="id" value={kategori.id} /> : null}
      <div className="flex-1">
        <Input
          label={sedangEdit ? "Ubah nama kategori" : "Tambah kategori baru"}
          name="nama"
          placeholder="Contoh: Terpal Kolam, Tenda"
          defaultValue={nilaiNama}
          required
        />
      </div>
      <Tombol type="submit" disabled={sedangProses} className="disabled:opacity-60">
        {sedangProses ? "Menyimpan..." : sedangEdit ? "Simpan" : "Tambah"}
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
      {sedangEdit ? (
        <Tombol href="/admin/kategori" varian="garis">
          Batal
        </Tombol>
      ) : null}
    </form>
  );
}
