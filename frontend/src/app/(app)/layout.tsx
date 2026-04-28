"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoMark from "@/components/LogoMark";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAuth, getAuthUser, trialDaysRemaining, type AuthUser } from "@/lib/auth";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    href: "/new-thread",
    label: "New",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => { setUser(getAuthUser()); }, []);

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  const daysLeft   = user ? trialDaysRemaining(user) : null;
  const isExpired  = daysLeft !== null && daysLeft === 0;
  const showBanner = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  const planLabel = user?.is_admin
    ? "Admin"
    : user?.plan !== "free"
    ? user?.plan
    : daysLeft !== null
    ? `${daysLeft}d trial left`
    : "Free";

  const planColor = user?.is_admin
    ? "#06b6d4"
    : isExpired
    ? "#ef4444"
    : showBanner
    ? "#f59e0b"
    : "rgba(255,255,255,0.3)";

  return (
    <div
      className="flex h-[100dvh] dark:bg-black bg-slate-100"
      style={{
        backgroundImage: "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(6,182,212,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(249,115,22,0.05) 0%, transparent 50%)",
      }}
    >
      {/* ── Desktop Sidebar (md+) ── */}
      <aside
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col dark:border-white/[0.06] border-slate-200 border-r"
        style={{ background: "var(--sidebar-bg)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 dark:border-white/[0.06] border-slate-200 border-b">
          <LogoMark size={28} />
          <span className="dark:text-white text-slate-900 font-bold text-base tracking-tight">
            Inbox<span className="text-brand">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "dark:text-white text-slate-900 bg-brand/10 border border-brand/20"
                    : "dark:text-white/40 dark:hover:text-white/80 dark:hover:bg-white/[0.04] text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className={active ? "text-brand" : ""}>{icon}</span>
                {label === "New" ? "New Thread" : label}
              </Link>
            );
          })}
        </nav>

        {/* Trial warning */}
        {showBanner && (
          <div className="mx-3 mb-2 rounded-xl px-3 py-2.5 border border-amber-500/20 bg-amber-500/[0.06]">
            <p className="text-xs font-semibold mb-0.5 text-amber-400">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in trial
            </p>
            <Link href="/#pricing" className="text-[11px] text-amber-400/60 underline underline-offset-2 hover:text-amber-400 transition-colors">
              View plans →
            </Link>
          </div>
        )}

        {/* User footer */}
        <div className="p-3 dark:border-white/[0.06] border-slate-200 border-t">
          <div className="flex items-center gap-2 mb-2">
            <ThemeToggle className="flex-1 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-100">
            <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center flex-shrink-0">
              <span className="text-brand text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="dark:text-white text-slate-900 text-xs font-medium truncate">{user?.email ?? "…"}</p>
              <p className="text-[10px] capitalize font-medium" style={{ color: planColor }}>{planLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="dark:text-white/20 dark:hover:text-white/60 text-slate-300 hover:text-slate-600 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header
          className="md:hidden flex-shrink-0 flex items-center justify-between h-14 px-4 dark:border-white/[0.06] border-slate-200 border-b"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <div className="flex items-center gap-2">
            <LogoMark size={26} />
            <span className="dark:text-white text-slate-900 font-bold text-sm tracking-tight">
              Inbox<span className="text-brand">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center dark:text-white/30 dark:hover:text-white/60 text-slate-400 hover:text-slate-700 transition-colors dark:bg-white/[0.04] bg-slate-100 border dark:border-white/[0.08] border-slate-200"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {isExpired ? (
            <div className="flex items-center justify-center h-full px-6">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-500/[0.08] border border-red-500/20">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="10" stroke="#ef4444" strokeWidth="1.8"/>
                    <path d="M14 9v5M14 18v1" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="text-white text-xl font-bold mb-3 tracking-tight">Your trial has ended</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-8">
                  Your 14-day free trial has expired. Upgrade to keep access to all your threads and AI analysis.
                </p>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-brand hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] transition-all duration-200"
                >
                  View pricing plans
                </Link>
                <button
                  onClick={handleLogout}
                  className="block mx-auto mt-4 text-white/20 hover:text-white/50 text-sm transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="md:hidden flex-shrink-0 flex items-center h-[58px] dark:border-white/[0.06] border-slate-200 border-t"
          style={{ background: "var(--sidebar-bg)" }}
        >
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 ${
                  active ? "text-brand" : "dark:text-white/30 text-slate-400"
                }`}
              >
                <span className={active ? "text-brand" : ""}>{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
