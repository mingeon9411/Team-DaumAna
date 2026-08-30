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
        <nav className="card flex items-center gap-1 px-2 py-2 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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

      <footer className="mx-auto max-w-3xl w-full px-6 py-10 text-xs" style={{ color: "var(--color-muted)" }}>
        <Link to="/">© 2026 Portfolio</Link>
      </footer>
    </div>
  );
}
