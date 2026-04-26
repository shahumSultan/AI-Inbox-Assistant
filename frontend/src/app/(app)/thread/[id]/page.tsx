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

const PRIORITY_COLOR: Record<number, string> = {
  1: "oklch(72% 0.16 200)",
  2: "oklch(72% 0.16 200)",
  3: "oklch(80% 0.18 85)",
  4: "oklch(72% 0.22 30)",
  5: "oklch(65% 0.25 15)",
};
const PRIORITY_LABEL: Record<number, string> = { 1: "Low", 2: "Normal", 3: "Medium", 4: "High", 5: "Critical" };

const ACTION_ICON: Record<string, string> = {
  reply: "↩",
  follow_up: "⏰",
  schedule: "📅",
  task: "✓",
  ignore: "✕",
};

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [thread, setThread] = useState<ThreadOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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
      setThread((prev) =>
        prev
          ? {
              ...prev,
              actions: prev.actions.map((a) =>
                a.id === actionId ? { ...a, status: "done" } : a
              ),
            }
          : prev
      );
    } catch {
      // silently ignore — action stays open
    } finally {
      setCompleting(null);
    }
  }

  if (error) {
    return (
      <div className="px-8 py-10">
        <p className="text-red-400 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>{error}</p>
        <button onClick={() => router.back()} className="text-slate-600 text-sm mt-4 hover:text-slate-400 transition-colors" style={{ fontFamily: "var(--font-outfit)" }}>
          ← Back
        </button>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="px-8 py-10 flex items-center gap-3">
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="oklch(64% 0.22 265 / 0.3)" strokeWidth="2"/>
          <path d="M12 3a9 9 0 019 9" stroke="oklch(64% 0.22 265)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-slate-600 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>Loading…</span>
      </div>
    );
  }

  const color = PRIORITY_COLOR[thread.priority_score] ?? PRIORITY_COLOR[3];
  const label = PRIORITY_LABEL[thread.priority_score] ?? "Medium";
  const openActions = thread.actions.filter((a) => a.status === "open");
  const doneActions = thread.actions.filter((a) => a.status === "done");

  return (
    <div className="flex flex-col px-8 py-10 max-w-3xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-400 text-sm mb-8 transition-colors w-fit"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </button>

      {/* Thread header */}
      <div
        className="rounded-2xl border p-6 mb-5"
        style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-white text-xl font-bold leading-snug" style={{ fontFamily: "var(--font-outfit)" }}>
            {thread.title}
          </h1>
          <span
            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: "var(--font-outfit)" }}
          >
            P{thread.priority_score} {label}
          </span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
          {thread.summary}
        </p>

        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{ background: "oklch(64% 0.22 265 / 0.08)", border: "1px solid oklch(64% 0.22 265 / 0.15)" }}
        >
          <span className="text-slate-500 text-xs uppercase tracking-wider mr-2" style={{ fontFamily: "var(--font-outfit)" }}>Intent</span>
          <span className="text-slate-300 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>{thread.primary_intent}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600" style={{ fontFamily: "var(--font-outfit)" }}>
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
          <h2 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
            Actions ({openActions.length})
          </h2>
          <div className="flex flex-col gap-3">
            {openActions.map((action) => (
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                        {action.title}
                      </span>
                      <button
                        onClick={() => markDone(action.id)}
                        disabled={completing === action.id}
                        className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150 flex-shrink-0"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "#64748b",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontFamily: "var(--font-outfit)",
                        }}
                      >
                        {completing === action.id ? "…" : "Mark done"}
                      </button>
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
            ))}
          </div>
        </div>
      )}

      {/* Done actions */}
      {doneActions.length > 0 && (
        <div>
          <h2 className="text-slate-600 text-xs font-medium uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
            Completed ({doneActions.length})
          </h2>
          <div className="flex flex-col gap-2">
            {doneActions.map((action) => (
              <div
                key={action.id}
                className="rounded-xl border px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <span className="text-slate-700 text-sm">{ACTION_ICON[action.type] ?? "•"}</span>
                <span className="text-slate-600 text-sm line-through" style={{ fontFamily: "var(--font-outfit)" }}>
                  {action.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
