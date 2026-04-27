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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#080E1F" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4">
            <LogoMark size={48} />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Inbox<span className="text-brand">AI</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/[0.08] p-8"
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <h1
            className="text-white text-2xl font-bold mb-1 tracking-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Create your account
          </h1>
          <p className="text-slate-500 text-sm mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
            Free for 14 days — no card required
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-outfit)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-brand/50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontFamily: "var(--font-outfit)",
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-outfit)" }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-brand/50"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontFamily: "var(--font-outfit)",
                }}
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <p
                className="text-red-400 text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(239,68,68,0.1)", fontFamily: "var(--font-outfit)" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6" style={{ fontFamily: "var(--font-outfit)" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand/80 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
