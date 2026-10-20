"use client";

import Link from "next/link";
import { useKeranjang } from "@/components/KeranjangProvider";

export default function TautanKeranjang() {
  const { jumlahItem } = useKeranjang();

  return (
    <Link
      href="/keranjang"
      className="inline-flex items-center gap-2 text-teks-lembut hover:text-utama"
    >
      Keranjang
      {jumlahItem > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-latar">
          {jumlahItem > 99 ? "99+" : jumlahItem}
        </span>
      ) : null}
    </Link>
  );
}
