"use client";

import { motion } from "framer-motion";

const COMPANIES = ["Notion", "Linear", "Vercel", "Stripe", "Figma", "Loom", "Arc", "Raycast"];

export default function SocialProof() {
  return (
    <section className="py-16 border-y border-white/[0.06] bg-black/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white/25 text-xs font-medium tracking-widest uppercase mb-8"
         
        >
          Trusted by teams at
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {COMPANIES.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-white/25 font-semibold text-base tracking-tight hover:text-white/60 transition-colors duration-300 cursor-default"
             
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
