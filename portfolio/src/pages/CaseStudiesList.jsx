import { Link } from "react-router-dom";
import { getAllCaseStudies } from "../lib/markdown.js";

// 역할이 3개 이상이면 배지가 길어지므로 압축 표기 (1,2번 카드의 짧은 배지와 대칭)
const roleBadge = (role) => (role.length >= 3 ? "Full-Stack / DevOps" : role.join(" / "));

// Home의 진입 애니메이션(.animate-in, 순서대로 살짝 떠오르며 등장)과 같은 계단식 딜레이
const STEP = 80;

export default function CaseStudiesList() {
  const items = getAllCaseStudies();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1
        className="animate-in text-2xl font-medium tracking-tight"
        style={{ fontFamily: "var(--font-serif)", animationDelay: "0ms" }}
      >
        Case Studies
      </h1>
      <p className="animate-in mt-3" style={{ color: "var(--color-muted)", animationDelay: `${STEP}ms` }}>
        1차 3인 팀 프로젝트에서 백엔드를 맡은 뒤, 2·3차 개인 고도화에서 겪은 설계 결정·장애 대응·검증 과정을 정리했습니다.
        (도메인/경로/커밋 해시는 일부 마스킹)
      </p>

      <section className="card mt-6 p-6" aria-labelledby="evidence-scope-title">
        <h2 id="evidence-scope-title" className="text-lg font-semibold">프로젝트 범위와 검증 기준</h2>
        <dl className="mt-4 space-y-4 text-sm leading-relaxed">
          <div>
            <dt className="font-semibold">공개 배포한 프로젝트의 개발·운영 경험</dt>
            <dd className="mt-1" style={{ color: "var(--color-muted)" }}>
              인증·상품·주문·결제 API 구현과 배포 후 장애 대응을 기록했습니다.
              실제 이용자 수·주문량·동시 접속 규모는 이 포트폴리오의 검증 지표에 포함하지 않았습니다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">관측값과 코드 변경을 구분한 성능 기록</dt>
            <dd className="mt-1" style={{ color: "var(--color-muted)" }}>
              <Link to="/case-studies/jipdaum-redis-product-cache" className="underline">Redis의 534ms·28ms</Link>는 캐시 미스·히트 응답 관측값이며,
              반복 측정과 부하 조건을 갖춘 벤치마크는 후속 과제입니다.{" "}
              <Link to="/case-studies/jipdaum-chatbot-latency" className="underline">챗봇 호출 상한 변경</Link>은 구현했고, 변경 후 응답시간은 재측정 과제로 남겼습니다.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">구현·검증 기록과 후속 과제</dt>
            <dd className="mt-1" style={{ color: "var(--color-muted)" }}>
              <Link to="/case-studies/jipdaum-payment-consistency" className="underline">주문·결제 정합성 보완</Link>과 테스트 결과를 기록하고,
              웹훅·환불 등 남은 범위를 함께 명시했습니다.{" "}
              <Link to="/case-studies/jipdaum-incident-review" className="underline">장애 대응 사례</Link>도 코드 수정과 자동 재발 방지 검증을 구분합니다.
              각 상태는 사례에 적힌 기록 시점을 기준으로 합니다.
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 space-y-4">
        {items.map((x, i) => (
          <Link
            key={x.slug}
            to={`/case-studies/${x.slug}`}
            viewTransition
            className="animate-in card block p-6 hover:-translate-y-0.5 transition-transform"
            style={{ animationDelay: `${STEP * 2 + i * STEP}ms` }}
          >
            <p className="text-center text-sm font-semibold tracking-wide" style={{ color: "#000" }}>
              집다움 프로젝트
            </p>

            {x.meta.role.length > 0 && (
              <span className="mt-1 tag text-[11px]">{roleBadge(x.meta.role)}</span>
            )}

            <p className="mt-2 text-lg font-semibold">{x.meta.title}</p>
            {x.meta.summary && (
              <p className="mt-1 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--color-muted)" }}>
                {x.meta.summary}
              </p>
            )}

            {x.meta.stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {x.meta.stack.map((s) => (
                  <span key={s} className="tag text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {x.meta.highlights[0] && (
              <p className="mt-3 text-sm leading-relaxed">💡 {x.meta.highlights[0]}</p>
            )}

            <p className="mt-4 text-right text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
              자세히 보기 →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
