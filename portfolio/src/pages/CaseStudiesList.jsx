import { Link } from "react-router-dom";
import { getAllCaseStudies } from "../lib/markdown.js";

export default function CaseStudiesList() {
  const items = getAllCaseStudies();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
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
            <p className="text-xs" style={{ color: "var(--color-accent)" }}>
              {x.meta.date}
              {x.meta.period?.start && x.meta.period?.end
                ? ` · ${x.meta.period.start} ~ ${x.meta.period.end}`
                : ""}
            </p>

            <p className="mt-1 text-lg font-semibold">{x.meta.title}</p>

            {x.meta.summary ? (
              <p className="mt-2" style={{ color: "var(--color-muted)" }}>
                {x.meta.summary}
              </p>
            ) : null}

            {x.meta.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {x.meta.tags.slice(0, 8).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
