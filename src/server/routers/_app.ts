// src/server/routers/_app.ts
import { router } from "@/server/trpc";
import { modelsRouter } from "@/features/models/router";
import { chatRouter } from "@/features/chat/router";

export const appRouter = router({
  models: modelsRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;