import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCaseStudyBySlug } from "../lib/markdown.js";
import systemArchitecture from "../../image/시스템 아키텍처 다이어그램.png";
import paymentFlow from "../assets/diagrams/payment-flow.svg";
import coreErd from "../../image/집다움 ERD - 핵심 구성.png";
import Redirect302Incident from "../components/Redirect302Incident.jsx";

// "3. 인증 크래시..." 절만 마크다운 대신 Redirect302Incident 컴포넌트로 교체 —
// 이 문서(jipdaum-incident-review)에서만 쓰는 상세판이라 슬러그로만 분기한다.
const SECTION3_START = "## 3. 인증 크래시 버그가 20일 뒤 다른 경로로 재발";
const SECTION3_END = "## 그 외 트러블슈팅";

function splitAroundSection3(content) {
  const start = content.indexOf(SECTION3_START);
  const end = content.indexOf(SECTION3_END);
  if (start === -1 || end === -1) return null;
  return { before: content.slice(0, start), after: content.slice(end) };
}

// "2026-08-30" → "2026.08.30" (YYYY-MM 형태도 그대로 동작)
const dot = (d) => d.replaceAll("-", ".");

// 상단 날짜 한 줄: 기간이 있으면 기간만(단일일이면 하루만) 보여주고,
// meta.date와 중복 표기하지 않는다.
function formatDateLine(meta) {
  const { start, end } = meta.period ?? {};
  if (start && end) return start === end ? dot(start) : `${dot(start)} ~ ${dot(end)}`;
  return meta.date ? dot(meta.date) : "";
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const item = getCaseStudyBySlug(slug);
  const split = slug === "jipdaum-incident-review" && item ? splitAroundSection3(item.content) : null;

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p>Not found</p>
        <Link className="underline" to="/case-studies" viewTransition>
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link className="text-sm underline" style={{ color: "var(--color-muted)" }} to="/case-studies" viewTransition>
        ← Case Studies
      </Link>

      <header className="animate-in card mt-4 p-8" style={{ animationDelay: "0ms" }}>
        <p className="text-xs" style={{ color: "var(--color-accent)" }}>{formatDateLine(item.meta)}</p>

        <h1 className="mt-2 text-2xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          {item.meta.title}
        </h1>

        <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
          👤 1인 개발 — 기획 · 개발 · 배포 전담
        </p>

        {item.meta.highlights?.length ? (
          <ul className="mt-4 list-disc pl-5 space-y-1" style={{ color: "var(--color-ink)" }}>
            {item.meta.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : null}

        {item.meta.stack?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.meta.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <details className="animate-in card group mt-6 p-6" style={{ animationDelay: "80ms" }}>
        <summary
          className="flex list-none cursor-pointer items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] [&::-webkit-details-marker]:hidden"
          style={{ background: "var(--color-accent-soft)" }}
        >
          <span aria-hidden="true">🗂</span>
          <span>집다움 시스템 아키텍처 다이어그램</span>
          <span
            aria-hidden="true"
            className="ml-auto text-xs text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-180"
          >
            ▼
          </span>
        </summary>
        <a href={systemArchitecture} target="_blank" rel="noopener noreferrer" title="새 탭에서 원본 크기로 보기">
          <img
            src={systemArchitecture}
            alt="집다움 시스템 아키텍처 원본 다이어그램: React, Django, Spring Boot, 공유 MySQL, Redis 및 외부 서비스 연결. 이미지의 인증 분담과 JWT 공유 표기는 아래 현재 구현 설명을 참고하세요."
            width="3008"
            height="1697"
            className="mt-4 w-full rounded-2xl border cursor-zoom-in"
            style={{ borderColor: "var(--color-line)" }}
            loading="lazy"
          />
        </a>
        <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
          이미지를 클릭하면 원본을 확대할 수 있습니다. 현재 구현에서는 회원 인증·전체 API·JWT를 Spring Boot가 담당하며,
          Django는 관리자 전용입니다. 이미지의 인증 분담·JWT 키 공유 표기는 현재 구현과 다릅니다.
        </p>
      </details>

      {slug === "jipdaum-db-architecture" && (
        <section className="card mt-6 p-6" aria-labelledby="core-erd-title">
          <h2 id="core-erd-title" className="text-lg font-semibold">집다움 ERD · 핵심 구성</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
            상품, 주문·결제, 회원·인증, 쿠폰의 주요 관계를 정리한 요약 ERD입니다.
            도메인 이해를 위해 테이블명과 컬럼을 간략히 표시했으며, 전체 물리 스키마와 시스템 테이블은 생략했습니다.
          </p>
          <figure className="mt-4">
            <a href={coreErd} target="_blank" rel="noreferrer" aria-label="집다움 핵심 ERD 원본 열기">
              <img src={coreErd} alt="집다움 핵심 ERD: 상품·카테고리·옵션·리뷰·찜, 장바구니·주문·주문항목·결제·문의, 회원·인증, 쿠폰·회원쿠폰의 기본키와 외래키 관계." width="2642" height="1650" loading="lazy" className="w-full rounded-2xl" />
            </a>
            <figcaption className="mt-3 flex flex-wrap gap-4 text-sm">
              <a href={coreErd} target="_blank" rel="noreferrer" className="underline">ERD 크게 보기 ↗</a>
              <a href={coreErd} download className="underline">ERD 다운로드</a>
            </figcaption>
          </figure>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li><strong>주문 내역 보존:</strong> 주문항목의 ordered_price에 주문 당시 단가를 저장해 상품 가격 변경과 분리했습니다.</li>
            <li><strong>주문·결제 분리:</strong> 주문 하나에 결제 레코드는 최대 하나입니다. 결제 준비 전이나 0원 주문은 결제 레코드가 없을 수 있습니다.</li>
            <li><strong>공유 DB:</strong> Django 관리자와 Spring Boot API가 같은 MySQL 데이터를 사용합니다. 스키마 관리 범위와 예외는 아래 설계 기록에서 설명합니다.</li>
          </ul>
        </section>
      )}

      {slug === "jipdaum-payment-consistency" && (
        <section className="card mt-6 p-6" aria-labelledby="payment-flow-title">
          <h2 id="payment-flow-title" className="text-lg font-semibold">집다움 결제 흐름</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
            주문 생성 시 옵션 재고를 예약하고, PortOne 서버 조회로 결제 상태와 금액을 검증합니다.
            0원 주문·중복 검증·취소 경계와 아직 구현하지 않은 자동 복구 과제를 함께 표시했습니다.
          </p>
          <a href={paymentFlow} target="_blank" rel="noreferrer" aria-label="집다움 결제 흐름도 원본 열기">
            <img src={paymentFlow} alt="주문 생성과 재고 예약, 0원 주문 분기, PortOne 결제, 서버 검증, 주문 확정 흐름. 결제 준비 전 취소는 재고·쿠폰을 복구하며 웹훅·환불·자동 만료는 미구현입니다." width="1440" height="1240" loading="lazy" className="mt-4 w-full rounded-2xl" />
          </a>
          <a href={paymentFlow} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm underline">흐름도 크게 보기 ↗</a>
        </section>
      )}

      <article className="animate-in card markdown mt-6 p-8" style={{ animationDelay: "160ms" }}>
        {split ? (
          <>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{split.before}</ReactMarkdown>
            <Redirect302Incident />
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{split.after}</ReactMarkdown>
          </>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
        )}
      </article>
    </div>
  );
}
