// src/server/context.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;