const STEPS = [
  {
    num: "01",
    accent: "#22d3ee",
    title: "Connect Gmail",
    desc: "Link your Gmail account in under 30 seconds using Google OAuth. Your credentials never touch our servers.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 8l8 5 8-5" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="3" y="7" width="16" height="10" rx="2.5" stroke="#22d3ee" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    num: "02",
    accent: "#a78bfa",
    title: "AI Analyses",
    desc: "Our AI reads, categorises, and summarises every email in real-time. It learns your preferences and gets smarter daily.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="11" cy="11" r="3" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round"/>
        <path d="M8 11l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: "03",
    accent: "#34d399",
    title: "You Act",
    desc: "See only what matters. Approve AI-drafted replies. Watch your inbox shrink. Users save an average of 2.4 hrs/day.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 11.5l4.5 4.5 8-9" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.012)" }}
    >
      {/* bg glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* Heading */}
        <div className="text-center mb-20">
          <span
            className="text-brand text-[11px] font-medium tracking-[0.16em] uppercase"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Dead-simple setup
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Running in{" "}
            <span className="text-slate-500">3 minutes</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">

          {/* connector */}
          <div
            className="hidden md:block absolute top-9 left-[calc(16.66%+32px)] right-[calc(16.66%+32px)] h-px"
            style={{ background: "linear-gradient(90deg, rgba(34,211,238,0.35), rgba(167,139,250,0.35), rgba(52,211,153,0.35))" }}
          />

          {STEPS.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">

              {/* icon circle */}
              <div className="relative mb-7">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center border border-white/[0.08] transition-all duration-300 hover:border-white/[0.16] hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.025)" }}
                >
                  {step.icon}
                </div>
                {/* step number badge */}
                <div
                  className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "#080810",
                    border: `1px solid ${step.accent}60`,
                    color: step.accent,
                    fontFamily: "var(--font-syne)",
                  }}
                >
                  {step.num.slice(1)}
                </div>
              </div>

              <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: "var(--font-syne)" }}>
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]" style={{ fontFamily: "var(--font-dm-sans)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
