export default function Input({
  label,
  name,
  type = "text",
  textarea = false,
  error,
  ...props
}) {
  const kelas =
    "w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none";
  const kelasError = error ? " border-bahaya" : "";

  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          className={`${kelas}${kelasError}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      ) : (
        <input
          name={name}
          type={type}
          className={`${kelas}${kelasError}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      )}
      {error ? <span className="text-xs font-normal text-bahaya">{error}</span> : null}
    </label>
  );
}
