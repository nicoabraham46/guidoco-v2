import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/admin-auth";

// In-memory store — vive por Edge worker instance (válido para single-instance / dev)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/checkout": { max: 5, windowMs: 60_000 },
  "/admin/login":  { max: 3, windowMs: 60_000 },
};

function isRateLimited(ip: string, path: string): boolean {
  const limit = RATE_LIMITS[path];
  if (!limit) return false;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart >= limit.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= limit.max) return true;

  entry.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting — aplica a rutas configuradas
  const limitedPath = Object.keys(RATE_LIMITS).find((p) => pathname.startsWith(p));
  if (limitedPath) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (isRateLimited(ip, limitedPath)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intentá más tarde" },
        { status: 429 }
      );
    }
  }

  // Auth admin — rutas fuera de /admin no necesitan más lógica
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Permitir acceso a /admin/login sin autenticación
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión
  const adminSession = request.cookies.get("admin_session");
  if (!adminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Comparar contra el token HMAC esperado
  const expectedToken = await getAdminSessionToken();
  if (adminSession.value !== expectedToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/checkout"],
};
