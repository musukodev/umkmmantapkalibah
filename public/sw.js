self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Tidak menyimpan cache. Semua permintaan tetap diteruskan ke jaringan
// supaya katalog dan halaman admin selalu menampilkan data terbaru.
self.addEventListener("fetch", () => {});
