import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE_ROLE_KEY (bypasea RLS)
 * Solo usar en server-side code (API routes, server actions, server components)
 * NUNCA importar en client components
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "❌ NEXT_PUBLIC_SUPABASE_URL no está configurada en .env.local"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "❌ SUPABASE_SERVICE_ROLE_KEY no está configurada.\n" +
      "   Obtén la service_role key desde:\n" +
      "   Supabase Dashboard → Settings → API → service_role (secret key)\n" +
      "   Agrégala a .env.local:\n" +
      "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc..."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
