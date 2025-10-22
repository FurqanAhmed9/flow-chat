// src/features/chat/components/chat-client.tsx
"use client";

import { trpc } from "@/lib/trpc/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot, User, Loader2, ChevronDown } from "lucide-react"; // <-- Import ChevronDown
import { MessageBubble } from "./message-bubble";
import { Separator } from "@/components/ui/separator";
import { type AppRouter } from "@/server/routers/_app";
import { type inferRouterOutputs } from "@trpc/server";
import { ModeToggle } from "@/components/mode-toggle";

// Infer the output type for a single history message
type RouterOutput = inferRouterOutputs<AppRouter>;
type Message =
  | RouterOutput["chat"]["history"][number]
  | {
      id: string; // Optimistic ID
      // Add other fields if they differ from the inferred type
    };

export function ChatClient() {
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true); // <-- New state for scroll position

  const messageListRef = useRef<HTMLDivElement>(null);

  // tRPC queries and mutations
  const modelsQuery = trpc.models.getAvailable.useQuery(undefined, {
    staleTime: Infinity,
  });

  // ✅ CORRECT: Use useEffect to react to data changes
  useEffect(() => {
    if (modelsQuery.data && !selectedModelId && modelsQuery.data.length > 0) {
      setSelectedModelId(String(modelsQuery.data[0].id));
    }
  }, [modelsQuery.data, selectedModelId]);

  const historyQuery = trpc.chat.history.useQuery(undefined, {
    staleTime: Infinity,
  });

  // ✅ CORRECT: Use useEffect to set initial messages
  useEffect(() => {
    if (historyQuery.data) {
      setMessages(historyQuery.data as Message[]);
    }
  }, [historyQuery.data]);

  const utils = trpc.useUtils();
  const sendMessage = trpc.chat.send.useMutation({
    onMutate: async (newMessage) => {
      // Optimistic update: add user message immediately
      setMessages((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          content: newMessage.prompt,
          role: "user",
          created_at: new Date().toISOString(),
          // Add other required fields with temp data
          model_id: newMessage.modelId,
          user_id: "", // Not needed on client
          model: null,
        },
      ]);
      setPrompt("");
    },
    onSuccess: (data, variables) => {
      // Add assistant's reply
      setMessages((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now() + 1}`,
          content: data.reply,
          role: "assistant",
          model: { tag: variables.modelTag },
          created_at: new Date().toISOString(),
          // Add other required fields with temp data
          model_id: variables.modelId,
          user_id: "", // Not needed on client
        },
      ]);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      // Revert optimistic update on error (simplified)
      utils.chat.history.invalidate();
    },
    onSettled: () => {
      // Refetch history to get actual IDs and confirm
      utils.chat.history.invalidate();
    },
  });

  // Auto-scroll effect
  useEffect(() => {
    // Only auto-scroll if the user is already at the bottom
    if (messageListRef.current && isAtBottom) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]); // Removed isAtBottom from deps

  // --- New scroll handler functions ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 10; // 10px threshold
    const atBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  // --- End new functions ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedModelId || sendMessage.isPending) return;

    const selectedModel = modelsQuery.data?.find(
      (m) => m.id === Number(selectedModelId),
    );
    if (!selectedModel) {
      toast.error("Please select a valid model.");
      return;
    }

    sendMessage.mutate({
      prompt: prompt,
      modelId: selectedModel.id,
      modelTag: selectedModel.tag,
    });
  };

  return (
    <div className="flex justify-center m-8 min-h-screen bg-background">
      <div className="flex flex-col flex-1 max-w-5xl w-[80%] h-[80vh] rounded-2xl overflow-hidden shadow-xl border bg-card">
        {/* Top Bar: Model Selector + Mode Toggle */}
<div className="relative p-4 border-b bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
  {/* Model Selector */}
  <Select
    value={selectedModelId ?? undefined}
    onValueChange={setSelectedModelId}
    disabled={modelsQuery.isLoading || sendMessage.isPending}
  >
    <SelectTrigger className="w-full sm:w-[280px] shadow-sm focus:ring-2 focus:ring-blue-500">
      <SelectValue placeholder="Select a model" />
    </SelectTrigger>

    <SelectContent className="dark:bg-blue-500 bg-gray-100 border border-gray-300 dark:border-gray-400 rounded-md shadow-md">
      {modelsQuery.data?.map((model) => (
        <SelectItem
          key={model.id}
          value={String(model.id)}
          className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-blue-400 cursor-pointer transition-colors"
        >
          {model.name} ({model.tag})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Mode Toggle */}
  <div className="flex justify-center sm:absolute sm:right-4 sm:top-1/2 sm:-translate-y-1/2">
    <ModeToggle />
  </div>
</div>


        {/* Message List */}
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 relative" // <-- Add relative
          onScroll={handleScroll} // <-- Add scroll handler
        >
          {historyQuery.isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {sendMessage.isPending && (
            <div className="flex items-start space-x-3">
              <div className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary shadow-inner">
                  <Bot className="h-5 w-5 text-primary" />
                </span>
              </div>
              <div className="flex items-center space-x-1 pt-2">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* --- New Scroll to Bottom Button --- */}
          {!isAtBottom && (
            <Button
              onClick={scrollToBottom}
              variant="outline"
              size="icon"
              className="fixed bottom-40 left-1/2 transform -translate-x-1/2 h-10 w-10 rounded-full bg-black shadow-lg flex items-center justify-center"
            >
              <ChevronDown className="h-5 w-5" />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          )}
          {/* --- End New Button --- */}
        </div>

        <Separator />

        {/* Input Form */}
        <div className="p-4 bg-card border-t">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-background border px-3 py-2 shadow-sm"
          >
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your message..."
              disabled={sendMessage.isPending}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:outline-none bg-transparent"
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                sendMessage.isPending || !prompt.trim() || !selectedModelId
              }
              className="rounded-full shadow hover:scale-105 transition-all"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}