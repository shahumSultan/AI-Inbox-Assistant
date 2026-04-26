import LogoMark from "./LogoMark";

const LINKS: Record<string, string[]> = {
  Product:  ["Features", "Pricing", "Changelog", "Roadmap"],
  Company:  ["About", "Blog", "Careers", "Press"],
  Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  Support:  ["Documentation", "Status", "Contact"],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={32} />
              <span className="text-white font-bold text-[17px]" style={{ fontFamily: "var(--font-outfit)" }}>
                Inbox<span className="text-brand">AI</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-[175px]" style={{ fontFamily: "var(--font-outfit)" }}>
              AI-powered email management for modern teams.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="X / Twitter" className="text-slate-700 hover:text-slate-400 transition-colors">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <path d="M11.9 1h2.3L9.3 6.4 15 14h-4.5L7 9.5 3.3 14H1l5.3-6-5-7H6l3.2 4.2L11.9 1zm-.8 11.7h1.3L4.2 2.3H2.8l8.3 10.4z"/>
                </svg>
              </a>
              <a href="#" aria-label="GitHub" className="text-slate-700 hover:text-slate-400 transition-colors">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <path d="M7.5 0C3.4 0 0 3.4 0 7.5c0 3.3 2.1 6.1 5.1 7.1.4.1.5-.2.5-.4v-1.3c-2.1.5-2.5-1-2.5-1-.3-.8-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.7.8 2.1.6.1-.5.3-.8.5-1C4 11.4 2.2 10.7 2.2 7.6c0-.8.3-1.5.8-2-.1-.2-.4-.9.1-2 0 0 .6-.2 2.1.8.6-.2 1.2-.3 1.8-.3.6 0 1.2.1 1.8.3 1.4-.9 2.1-.8 2.1-.8.5 1 .2 1.7.1 2 .5.5.8 1.2.8 2 0 3.1-1.9 3.8-3.7 4 .3.3.5.7.5 1.3v2c0 .2.1.5.5.4 3-1 5.1-3.8 5.1-7.1C15 3.4 11.6 0 7.5 0z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-700 hover:text-slate-400 transition-colors">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <path d="M13.7 0H1.3C.6 0 0 .6 0 1.3v12.4C0 14.4.6 15 1.3 15h12.4c.7 0 1.3-.6 1.3-1.3V1.3C15 .6 14.4 0 13.7 0zM4.4 12.7H2.2V5.6h2.2v7.1zM3.3 4.6c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zm9.4 8.1h-2.2V9.2c0-.8 0-1.8-1.1-1.8s-1.3.9-1.3 1.8v3.5H5.9V5.6h2.1V6.5h.1c.3-.6 1-1.2 2.1-1.2 2.2 0 2.6 1.5 2.6 3.4v4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h4
                className="text-slate-400 text-[11px] font-semibold tracking-[0.14em] uppercase mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {cat}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-600 hover:text-slate-300 text-sm transition-colors duration-200"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-700 text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
            © 2026 AI Inbox Assistant, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            <span className="text-slate-600 text-xs" style={{ fontFamily: "var(--font-outfit)" }}>
              All systems operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
