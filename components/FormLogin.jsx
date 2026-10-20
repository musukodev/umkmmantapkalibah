"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { masuk } from "@/app/admin/actions";

export default function FormLogin() {
  const [keadaan, aksi, sedangProses] = useActionState(masuk, {});

  return (
    <form action={aksi} className="flex flex-col gap-4">
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {keadaan?.error ? (
        <p role="alert" className="text-sm text-bahaya">
          {keadaan.error}
        </p>
      ) : null}
      <Tombol type="submit" className="disabled:opacity-60" disabled={sedangProses}>
        {sedangProses ? "Memproses..." : "Masuk"}
      </Tombol>
    </form>
  );
}
