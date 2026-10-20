"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tanyaProduk } from "@/app/produk/actions";

export default function TanyaProduk({ produkId }) {
  const [keadaan, aksi, sedangProses] = useActionState(tanyaProduk, {});
  const pertanyaanRef = useRef(null);

  useEffect(() => {
    if (keadaan?.jawaban) {
      pertanyaanRef.current?.focus();
    }
  }, [keadaan?.jawaban]);

  return (
    <section
      aria-labelledby="judul-tanya-produk"
      className="mt-8 rounded-2xl border border-garis bg-permukaan p-4"
    >
      <h2 id="judul-tanya-produk" className="font-bold">
        Tanya tentang produk ini
      </h2>
      <p className="mt-1 text-sm text-teks-lembut">
        Asisten akan menjawab berdasarkan nama, harga, kategori, dan deskripsi
        produk. Untuk stok atau pengiriman, konfirmasi lewat WhatsApp.
      </p>

      <form action={aksi} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="id" value={produkId} />
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="situs_web"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
        <Input
          label="Pertanyaan"
          name="pertanyaan"
          textarea
          inputRef={pertanyaanRef}
          rows={3}
          minLength={3}
          maxLength={300}
          placeholder="Contoh: Apakah produk ini cocok untuk hadiah?"
          required
        />
        <Tombol
          type="submit"
          className="self-start disabled:cursor-not-allowed disabled:opacity-60"
          disabled={sedangProses}
        >
          {sedangProses ? "Menjawab..." : "Tanya asisten"}
        </Tombol>
      </form>

      {keadaan?.error ? (
        <p role="alert" className="mt-3 text-sm text-bahaya">
          {keadaan.error}
        </p>
      ) : null}

      {keadaan?.jawaban ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-lg border border-garis bg-latar p-3 text-sm leading-relaxed"
        >
          {keadaan.jawaban}
        </div>
      ) : null}
    </section>
  );
}
