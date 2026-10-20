"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { kirimUlasan } from "@/app/produk/ulasan-actions";

export default function FormUlasan({ produkId }) {
  const [keadaan, aksi, sedangProses] = useActionState(kirimUlasan, {});
  const [rating, setRating] = useState(5);
  const formRef = useRef(null);

  useEffect(() => {
    if (keadaan?.sukses) {
      formRef.current?.reset();
      setRating(5);
    }
  }, [keadaan?.sukses]);

  return (
    <form
      ref={formRef}
      action={aksi}
      className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4"
    >
      <h3 className="font-bold">Tulis ulasan</h3>
      <input type="hidden" name="produk_id" value={produkId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="situs_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Input
        label="Nama kamu"
        name="nama"
        placeholder="Nama panggilan atau pembeli"
        required
        minLength={2}
        maxLength={60}
      />

      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>Rating bintang (1–5)</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((bintang) => (
            <button
              key={bintang}
              type="button"
              onClick={() => setRating(bintang)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors ${
                rating >= bintang
                  ? "border-harga bg-harga-latar text-harga"
                  : "border-garis bg-latar text-teks-lembut"
              }`}
            >
              ★ {bintang}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Komentar (opsional)"
        name="komentar"
        textarea
        rows={3}
        placeholder="Ceritakan pengalamanmu tentang produk ini..."
        maxLength={500}
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
        {sedangProses ? "Mengirim ulasan..." : "Kirim ulasan"}
      </Tombol>
    </form>
  );
}
