const STACK = ["Spring Boot", "Django", "React", "Vite", "MySQL", "Docker", "GitHub Actions", "Cloudflare Pages"];

const STRENGTHS = [
  {
    emoji: "🔍",
    title: "근본 원인 분석",
    desc: "증상이 아니라 원인을 추적 — 배제법·코드 직접 추적으로 원인을 특정하고, 재발 시 이전 사례와 비교해 공통 패턴을 일반화.",
  },
  {
    emoji: "🛡️",
    title: "재발 방지 설계",
    desc: "버그 하나를 고치는 데 그치지 않고 체크리스트·폴백 로직 등 프로세스/코드 레벨 안전장치로 확장.",
  },
  {
    emoji: "🔗",
    title: "이기종 시스템 통합",
    desc: "서로 다른 프레임워크(Django/Spring)가 하나의 DB를 안전하게 공유하도록 소유권 경계를 설계 — 라이선스 비용 없이 동일 인스턴스를 두 백엔드가 공유하는 구조로 프로덕션까지 안정적으로 운영.",
  },
  {
    emoji: "🗄️",
    title: "DB 마이그레이션",
    desc: "Oracle → MySQL 전환의 기술적 차이(네이밍, 문법, 드라이버)를 원인부터 파악해 해결.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <section className="card p-10">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          About
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
          장애가 나면 증상보다 근본 원인을 먼저 찾습니다. 커밋 로그와 코드 diff, 작업일지를
          근거로 원인을 좁히고, 고쳐서 끝내는 게 아니라 같은 유형이 재발하지 않도록
          코드·배포 파이프라인·팀 컨벤션까지 손을 댑니다.
        </p>
      </section>

      <section className="card p-10">
        <h2 className="text-lg font-semibold">핵심 역량</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STRENGTHS.map((s) => (
            <div key={s.title} className="rounded-2xl p-5" style={{ background: "var(--color-bg)" }}>
              <div className="text-2xl">{s.emoji}</div>
              <p className="mt-2 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-10">
        <h2 className="text-lg font-semibold">Stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
