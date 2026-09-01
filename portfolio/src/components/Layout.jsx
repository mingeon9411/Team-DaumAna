import { Link, NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/case-studies", label: "Case Studies" },
  { to: "/contact", label: "Contact" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="mx-auto max-w-3xl w-full px-6 pt-8">
        <nav className="card flex items-center justify-center gap-1 px-2 py-2 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              viewTransition
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-medium transition-colors ${
                  isActive ? "text-white" : "hover:bg-[var(--color-accent-soft)]"
                }`
              }
              style={({ isActive }) => (isActive ? { background: "var(--color-accent)" } : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mx-auto max-w-3xl w-full px-6 py-10 text-xs text-center" style={{ color: "var(--color-muted)" }}>
        <Link to="/" viewTransition>© 2026 KANG Mingeon. Developer Portfolio.</Link>
        {/* 방문자 IP 기준(일 1회) 중복 방지 조회수 — 외부 무료 뱃지 서비스, 자체 서버/DB 불필요 */}
        <div className="mt-3">
          <img
            src="https://visitor-badge.laobi.icu/badge?page_id=mingeon9411.jipdaum-portfolio&color=a184e8"
            alt="조회수"
          />
        </div>
      </footer>
    </div>
  );
}
