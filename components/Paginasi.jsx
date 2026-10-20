import Tombol from "@/components/Tombol";

function buatTautan(basePath, params, halaman) {
  const pencarian = new URLSearchParams();

  for (const [kunci, nilai] of Object.entries(params)) {
    if (nilai) {
      pencarian.set(kunci, String(nilai));
    }
  }

  if (halaman > 1) {
    pencarian.set("halaman", String(halaman));
  }

  const query = pencarian.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function Paginasi({
  basePath,
  halaman,
  totalHalaman,
  params = {},
}) {
  if (totalHalaman <= 1) {
    return null;
  }

  const mulai = Math.max(1, halaman - 2);
  const selesai = Math.min(totalHalaman, halaman + 2);
  const nomor = [];

  for (let i = mulai; i <= selesai; i += 1) {
    nomor.push(i);
  }

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center gap-2"
    >
      {halaman > 1 ? (
        <Tombol href={buatTautan(basePath, params, halaman - 1)} varian="garis">
          Sebelumnya
        </Tombol>
      ) : (
        <span className="inline-flex items-center justify-center rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold text-teks-lembut opacity-50">
          Sebelumnya
        </span>
      )}

      {mulai > 1 ? (
        <>
          <Tombol href={buatTautan(basePath, params, 1)} varian="garis">
            1
          </Tombol>
          {mulai > 2 ? <span className="px-1 text-teks-lembut">…</span> : null}
        </>
      ) : null}

      {nomor.map((angka) =>
        angka === halaman ? (
          <span
            key={angka}
            aria-current="page"
            className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-latar"
          >
            {angka}
          </span>
        ) : (
          <Tombol
            key={angka}
            href={buatTautan(basePath, params, angka)}
            varian="garis"
          >
            {angka}
          </Tombol>
        )
      )}

      {selesai < totalHalaman ? (
        <>
          {selesai < totalHalaman - 1 ? (
            <span className="px-1 text-teks-lembut">…</span>
          ) : null}
          <Tombol
            href={buatTautan(basePath, params, totalHalaman)}
            varian="garis"
          >
            {totalHalaman}
          </Tombol>
        </>
      ) : null}

      {halaman < totalHalaman ? (
        <Tombol href={buatTautan(basePath, params, halaman + 1)} varian="garis">
          Berikutnya
        </Tombol>
      ) : (
        <span className="inline-flex items-center justify-center rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold text-teks-lembut opacity-50">
          Berikutnya
        </span>
      )}
    </nav>
  );
}
