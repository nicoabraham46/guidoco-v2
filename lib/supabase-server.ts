import { createClient } from "@supabase/supabase-js";

// Cliente con anon key (para queries públicos con RLS)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
