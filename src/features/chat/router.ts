// src/features/chat/router.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { protectedProcedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Groq from "groq-sdk"; // Import Groq

// Check for Groq API key
if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set. Using echo stub.");
}

// Instantiate the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getLLMResponse = async (
  prompt: string,
  modelTag: string,
): Promise<string> => {
  // --- AI Stub ---
  // Stub now checks for GROQ_API_KEY
  if (!process.env.GROQ_API_KEY || modelTag === "echo") {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `You said: "${prompt}" (using model: ${modelTag})`;
  }

  // --- Real Groq Call ---
  try {
    // Use the Groq client
    const completion = await groq.chat.completions.create({
      model: modelTag, // e.g., 'llama3-8b-8192'
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content ?? "No response from AI.";
  } catch (error) {
    console.error("Groq API call failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get response from AI",
    });
  }
  // --- End Real Groq Call ---
};

export const chatRouter = router({
  history: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*, model:models(tag)")
      .eq("user_id", ctx.session.user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chat history",
      });
    }
    return data;
  }),

  send: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        modelId: z.number().int(),
        modelTag: z.string(), // Pass tag for the LLM function
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 1. Persist user message
      const { error: userMsgError } = await supabaseAdmin
        .from("messages")
        .insert({
          user_id: userId,
          model_id: input.modelId,
          content: input.prompt,
          role: "user",
        });

      if (userMsgError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save user message",
        });
      }

      // 2. Get LLM response (now from Groq)
      const assistantResponse = await getLLMResponse(
        input.prompt,
        input.modelTag,
      );

      // 3. Persist assistant message
      const { error: assistantMsgError } = await supabaseAdmin
        .from("messages")
        .insert({
          user_id: userId,
          model_id: input.modelId,
          content: assistantResponse,
          role: "assistant",
        });

      if (assistantMsgError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save assistant message",
        });
      }

      // 4. Return assistant response
      return {
        reply: assistantResponse,
      };
    }),
});