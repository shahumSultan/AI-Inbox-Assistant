"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface ThreadOut {
  id: string;
  title: string;
  summary: string;
  primary_intent: string;
  priority_score: number;
  status: string;
  actions: { id: string; type: string; status: string }[];
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

export default function DashboardPage() {
  const [threads, setThreads] = useState<ThreadOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ThreadOut[]>("/api/threads")
      .then(setThreads)
      .catch((e) => setError((e as Error).message));
  }, []);

  const loading = threads === null && !error;

  return (
    <div className="flex flex-col h-full px-8 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
            Your communication command centre
          </p>
        </div>
        {threads && threads.length > 0 && (
          <Link
            href="/new-thread"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 hover:shadow-[0_0_24px_oklch(64%_0.22_265/0.4)]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            New Thread
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="oklch(64% 0.22 265 / 0.3)" strokeWidth="2"/>
              <path d="M12 3a9 9 0 019 9" stroke="oklch(64% 0.22 265)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-slate-600 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>Loading threads…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontFamily: "var(--font-outfit)" }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {threads && threads.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "oklch(64% 0.22 265 / 0.1)", border: "1px solid oklch(64% 0.22 265 / 0.2)" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8l10 6 10-6" stroke="oklch(64% 0.22 265)" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="4" y="7" width="20" height="14" rx="3" stroke="oklch(64% 0.22 265)" strokeWidth="1.8"/>
                <path d="M10 14h8" stroke="oklch(72% 0.16 200)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              No threads yet
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
              Paste your first email thread and let AI tell you exactly what to do, what to say, and when to follow up.
            </p>
            <Link
              href="/new-thread"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 hover:shadow-[0_0_24px_oklch(64%_0.22_265/0.4)]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Analyse your first thread
            </Link>
          </div>
        </div>
      )}

      {/* Thread list */}
      {threads && threads.length > 0 && (
        <div className="flex flex-col gap-3 max-w-3xl">
          {threads.map((thread) => {
            const color = PRIORITY_COLOR[thread.priority_score] ?? PRIORITY_COLOR[3];
            const label = PRIORITY_LABEL[thread.priority_score] ?? "Medium";
            const openActions = thread.actions.filter((a) => a.status === "open").length;
            return (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="block rounded-2xl border p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.03] group"
                style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3
                    className="text-white font-semibold text-base leading-snug group-hover:text-brand transition-colors"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {thread.title}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: "var(--font-outfit)" }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2" style={{ fontFamily: "var(--font-outfit)" }}>
                  {thread.summary}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
                    {new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  {openActions > 0 && (
                    <span className="text-xs font-medium" style={{ color: "oklch(64% 0.22 265)", fontFamily: "var(--font-outfit)" }}>
                      {openActions} action{openActions !== 1 ? "s" : ""} pending
                    </span>
                  )}
                  <span
                    className="text-xs capitalize ml-auto"
                    style={{ color: thread.status === "active" ? "oklch(72% 0.16 200)" : "#475569", fontFamily: "var(--font-outfit)" }}
                  >
                    {thread.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
