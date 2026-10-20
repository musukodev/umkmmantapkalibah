import { buatKlienServer } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const produkId = String(body?.produkId ?? "").trim();

    if (/^\d+$/.test(produkId)) {
      const supabase = buatKlienServer();
      await supabase.from("klik_whatsapp").insert({
        produk_id: Number(produkId),
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
