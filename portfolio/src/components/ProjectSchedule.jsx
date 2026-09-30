import rows from "../data/projectSchedule.json";
import { Link } from "react-router-dom";

const frontRepo = "https://github.com/mingeon9411/Team-DaumAna";
const backRepo = "https://github.com/mingeon9411/jipdaum_Springboot";

export default function ProjectSchedule() {
  return (
    <section className="card p-6 sm:p-8" aria-labelledby="schedule-title">
      <p className="text-xs tracking-widest" style={{ color: "var(--color-muted)" }}>PROJECT TIMELINE · 2026</p>
      <h2 id="schedule-title" className="mt-2 text-xl font-semibold">집다움 개발 일정</h2>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
        두 저장소의 커밋을 바탕으로 정리한 개발 기록입니다.
        날짜는 작업 착수·완료일이 아닌 커밋이 기록된 기간입니다.
      </p>
      <figure className="mt-5">
        <a href="/images/project-schedule.png" target="_blank" rel="noreferrer" aria-label="개발 일정표 이미지 원본 열기">
          <img src="/images/project-schedule.png" alt="집다움 개발 일정표. 기간별 상세 내용과 근거 커밋은 아래 표에서 확인할 수 있습니다." width="1800" height="1510" loading="lazy" className="w-full rounded-2xl" />
        </a>
        <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
          <span>기능 개발 기록: 2026.06.26–09.11 · 저장소 확인: 2026.09.30</span>
          <a href="/images/project-schedule.png" download className="underline">일정표 PNG 다운로드</a>
        </figcaption>
      </figure>
      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-semibold">기간별 상세 내용 · 근거 커밋 보기</summary>
        <div className="markdown mt-3 overflow-x-auto" role="region" aria-label="개발 일정 상세 표" tabIndex={0}>
          <table className="min-w-[720px]">
            <caption className="sr-only">두 저장소의 기간별 개발 내용과 대표 커밋</caption>
            <thead><tr><th scope="col">기간 / 주요 단계</th><th scope="col">Team-DaumAna</th><th scope="col">jipdaum_Springboot</th></tr></thead>
            <tbody>{rows.map((row) => (
              <tr key={row.period}>
                <th scope="row">{row.period}<br />{row.title}</th>
                <td>{row.frontend}{row.frontCommit && <><br /><a href={`${frontRepo}/commit/${row.frontCommit}`} target="_blank" rel="noreferrer">{row.frontCommit} ↗</a></>}</td>
                <td>{row.backend}<br /><a href={`${backRepo}/commit/${row.backCommit}`} target="_blank" rel="noreferrer">{row.backCommit} ↗</a></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </details>
      <Link to="/work-logs" viewTransition className="mt-5 inline-block text-sm font-semibold underline">
        1·2·3차 작업일지 보기 →
      </Link>
      <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        출처: <a className="underline" href={`${frontRepo}/commits/main/`} target="_blank" rel="noreferrer">Team-DaumAna 커밋</a>
        {" · "}<a className="underline" href={`${backRepo}/commits/main/`} target="_blank" rel="noreferrer">jipdaum_Springboot 커밋</a>
        <br />9월 30일 Spring README 정정은 기능 개발 일정에서 제외했습니다.
      </p>
    </section>
  );
}
