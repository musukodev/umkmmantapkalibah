import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 memakai proxy.js (pengganti middleware.js).
// Semua rute /admin dicek di sini sebelum halaman dirender.
export async function proxy(request) {
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diisi.");
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, kunci, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const halamanLogin = pathname === "/admin/login";

  function alihkanKe(tujuan) {
    const alamat = request.nextUrl.clone();
    alamat.pathname = tujuan;
    alamat.search = "";
    const pengalihan = NextResponse.redirect(alamat);

    // Simpan cookie sesi yang baru diperbarui agar tidak hilang saat redirect.
    response.cookies.getAll().forEach((cookie) => {
      const { name, value, ...options } = cookie;
      pengalihan.cookies.set(name, value, options);
    });

    return pengalihan;
  }

  if (!user && !halamanLogin) {
    return alihkanKe("/admin/login");
  }

  if (user && halamanLogin) {
    return alihkanKe("/admin");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
