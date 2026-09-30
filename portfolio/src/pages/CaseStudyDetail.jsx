import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCaseStudyBySlug } from "../lib/markdown.js";
import systemArchitecture from "../assets/diagrams/system-architecture.svg";
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
          <span>시스템 아키텍처 — Spring Boot API · Django 관리자 · MySQL · Redis</span>
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
            alt="집다움 시스템 아키텍처: React는 Spring Boot 전체 API와 통신하고, Spring Boot가 회원 인증·JWT, 공유 MySQL, Redis 상품 캐시와 외부 서비스를 처리합니다. Django는 별도의 관리자 화면과 DB 마이그레이션을 담당합니다."
            width="1440"
            height="1160"
            className="mt-4 w-full rounded-2xl border cursor-zoom-in"
            style={{ borderColor: "var(--color-line)" }}
            loading="lazy"
          />
        </a>
        <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
          2026.09.30 구조 기준 · 이미지를 클릭하면 원본을 확대할 수 있습니다.
        </p>
      </details>

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
