const EMAILS = [
  { tag: "URGENT",     tagHex: "#ef4444", from: "Sarah Chen",   subject: "Q4 report needs your sign-off", time: "2m",  unread: true  },
  { tag: "AI REPLIED", tagHex: "#22d3ee", from: "Billing Ops",  subject: "Invoice #4521 auto-handled",    time: "14m", unread: false },
  { tag: "SUMMARY",    tagHex: "#a78bfa", from: "Team Digest",  subject: "47 Slack msgs → 3 key points",  time: "1h",  unread: false },
  { tag: "SCHEDULED",  tagHex: "#f59e0b", from: "Calendar AI",  subject: "Meeting moved to Fri 3 pm",     time: "2h",  unread: false },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(oklch(64% 0.22 265 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(64% 0.22 265 / 0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* left glow */}
        <div
          className="absolute -top-20 left-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(64% 0.22 265 / 0.18) 0%, transparent 65%)" }}
        />
        {/* right glow */}
        <div
          className="absolute top-1/3 right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 65%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/25 bg-brand/5 mb-9">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
              <span className="text-brand text-xs font-medium tracking-wide" style={{ fontFamily: "var(--font-outfit)" }}>
                AI-Powered Email Management
              </span>
            </div>

            {/* headline */}
            <h1
              className="text-[52px] sm:text-[64px] lg:text-[72px] font-bold leading-[1.03] tracking-[-0.02em] text-white mb-7"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Your inbox,
              <br />
              <span
                className="animate-gradient"
                style={{
                  background: "linear-gradient(90deg, oklch(64% 0.22 265) 0%, oklch(72% 0.16 200) 55%, oklch(64% 0.22 305) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                managed by AI.
              </span>
              <br />
              <span className="text-slate-500">Not by you.</span>
            </h1>

            {/* sub */}
            <p
              className="text-slate-400 text-[17px] leading-[1.75] mb-11 max-w-[440px]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              AI Inbox Assistant reads, summarises, prioritises, and replies to
              your emails — giving you back{" "}
              <span className="text-slate-200 font-medium">2+ hours every day</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-7">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 hover:shadow-[0_0_32px_oklch(64%_0.22_265/0.5)]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Start Free Trial
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:text-white transition-all duration-200"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5.2 4.8l3.8 1.7-3.8 1.7V4.8z" fill="currentColor"/>
                </svg>
                Watch Demo
              </a>
            </div>

            {/* trust line */}
            <p className="text-slate-700 text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* ── Right: inbox mockup ── */}
          <div className="flex justify-center lg:justify-end">
            <div className="animate-float">
              <InboxMockup />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function InboxMockup() {
  return (
    <div
      className="w-[360px] sm:w-[420px] rounded-2xl overflow-hidden border border-white/[0.09]"
      style={{ background: "rgba(8,14,31,0.94)", backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div className="flex-1 mx-3">
          <div className="mx-auto w-fit px-3 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.05]">
            <span className="text-slate-500 text-[11px]" style={{ fontFamily: "var(--font-outfit)" }}>
              app.inboxai.io
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Inbox</span>
          <span className="px-1.5 py-0.5 rounded-full bg-brand/15 text-brand text-[10px] font-medium" style={{ fontFamily: "var(--font-outfit)" }}>4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand/10 border border-brand/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
            <span className="text-brand text-[10px] font-medium" style={{ fontFamily: "var(--font-outfit)" }}>AI Active</span>
          </div>
        </div>
      </div>

      {/* Email rows */}
      <div className="divide-y divide-white/[0.04]">
        {EMAILS.map((e, i) => (
          <div
            key={i}
            className="group px-4 py-3 hover:bg-white/[0.025] transition-colors duration-200 cursor-pointer"
            style={{ animation: `email-in 0.45s ease-out ${i * 0.1}s both` }}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.unread ? "#22d3ee" : "transparent" }} />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: e.unread ? "#f1f5f9" : "#94a3b8", fontFamily: "var(--font-outfit)" }}
                >
                  {e.from}
                </span>
              </div>
              <span className="text-[11px] flex-shrink-0 text-slate-600" style={{ fontFamily: "var(--font-outfit)" }}>
                {e.time} ago
              </span>
            </div>
            <div className="pl-3.5 flex items-center gap-2">
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest flex-shrink-0"
                style={{
                  color: e.tagHex,
                  background: `${e.tagHex}18`,
                  border: `1px solid ${e.tagHex}28`,
                  fontFamily: "var(--font-outfit)",
                }}
              >
                {e.tag}
              </span>
              <span className="text-slate-600 text-xs truncate" style={{ fontFamily: "var(--font-outfit)" }}>
                {e.subject}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div
        className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]"
        style={{ background: "rgba(34,211,238,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1l1.2 2.4L10 4l-2 2 .5 2.8L6 7.5l-2.5 1.3L4 6 2 4l2.8-.6L6 1z" fill="#f59e0b" fillOpacity="0.7"/>
          </svg>
          <span className="text-amber/70 text-[11px]" style={{ fontFamily: "var(--font-outfit)" }}>
            127 emails processed today
          </span>
        </div>
        <span className="text-slate-700 text-[11px]" style={{ fontFamily: "var(--font-outfit)" }}>
          2.4 hrs saved
        </span>
      </div>
    </div>
  );
}
