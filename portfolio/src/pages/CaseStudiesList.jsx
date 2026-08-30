import { Link } from "react-router-dom";
import { getAllCaseStudies } from "../lib/markdown.js";

export default function CaseStudiesList() {
  const items = getAllCaseStudies();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-medium tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
        Case Studies
      </h1>
      <p className="mt-3" style={{ color: "var(--color-muted)" }}>
        운영 장애·원인 분석·재발 방지 중심으로 정리했습니다. (도메인/경로/커밋 해시는 일부 마스킹)
      </p>

      <div className="mt-8 space-y-4">
        {items.map((x) => (
          <Link
            key={x.slug}
            to={`/case-studies/${x.slug}`}
            className="card block p-6 hover:-translate-y-0.5 transition-transform"
          >
            <p className="text-center text-sm font-semibold tracking-wide" style={{ color: "#000" }}>
              집다움 프로젝트
            </p>

            {x.meta.role.length > 0 && (
              <span className="mt-1 tag text-[11px]">{x.meta.role.join(" / ")}</span>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
