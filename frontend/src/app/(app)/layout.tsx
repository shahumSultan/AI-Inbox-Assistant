"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoMark from "@/components/LogoMark";
import { clearAuth, getAuthUser, type AuthUser } from "@/lib/auth";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    href: "/new-thread",
    label: "New Thread",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex h-screen" style={{ background: "#080E1F" }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06]">
          <LogoMark size={28} />
          <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            Inbox<span className="text-brand">AI</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-white bg-brand/15 border border-brand/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <span className={active ? "text-brand" : ""}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-brand text-xs font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: "var(--font-outfit)" }}>
                {user?.email ?? "…"}
              </p>
              <p className="text-slate-600 text-[10px] capitalize" style={{ fontFamily: "var(--font-outfit)" }}>
                {user?.plan ?? "free"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-700 hover:text-slate-400 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
