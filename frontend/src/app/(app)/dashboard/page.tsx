"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface DashboardThread {
  id: string;
  title: string;
  summary: string;
  primary_intent: string;
  priority_score: number;
  status: string;
  open_action_count: number;
  top_action_type: string | null;
  earliest_due: string | null;
  created_at: string;
}

interface DashboardGroup {
  key: string;
  label: string;
  color: string;
  threads: DashboardThread[];
}

interface DashboardOut {
  groups: DashboardGroup[];
  total: number;
}

const PRIORITY: Record<number, { label: string; color: string }> = {
  1: { label: "P1", color: "#64748b" },
  2: { label: "P2", color: "#64748b" },
  3: { label: "P3", color: "#f59e0b" },
  4: { label: "P4", color: "#f97316" },
  5: { label: "P5", color: "#ef4444" },
};

const ACTION_LABEL: Record<string, string> = {
  reply: "Reply",
  follow_up: "Follow-up",
  schedule: "Schedule",
  task: "Task",
  ignore: "Ignore",
};

const GROUP_META: Record<string, { icon: React.ReactNode; description: string }> = {
  reply_now: {
    description: "High-priority threads that need your response",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 4l6 3.5L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  follow_up_today: {
    description: "Actions due today or overdue",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  waiting: {
    description: "Threads awaiting a response or no actions pending",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".4"/>
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  low_priority: {
    description: "Low urgency — check when you have time",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M2 7h7M2 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
};

function isOverdue(due: string | null): boolean {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function formatDue(due: string | null): string | null {
  if (!due) return null;
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function ThreadCard({ thread, groupColor }: { thread: DashboardThread; groupColor: string }) {
  const p = PRIORITY[thread.priority_score] ?? PRIORITY[3];
  const dueLabel = formatDue(thread.earliest_due);
  const overdue = isOverdue(thread.earliest_due);

  return (
    <Link
      href={`/thread/${thread.id}`}
      className="group block rounded-xl border dark:border-white/[0.07] border-slate-200 p-4 transition-all duration-200 dark:hover:border-white/[0.14] hover:border-slate-300 relative overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: groupColor }}
      />

      <div className="pl-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="dark:text-white text-slate-900 font-semibold text-sm leading-snug group-hover:text-brand transition-colors line-clamp-1">
            {thread.title}
          </h3>
          <span
            className="flex-shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: `${p.color}18`, color: p.color }}
          >
            {p.label}
          </span>
        </div>

        {/* Summary */}
        <p className="dark:text-white/40 text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {thread.summary}
        </p>

        {/* Footer pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {thread.open_action_count > 0 && thread.top_action_type && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand/[0.08] text-brand">
              {ACTION_LABEL[thread.top_action_type] ?? thread.top_action_type}
              {thread.open_action_count > 1 && (
                <span className="opacity-60">+{thread.open_action_count - 1}</span>
              )}
            </span>
          )}

          {dueLabel && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: overdue ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                color: overdue ? "#ef4444" : "#f59e0b",
              }}
            >
              {dueLabel}
            </span>
          )}

          <span className="dark:text-white/20 text-slate-300 text-[11px] ml-auto">
            {new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function GroupSection({ group }: { group: DashboardGroup }) {
  const meta = GROUP_META[group.key];
  if (group.threads.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span style={{ color: group.color }}>{meta.icon}</span>
        <h2 className="dark:text-white text-slate-900 text-sm font-semibold">{group.label}</h2>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${group.color}18`, color: group.color }}
        >
          {group.threads.length}
        </span>
        <span className="dark:text-white/25 text-slate-400 text-xs hidden sm:block">{meta.description}</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {group.threads.map((t) => (
          <ThreadCard key={t.id} thread={t} groupColor={group.color} />
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [data,  setData]  = useState<DashboardOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardOut>("/api/dashboard")
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  const loading = data === null && !error;

  const replyNow     = data?.groups.find((g) => g.key === "reply_now")?.threads.length ?? 0;
  const followUpToday = data?.groups.find((g) => g.key === "follow_up_today")?.threads.length ?? 0;

  return (
    <div className="flex flex-col h-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dark:text-white text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="dark:text-white/40 text-slate-500 text-sm">Your communication command centre</p>
        </div>
        {data && data.total > 0 && (
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

      {/* Stats strip */}
      {data && data.total > 0 && (
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl dark:border-white/[0.07] border-slate-200 border" style={{ background: "var(--surface)" }}>
            <span className="text-xs dark:text-white/40 text-slate-500">Total</span>
            <span className="text-sm font-bold dark:text-white text-slate-900">{data.total}</span>
          </div>
          {replyNow > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">{replyNow} need reply</span>
            </div>
          )}
          {followUpToday > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs text-amber-400 font-medium">{followUpToday} follow up today</span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="rgba(6,182,212,0.25)" strokeWidth="2"/>
              <path d="M12 3a9 9 0 019 9" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="dark:text-white/30 text-slate-400 text-sm">Loading…</p>
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
      {data?.total === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-brand/[0.08] border border-brand/20">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 8l10 6 10-6" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="4" y="7" width="20" height="14" rx="3" stroke="#06b6d4" strokeWidth="1.8"/>
              </svg>
            </div>
            <h2 className="dark:text-white text-slate-900 text-xl font-bold mb-3 tracking-tight">No threads yet</h2>
            <p className="dark:text-white/40 text-slate-500 text-sm leading-relaxed mb-8">
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

      {/* Grouped lanes */}
      {data && data.total > 0 && (
        <div className="max-w-4xl w-full">
          {data.groups.map((group) => (
            <GroupSection key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
