import systemArchitecture from "../assets/diagrams/system-architecture.png";
import teamRoles from "../assets/diagrams/team-roles.png";

// shields.io 배지 슬러그 — 루트 README의 Tech Stack 섹션과 동일한 값 사용
const STACK_GROUPS = [
  {
    category: "Frontend",
    items: [
      "React-20232A?logo=react&logoColor=61DAFB",
      "Vite-646CFF?logo=vite&logoColor=white",
      "React_Router-CA4245?logo=reactrouter&logoColor=white",
      "Axios-5A29E4?logo=axios&logoColor=white",
      "hCaptcha-006BFF?logoColor=white",
    ],
  },
  {
    category: "Backend",
    items: [
      "Spring_Boot-6DB33F?logo=springboot&logoColor=white",
      "Django-092E20?logo=django&logoColor=white",
      "DRF-ff1709?logo=django&logoColor=white",
      "JWT-000000?logo=jsonwebtokens&logoColor=white",
    ],
  },
  { category: "Database", items: ["MySQL-4479A1?logo=mysql&logoColor=white"] },
  {
    category: "Auth",
    items: [
      "Google-4285F4?logo=google&logoColor=white",
      "Kakao-FFCD00?logo=kakao&logoColor=black",
      "Naver-03C75A?logo=naver&logoColor=white",
    ],
  },
  { category: "Payment", items: ["PortOne_V2-6C1EF2?logoColor=white"] },
  {
    category: "DevOps",
    items: [
      "Docker-2496ED?logo=docker&logoColor=white",
      "Git-F05032?logo=git&logoColor=white",
      "GitHub_Actions-2088FF?logo=githubactions&logoColor=white",
      "Amazon_EC2-FF9900?logo=amazonec2&logoColor=white",
      "Cloudflare_Pages-F38020?logo=cloudflarepages&logoColor=white",
    ],
  },
];

const badgeSrc = (slug) => `https://img.shields.io/badge/${slug}&style=flat-square`;
const badgeLabel = (slug) => decodeURIComponent(slug.split("-")[0]).replace(/_/g, " ");

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
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
      <section className="card p-14">
        <h1 className="text-4xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          About
        </h1>
        <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--color-muted)" }}>
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
        <h2 className="text-lg font-semibold">시스템 아키텍처</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          React(Vite) → Spring Boot API → MySQL 구조. Django는 API 이관이 끝나 관리자 화면과 DB 스키마 마이그레이션 소유로 축소.
        </p>
        <a href={systemArchitecture} target="_blank" rel="noopener noreferrer" title="새 탭에서 원본 크기로 보기">
          <img
            src={systemArchitecture}
            alt="집다움 시스템 아키텍처 다이어그램: React(Vite) 프론트엔드가 REST API로 Spring Boot 백엔드와 통신하고, Spring Boot가 MySQL 및 외부 연동(Gemini, OAuth, PortOne, hCaptcha, SMTP)을 처리하며, Django는 admin 화면과 DB 스키마 마이그레이션을 담당하는 구조도"
            className="mt-4 w-full rounded-2xl border cursor-zoom-in"
            style={{ borderColor: "var(--color-line)" }}
            loading="lazy"
          />
        </a>
      </section>

      <section className="card p-10">
        <h2 className="text-lg font-semibold">구성원 · 역할</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          1인 풀스택 개발 — 프론트엔드 · 백엔드(Django/Spring Boot) · 데이터베이스 · 배포 전 영역을 강민건 혼자 담당.
        </p>
        <a href={teamRoles} target="_blank" rel="noopener noreferrer" title="새 탭에서 원본 크기로 보기">
          <img
            src={teamRoles}
            alt="집다움 구성원 · 역할 다이어그램: 강민건(Full-Stack Developer, 1인 개발)이 프론트엔드(React/Vite), 백엔드(Django 관리자 전용, Spring Boot 핵심/부가 기능), 데이터베이스(MySQL), 배포까지 전 영역을 담당하는 역할 분담표"
            className="mt-4 w-full rounded-2xl border cursor-zoom-in"
            style={{ borderColor: "var(--color-line)" }}
            loading="lazy"
          />
        </a>
      </section>

      <h2 className="text-lg font-semibold px-2">Stack</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {STACK_GROUPS.map((g) => (
          <section key={g.category} className="card p-6">
            <p className="text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
              {g.category}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {g.items.map((s) => (
                <img key={s} src={badgeSrc(s)} alt={badgeLabel(s)} height={20} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
