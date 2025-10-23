"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) toast.error(error.message);
    else {
      toast.success("Logged in successfully!");
      router.push("/chat");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#141e30] via-[#243b55] to-[#141e30] px-4 sm:px-6 md:px-10">
      <Card className="w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-black/70 backdrop-blur-xl text-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-800 flex flex-col justify-center hover:shadow-blue-900/40 transition-all duration-300">
        <form onSubmit={handleLogin} className="w-full max-w-md mx-auto">
          <CardHeader className="text-center mb-4 sm:mb-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm sm:text-base mt-2 sm:mt-3">
              Sign in to continue chatting with AI
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 sm:gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-300 text-sm sm:text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-[#1f1f1f] text-white border-none focus:ring-2 focus:ring-blue-500 py-5 sm:py-6 text-base placeholder:text-gray-400"
              />
            </div>

            <div className="grid gap-3 relative">
              <Label htmlFor="password" className="text-gray-300 text-sm sm:text-base">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-[#1f1f1f] text-white border-none focus:ring-2 focus:ring-blue-500 pr-10 py-5 sm:py-6 text-base placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[55%] text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-5 sm:gap-6 mt-6 sm:mt-8">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-5 sm:py-6 transition-all shadow-lg hover:shadow-blue-500/30"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-gray-400">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
