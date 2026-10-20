import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DaftarServiceWorker from "@/components/DaftarServiceWorker";
import { KeranjangProvider } from "@/components/KeranjangProvider";
import { SITE_URL } from "@/lib/site";
import { toko } from "@/lib/toko";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: toko.nama,
  description: `${toko.tagline}. ${toko.nama}, ${toko.alamat}.`,
  applicationName: toko.nama,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: toko.nama,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: toko.nama,
    title: toko.nama,
    description: `${toko.tagline}. ${toko.nama}, ${toko.alamat}.`,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: toko.nama,
    description: `${toko.tagline}. ${toko.nama}, ${toko.alamat}.`,
  },
};

export const viewport = {
  themeColor: "#1f6b4f",
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('tema')==='gelap'){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <KeranjangProvider>
          <DaftarServiceWorker />
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
          <Footer />
        </KeranjangProvider>
      </body>
    </html>
  );
}
