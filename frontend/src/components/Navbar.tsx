"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LogoMark from "./LogoMark";

const NAV_LINKS = [
  { label: "Features",     href: "#features"     },
  { label: "How it works", href: "#how-it-works"  },
  { label: "Pricing",      href: "#pricing"       },
] as const;

const NAVBAR_HEIGHT = 64;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = useCallback((href: string) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-black/50 border-b border-white/[0.06]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="logo-glow transition-all duration-300">
              <LogoMark size={30} />
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              Inbox<span className="text-brand">Cube</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => scrollTo(href)}
                className="nav-link text-sm px-3 py-2 rounded-full"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="nav-link text-sm px-4 py-2 rounded-full"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-gradient-brand text-sm font-semibold px-5 py-2 rounded-full text-white transition-all duration-300 hover-glow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="nav-link md:hidden p-1 rounded-lg"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {open
                ? <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                : <path d="M4 7h14M4 11h10M4 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <button
                    key={label}
                    onClick={() => { scrollTo(href); setOpen(false); }}
                    className="nav-link text-left text-sm px-3 py-2.5 rounded-xl"
                  >
                    {label}
                  </button>
                ))}
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                  <Link href="/login" className="nav-link text-center text-sm py-2.5 rounded-full border border-white/10" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link href="/register" className="bg-gradient-brand text-center text-sm font-semibold py-2.5 rounded-full text-white" onClick={() => setOpen(false)}>Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
