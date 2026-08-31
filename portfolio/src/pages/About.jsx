import canvaIcon from "../assets/icons/canva.png";

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
      "Google-4285F4?logo=google&logoColor=white",
      "Kakao-FFCD00?logo=kakao&logoColor=black",
      "Naver-03C75A?logo=naver&logoColor=white",
      "PortOne_V2-6C1EF2?logoColor=white",
    ],
  },
  { category: "Database", items: ["MySQL-4479A1?logo=mysql&logoColor=white"] },
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
  {
    category: "Tools",
    // Claude/Gemini는 shields.io(simple-icons) 배지, Canva는 simple-icons에 없어
    // Canva 공식 아이콘(static.canva.com)을 받아 로컬 자산으로 별도 렌더링.
    items: ["Claude-D97757?logo=claude&logoColor=white", "Google_Gemini-8E75B2?logo=googlegemini&logoColor=white"],
  },
];

const badgeSrc = (slug) => `https://img.shields.io/badge/${slug}&style=flat-square`;
const badgeLabel = (slug) => decodeURIComponent(slug.split("-")[0]).replace(/_/g, " ");

const STRENGTHS = [
  {
    emoji: "🚨",
    title: "현장형 장애 대응",
    desc: "쿠팡풀필먼트서비스 CFS 출고 현장에서 관리자 없이 혼자 상온 챔버 마감을 책임지던 날 전산 서버가 마비되었다 — 복구를 기다리는 대신 지금 할 수 있는 일의 우선순위부터 정해 두 번의 마감을 모두 지켰다. 시스템이 멈춰도 현장은 멈추지 않는다는 감각을 개발에도 그대로 적용한다.",
  },
  {
    emoji: "🔍",
    title: "근본 원인 분석",
    desc: "설정 키 하나에 기본값이 없던 것이 원인이 되어, 배포는 성공인데 프로덕션 API 전체가 3시간 9분 동안 502 에러로 중단된 장애 사고를 커밋 로그·코드 diff만으로 원인부터 추적해 해결.",
  },
  {
    emoji: "🛡️",
    title: "재발 방지 설계",
    desc: "인증 크래시를 진입점 하나만 막고 끝냈다가 20일 뒤 다른 경로로 재발 — 19개 엔드포인트를 전수 확인한 뒤 전역 처리로 일반화해 같은 유형이 다시 새지 않게 막았다.",
  },
  {
    emoji: "🗄️",
    title: "DB & 아키텍처",
    desc: "서로 다른 프레임워크(Django/Spring)가 하나의 DB를 안전하게 공유하도록 소유권 경계를 설계하고, 라이선스 비용 없이 동일 인스턴스를 두 백엔드가 공유하는 구조로 프로덕션까지 안정적으로 운영. Oracle → MySQL 전환 과정의 기술적 차이(네이밍, 문법, 드라이버)도 원인부터 파악해 해결.",
  },
];

// Home의 진입 애니메이션(.animate-in, 순서대로 살짝 떠오르며 등장)과 같은 계단식 딜레이
const STEP = 80;

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
      <section className="animate-in card p-14" style={{ animationDelay: "0ms" }}>
        <h1 className="text-4xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          About
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-accent)" }}>
          쿠팡풀필먼트서비스 CFS 출고 현장 PS(problem solver - 출고 문제 해결 업무) 1년 7개월 → 웹 개발자 전환
        </p>
        <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--color-muted)" }}>
          WMS 기반 출고 문제 해결을 현장에서 직접 맡으며, 전산 장애가 현장에 미치는 파급을
          몸으로 겪었습니다. 관리자 없이 혼자 마감을 책임지던 날 전산 서버가 마비되었을 때도
          복구를 기다리는 대신 지금 할 수 있는 일의 우선순위부터 정해 마감을 지켰던 경험이,
          지금 "장애가 나면 증상보다 근본 원인을 먼저 찾는" 개발 습관의 출발점입니다.
          현장에서 전산 데이터 흐름만 보고도 앞으로 생길 문제를 예측하던 습관은 개발에서도
          그대로 이어집니다 — 커밋 로그와 코드 diff, 작업일지를 근거로 원인을 좁히고,
          문제 하나를 고치는 데 그치지 않고 같은 유형이 재발하지 않도록 코드·배포
          파이프라인·팀 컨벤션까지 손을 댑니다.
        </p>
      </section>

      <section className="animate-in card p-10" style={{ animationDelay: `${STEP}ms` }}>
        <h2 className="text-lg font-semibold">핵심 역량</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STRENGTHS.map((s, i) => (
            <div
              key={s.title}
              className="animate-in rounded-2xl p-5"
              style={{ background: "var(--color-bg)", animationDelay: `${STEP * 2 + i * STEP}ms` }}
            >
              <div className="text-2xl">{s.emoji}</div>
              <p className="mt-2 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <h2
        className="animate-in text-lg font-semibold px-2"
        style={{ animationDelay: `${STEP * 2 + STRENGTHS.length * STEP}ms` }}
      >
        Stack
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {STACK_GROUPS.map((g, i) => (
          <section
            key={g.category}
            className="animate-in card p-6"
            style={{ animationDelay: `${STEP * 3 + STRENGTHS.length * STEP + i * STEP}ms` }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
              {g.category}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {g.items.map((s) => (
                <img key={s} src={badgeSrc(s)} alt={badgeLabel(s)} height={20} />
              ))}
              {g.category === "Tools" && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-xs pr-2 pl-1.5 text-white"
                  style={{ background: "#00C4CC", height: 20, fontSize: 11, fontWeight: 700 }}
                >
                  <img src={canvaIcon} alt="" width={14} height={14} className="rounded-full" />
                  Canva
                </span>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
