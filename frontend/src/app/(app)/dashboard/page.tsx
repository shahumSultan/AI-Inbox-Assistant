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

const PRIORITY: Record<number, { label: string; color: string }> = {
  1: { label: "Low",      color: "#06b6d4" },
  2: { label: "Normal",   color: "#06b6d4" },
  3: { label: "Medium",   color: "#f59e0b" },
  4: { label: "High",     color: "#f97316" },
  5: { label: "Critical", color: "#ef4444" },
};

export default function DashboardPage() {
  const [threads, setThreads] = useState<ThreadOut[] | null>(null);
  const [error,   setError]   = useState<string | null>(null);

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
          <h1 className="text-white text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-white/40 text-sm">Your communication command centre</p>
        </div>
        {threads && threads.length > 0 && (
          <Link
            href="/new-thread"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:scale-105 transition-all duration-200"
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
              <circle cx="12" cy="12" r="9" stroke="rgba(6,182,212,0.25)" strokeWidth="2"/>
              <path d="M12 3a9 9 0 019 9" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-white/30 text-sm">Loading threads…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-400 bg-red-500/[0.08] border border-red-500/15">
          {error}
        </div>
      )}

      {/* Empty state */}
      {threads?.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-brand/[0.08] border border-brand/20">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8l10 6 10-6" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="4" y="7" width="20" height="14" rx="3" stroke="#06b6d4" strokeWidth="1.8"/>
                <path d="M10 14h8" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-3 tracking-tight">No threads yet</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Paste your first email thread and let AI tell you exactly what to do, what to say, and when to follow up.
            </p>
            <Link
              href="/new-thread"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:scale-105 transition-all duration-200"
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
            const p = PRIORITY[thread.priority_score] ?? PRIORITY[3];
            const openActions = thread.actions.filter((a) => a.status === "open").length;
            return (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="block rounded-2xl border border-white/[0.07] p-5 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.03] group"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-white font-semibold text-base leading-snug group-hover:text-brand transition-colors">
                    {thread.title}
                  </h3>
                  <span
                    className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}
                  >
                    {p.label}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-3 line-clamp-2">{thread.summary}</p>
                <div className="flex items-center gap-4">
                  <span className="text-white/20 text-xs">
                    {new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  {openActions > 0 && (
                    <span className="text-xs font-medium text-brand">
                      {openActions} action{openActions !== 1 ? "s" : ""} pending
                    </span>
                  )}
                  <span className="text-xs capitalize ml-auto" style={{ color: thread.status === "active" ? "#06b6d4" : "rgba(255,255,255,0.2)" }}>
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
