// src/lib/supabase/admin.ts
// This client uses the SERVICE_ROLE_KEY for server-side admin tasks
import { createClient } from "@supabase/supabase-js";

// Ensure this runs only on the server
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Admin client will not work.",
  );
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);