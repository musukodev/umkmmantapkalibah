import { buatKlienServer } from "@/lib/supabase/server";
import { bolehLakukanAksi } from "@/lib/rate-limit";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const produkId = String(body?.produkId ?? "").trim();
  const idAngka = Number(produkId);

  if (!/^\d+$/.test(produkId) || !Number.isSafeInteger(idAngka) || idAngka < 1) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    if (!(await bolehLakukanAksi(request.headers, "klik_wa", 30, 60))) {
      return Response.json({ ok: false }, { status: 429 });
    }

    const supabase = buatKlienServer();
    const { data: produk, error: errorProduk } = await supabase
      .from("produk")
      .select("id")
      .eq("id", produkId)
      .eq("aktif", true)
      .maybeSingle();

    if (errorProduk || !produk) {
      return Response.json({ ok: false }, { status: errorProduk ? 503 : 404 });
    }

    const { error } = await supabase.from("klik_whatsapp").insert({
      produk_id: idAngka,
    });

    if (error) {
      console.error("Gagal mencatat klik WhatsApp:", error.message);
      return Response.json({ ok: false }, { status: 503 });
    }

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Layanan pencatatan klik belum tersedia:", error.message);
    return Response.json({ ok: false }, { status: 503 });
  }
}
