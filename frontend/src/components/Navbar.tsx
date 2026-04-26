"use client";

import { useState, useEffect } from "react";
import LogoMark from "./LogoMark";

const NAV_LINKS = ["Features", "Pricing", "About"] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-2xl bg-[#080E1F]/80 border-b border-white/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[64px]">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_10px_oklch(64%_0.22_265/0.5)]">
              <LogoMark size={32} />
            </div>
            <span
              className="text-white font-bold text-[17px] tracking-tight"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Inbox<span className="text-brand">AI</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-400 hover:text-white text-sm transition-colors duration-200 relative group"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Sign in
            </a>
            <a
              href="#"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-brand hover:brightness-110 transition-all duration-200 hover:shadow-[0_0_24px_oklch(64%_0.22_265/0.45)]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {open ? (
                <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h14M4 11h10M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-64 pb-5" : "max-h-0"
          }`}
        >
          <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-400 hover:text-white px-1 py-2 text-sm transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
                onClick={() => setOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="#"
              className="mt-3 py-2.5 rounded-full text-sm text-center font-semibold text-white bg-brand"
              style={{ fontFamily: "var(--font-outfit)" }}
              onClick={() => setOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
