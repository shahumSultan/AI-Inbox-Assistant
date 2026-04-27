"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

interface TokenResponse {
  access_token: string;
  user_id: string;
  email: string;
  plan: string;
  is_admin: boolean;
  trial_ends_at: string | null;
}

export default function RegisterPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<TokenResponse>("/api/auth/register", { email, password });
      saveAuth(res.access_token, { user_id: res.user_id, email: res.email, plan: res.plan, is_admin: res.is_admin, trial_ends_at: res.trial_ends_at });
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-black"
      style={{
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.12) 0%, transparent 60%)",
      }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center mb-10 group">
          <div className="mb-3 transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(6,182,212,0.6)]">
            <LogoMark size={44} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Inbox<span className="text-brand">AI</span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] p-8" style={{ background: "rgba(255,255,255,0.03)" }}>
          <h1 className="text-white text-2xl font-bold mb-1 tracking-tight">Create your account</h1>
          <p className="text-white/40 text-sm mb-8">Free for 14 days — no card required</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none bg-white/[0.04] border border-white/[0.09] focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-medium mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none bg-white/[0.04] border border-white/[0.09] focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all duration-200"
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs rounded-lg px-3 py-2 bg-red-500/[0.1] border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_28px_rgba(6,182,212,0.45)] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-2"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand/80 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
