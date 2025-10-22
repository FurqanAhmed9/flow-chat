// src/features/models/router.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

export const modelsRouter = router({
  getAvailable: protectedProcedure.query(async () => {
    const { data, error } = await supabaseAdmin.from("models").select("*");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch models",
        cause: error,
      });
    }
    return data;
  }),
});