import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCaseStudyBySlug } from "../lib/markdown.js";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const item = getCaseStudyBySlug(slug);

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p>Not found</p>
        <Link className="underline" to="/case-studies">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link className="text-sm underline" style={{ color: "var(--color-muted)" }} to="/case-studies">
        ← Case Studies
      </Link>

      <header className="card mt-4 p-8">
        <p className="text-xs" style={{ color: "var(--color-accent)" }}>
          {item.meta.date}
          {item.meta.period?.start && item.meta.period?.end
            ? ` · ${item.meta.period.start} ~ ${item.meta.period.end}`
            : ""}
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
          {item.meta.title}
        </h1>

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

      <article className="card markdown mt-6 p-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
      </article>
    </div>
  );
}
