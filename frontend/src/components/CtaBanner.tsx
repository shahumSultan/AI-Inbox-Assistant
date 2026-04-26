export default function CtaBanner() {
  return (
    <section className="py-24 relative overflow-hidden">

      {/* background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.09) 0%, transparent 50%, rgba(167,139,250,0.07) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* top & bottom vignettes */}
        <div className="absolute top-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, #080810, transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, #080810, transparent)" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">

        {/* badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/25 bg-brand/5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
          <span className="text-brand text-xs font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Free for 14 days — no card needed
          </span>
        </div>

        <h2
          className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-white mb-6 tracking-[-0.02em] leading-tight"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Stop managing email.
          <br />
          <span
            className="animate-gradient"
            style={{
              background: "linear-gradient(90deg, #22d3ee 0%, #67e8f9 40%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Start owning your time.
          </span>
        </h2>

        <p
          className="text-slate-400 text-lg leading-relaxed mb-11 max-w-xl mx-auto"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Join thousands of professionals who handed their inbox to AI — and never looked back.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="px-8 py-3.5 rounded-full font-semibold text-sm text-slate-950 bg-brand hover:bg-cyan-300 transition-all duration-200 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Start Your Free Trial
          </a>
          <a
            href="#pricing"
            className="px-8 py-3.5 rounded-full font-medium text-sm text-slate-300 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:text-white transition-all duration-200"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            View Pricing
          </a>
        </div>

      </div>
    </section>
  );
}
