// src/app/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/chat");
  }

  const handleSignOut = async () => {
    "use server";
    const supabaseClient = createSupabaseServerClient();
    await supabaseClient.auth.signOut();
    redirect("/login");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#141e30] text-white p-6 relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.2),transparent_70%)] blur-3xl"></div>

      <section className="z-10 text-center bg-black/60 backdrop-blur-xl border border-gray-700 rounded-3xl p-10 shadow-2xl max-w-lg w-full transform transition-transform hover:scale-[1.03] duration-300">
        <h1 className="text-5xl font-extrabold mb-4 tracking-wide drop-shadow-md">
          Flow<span className="text-blue-400">Chat</span>
        </h1>
        <p className="text-gray-300 mb-10 text-base leading-relaxed">
          Converse seamlessly with AI - built with Next.js & Supabase.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-6 shadow-lg hover:shadow-blue-500/40 transition-all"
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white text-lg font-semibold py-6 transition-all"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {session && (
          <form action={handleSignOut} className="mt-8">
            <Button variant="destructive" className="w-full">
              Sign Out
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
