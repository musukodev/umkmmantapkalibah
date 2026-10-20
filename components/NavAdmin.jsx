import Link from "next/link";
import { keluar } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-garis pb-4 text-sm font-semibold">
      <Link href="/admin" className="hover:text-utama">
        Produk
      </Link>
      <Link href="/admin/kategori" className="hover:text-utama">
        Kategori
      </Link>
      <Link href="/admin/ulasan" className="hover:text-utama">
        Ulasan
      </Link>
      <Link href="/admin/banner" className="hover:text-utama">
        Banner
      </Link>
      <Link href="/admin/pengaturan" className="hover:text-utama">
        Pengaturan
      </Link>
      <Link href="/admin/log" className="hover:text-utama">
        Log
      </Link>
      <Link href="/admin/akun" className="hover:text-utama">
        Akun
      </Link>
      <Link href="/admin/password" className="hover:text-utama">
        Password
      </Link>
      <form action={keluar} className="ml-auto">
        <button type="submit" className="font-semibold text-teks-lembut hover:text-bahaya">
          Keluar
        </button>
      </form>
    </nav>
  );
}
