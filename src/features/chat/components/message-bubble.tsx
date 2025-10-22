import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  id: string | number;
  content: string;
  role: "user" | "assistant";
  model?: { tag: string } | null;
  created_at: string;
};

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn("flex items-end space-x-3 transition-all", {
        "justify-end": isUser,
      })}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <Avatar className="h-10 w-10 border shrink-0 shadow-md">
          <AvatarFallback className="bg-neutral-200 dark:bg-neutral-700">
            <Bot className="h-5 w-5 text-primary dark:text-white" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "relative px-4 py-3 rounded-2xl max-w-xs sm:max-w-md md:max-w-lg shadow-lg border transition-all duration-300",
          "animate-in fade-in slide-in-from-bottom-2",
          isUser
            ? " bg-blue-500 text-white border-blue-400/40 shadow-blue-800/30"
            : "bg-linear-to-br from-gray-100 to-gray-200 text-gray-900 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 border-gray-500/30 shadow-gray-900/20"
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </p>
        <div
          className={cn(
            "text-[11px] mt-2 text-right",
            isUser ? "text-blue-100/80" : "text-gray-500 dark:text-gray-400"
          )}
        >
          {formatTimestamp(message.created_at)}
          {!isUser && message.model?.tag && (
            <span className="ml-2 italic">· {message.model.tag}</span>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="h-10 w-10 border shrink-0 shadow-md">
          <AvatarFallback className="bg-blue-500 text-white">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
