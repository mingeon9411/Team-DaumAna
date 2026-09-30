export default function ProjectSchedule() {
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="work-logs-title">
      <h2 id="work-logs-title" className="text-xl font-semibold">집다움 작업일지</h2>
      <nav aria-label="차수별 작업일지 바로가기" className="mt-5 grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((phase) => (
          <a
            key={phase}
            href={`/work-logs#phase-${phase}`}
            className="rounded-2xl px-5 py-4 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ background: "var(--color-accent-soft)" }}
          >
            {phase}차 작업일지 보기 →
          </a>
        ))}
      </nav>
    </section>
  );
}
