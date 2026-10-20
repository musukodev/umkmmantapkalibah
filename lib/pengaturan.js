import { cache } from "react";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko as tokoBawaan } from "@/lib/toko";

export const ambilPengaturanToko = cache(async () => {
  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("pengaturan_toko")
      .select("nama, nomor_whatsapp, jam_buka, alamat")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return tokoBawaan;
    }

    return {
      nama: data.nama || tokoBawaan.nama,
      tagline: tokoBawaan.tagline,
      nomorWhatsApp: data.nomor_whatsapp || tokoBawaan.nomorWhatsApp,
      alamat: data.alamat || tokoBawaan.alamat,
      jamBuka: data.jam_buka || tokoBawaan.jamBuka,
    };
  } catch {
    return tokoBawaan;
  }
});
