"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";

export default function BagikanProduk({ judul }) {
  const [pesan, setPesan] = useState("");

  async function bagikan() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: judul, url });
        setPesan("Link siap dibagikan.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setPesan("Link tersalin.");
        return;
      }

      window.prompt("Salin link produk ini:", url);
      setPesan("Link bisa disalin dari kotak.");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      window.prompt("Salin link produk ini:", url);
      setPesan("Link bisa disalin dari kotak.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tombol type="button" varian="garis" onClick={bagikan}>
        Bagikan produk
      </Tombol>
      {pesan ? (
        <span role="status" className="text-sm text-utama">
          {pesan}
        </span>
      ) : null}
    </div>
  );
}
