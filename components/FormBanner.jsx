"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanBanner } from "@/app/admin/banner/actions";

export default function FormBanner() {
  const [keadaan, aksi, sedangProses] = useActionState(simpanBanner, {});
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
      className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5"
    >
      <h2 className="font-bold">Tambah banner promosi</h2>
      <div className="flex items-center gap-3">
        <input
          id="banner-aktif"
          type="checkbox"
          name="aktif"
          defaultChecked={true}
          className="h-4 w-4 rounded text-utama focus:ring-utama"
        />
        <label htmlFor="banner-aktif" className="text-sm font-semibold">
          Aktifkan banner di beranda
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Judul promo"
          name="judul"
          placeholder="Contoh: Diskon Musim Hujan 20%"
          required
        />
        <Input
          label="Tautan tujuan (opsional)"
          name="tautan"
          placeholder="Contoh: /kategori/terpal-kolam"
        />
      </div>

      <Input
        label="Link gambar (opsional)"
        name="gambar_url"
        placeholder="https://... atau /produk/..."
      />

      <Input
        label="Teks keterangan (opsional)"
        name="teks"
        textarea
        rows={2}
        placeholder="Penjelasan singkat penawaran..."
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
        disabled={sedangProses}
        className="self-start disabled:opacity-60"
      >
        {sedangProses ? "Menyimpan..." : "Simpan banner"}
      </Tombol>
    </form>
  );
}
