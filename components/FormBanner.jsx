"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanBanner } from "@/app/admin/banner/actions";

export default function FormBanner({ banner }) {
  const sedangEdit = Boolean(banner);
  const [keadaan, aksi, sedangProses] = useActionState(simpanBanner, {});
  const formRef = useRef(null);

  useEffect(() => {
    if (keadaan?.sukses && !sedangEdit) {
      formRef.current?.reset();
    }
  }, [keadaan?.sukses, sedangEdit]);

  return (
    <form
      ref={formRef}
      action={aksi}
      className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5"
    >
      {sedangEdit ? <input type="hidden" name="id" value={banner.id} /> : null}
      <h2 className="font-bold">
        {sedangEdit ? "Ubah banner promosi" : "Tambah banner promosi"}
      </h2>
      <div className="flex items-center gap-3">
        <input
          id={sedangEdit ? `banner-aktif-${banner.id}` : "banner-aktif"}
          type="checkbox"
          name="aktif"
          defaultChecked={banner?.aktif ?? true}
          className="h-4 w-4 rounded text-utama focus:ring-utama"
        />
        <label
          htmlFor={sedangEdit ? `banner-aktif-${banner.id}` : "banner-aktif"}
          className="text-sm font-semibold"
        >
          Aktifkan banner di beranda
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Judul promo"
          name="judul"
          placeholder="Contoh: Diskon Musim Hujan 20%"
          defaultValue={banner?.judul ?? ""}
          required
        />
        <Input
          label="Tautan tujuan (opsional)"
          name="tautan"
          placeholder="Contoh: /kategori/terpal-kolam"
          defaultValue={banner?.tautan ?? ""}
        />
      </div>

      <Input
        label="Link gambar (opsional)"
        name="gambar_url"
        placeholder="https://... atau /produk/..."
        defaultValue={banner?.gambar_url ?? ""}
      />

      <Input
        label="Teks keterangan (opsional)"
        name="teks"
        textarea
        rows={2}
        placeholder="Penjelasan singkat penawaran..."
        defaultValue={banner?.teks ?? ""}
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
        {sedangProses ? "Menyimpan..." : sedangEdit ? "Simpan perubahan" : "Simpan banner"}
      </Tombol>
    </form>
  );
}
