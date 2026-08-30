import { Link } from "react-router-dom";

const HIGHLIGHTS = [
  { emoji: "🛠️", title: "Fix", desc: "전면 장애(502) 복구 경험" },
  { emoji: "🐛", title: "Debug", desc: "근거 기반 분석 — 커밋/코드 diff/작업일지" },
  { emoji: "🚀", title: "Ship", desc: "재발 방지까지 설계하고 배포" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <section className="card p-10">
        <p className="text-sm" style={{ color: "var(--color-accent)" }}>
          Backend Engineer
        </p>
        <h1
          className="mt-2 text-4xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          운영 실패를 끝까지 추적해
          <br />
          재발을 막는 개발자
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--color-muted)" }}>
          커밋 로그·코드 diff·작업일지 기반으로 원인을 좁히고, 코드·배포·프로세스 개선으로
          재발 방지까지 연결합니다.
        </p>
        <Link
          to="/case-studies"
          className="mt-6 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--color-accent)" }}
        >
          케이스 스터디 보기 →
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="card p-6 text-center">
            <div className="text-3xl">{h.emoji}</div>
            <p className="mt-3 font-semibold">{h.title}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              {h.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
