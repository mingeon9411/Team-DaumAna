// "3. 인증 크래시 버그가 20일 뒤 다른 경로로 재발" 섹션의 상세판 —
// jipdaum-incident-review.md의 해당 마크다운 절을 대체해 CaseStudyDetail.jsx가 끼워 넣는다.
// 이 문서 하나에만 쓰는 구성이라 재사용 컴포넌트로 분리하지 않고 파일 하나에 데이터+렌더를 같이 둠.

const GOOD = "#16a34a";
const WARN = "#d97706";
const BAD = "#dc2626";

const STATS = [
  {
    value: "3 → 5",
    label: "GlobalExceptionHandler가 처리하는 예외 타입 수",
    highlight: "GlobalExceptionHandler가",
  },
  { value: "19 → 0", label: "302 경로에 노출됐던 @Valid 엔드포인트 (11개 파일)" },
  { value: "3주", label: "1차 수정 → 재발까지 걸린 기간" },
  { value: "0 → 0", label: "문서 작성 당시 이 경로의 회귀 테스트 수" },
];

const INCIDENTS = [
  {
    badge: "1차 · 8/7",
    tone: { bg: "#fde8d7", fg: "#b45309" },
    title: "미인증 요청이 로그인 HTML을 200으로 받음",
    commit: "2b2d579",
    rows: [
      ["증상", "토큰 만료 후 마이페이지 진입 시, 401 대신 로그인 HTML을 받아 프론트가 크래시(배열 아닌 값에 .filter())."],
      ["원인", 'oauth2Login()의 기본 AuthenticationEntryPoint — "인증이 아예 안 된 요청" 진입점 하나.'],
      ["해결", "RestAuthenticationEntryPoint 신설, defaultAuthenticationEntryPointFor로 /api/**만 401 JSON 강제."],
      ["한계", '"인증됨 + 컨트롤러 안 예외"는 완전히 다른 코드 경로(GlobalExceptionHandler)라 이때는 손대지 못함 — 3주 뒤 그대로 재발.'],
    ],
    code: {
      file: "SecurityConfig.java",
      body: `.exceptionHandling(exceptions -> exceptions.defaultAuthenticationEntryPointFor(
        restAuthenticationEntryPoint, new AntPathRequestMatcher("/api/**")))`,
    },
  },
  {
    badge: "재발 · 8/27",
    tone: { bg: "#fce7f3", fg: "#be185d" },
    title: "@Valid 실패·미처리 예외가 같은 302를 다시 냄",
    commit: "90b0ef2",
    rows: [
      ["발견", '백엔드 검수 중 GlobalExceptionHandler를 열어보니, "여기 안 걸리면 302 난다"는 주석이 이미 있는데 그 주석이 경고하는 두 케이스는 핸들러가 없었음.'],
      ["범위", "grep으로 @Valid 사용처 전수 확인 — 회원가입/로그인/장바구니/주문/결제 등 11개 파일, 19개 엔드포인트가 노출."],
      ["재발 이유", '1차 수정은 "미인증" 진입점만 막았을 뿐, "인증 후 컨트롤러 예외"가 별개 경로라는 걸 그때는 일반화하지 못함.'],
      ["해결", "MethodArgumentNotValidException → 필드별 에러, 그 외 모든 Exception → 500 JSON(스택트레이스는 서버 로그로만)."],
    ],
    code: {
      file: "GlobalExceptionHandler.java",
      body: `@ExceptionHandler(Exception.class)
public ResponseEntity<?> handleUnexpected(Exception e) {
    log.error("처리되지 않은 예외", e);   // 클라이언트엔 원인 미노출
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponse("서버 오류가 발생했습니다."));
}`,
    },
  },
];

const TRADEOFFS = [
  {
    q: "진입점을 어디까지 덮을 것인가",
    rejected: "authenticationEntryPoint() 전체 교체",
    chosen: "defaultAuthenticationEntryPointFor + /api/** 매처",
    why: "전체를 401 JSON으로 덮으면 코드는 짧지만, oauth2Login()이 등록하는 자기 진입점(콜백 등 실제 302가 필요한 논-API 플로우)까지 같이 사라져 소셜 로그인 자체가 깨진다. 매처로 범위를 좁히는 쪽이 몇 줄 더 들어도 두 요구를 동시에 만족한다.",
  },
  {
    q: "@Valid 에러를 어떤 모양으로 내려줄 것인가",
    rejected: "더 풍부한 신규 에러 포맷 설계",
    chosen: "기존 FieldValidationException과 동일 관례 재사용",
    why: "새 포맷이 이론적으로는 낫지만, 프론트(Register.jsx)가 이미 err.response.data.<field>로 읽는 관례에 맞춰져 있다. 백엔드만 새 모양을 내리면 프론트도 같이 고쳐야 해 이번 수정 범위를 벗어난다.",
  },
  {
    q: "미처리 예외를 어떻게 다룰 것인가",
    rejected: "스택트레이스를 응답에 그대로 노출",
    chosen: "500 JSON 응답 + 스택트레이스는 서버 로그로만",
    why: '"그대로 둔다"는 이번 사건 자체와 같다(무대응 = 302). 감싸되 클라이언트엔 원인을 노출하지 않아 정보 노출을 막으면서도 서버 로그에는 전체 스택트레이스를 남겨 디버깅 가능성은 유지했다.',
  },
];

const METRICS_HEAD = ["지표", "수정 전", "1차 후 (8/7)", "2차 후 (8/27)"];
const METRICS_ROWS = [
  ["처리하는 예외 타입 수", "3", "3", { t: "5 (+67%)", tone: GOOD }],
  ["302로 새는 미인증 경로", "/api/** 전체", { t: "0", tone: GOOD }, { t: "0", tone: GOOD }],
  ['302로 새는 "인증 후 예외" 경로', "/api/** 전체", { t: "/api/** 전체", tone: WARN }, { t: "0", tone: GOOD }],
  ["노출됐던 @Valid 엔드포인트", "19개 (11파일)", { t: "19개", tone: WARN }, { t: "0", tone: GOOD }],
  ["재발까지 걸린 기간", "–", "3주 (8/7 → 8/27)", ""],
  ["이 경로를 커버하는 회귀 테스트", "0", "0", { t: "0", tone: WARN }],
];

const POSTMORTEM_DONE = [
  ["코드", "미인증(8/7) + 컨트롤러 예외(8/27) 두 경로 모두 JSON 응답으로 막음."],
  [
    "프로세스",
    'CLAUDE.md에 "백엔드 변경 시 자체 검수 체크리스트" 신설: 새 예외 타입을 던지면 GlobalExceptionHandler에 걸리는지 확인을 명문화. 코드 수정 1건이 아니라 재발 자체를 막는 절차로 대응을 넓힘.',
  ],
  [
    "문서",
    '각 핸들러 위에 "여기 안 걸리면 왜 302가 나는지"를 설명하는 주석을 남김. 실제로 1차 수정 때 남긴 이 주석이 검수 중 2차 수정을 촉발한 단서였다.',
  ],
];
const POSTMORTEM_OPEN = [
  [
    "회귀 테스트 부재",
    "2026-08-31 확인 당시 GlobalExceptionHandler를 겨냥한 테스트는 0개였다(당시 security 테스트는 JwtTokenProviderTest 하나). 코드에서 처리 경로를 확인했지만, 핸들러 순서나 우선순위 변경에 따른 회귀를 자동으로 검증하지는 못했다.",
  ],
  [
    "제안",
    "MockMvc 세 케이스만 고정해도 회귀는 잡힌다: 미인증 /api/** 요청이 302가 아님 · @Valid 실패가 {필드: 메시지}를 반환함 · 임의 RuntimeException이 302가 아닌 500 JSON을 반환함.",
  ],
];

function SectionLabel({ n, title, sub }) {
  return (
    <div className="mt-10 flex items-baseline justify-between gap-4">
      <h2 className="flex items-baseline gap-2 text-xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        <span className="text-xs font-mono" style={{ color: "var(--color-muted)" }}>
          {n}
        </span>
        {title}
      </h2>
      {sub && (
        <span className="whitespace-nowrap text-xs" style={{ color: "var(--color-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function FlowRow({ tag, tone, result }) {
  const box = "rounded-xl border px-3 py-2 text-xs";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs font-mono" style={{ color: "var(--color-muted)" }}>
        {tag}
      </span>
      <span className={box} style={{ borderColor: "var(--color-line)", background: "var(--color-bg)" }}>
        axios GET /api/**
      </span>
      <span style={{ color: "var(--color-muted)" }}>→</span>
      <span className={box} style={{ borderColor: "var(--color-line)", background: "var(--color-bg)" }}>
        인증 실패 또는 컨트롤러 예외
      </span>
      <span style={{ color: "var(--color-muted)" }}>→</span>
      <span
        className={`${box} font-semibold`}
        style={
          tone === "bad"
            ? { borderColor: BAD, background: "#fee2e2", color: BAD }
            : { borderColor: GOOD, background: "#dcfce7", color: GOOD }
        }
      >
        {result}
      </span>
    </div>
  );
}

export default function Redirect302Incident() {
  return (
    <div>
      <h2 className="mt-10 text-xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        3. 302 리다이렉트 사건
      </h2>
      <p className="mt-2 leading-relaxed" style={{ color: "var(--color-muted)" }}>
        axios가 로그인 페이지의 302를 따라가 JSON 대신 HTML을 받고 크래시하던 문제 — 같은
        메커니즘이 3주 간격을 두고 두 번, 서로 다른 코드 경로에서 재발했다.
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
        1차 <b style={{ color: "var(--color-ink)" }}>2026-08-07 · 2b2d579</b> &nbsp;·&nbsp; 재발{" "}
        <b style={{ color: "var(--color-ink)" }}>2026-08-27 · 90b0ef2</b> &nbsp;·&nbsp; 영역{" "}
        <b style={{ color: "var(--color-ink)" }}>Spring Security · GlobalExceptionHandler</b>
      </p>

      {/* 스탯 카드 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--color-ink)" }}>
              {s.value}
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {s.highlight ? (
                <>
                  <mark className="rounded px-0.5" style={{ background: "var(--color-accent-soft)", color: "var(--color-ink)" }}>
                    {s.highlight}
                  </mark>
                  {s.label.slice(s.highlight.length)}
                </>
              ) : (
                s.label
              )}
            </p>
          </div>
        ))}
      </div>

      {/* 플로우 다이어그램 */}
      <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: "var(--color-line)" }}>
        <p className="text-sm font-semibold">요청이 302로 새는 경로 — 수정 전 / 후</p>
        <div className="mt-4 space-y-3">
          <FlowRow tag="BEFORE" tone="bad" result="302 → /login (HTML)" />
          <FlowRow tag="AFTER" tone="good" result="401/400/500 (JSON)" />
        </div>
      </div>

      {/* 01 Troubleshooting */}
      <SectionLabel n="01" title="Troubleshooting" sub="증상 → 원인 → 해결" />
      <p className="mt-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
        oauth2Login()의 기본 미인증 처리기는 /login으로 302를 준다. Boot가 처리 안 된 예외를
        /error로 포워드해도 그 요청은 SecurityConfig의 anyRequest().authenticated()에 다시
        걸려 같은 302를 받는다. axios/fetch는 302를 그대로 따라가므로, JSON을 기대하던
        호출부가 로그인 HTML을 파싱하려다 죽는다 — 이 하나의 메커니즘이 서로 다른 두
        진입점에서 두 번 문제를 냈다.
      </p>

      <div className="mt-4 space-y-4">
        {INCIDENTS.map((inc) => (
          <div key={inc.commit} className="rounded-2xl border p-5" style={{ borderColor: "var(--color-line)" }}>
            <div className="flex items-center gap-3">
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: inc.tone.bg, color: inc.tone.fg }}>
                {inc.badge}
              </span>
              <p className="font-semibold">{inc.title}</p>
              <span className="ml-auto font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                {inc.commit}
              </span>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              {inc.rows.map(([label, text]) => (
                <div key={label} className="grid grid-cols-[5rem_1fr] gap-3">
                  <dt style={{ color: "var(--color-muted)" }}>{label}</dt>
                  <dd className="leading-relaxed">{text}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 overflow-x-auto rounded-2xl p-4 text-sm leading-relaxed" style={{ background: "#1e1b2e", color: "#e2e0f0" }}>
              <p className="mb-2 text-xs" style={{ color: "#a9a4c4" }}>
                // {inc.code.file}
              </p>
              <pre className="whitespace-pre-wrap">{inc.code.body}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* 02 Trade-off */}
      <SectionLabel n="02" title="Trade-off" sub="왜 이 방식인가" />
      <div className="mt-4 space-y-4">
        {TRADEOFFS.map((t) => (
          <div key={t.q} className="rounded-2xl border p-5" style={{ borderColor: "var(--color-line)" }}>
            <p className="font-semibold">{t.q}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed p-3 text-sm" style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
                  기각
                </p>
                <p className="mt-1">{t.rejected}</p>
              </div>
              <div className="rounded-xl border p-3 text-sm" style={{ borderColor: GOOD, background: "#dcfce7" }}>
                <p className="text-xs font-semibold" style={{ color: GOOD }}>
                  채택
                </p>
                <p className="mt-1" style={{ color: "#14532d" }}>
                  {t.chosen}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {t.why}
            </p>
          </div>
        ))}
      </div>

      {/* 03 Metrics */}
      <SectionLabel n="03" title="Metrics" sub="코드 점검 기준" />
      <div className="mt-4 overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--color-line)" }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ background: "var(--color-accent-soft)" }}>
              {METRICS_HEAD.map((h, i) => (
                <th key={h} className={`border-b px-4 py-3 font-semibold ${i === 0 ? "text-left" : "text-right"}`} style={{ borderColor: "var(--color-line)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS_ROWS.map((row) => (
              <tr key={row[0]}>
                <td className="border-b px-4 py-3" style={{ borderColor: "var(--color-line)" }}>
                  {row[0]}
                </td>
                {row.slice(1).map((cell, i) => {
                  const isObj = cell && typeof cell === "object";
                  return (
                    <td
                      key={i}
                      className="border-b px-4 py-3 text-right font-mono"
                      style={{ borderColor: "var(--color-line)", color: isObj ? cell.tone : "var(--color-ink)" }}
                    >
                      {isObj ? cell.t : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        예외 타입 수와 처리 경로는 코드 점검 결과이며, 실제 HTTP 요청을 전수 실행한 통계는 아닙니다.
        테스트 수는 이 문서 작성 시점(2026-08-31) src/test 확인 기준입니다.
      </p>

      {/* 04 Post-mortem */}
      <SectionLabel n="04" title="Post-mortem" sub="반영된 것 / 남은 것" />
      <div className="mt-4 space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: GOOD }} />
          문서 작성 당시 반영한 조치
        </p>
        {POSTMORTEM_DONE.map(([label, text]) => (
          <div key={label} className="rounded-xl border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: GOOD, background: "var(--color-bg)" }}>
            <b>{label}</b> — {text}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: WARN }} />
          문서 작성 당시 남은 검증 과제
        </p>
        {POSTMORTEM_OPEN.map(([label, text]) => (
          <div key={label} className="rounded-xl border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: WARN, background: "#fff7ed" }}>
            <b>{label}</b> — {text}
          </div>
        ))}
      </div>
    </div>
  );
}
