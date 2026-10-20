import FormUlasan from "@/components/FormUlasan";

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export default function BagianUlasan({ produkId, daftarUlasan = [] }) {
  const total = daftarUlasan.length;
  const rerata =
    total > 0
      ? (
          daftarUlasan.reduce((acc, u) => acc + Number(u.rating), 0) / total
        ).toFixed(1)
      : null;

  return (
    <section aria-labelledby="judul-ulasan" className="border-t border-garis py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 id="judul-ulasan" className="text-xl font-bold">
            Ulasan pembeli
          </h2>
          {rerata ? (
            <p className="mt-1 text-sm text-teks-lembut">
              <span className="font-bold text-harga">★ {rerata}</span> dari 5 (
              {total} ulasan)
            </p>
          ) : (
            <p className="mt-1 text-sm text-teks-lembut">
              Belum ada ulasan untuk produk ini.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          {total === 0 ? (
            <div className="rounded-2xl border border-garis bg-permukaan p-5 text-sm text-teks-lembut">
              Jadilah yang pertama memberikan ulasan untuk produk ini.
            </div>
          ) : (
            daftarUlasan.map((ulasan) => {
              const tanggal = ulasan.created_at
                ? formatTanggal.format(new Date(ulasan.created_at))
                : "";

              return (
                <div
                  key={ulasan.id}
                  className="flex flex-col gap-2 rounded-2xl border border-garis bg-latar p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{ulasan.nama}</p>
                    <span className="text-xs text-teks-lembut">{tanggal}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-harga">
                    {"★".repeat(ulasan.rating)}
                    {"☆".repeat(5 - ulasan.rating)}
                  </div>
                  {ulasan.komentar ? (
                    <p className="text-sm leading-relaxed text-teks-lembut">
                      {ulasan.komentar}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div>
          <FormUlasan produkId={produkId} />
        </div>
      </div>
    </section>
  );
}
