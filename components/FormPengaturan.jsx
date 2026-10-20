"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanPengaturanToko } from "@/app/admin/pengaturan/actions";

export default function FormPengaturan({ pengaturan }) {
  const [keadaan, aksi, sedangProses] = useActionState(simpanPengaturanToko, {});

  return (
    <form action={aksi} className="flex max-w-xl flex-col gap-4">
      <Input
        label="Nama Toko"
        name="nama"
        defaultValue={pengaturan.nama ?? ""}
        placeholder="Contoh: Terpal B"
        required
      />

      <Input
        label="Nomor WhatsApp"
        name="nomor_whatsapp"
        defaultValue={pengaturan.nomorWhatsApp ?? ""}
        placeholder="Format internasional: 6281378280892"
        required
      />
      <p className="-mt-2 text-xs text-teks-lembut">
        Gunakan format internasional tanpa tanda + dan tanpa angka 0 di depan
        (contoh: 6281378280892).
      </p>

      <Input
        label="Jam Buka"
        name="jam_buka"
        defaultValue={pengaturan.jamBuka ?? ""}
        placeholder="Contoh: Buka pukul 08.00"
      />

      <Input
        label="Alamat Fisik"
        name="alamat"
        textarea
        rows={3}
        defaultValue={pengaturan.alamat ?? ""}
        placeholder="Contoh: Politeknik Negeri Batam"
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

      <div className="pt-2">
        <Tombol type="submit" disabled={sedangProses} className="disabled:opacity-60">
          {sedangProses ? "Menyimpan..." : "Simpan pengaturan"}
        </Tombol>
      </div>
    </form>
  );
}
