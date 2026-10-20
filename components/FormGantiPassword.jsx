"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

export default function FormGantiPassword() {
  const [keadaan, aksi, sedangProses] = useActionState(gantiPassword, {});

  return (
    <form action={aksi} className="flex max-w-sm flex-col gap-4">
      <Input
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Ulangi password baru"
        name="konfirmasi_password"
        type="password"
        autoComplete="new-password"
        minLength={8}
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
      <Tombol type="submit" className="self-start disabled:opacity-60" disabled={sedangProses}>
        {sedangProses ? "Menyimpan..." : "Simpan password"}
      </Tombol>
    </form>
  );
}
