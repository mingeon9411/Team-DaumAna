import ImageZoomLink from "../components/ImageZoomLink.jsx";
import { useEffect } from "react";
import firstLog from "../../image/집다움 프로젝트 1차 작업일지.png";
import secondLog from "../../image/집다움 2차 프로젝트 작업일지.png";
import thirdLog from "../../image/집다움 프로젝트 3차 작업일지.png";

const LOGS = [
  { id: "phase-1", title: "1차 작업일지", period: "2026.05.28–06.11", summary: "Oracle DB와 Django 기반 구축, 모델·API 설계, 회원가입과 소셜 로그인 연동을 기록했습니다.", image: firstLog, height: 3886 },
  { id: "phase-2", title: "2차 작업일지", period: "2026.06.26–08.21", summary: "React 화면 개발과 Spring Boot API 이관, MySQL 전환, 주문·결제 연동, AI 챗봇 도입 과정을 기록했습니다.", image: secondLog, height: 6252 },
  { id: "phase-3", title: "3차 작업일지", period: "2026.08.22–09.09", summary: "Cloudflare Pages 이관, 운영 장애 대응, Redis 캐시, 룩북·고객 기능 개선과 서비스 안정화 과정을 기록했습니다.", image: thirdLog, height: 4752 },
];

export default function WorkLogs() {
  useEffect(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
      <header className="card p-6 sm:p-10">
        <p className="text-xs tracking-widest" style={{ color: "var(--color-muted)" }}>JIPDAUM · WORK LOGS</p>
        <h1 className="mt-2 text-3xl font-medium">집다움 작업일지</h1>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          초기 구축부터 서비스 고도화까지, 1·2·3차 개발 과정을 날짜별로 정리했습니다.
          각 이미지는 작성 당시의 기술 구성과 작업 내역을 담고 있습니다.
          현재는 MySQL을 사용하며, API는 Spring Boot가, 관리자 화면은 Django가 담당합니다.
        </p>
        <nav aria-label="차수별 작업일지 바로가기" className="mt-5 flex flex-wrap gap-2">
          {LOGS.map((log) => <a key={log.id} href={`#${log.id}`} className="tag px-4 py-2">{log.title}</a>)}
        </nav>
      </header>
      {LOGS.map((log) => (
        <section key={log.id} id={log.id} aria-labelledby={`${log.id}-title`} className="card scroll-mt-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`${log.id}-title`} className="text-xl font-semibold">{log.title}</h2>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{log.period}</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{log.summary}</p>
          <figure className="mt-5">
            <ImageZoomLink href={log.image} target="_blank" rel="noreferrer" aria-label={`${log.title} 이미지 원본 열기`}>
              <img src={log.image} alt={`집다움 ${log.title}, ${log.period}. ${log.summary}`} width="5120" height={log.height} loading="lazy" className="w-full rounded-2xl" />
            </ImageZoomLink>
            <figcaption className="mt-3 flex flex-wrap gap-4 text-sm">
              <ImageZoomLink href={log.image} target="_blank" rel="noreferrer" className="underline">확대해서 보기</ImageZoomLink>
            </figcaption>
          </figure>
        </section>
      ))}
    </div>
  );
}
