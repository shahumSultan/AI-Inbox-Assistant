"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface ActionOut {
  id: string;
  type: string;
  title: string;
  suggested_next_step: string;
  suggested_text: string | null;
  priority: number;
  due_date: string | null;
  status: string;
}

interface ThreadOut {
  id: string;
  title: string;
  summary: string;
  primary_intent: string;
  priority_score: number;
  confidence_score: number;
  status: string;
  actions: ActionOut[];
}

const PRIORITY: Record<number, { label: string; color: string }> = {
  1: { label: "Low",      color: "#06b6d4" },
  2: { label: "Normal",   color: "#06b6d4" },
  3: { label: "Medium",   color: "#f59e0b" },
  4: { label: "High",     color: "#f97316" },
  5: { label: "Critical", color: "#ef4444" },
};

const ACTION_ICON: Record<string, string> = {
  reply: "↩", follow_up: "⏰", schedule: "📅", task: "✓", ignore: "✕",
};

export default function NewThreadPage() {
  const router = useRouter();
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<ThreadOut | null>(null);
  const [copied,  setCopied]  = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (text.trim().length < 20) return;
    setError(null);
    setLoading(true);
    try {
      const thread = await api.post<ThreadOut>("/api/threads/analyse", { raw_text: text });
      setResult(thread);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const p = result ? (PRIORITY[result.priority_score] ?? PRIORITY[3]) : null;

  return (
    <div className="flex flex-col h-full px-8 py-10 max-w-3xl mx-auto w-full">

      <div className="mb-8">
        <h1 className="dark:text-white text-slate-900 text-3xl font-bold tracking-tight mb-1">Analyse Thread</h1>
        <p className="dark:text-white/40 text-slate-500 text-sm">Paste an email thread and get instant AI-powered next steps</p>
      </div>

      {!result && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-2xl dark:border-white/[0.08] border-slate-200 border overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="px-4 pt-4 pb-1 border-b dark:border-white/[0.06] border-slate-200">
              <p className="dark:text-white/30 text-slate-400 text-xs font-medium uppercase tracking-wider">Email Thread</p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={20}
              rows={14}
              className="w-full px-4 py-4 text-sm dark:text-white/70 text-slate-600 dark:placeholder-white/20 placeholder-slate-300 bg-transparent outline-none resize-none"
              placeholder={"From: sender@company.com\nTo: you@yourcompany.com\nSubject: Q2 Budget Review\n\nPaste the full email thread here — include all replies for best results…"}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs rounded-lg px-3 py-2 bg-red-500/[0.1] border border-red-500/20">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="dark:text-white/25 text-slate-400 text-xs">
              {text.length > 0 ? `${text.length.toLocaleString()} characters` : "Supports any email format"}
            </span>
            <button
              type="submit"
              disabled={loading || text.trim().length < 20}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8"/>
                  </svg>
                  Analysing…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 4.5H13l-3.5 2.5 1.5 4.5L7 10l-4 2.5 1.5-4.5L1 5.5h4.5L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  Analyse Thread
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {result && p && (
        <div className="flex flex-col gap-5">
          {/* Summary card */}
          <div className="rounded-2xl dark:border-white/[0.08] border-slate-200 border p-6" style={{ background: "var(--surface)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="dark:text-white text-slate-900 text-lg font-bold leading-snug">{result.title}</h2>
              <span
                className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
              >
                P{result.priority_score} {p.label}
              </span>
            </div>
            <p className="dark:text-white/50 text-slate-500 text-sm leading-relaxed mb-4">{result.summary}</p>
            <div className="rounded-xl px-4 py-3 bg-brand/[0.07] border border-brand/15">
              <span className="dark:text-white/30 text-slate-400 text-xs uppercase tracking-wider mr-2">Intent</span>
              <span className="dark:text-white/70 text-slate-600 text-sm">{result.primary_intent}</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="dark:text-white/25 text-slate-400 text-xs">{Math.round(result.confidence_score * 100)}% confidence</span>
              <button
                onClick={() => { setResult(null); setText(""); }}
                className="dark:text-white/30 text-slate-400 hover:dark:text-white/60 text-slate-500 text-xs transition-colors"
              >
                ← Analyse another thread
              </button>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="dark:text-white/30 text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
              Recommended Actions ({result.actions.length})
            </h3>
            <div className="flex flex-col gap-3">
              {result.actions.map((action) => {
                const ap = PRIORITY[action.priority] ?? PRIORITY[3];
                return (
                  <div key={action.id} className="rounded-xl dark:border-white/[0.07] border-slate-200 border p-4" style={{ background: "var(--surface)" }}>
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 bg-brand/10 text-brand">
                        {ACTION_ICON[action.type] ?? "•"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="dark:text-white text-slate-900 text-sm font-semibold">{action.title}</span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                            style={{ background: `${ap.color}15`, color: ap.color }}
                          >
                            {action.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="dark:text-white/50 text-slate-500 text-sm leading-relaxed">{action.suggested_next_step}</p>
                        {action.due_date && (
                          <p className="dark:text-white/20 text-slate-300 text-xs mt-1">
                            Due: {new Date(action.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        {action.suggested_text && (
                          <div className="mt-3">
                            <div className="rounded-xl p-3 text-sm dark:text-white/60 text-slate-500 mb-2 leading-relaxed whitespace-pre-wrap dark:border-white/[0.07] border-slate-200 border" style={{ background: "var(--surface-2)" }}>
                              {action.suggested_text}
                            </div>
                            <button
                              onClick={() => copyText(action.id, action.suggested_text!)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border"
                              style={{
                                background:   copied === action.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.06)",
                                color:        copied === action.id ? "#06b6d4" : "rgba(255,255,255,0.4)",
                                borderColor:  copied === action.id ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)",
                              }}
                            >
                              {copied === action.id ? "✓ Copied" : "Copy reply"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => { setResult(null); setText(""); }} className="dark:text-white/30 text-slate-400 hover:dark:text-white/60 text-slate-500 text-sm transition-colors">
              ← Analyse another
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:scale-105 transition-all duration-200"
            >
              View Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
