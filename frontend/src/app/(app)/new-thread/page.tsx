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

const PRIORITY_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Low", color: "oklch(72% 0.16 200)" },
  2: { label: "Normal", color: "oklch(72% 0.16 200)" },
  3: { label: "Medium", color: "oklch(80% 0.18 85)" },
  4: { label: "High", color: "oklch(72% 0.22 30)" },
  5: { label: "Critical", color: "oklch(65% 0.25 15)" },
};

const ACTION_ICON: Record<string, string> = {
  reply: "↩",
  follow_up: "⏰",
  schedule: "📅",
  task: "✓",
  ignore: "✕",
};

export default function NewThreadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ThreadOut | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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

  const p = result ? PRIORITY_LABEL[result.priority_score] ?? PRIORITY_LABEL[3] : null;

  return (
    <div className="flex flex-col h-full px-8 py-10 max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
          Analyse Thread
        </h1>
        <p className="text-slate-500 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
          Paste an email thread and get instant AI-powered next steps
        </p>
      </div>

      {/* Input */}
      {!result && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="px-4 pt-4 pb-1 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-outfit)" }}>
                Email Thread
              </p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={20}
              rows={14}
              className="w-full px-4 py-4 text-sm text-slate-300 placeholder-slate-600 bg-transparent outline-none resize-none"
              style={{ fontFamily: "var(--font-outfit)" }}
              placeholder={"From: sender@company.com\nTo: you@yourcompany.com\nSubject: Q2 Budget Review\n\nPaste the full email thread here — include all replies for best results…"}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.1)", fontFamily: "var(--font-outfit)" }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
              {text.length > 0 ? `${text.length.toLocaleString()} characters` : "Supports any email format"}
            </span>
            <button
              type="submit"
              disabled={loading || text.trim().length < 20}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_24px_oklch(64%_0.22_265/0.4)]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
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

      {/* Results */}
      {result && p && (
        <div className="flex flex-col gap-5">
          {/* Thread summary card */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-white text-lg font-bold leading-snug" style={{ fontFamily: "var(--font-outfit)" }}>
                {result.title}
              </h2>
              <span
                className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30`, fontFamily: "var(--font-outfit)" }}
              >
                P{result.priority_score} {p.label}
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              {result.summary}
            </p>

            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "oklch(64% 0.22 265 / 0.08)", border: "1px solid oklch(64% 0.22 265 / 0.15)" }}
            >
              <span className="text-slate-500 text-xs uppercase tracking-wider mr-2" style={{ fontFamily: "var(--font-outfit)" }}>Intent</span>
              <span className="text-slate-300" style={{ fontFamily: "var(--font-outfit)" }}>{result.primary_intent}</span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-slate-600 text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
                {Math.round(result.confidence_score * 100)}% confidence
              </span>
              <button
                onClick={() => { setResult(null); setText(""); }}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ← Analyse another thread
              </button>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
              Recommended Actions ({result.actions.length})
            </h3>
            <div className="flex flex-col gap-3">
              {result.actions.map((action) => {
                const ap = PRIORITY_LABEL[action.priority] ?? PRIORITY_LABEL[3];
                return (
                  <div
                    key={action.id}
                    className="rounded-xl border p-4"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: "oklch(64% 0.22 265 / 0.12)", color: "oklch(64% 0.22 265)" }}
                      >
                        {ACTION_ICON[action.type] ?? "•"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                            {action.title}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                            style={{ background: `${ap.color}15`, color: ap.color, fontFamily: "var(--font-outfit)" }}
                          >
                            {action.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: "var(--font-outfit)" }}>
                          {action.suggested_next_step}
                        </p>
                        {action.due_date && (
                          <p className="text-slate-600 text-xs mt-1" style={{ fontFamily: "var(--font-outfit)" }}>
                            Due: {new Date(action.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        {action.suggested_text && (
                          <div className="mt-3">
                            <div
                              className="rounded-xl p-3 text-sm text-slate-300 mb-2 leading-relaxed whitespace-pre-wrap"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "var(--font-outfit)" }}
                            >
                              {action.suggested_text}
                            </div>
                            <button
                              onClick={() => copyText(action.id, action.suggested_text!)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                              style={{
                                background: copied === action.id ? "oklch(72% 0.16 200 / 0.15)" : "rgba(255,255,255,0.06)",
                                color: copied === action.id ? "oklch(72% 0.16 200)" : "#94a3b8",
                                border: `1px solid ${copied === action.id ? "oklch(72% 0.16 200 / 0.3)" : "rgba(255,255,255,0.08)"}`,
                                fontFamily: "var(--font-outfit)",
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

          {/* Navigate to thread */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setResult(null); setText(""); }}
              className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ← Analyse another
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              View Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
