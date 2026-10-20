"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import {
  buatDeskripsiProduk,
  simpanProduk,
} from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol }) {
  const [keadaan, aksi, sedangProses] = useActionState(simpanProduk, {});
  const [pesanAI, setPesanAI] = useState(null);
  const [sedangAI, mulaiAI] = useTransition();
  const formRef = useRef(null);
  const deskripsiRef = useRef(null);
  const nilai = keadaan?.nilai ?? produk;

  function buatDeskripsi() {
    if (!formRef.current) {
      return;
    }

    setPesanAI(null);
    const formData = new FormData(formRef.current);

    mulaiAI(async () => {
      try {
        const hasil = await buatDeskripsiProduk(formData);

        if (hasil?.error) {
          setPesanAI({ jenis: "error", teks: hasil.error });
          return;
        }

        if (deskripsiRef.current) {
          deskripsiRef.current.value = hasil.deskripsi;
          deskripsiRef.current.focus();
        }

        setPesanAI({
          jenis: "sukses",
          teks: "Deskripsi dibuat. Periksa dan sesuaikan sebelum menyimpan.",
        });
      } catch {
        setPesanAI({
          jenis: "error",
          teks: "Deskripsi belum bisa dibuat. Periksa koneksi lalu coba lagi.",
        });
      }
    });
  }

  return (
    <form ref={formRef} action={aksi} className="flex max-w-xl flex-col gap-4">
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
        inputRef={deskripsiRef}
        defaultValue={nilai.deskripsi ?? ""}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tombol
          type="button"
          varian="garis"
          onClick={buatDeskripsi}
          disabled={sedangAI || sedangProses}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sedangAI ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
        </Tombol>
        {pesanAI ? (
          <p
            role={pesanAI.jenis === "error" ? "alert" : "status"}
            className={`max-w-md text-sm ${
              pesanAI.jenis === "error" ? "text-bahaya" : "text-utama"
            }`}
          >
            {pesanAI.teks}
          </p>
        ) : null}
      </div>

      {keadaan?.error ? (
        <p role="alert" className="text-sm text-bahaya">
          {keadaan.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Tombol
          type="submit"
          className="disabled:cursor-not-allowed disabled:opacity-60"
          disabled={sedangProses || sedangAI}
        >
          {sedangProses ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
