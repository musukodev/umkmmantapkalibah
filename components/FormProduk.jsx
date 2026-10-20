"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import {
  buatDeskripsiProduk,
  simpanProduk,
  unggahFotoProduk,
} from "@/app/admin/actions";

export default function FormProduk({ produk = {}, labelTombol, kategoriList = [] }) {
  const [keadaan, aksi, sedangProses] = useActionState(simpanProduk, {});
  const [pesanAI, setPesanAI] = useState(null);
  const [sedangAI, mulaiAI] = useTransition();
  const [pesanFoto, setPesanFoto] = useState(null);
  const [sedangUnggah, setSedangUnggah] = useState(false);
  const formRef = useRef(null);
  const deskripsiRef = useRef(null);
  const fotoRef = useRef(null);
  const fileRef = useRef(null);
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

  async function unggahFoto() {
    const file = fileRef.current?.files?.[0];

    if (!file) {
      setPesanFoto({ jenis: "error", teks: "Pilih file foto dulu." });
      return;
    }

    setPesanFoto(null);
    setSedangUnggah(true);

    try {
      const data = new FormData();
      data.append("foto", file);
      const hasil = await unggahFotoProduk(data);

      if (hasil?.error) {
        setPesanFoto({ jenis: "error", teks: hasil.error });
        return;
      }

      if (fotoRef.current) {
        fotoRef.current.value = hasil.url;
      }

      setPesanFoto({
        jenis: "sukses",
        teks: "Foto berhasil diunggah. Simpan produk untuk memakai foto ini.",
      });
    } catch {
      setPesanFoto({
        jenis: "error",
        teks: "Foto belum bisa diunggah. Periksa koneksi lalu coba lagi.",
      });
    } finally {
      setSedangUnggah(false);
    }
  }

  return (
    <form ref={formRef} action={aksi} className="flex max-w-xl flex-col gap-4">
      {produk.id ? <input type="hidden" name="id" value={produk.id} /> : null}

      <div className="flex items-center gap-3 rounded-lg border border-garis bg-permukaan p-3">
        <input
          id="aktif"
          type="checkbox"
          name="aktif"
          defaultChecked={nilai.aktif ?? true}
          className="h-4 w-4 rounded text-utama focus:ring-utama"
        />
        <label htmlFor="aktif" className="text-sm font-semibold">
          Aktifkan produk di katalog publik
        </label>
      </div>

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={nilai.nama ?? ""}
        error={keadaan?.fieldErrors?.nama}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Harga normal (Rp)"
          name="harga"
          type="number"
          min="1"
          step="1"
          defaultValue={nilai.harga ?? ""}
          error={keadaan?.fieldErrors?.harga}
          required
        />
        <Input
          label="Harga diskon (Rp, opsional)"
          name="harga_diskon"
          type="number"
          min="1"
          step="1"
          placeholder="Coret harga normal"
          defaultValue={nilai.harga_diskon ?? ""}
          error={keadaan?.fieldErrors?.harga_diskon}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Jumlah stok"
          name="stok"
          type="number"
          min="0"
          step="1"
          placeholder="10"
          defaultValue={nilai.stok ?? 10}
          error={keadaan?.fieldErrors?.stok}
        />
        <Input
          label="Urutan tampil (angka)"
          name="urutan"
          type="number"
          step="1"
          placeholder="0 (lebih kecil lebih dulu)"
          defaultValue={nilai.urutan ?? 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            label="Kategori"
            name="kategori"
            list="daftar-kategori"
            placeholder="Pilih atau ketik kategori"
            defaultValue={nilai.kategori ?? ""}
          />
          {kategoriList.length > 0 ? (
            <datalist id="daftar-kategori">
              {kategoriList.map((kat) => (
                <option key={kat} value={kat} />
              ))}
            </datalist>
          ) : null}
        </div>
        <Input
          label="Badge (opsional)"
          name="badge"
          placeholder="Contoh: Baru, Terlaris, Promo"
          maxLength={30}
          defaultValue={nilai.badge ?? ""}
        />
      </div>

      <Input
        label="Link foto utama"
        name="foto_url"
        inputRef={fotoRef}
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url ?? ""}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-garis bg-permukaan p-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Unggah foto dari perangkat
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-normal text-teks file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-teks"
          />
        </label>
        <p className="text-xs text-teks-lembut">
          JPG, PNG, atau WebP. Maksimal 2 MB. Foto akan disimpan di Supabase
          Storage dan link-nya diisi otomatis.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tombol
            type="button"
            varian="garis"
            onClick={unggahFoto}
            disabled={sedangUnggah || sedangAI || sedangProses}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sedangUnggah ? "Mengunggah..." : "Unggah foto"}
          </Tombol>
          {pesanFoto ? (
            <p
              role={pesanFoto.jenis === "error" ? "alert" : "status"}
              className={`text-sm ${
                pesanFoto.jenis === "error" ? "text-bahaya" : "text-utama"
              }`}
            >
              {pesanFoto.teks}
            </p>
          ) : null}
        </div>
      </div>

      <Input
        label="Foto tambahan galeri (satu URL per baris)"
        name="foto_tambahan"
        textarea
        rows={3}
        placeholder="https://.../foto-2.jpg&#10;https://.../foto-3.jpg"
        defaultValue={nilai.foto_tambahan ?? ""}
      />

      <Input
        label="Varian produk (satu baris per varian, format: Nama: Harga)"
        name="varian_teks"
        textarea
        rows={3}
        placeholder="Ukuran S: 25000&#10;Ukuran M: 30000&#10;Ukuran L: 35000"
        defaultValue={nilai.varian_teks ?? ""}
      />

      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        rows={4}
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

      <div className="flex gap-3 pt-2">
        <Tombol
          type="submit"
          className="disabled:cursor-not-allowed disabled:opacity-60"
          disabled={sedangProses || sedangAI || sedangUnggah}
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
