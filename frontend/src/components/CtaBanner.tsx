"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, transparent 50%, rgba(249,115,22,0.06) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 border border-cyan-500/25 bg-cyan-500/5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-xs font-medium" style={{ fontFamily: "var(--font-outfit)" }}>
            Free for 14 days — no card needed
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-white mb-6 tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Stop managing email.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 40%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Start owning your time.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/50 text-lg leading-relaxed mb-11 max-w-xl mx-auto"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Join thousands of professionals who handed their inbox to AI — and never looked back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:scale-105"
            style={{ background: "linear-gradient(135deg, #06b6d4, #f97316)", fontFamily: "var(--font-outfit)" }}
          >
            Start Your Free Trial
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center px-8 py-3.5 rounded-full text-sm font-medium text-white/60 border border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-200"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            View Pricing
          </a>
        </motion.div>

      </div>
    </section>
  );
}
