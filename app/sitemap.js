import { SITE_URL } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { buatKlienServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let produk = [];
  let kategori = [];

  try {
    const supabase = buatKlienServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, kategori, created_at")
      .eq("aktif", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    produk = data ?? [];
    kategori = [
      ...new Set(
        produk
          .map((item) => item.kategori)
          .filter(Boolean)
          .map((nama) => slugify(nama))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "id"));
  } catch (error) {
    console.error("Gagal membuat sitemap produk:", error.message);
  }

  const sekarang = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: sekarang,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tentang`,
      lastModified: sekarang,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...kategori.map((slug) => ({
      url: `${SITE_URL}/kategori/${slug}`,
      lastModified: sekarang,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    ...produk.map((item) => {
      const tanggal = item.created_at ? new Date(item.created_at) : sekarang;
      return {
        url: `${SITE_URL}/produk/${item.id}`,
        lastModified: Number.isNaN(tanggal.getTime()) ? sekarang : tanggal,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    }),
  ];
}
