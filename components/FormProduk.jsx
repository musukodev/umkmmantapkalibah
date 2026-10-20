"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanProduk } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol }) {
  const [keadaan, aksi, sedangProses] = useActionState(simpanProduk, {});
  const nilai = keadaan?.nilai ?? produk;

  return (
    <form action={aksi} className="flex max-w-xl flex-col gap-4">
      {produk.id ? <input type="hidden" name="id" value={produk.id} /> : null}

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={nilai.nama ?? ""}
        error={keadaan?.fieldErrors?.nama}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        step="1"
        defaultValue={nilai.harga ?? ""}
        error={keadaan?.fieldErrors?.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={nilai.kategori ?? ""}
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url ?? ""}
      />
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={nilai.deskripsi ?? ""}
      />

      {keadaan?.error ? (
        <p role="alert" className="text-sm text-bahaya">
          {keadaan.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Tombol type="submit" className="disabled:opacity-60" disabled={sedangProses}>
          {sedangProses ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
