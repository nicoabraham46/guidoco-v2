import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/checkout": { max: 5, windowMs: 60_000 },
  "/admin/login":  { max: 3, windowMs: 60_000 },
};

/**
 * Chequea el rate limit contra la tabla compartida en Supabase (rate_limits),
 * en vez de memoria local — así el límite es real entre todas las instancias
 * de Vercel. Si la consulta a Supabase falla, se deja pasar el request
 * (fail-open) para no bloquear accidentalmente por un problema de conexión.
 */
async function isRateLimited(ip: string, path: string): Promise<boolean> {
  const limit = RATE_LIMITS[path];
  if (!limit) return false;

  const key = `${ip}:${path}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max: limit.max,
      p_window_ms: limit.windowMs,
    });

    if (error) {
      console.error("[middleware] Error checking rate limit:", error.message);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error("[middleware] Rate limit check failed:", err);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting — aplica a rutas configuradas
  const limitedPath = Object.keys(RATE_LIMITS).find((p) => pathname.startsWith(p));
  if (limitedPath) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (await isRateLimited(ip, limitedPath)) {
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

  // Verificar cookie de sesión (firma válida y no vencida)
  const adminSession = request.cookies.get("admin_session");
  if (!adminSession || !(await verifyAdminSessionToken(adminSession.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/checkout"],
};
