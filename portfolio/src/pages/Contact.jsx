const GITHUB_ICON = (
  <svg viewBox="0 0 16 16" width="26" height="26" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const LINKS = [
  { icon: "📧", label: "Email", value: "toube77@gmail.com", href: "mailto:toube77@gmail.com" },
  { icon: GITHUB_ICON, label: "GitHub", value: "github.com/mingeon9411", href: "https://github.com/mingeon9411" },
  { icon: "🏠", label: "집다움 홈페이지", value: "jipdaum.life", href: "https://jipdaum.life" },
  {
    icon: "🎨",
    label: "Frontend Repo",
    value: "Team-DaumAna",
    href: "https://github.com/mingeon9411/Team-DaumAna",
  },
  {
    icon: "⚙️",
    label: "Backend Repo",
    value: "jipdaum_Springboot",
    href: "https://github.com/mingeon9411/jipdaum_Springboot",
  },
];

// Home의 진입 애니메이션(.animate-in, 순서대로 살짝 떠오르며 등장)과 같은 계단식 딜레이
const STEP = 80;

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-4">
      <h1
        className="animate-in text-2xl font-medium tracking-tight"
        style={{ fontFamily: "var(--font-serif)", animationDelay: "0ms" }}
      >
        Contact
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="animate-in card block p-6 hover:-translate-y-0.5 transition-transform"
            style={{ animationDelay: `${STEP + i * STEP}ms` }}
          >
            <div className="text-2xl">{l.icon}</div>
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
