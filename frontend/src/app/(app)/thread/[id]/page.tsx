"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  source: string;
  actions: ActionOut[];
  created_at: string;
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

export default function ThreadPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [thread,     setThread]     = useState<ThreadOut | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [copied,     setCopied]     = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    api.get<ThreadOut>(`/api/threads/${id}`)
      .then(setThread)
      .catch((e) => setError((e as Error).message));
  }, [id]);

  function copyText(actionId: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(actionId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function markDone(actionId: string) {
    setCompleting(actionId);
    try {
      await api.patch(`/api/actions/${actionId}`, { status: "done" });
      setThread((prev) => prev
        ? { ...prev, actions: prev.actions.map((a) => a.id === actionId ? { ...a, status: "done" } : a) }
        : prev
      );
    } catch { /* stays open */ }
    finally { setCompleting(null); }
  }

  if (error) return (
    <div className="px-8 py-10">
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={() => router.back()} className="dark:text-white/30 text-slate-400 text-sm mt-4 hover:dark:text-white/60 text-slate-500 transition-colors">← Back</button>
    </div>
  );

  if (!thread) return (
    <div className="px-8 py-10 flex items-center gap-3">
      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="rgba(6,182,212,0.25)" strokeWidth="2"/>
        <path d="M12 3a9 9 0 019 9" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <span className="dark:text-white/30 text-slate-400 text-sm">Loading…</span>
    </div>
  );

  const p           = PRIORITY[thread.priority_score] ?? PRIORITY[3];
  const openActions = thread.actions.filter((a) => a.status === "open");
  const doneActions = thread.actions.filter((a) => a.status === "done");

  return (
    <div className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 max-w-3xl mx-auto w-full">

      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 dark:text-white/30 text-slate-400 hover:dark:text-white/60 text-slate-500 text-sm transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
        <button
          onClick={() => router.push(`/reply/${thread.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all duration-200 flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 7.5L5 3l4 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 3v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Generate Reply
        </button>
      </div>

      {/* Thread header card */}
      <div className="rounded-2xl dark:border-white/[0.08] border-slate-200 border p-6 mb-5" style={{ background: "var(--surface)" }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="dark:text-white text-slate-900 text-xl font-bold leading-snug">{thread.title}</h1>
          <span
            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
          >
            P{thread.priority_score} {p.label}
          </span>
        </div>
        <p className="dark:text-white/50 text-slate-500 text-sm leading-relaxed mb-4">{thread.summary}</p>
        <div className="rounded-xl px-4 py-3 mb-4 bg-brand/[0.07] border border-brand/15">
          <span className="dark:text-white/30 text-slate-400 text-xs uppercase tracking-wider mr-2">Intent</span>
          <span className="dark:text-white/70 text-slate-600 text-sm">{thread.primary_intent}</span>
        </div>
        <div className="flex items-center gap-4 text-xs dark:text-white/25 text-slate-400">
          <span>{Math.round(thread.confidence_score * 100)}% confidence</span>
          <span>·</span>
          <span>{new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          <span>·</span>
          <span className="capitalize">{thread.status}</span>
        </div>
      </div>

      {/* Open actions */}
      {openActions.length > 0 && (
        <div className="mb-5">
          <h2 className="dark:text-white/30 text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
            Actions ({openActions.length})
          </h2>
          <div className="flex flex-col gap-3">
            {openActions.map((action) => (
              <div key={action.id} className="rounded-xl dark:border-white/[0.07] border-slate-200 border p-4" style={{ background: "var(--surface)" }}>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 bg-brand/10 text-brand">
                    {ACTION_ICON[action.type] ?? "•"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="dark:text-white text-slate-900 text-sm font-semibold">{action.title}</span>
                      <button
                        onClick={() => markDone(action.id)}
                        disabled={completing === action.id}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150 flex-shrink-0 dark:text-white/30 text-slate-400 hover:dark:text-white/60 text-slate-500 dark:border-white/[0.08] border-slate-200 border hover:dark:border-white/[0.16] border-slate-300 dark:bg-white/[0.04] bg-slate-100 hover:dark:bg-white/[0.07] bg-slate-200"
                      >
                        {completing === action.id ? "…" : "Mark done"}
                      </button>
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
                            background:  copied === action.id ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.06)",
                            color:       copied === action.id ? "#06b6d4" : "rgba(255,255,255,0.4)",
                            borderColor: copied === action.id ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)",
                          }}
                        >
                          {copied === action.id ? "✓ Copied" : "Copy reply"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done actions */}
      {doneActions.length > 0 && (
        <div>
          <h2 className="dark:text-white/20 text-slate-300 text-xs font-medium uppercase tracking-wider mb-3">
            Completed ({doneActions.length})
          </h2>
          <div className="flex flex-col gap-2">
            {doneActions.map((action) => (
              <div key={action.id} className="rounded-xl border border-white/[0.05] px-4 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.01)" }}>
                <span className="dark:text-white/20 text-slate-300 text-sm">{ACTION_ICON[action.type] ?? "•"}</span>
                <span className="dark:text-white/20 text-slate-300 text-sm line-through">{action.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
