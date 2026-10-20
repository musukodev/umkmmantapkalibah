import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 memakai proxy.js (pengganti middleware.js).
// Semua rute /admin dicek di sini sebelum halaman dirender.
export async function proxy(request) {
  const nonce = btoa(crypto.randomUUID());
  const kebijakan = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", kebijakan);

  function responsBerikutnya() {
    const forwardHeaders = new Headers(requestHeaders);
    const cookieHeader = request.cookies
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    if (cookieHeader) {
      forwardHeaders.set("cookie", cookieHeader);
    }
    const berikutnya = NextResponse.next({
      request: { headers: forwardHeaders },
    });
    berikutnya.headers.set("Content-Security-Policy", kebijakan);
    berikutnya.headers.set("X-Frame-Options", "DENY");
    berikutnya.headers.set("X-Content-Type-Options", "nosniff");
    berikutnya.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    berikutnya.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    return berikutnya;
  }

  const { pathname } = request.nextUrl;
  const diAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!diAdmin) {
    return responsBerikutnya();
  }

  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diisi.");
  }

  let response = responsBerikutnya();

  const supabase = createServerClient(url, kunci, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = responsBerikutnya();
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const halamanLogin = pathname === "/admin/login";

  function alihkanKe(tujuan) {
    const alamat = request.nextUrl.clone();
    alamat.pathname = tujuan;
    alamat.search = "";
    const pengalihan = NextResponse.redirect(alamat);
    pengalihan.headers.set("Content-Security-Policy", kebijakan);
    pengalihan.headers.set("X-Frame-Options", "DENY");
    pengalihan.headers.set("X-Content-Type-Options", "nosniff");
    pengalihan.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    pengalihan.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Simpan cookie sesi yang baru diperbarui agar tidak hilang saat redirect.
    response.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie;
      pengalihan.cookies.set(name, value, options);
    });

    return pengalihan;
  }

  const admin = user?.app_metadata?.role === "admin";

  if (!admin && !halamanLogin) {
    return alihkanKe("/admin/login");
  }

  if (admin && halamanLogin) {
    return alihkanKe("/admin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
