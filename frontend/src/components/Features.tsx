"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    accent: "#06b6d4",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5l7 4 7-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 9h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>),
    title: "Smart Summarisation",
    desc: "Get a 3-line digest of every email thread — automatically. Never wade through a wall of text again.",
  },
  {
    accent: "#a78bfa",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.8 4 4.2.6-3 3 .7 4.2L9 12l-3.7 1.8.7-4.2-3-3 4.2-.6L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>),
    title: "Auto-Prioritisation",
    desc: "AI scores every email by urgency and importance. Critical messages always surface first.",
  },
  {
    accent: "#34d399",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 3L7 11M3 13l4-1-1-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    title: "One-click Replies",
    desc: "AI drafts context-aware replies you can approve and send with a single click, or tweak in seconds.",
  },
  {
    accent: "#f97316",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8h14M6 2v4M12 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>),
    title: "Calendar Integration",
    desc: "Meeting requests are automatically parsed, conflicts checked, and events synced to Google Calendar.",
  },
  {
    accent: "#f472b6",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 15c0-3 2-4.5 5-4.5M17 15c0-3-2-4.5-5-4.5M6 15c0-3 1.3-4.5 3-4.5s3 1.5 3 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>),
    title: "Team Inbox",
    desc: "Shared inboxes, assignment workflows, and SLA tracking — your whole team stays aligned.",
  },
  {
    accent: "#60a5fa",
    icon: (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14V9M8 14V6M12 14V4M16 14V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>),
    title: "Analytics Dashboard",
    desc: "Track response times, email volume trends, and exactly how many hours per week AI is saving you.",
  },
] as const;

export default function Features() {
  return (
    <section id="features" className="py-28" style={{ background: "rgba(0,0,0,0.2)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-xs font-medium tracking-widest uppercase">
            Everything you need
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-tight leading-tight">
            Inbox superpowers,
            <br />
            <span className="text-white/30 font-light">without the complexity</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl border border-white/[0.07] hover:border-white/[0.15] transition-all duration-300 cursor-default overflow-hidden"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 40% 0%, ${f.accent}18, transparent 65%)` }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105"
                style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
