import Link from "next/link";
import TautanKeranjang from "@/components/TautanKeranjang";
import ThemeToggle from "@/components/ThemeToggle";
import { toko } from "@/lib/toko";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <nav
          aria-label="Navigasi utama"
          className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-semibold"
        >
          <TautanKeranjang />
          <Link href="/favorit" className="text-teks-lembut hover:text-utama">
            Favorit
          </Link>
          <Link href="/bandingkan" className="text-teks-lembut hover:text-utama">
            Bandingkan
          </Link>
          <Link href="/tentang" className="text-teks-lembut hover:text-utama">
            Tentang
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
