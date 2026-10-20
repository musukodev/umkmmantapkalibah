export default function Loading() {
  return (
    <div className="py-10" aria-label="Memuat halaman" role="status">
      <span className="sr-only">Memuat halaman...</span>
      <div className="h-12 w-64 animate-pulse rounded-lg bg-permukaan" />
      <div className="mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-permukaan" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indeks) => (
          <div
            key={indeks}
            className="h-64 animate-pulse rounded-2xl border border-garis bg-permukaan"
          />
        ))}
      </div>
    </div>
  );
}
