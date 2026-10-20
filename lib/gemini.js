function kesalahanGemini(pesan, kode) {
  const error = new Error(pesan);
  error.code = kode;
  return error;
}

export async function buatDeskripsiDenganGemini({ nama, kategori }) {
  const kunci = process.env.GEMINI_API_KEY;

  if (!kunci) {
    throw kesalahanGemini("GEMINI_API_KEY belum diisi.", "KUNCI_KOSONG");
  }

  const namaBersih = String(nama ?? "").trim().slice(0, 120);
  const kategoriBersih = String(kategori ?? "").trim().slice(0, 80);
  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").replace(
    /^models\//,
    ""
  );

  if (!namaBersih) {
    throw kesalahanGemini("Nama produk wajib diisi.", "INPUT_KOSONG");
  }

  const prompt = [
    "Buat deskripsi produk untuk katalog UMKM dalam bahasa Indonesia.",
    `Nama produk: "${namaBersih}"`,
    `Kategori: "${kategoriBersih || "umum"}"`,
    "",
    "Aturan:",
    "- Tulis 2 sampai 3 kalimat, maksimal 60 kata.",
    "- Jelaskan manfaat dan keunggulan secara wajar.",
    "- Jangan memakai daftar, judul, tanda kutip, atau emoji.",
    "- Jangan mengarang bahan, ukuran, sertifikasi, atau klaim medis.",
    "- Langsung berikan teks deskripsi tanpa pembuka atau penutup.",
  ].join("\n");

  let respons;

  try {
    respons = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": kunci,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw kesalahanGemini("Gemini terlalu lama merespons.", "TIMEOUT");
    }

    throw kesalahanGemini("Tidak bisa menghubungi Gemini.", "JARINGAN");
  }

  if (!respons.ok) {
    const detail = await respons.text();
    console.error(
      "Gemini API menolak permintaan:",
      respons.status,
      detail.slice(0, 500)
    );

    if (respons.status === 429) {
      throw kesalahanGemini("Kuota Gemini sedang habis.", "KUOTA");
    }

    if (respons.status === 404) {
      throw kesalahanGemini(
        "Model Gemini tidak ditemukan. Periksa GEMINI_MODEL.",
        "MODEL"
      );
    }

    throw kesalahanGemini("Gemini API menolak permintaan.", "API");
  }

  let data;

  try {
    data = await respons.json();
  } catch {
    throw kesalahanGemini("Respons Gemini tidak bisa dibaca.", "API");
  }

  if (data?.promptFeedback?.blockReason) {
    throw kesalahanGemini("Permintaan diblokir oleh Gemini.", "DIBLOKIR");
  }

  const teks = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((bagian) => !bagian.thought)
    .map((bagian) => bagian.text ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .trim();

  if (!teks) {
    throw kesalahanGemini("Gemini tidak mengembalikan deskripsi.", "KOSONG");
  }

  return teks.slice(0, 1200);
}
