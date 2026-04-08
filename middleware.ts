import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a /admin/login y /admin/login/* sin autenticación
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  const adminSession = request.cookies.get("admin_session");
  if (!adminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Comparar contra el token HMAC esperado (no un simple "true")
  const expectedToken = await getAdminSessionToken();
  if (adminSession.value !== expectedToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
