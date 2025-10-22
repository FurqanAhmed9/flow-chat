// src/app/chat/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatClient } from "@/features/chat/components/chat-client";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default async function ChatPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    // Use the SERVER client to modify cookies
    const supabaseClient = createSupabaseServerClient(); 
    await supabaseClient.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
        <h1 className="text-3xl font-mono">flowchat...</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.email}
          </span>
          <form action={handleSignOut}>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-red-500 hover:text-black cursor-pointer transition-colors"
            >
              Log Out
            </Button>
          </form>
        </div>
      </header>

      {/* Chat Client fills remaining space */}
      <main className="flex-1 overflow-hidden">
        <ChatClient />
      </main>
    </div>
  );
}
