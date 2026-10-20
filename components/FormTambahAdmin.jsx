"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahAdmin } from "@/app/admin/akun/actions";

export default function FormTambahAdmin() {
  const [keadaan, aksi, sedangProses] = useActionState(tambahAdmin, {});
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
      className="flex max-w-xl flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-4"
    >
      <div>
        <h2 className="font-bold">Tambah admin</h2>
        <p className="mt-1 text-sm text-teks-lembut">
          Buat akun baru untuk pemilik atau pengelola toko.
        </p>
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label="Password awal"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Ulangi password"
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

      <Tombol
        type="submit"
        className="self-start disabled:cursor-not-allowed disabled:opacity-60"
        disabled={sedangProses}
      >
        {sedangProses ? "Menambahkan..." : "Tambah admin"}
      </Tombol>
    </form>
  );
}
