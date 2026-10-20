import Link from "next/link";
import Tombol from "@/components/Tombol";

export default function BannerBeranda({ bannerList = [] }) {
  if (!bannerList || bannerList.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {bannerList.map((banner) => (
        <section
          key={banner.id}
          className="relative overflow-hidden rounded-3xl border border-garis bg-gradient-to-r from-permukaan to-latar p-6 sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:max-w-xl">
            <span className="w-fit rounded-full bg-utama/15 px-3 py-1 text-xs font-bold text-utama">
              Promo Toko
            </span>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              {banner.judul}
            </h2>
            {banner.teks ? (
              <p className="text-sm leading-relaxed text-teks-lembut sm:text-base">
                {banner.teks}
              </p>
            ) : null}
            {banner.tautan ? (
              <div className="pt-2">
                <Tombol href={banner.tautan} className="self-start">
                  Lihat penawaran
                </Tombol>
              </div>
            ) : null}
          </div>
          {banner.gambar_url ? (
            <img
              src={banner.gambar_url}
              alt={banner.judul}
              className="mt-4 max-h-48 w-full rounded-2xl object-cover sm:absolute sm:right-6 sm:top-1/2 sm:mt-0 sm:h-40 sm:w-56 sm:-translate-y-1/2"
            />
          ) : null}
        </section>
      ))}
    </div>
  );
}
