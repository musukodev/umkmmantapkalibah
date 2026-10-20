import { createHmac } from "node:crypto";
import { buatKlienServer } from "@/lib/supabase/server";

function ambilIp(kepala) {
  const ipTepercaya = kepala.get("x-real-ip");
  if (ipTepercaya) {
    return ipTepercaya;
  }

  const diteruskan = kepala.get("x-forwarded-for");
  if (diteruskan) {
    return diteruskan.split(",")[0].trim();
  }
  return "lokal";
}

export async function bolehLakukanAksi(kepala, aksi, batas, jendelaDetik) {
  const rahasia = process.env.SUPABASE_SECRET_KEY;
  if (!rahasia) {
    throw new Error("SUPABASE_SECRET_KEY belum diisi.");
  }

  const sidikJari = createHmac("sha256", rahasia)
    .update(ambilIp(kepala))
    .digest("hex");
  const supabase = buatKlienServer();
  const { data, error } = await supabase.rpc("izinkan_laju", {
    p_sidik_jari: sidikJari,
    p_aksi: aksi,
    p_batas: batas,
    p_jendela_detik: jendelaDetik,
  });

  if (error) {
    console.error("Gagal memeriksa batas kiriman:", error.message);
    throw new Error("Pemeriksaan batas kiriman belum bisa dilakukan.");
  }

  return data === true;
}
