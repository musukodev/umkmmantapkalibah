"use client";

import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapus({ id, nama }) {
  return (
    <form
      action={hapusProduk}
      onSubmit={(event) => {
        const yakin = window.confirm(
          `Hapus produk "${nama}"? Tindakan ini tidak bisa dibatalkan.`
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
