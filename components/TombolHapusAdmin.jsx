"use client";

import Tombol from "@/components/Tombol";
import { hapusAdmin } from "@/app/admin/akun/actions";

export default function TombolHapusAdmin({ id, email }) {
  return (
    <form
      action={hapusAdmin}
      onSubmit={(event) => {
        const yakin = window.confirm(
          `Hapus akun admin "${email}"? Akun ini tidak bisa masuk lagi.`
        );

        if (!yakin) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}
