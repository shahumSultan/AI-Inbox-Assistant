const COMPANIES = ["Notion", "Linear", "Vercel", "Stripe", "Figma", "Loom", "Arc", "Raycast"];

export default function SocialProof() {
  return (
    <section className="py-14 border-y border-white/[0.05]" style={{ background: "rgba(255,255,255,0.012)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p
          className="text-center text-slate-700 text-[11px] font-medium tracking-[0.18em] uppercase mb-8"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {COMPANIES.map((name) => (
            <span
              key={name}
              className="text-slate-600 hover:text-slate-400 text-sm font-semibold tracking-tight transition-colors duration-300 cursor-default select-none"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
