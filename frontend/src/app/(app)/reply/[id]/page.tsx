"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface ThreadSummary {
  id: string;
  title: string;
  summary: string;
  primary_intent: string;
  priority_score: number;
}

interface ReplyDraft {
  label: string;
  text: string;
  reason: string;
}

const GOALS = [
  { value: "clarify",     label: "Clarify" },
  { value: "follow_up",   label: "Follow up" },
  { value: "close_deal",  label: "Close deal" },
  { value: "decline",     label: "Decline" },
  { value: "negotiate",   label: "Negotiate" },
  { value: "apologize",   label: "Apologize" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly" },
  { value: "assertive",    label: "Assertive" },
  { value: "concise",      label: "Concise" },
];

export default function ReplyPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [thread,    setThread]    = useState<ThreadSummary | null>(null);
  const [goal,      setGoal]      = useState("clarify");
  const [tone,      setTone]      = useState("professional");
  const [extra,     setExtra]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [drafts,    setDrafts]    = useState<ReplyDraft[]>([]);
  const [active,    setActive]    = useState(0);
  const [edited,    setEdited]    = useState<Record<number, string>>({});
  const [copied,    setCopied]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.get<ThreadSummary>(`/api/threads/${id}`).then(setThread).catch(() => {});
  }, [id]);

  async function generate() {
    setError(null);
    setLoading(true);
    setDrafts([]);
    setEdited({});
    try {
      const res = await api.post<{ replies: ReplyDraft[] }>("/api/replies/generate", {
        thread_id: id,
        goal,
        tone,
        extra_instruction: extra || undefined,
      });
      setDrafts(res.replies);
      setActive(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function currentText() {
    return edited[active] ?? drafts[active]?.text ?? "";
  }

  function handleEdit(val: string) {
    setEdited((prev) => ({ ...prev, [active]: val }));
  }

  function copy() {
    navigator.clipboard.writeText(currentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setEdited((prev) => { const n = { ...prev }; delete n[active]; return n; });
  }

  const hasEdit = edited[active] !== undefined;

  return (
    <div className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 max-w-3xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => router.push(`/thread/${id}`)}
        className="flex items-center gap-2 dark:text-white/30 text-slate-400 hover:dark:text-white/60 text-slate-500 text-sm mb-8 transition-colors w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to thread
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="dark:text-white text-slate-900 text-2xl sm:text-3xl font-bold tracking-tight mb-1">Generate Reply</h1>
        {thread && (
          <p className="dark:text-white/40 text-slate-500 text-sm line-clamp-1">{thread.title}</p>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-2xl dark:border-white/[0.08] border-slate-200 border p-6 mb-6" style={{ background: "var(--surface)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

          {/* Goal */}
          <div>
            <label className="block dark:text-white/50 text-slate-500 text-xs font-medium mb-2">Goal</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 border ${
                    goal === g.value
                      ? "bg-brand/15 border-brand/30 text-brand"
                      : "dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.08] border-slate-200 dark:text-white/40 text-slate-500 hover:dark:text-white/70 text-slate-600 hover:dark:bg-white/[0.07] bg-slate-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block dark:text-white/50 text-slate-500 text-xs font-medium mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150 border ${
                    tone === t.value
                      ? "bg-brand/15 border-brand/30 text-brand"
                      : "dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.08] border-slate-200 dark:text-white/40 text-slate-500 hover:dark:text-white/70 text-slate-600 hover:dark:bg-white/[0.07] bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Extra instruction */}
        <div className="mb-5">
          <label className="block dark:text-white/50 text-slate-500 text-xs font-medium mb-2">
            Extra instruction <span className="dark:text-white/20 text-slate-300">(optional)</span>
          </label>
          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="e.g. mention we can do a call next week, keep it under 3 sentences…"
            className="w-full px-3 py-2.5 rounded-xl dark:border-white/[0.08] border-slate-200 border dark:bg-white/[0.04] bg-slate-100 dark:text-white text-slate-900 text-sm dark:placeholder-white/20 placeholder-slate-300 outline-none focus:border-brand/40 transition-colors"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover-glow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8"/>
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 4.5H13l-3.5 2.5 1.5 4.5L7 10l-4 2.5 1.5-4.5L1 5.5h4.5L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              {drafts.length > 0 ? "Regenerate" : "Generate drafts"}
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-red-400 text-xs px-3 py-2 rounded-lg bg-red-500/[0.08] border border-red-500/20">{error}</p>
        )}
      </div>

      {/* Draft tabs + editor */}
      {drafts.length > 0 && (
        <div className="flex flex-col gap-4">

          {/* Tab row */}
          <div className="flex items-center gap-2">
            {drafts.map((d, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  active === i
                    ? "bg-white/[0.08] dark:border-white/[0.16] border-slate-300 text-white"
                    : "dark:bg-white/[0.03] bg-slate-100 dark:border-white/[0.07] border-slate-200 dark:text-white/40 text-slate-500 hover:dark:text-white/70 text-slate-600"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Reason */}
          <p className="dark:text-white/30 text-slate-400 text-xs italic px-1">{drafts[active]?.reason}</p>

          {/* Editable textarea */}
          <div className="rounded-2xl dark:border-white/[0.08] border-slate-200 border overflow-hidden" style={{ background: "var(--surface)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.06] border-slate-200">
              <span className="dark:text-white/30 text-slate-400 text-xs font-medium uppercase tracking-wider">Reply draft</span>
              <div className="flex items-center gap-2">
                {hasEdit && (
                  <button
                    onClick={reset}
                    className="dark:text-white/25 text-slate-400 hover:dark:text-white/50 text-slate-500 text-xs transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={copy}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border ${copied ? "copy-active" : "copy-idle"}`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={currentText()}
              onChange={(e) => handleEdit(e.target.value)}
              rows={14}
              className="w-full px-4 py-4 text-sm text-white/80 bg-transparent outline-none resize-none leading-relaxed"
            />
          </div>

        </div>
      )}
    </div>
  );
}
