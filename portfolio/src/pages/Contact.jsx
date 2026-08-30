const LINKS = [
  { emoji: "📧", label: "Email", value: "your-email@example.com", href: "mailto:your-email@example.com" },
  { emoji: "🐙", label: "GitHub", value: "github.com/your-id", href: "https://github.com/your-id" },
  { emoji: "💼", label: "LinkedIn", value: "linkedin.com/in/your-id", href: "https://linkedin.com/in/your-id" },
];

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        Contact
      </h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="card block p-6 hover:-translate-y-0.5 transition-transform">
            <div className="text-2xl">{l.emoji}</div>
            <p className="mt-2 font-semibold">{l.label}</p>
            <p className="mt-1 text-sm break-all" style={{ color: "var(--color-muted)" }}>
              {l.value}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
