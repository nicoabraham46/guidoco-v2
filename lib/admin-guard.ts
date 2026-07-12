import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

/**
 * Chequea si la request actual tiene una sesión de admin válida (firma
 * correcta y no vencida). Usar en API routes (no en middleware).
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionValue = cookieStore.get("admin_session")?.value;
    return await verifyAdminSessionToken(sessionValue);
  } catch {
    return false;
  }
}
