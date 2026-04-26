type Plan = {
  name: string;
  price: number;
  desc: string;
  features: string[];
  cta: string;
  badge: string | null;
  highlighted: boolean;
  disabled: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Basic",
    price: 19,
    desc: "Perfect for solo professionals reclaiming their inbox.",
    features: [
      "Core AI summarisation",
      "1 connected inbox",
      "500 emails / month",
      "One-click AI replies",
      "Mobile app",
    ],
    cta: "Start Free Trial",
    badge: null,
    highlighted: false,
    disabled: false,
  },
  {
    name: "Pro",
    price: 49,
    desc: "Full AI power for busy individuals and growing freelancers.",
    features: [
      "Everything in Basic",
      "Unlimited inboxes",
      "Unlimited emails",
      "Calendar integration",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Free Trial",
    badge: "Most Popular",
    highlighted: true,
    disabled: false,
  },
  {
    name: "Teams",
    price: 99,
    desc: "Shared inbox management and collaboration at scale.",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared inbox management",
      "Admin controls & roles",
      "SLA tracking",
      "Dedicated success manager",
    ],
    cta: "Join Waitlist",
    badge: "Coming Soon",
    highlighted: false,
    disabled: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <span
            className="text-brand text-[11px] font-medium tracking-[0.16em] uppercase"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Simple pricing
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Pay for what you use.
            <br />
            <span className="text-slate-500">Nothing more.</span>
          </h2>
          <p className="text-slate-600 mt-4 text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan) => <PricingCard key={plan.name} plan={plan} />)}
        </div>

      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 ${
        plan.disabled ? "opacity-55" : ""
      } ${
        plan.highlighted
          ? "border-brand/35 shadow-[0_0_60px_rgba(34,211,238,0.1),0_0_0_1px_rgba(34,211,238,0.08)]"
          : "border-white/[0.07] hover:border-white/[0.12]"
      }`}
      style={{
        background: plan.highlighted
          ? "linear-gradient(160deg, rgba(34,211,238,0.07) 0%, rgba(10,10,22,0.97) 45%)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans)",
            background: plan.highlighted ? "#22d3ee" : "rgba(255,255,255,0.08)",
            color: plan.highlighted ? "#061118" : "#64748b",
            boxShadow: plan.highlighted ? "0 0 20px rgba(34,211,238,0.35)" : "none",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Name & desc */}
      <div className="mb-6">
        <h3 className="text-white font-bold text-xl mb-1.5" style={{ fontFamily: "var(--font-syne)" }}>
          {plan.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)" }}>
          {plan.desc}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-6">
        <span className="text-5xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-syne)" }}>
          ${plan.price}
        </span>
        <span className="text-slate-500 text-sm mb-1" style={{ fontFamily: "var(--font-dm-sans)" }}>
          / month
        </span>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full mb-6"
        style={{ background: plan.highlighted ? "rgba(34,211,238,0.18)" : "rgba(255,255,255,0.06)" }}
      />

      {/* Features */}
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-3">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0 mt-[1px]">
              <path
                d="M3 7.5l3 3 6-6"
                stroke={plan.highlighted ? "#22d3ee" : "#334155"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-slate-400 text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        disabled={plan.disabled}
        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          plan.highlighted
            ? "bg-brand text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.45)]"
            : plan.disabled
            ? "bg-white/[0.04] text-slate-600 cursor-not-allowed border border-white/[0.05]"
            : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.12]"
        }`}
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {plan.cta}
      </button>
    </div>
  );
}
