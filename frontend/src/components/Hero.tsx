"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EMAILS = [
  { tag: "URGENT",     tagColor: "#ef4444", from: "Sarah Chen",   subject: "Q4 report needs your sign-off", time: "2m",  unread: true  },
  { tag: "AI REPLIED", tagColor: "#06b6d4", from: "Billing Ops",  subject: "Invoice #4521 auto-handled",    time: "14m", unread: false },
  { tag: "SUMMARY",    tagColor: "#a78bfa", from: "Team Digest",  subject: "47 Slack msgs → 3 key points",  time: "1h",  unread: false },
  { tag: "SCHEDULED",  tagColor: "#f97316", from: "Calendar AI",  subject: "Meeting moved to Fri 3 pm",     time: "2h",  unread: false },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium tracking-wide">
                AI-Powered Email Management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[36px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05] tracking-tight text-white mb-6"
            >
              Your inbox,
              <br />
              <span className="text-gradient-brand">
                managed by AI.
              </span>
              <br />
              <span className="text-white/30 font-light">Not by you.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/60 text-lg leading-relaxed mb-10 max-w-md"
             
            >
              AI Inbox Assistant reads, summarises, prioritises, and replies to
              your emails — giving you back{" "}
              <span className="text-white font-medium">2+ hours every day</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6"
            >
              <Link
                href="/register"
                className="bg-gradient-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105"
              >
                Start Free Trial
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-white/70 border border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-200"
               
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5.2 4.8l3.8 1.7-3.8 1.7V4.8z" fill="currentColor"/>
                </svg>
                See how it works
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/30 text-xs"
             
            >
              No credit card required · 14-day free trial · Cancel anytime
            </motion.p>
          </div>

          {/* Right: inbox mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <InboxMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InboxMockup() {
  return (
    <div
      className="w-full max-w-[420px] rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "rgba(0,0,0,0.75)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div className="flex-1 mx-3">
          <div className="mx-auto w-fit px-3 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.05]">
            <span className="text-white/30 text-[11px]">app.inboxai.io</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm font-semibold">Inbox</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-brand/15 text-brand">4</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-[10px] font-medium">AI Active</span>
        </div>
      </div>

      {/* Email rows */}
      <div className="divide-y divide-white/[0.04]">
        {EMAILS.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.unread ? "#06b6d4" : "transparent" }} />
                <span className="text-sm font-medium truncate" style={{ color: e.unread ? "#f1f5f9" : "#64748b" }}>
                  {e.from}
                </span>
              </div>
              <span className="text-[11px] flex-shrink-0 text-white/20">{e.time} ago</span>
            </div>
            <div className="pl-3.5 flex items-center gap-2">
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest flex-shrink-0"
                style={{ color: e.tagColor, background: `${e.tagColor}18`, border: `1px solid ${e.tagColor}28` }}
              >
                {e.tag}
              </span>
              <span className="text-white/30 text-xs truncate">{e.subject}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer stat */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]" style={{ background: "rgba(6,182,212,0.04)" }}>
        <span className="text-white/40 text-[11px]">127 emails processed today</span>
        <span className="text-cyan-400/60 text-[11px] font-medium">2.4 hrs saved</span>
      </div>
    </div>
  );
}
