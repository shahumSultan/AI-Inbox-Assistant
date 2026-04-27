"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Plan = {
  name: string;
  price: number;
  desc: string;
  features: string[];
  cta: string;
  ctaHref: string;
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
    ctaHref: "/register",
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
    ctaHref: "/register",
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
    ctaHref: "#",
    badge: "Coming Soon",
    highlighted: false,
    disabled: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-28" style={{ background: "rgba(0,0,0,0.2)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "var(--font-outfit)" }}>
            Simple pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-tight leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Pay for what you use.
            <br />
            <span className="text-white/30 font-light">Nothing more.</span>
          </h2>
          <p className="text-white/40 mt-4 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl p-7 border transition-all duration-300 ${
        plan.disabled ? "opacity-55" : ""
      } ${
        plan.highlighted
          ? "border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.12),0_0_0_1px_rgba(6,182,212,0.08)]"
          : "border-white/[0.07] hover:border-white/[0.15]"
      }`}
      style={{
        background: plan.highlighted
          ? "linear-gradient(160deg, rgba(6,182,212,0.1) 0%, rgba(0,0,0,0.6) 50%)"
          : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-outfit)",
            background: plan.highlighted
              ? "linear-gradient(135deg, #06b6d4, #f97316)"
              : "rgba(255,255,255,0.08)",
            color: plan.highlighted ? "#fff" : "rgba(255,255,255,0.4)",
            boxShadow: plan.highlighted ? "0 0 20px rgba(6,182,212,0.4)" : "none",
          }}
        >
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-white font-bold text-xl mb-1.5" style={{ fontFamily: "var(--font-outfit)" }}>
          {plan.name}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "var(--font-outfit)" }}>
          {plan.desc}
        </p>
      </div>

      <div className="flex items-end gap-1.5 mb-6">
        <span className="text-5xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
          ${plan.price}
        </span>
        <span className="text-white/30 text-sm mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
          / month
        </span>
      </div>

      <div
        className="h-px w-full mb-6"
        style={{ background: plan.highlighted ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.06)" }}
      />

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-3">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0 mt-[1px]">
              <path
                d="M3 7.5l3 3 6-6"
                stroke={plan.highlighted ? "#06b6d4" : "rgba(255,255,255,0.2)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "var(--font-outfit)" }}>
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {plan.disabled ? (
        <button
          disabled
          className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-not-allowed border border-white/[0.05] text-white/20"
          style={{ background: "rgba(255,255,255,0.03)", fontFamily: "var(--font-outfit)" }}
        >
          {plan.cta}
        </button>
      ) : (
        <Link
          href={plan.ctaHref}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold text-center transition-all duration-200 block ${
            plan.highlighted
              ? "text-white hover:shadow-[0_0_28px_rgba(6,182,212,0.45)] hover:brightness-110"
              : "text-white/70 hover:text-white border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.05]"
          }`}
          style={{
            background: plan.highlighted
              ? "linear-gradient(135deg, #06b6d4, #f97316)"
              : "transparent",
            fontFamily: "var(--font-outfit)",
          }}
        >
          {plan.cta}
        </Link>
      )}
    </div>
  );
}
