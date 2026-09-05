import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import "./PopularKeywordsSidebar.css";

const PREVIEW_INTERVAL_MS = 2500;

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };

/**
 * @typedef {"new" | "up" | "down" | "same"} KeywordStatus
 *
 * @typedef {Object} KeywordItem
 * @property {number} rank      현재 순위 (1~10)
 * @property {string} keyword   검색어 — Home.jsx의 PRODUCTS 배열 name/sub/label/brand 중
 *                               하나에 실제로 포함되는 문자열이어야 클릭했을 때 진짜 결과가 뜬다.
 * @property {KeywordStatus} status  "new"(최초 진입) | "up"(상승) | "down"(하락) | "same"(변동 없음)
 */

/**
 * 백엔드 연동 전 사용하는 목업 데이터. 오늘의집 같은 타사 실검을 베낀 게 아니라,
 * 실제로 Home.jsx의 PRODUCTS 카탈로그에 있는 상품명 속 문구로만 골랐다 — 그래서
 * 클릭하면 실제 집다움 상품(그 아래 그리드)이 바로 필터링되어 나온다.
 * 실제 서비스로 넘어가면 GET /api/shop/products/popular-keywords 같은 걸로 교체하면 된다.
 * @type {KeywordItem[]} */
export const MOCK_KEYWORDS = [
  { rank: 1, keyword: "북유럽 소파", status: "up" },
  { rank: 2, keyword: "우드 롱 무드등", status: "new" },
  { rank: 3, keyword: "우드 의자", status: "new" },
  { rank: 4, keyword: "피서지 의자", status: "up" },
  { rank: 5, keyword: "북유럽 침대", status: "same" },
  { rank: 6, keyword: "파스텔 문양 침대", status: "new" },
  { rank: 7, keyword: "빨래 바구니", status: "up" },
  { rank: 8, keyword: "러그 B형", status: "down" },
  { rank: 9, keyword: "린넨 빨래 바구니", status: "new" },
  { rank: 10, keyword: "러그 A형", status: "up" },
];

/** @param {{ status: KeywordStatus }} props */
function StatusMark({ status }) {
  if (status === "new") {
    return <span className="text-[11px] font-bold text-rose-500">NEW</span>;
  }
  if (status === "up") {
    return <span className="text-[11px] font-bold text-rose-500">▲</span>;
  }
  if (status === "down") {
    return <span className="text-[11px] font-bold text-blue-500">▼</span>;
  }
  return <span className="text-[11px] font-bold text-muted-foreground">–</span>;
}

/**
 * 순위 목록 자체(제목 없이 항목들만) — 미니바 드롭다운과 SearchOverlay.jsx의
 * 풀스크린 검색 모달이 똑같은 항목 마크업(순위/키워드/상승·하락 표시)을 공유한다.
 * @param {{ data: KeywordItem[], onSelect?: (keyword: string) => void, className?: string }} props
 */
export function PopularKeywordsList({ data, onSelect, className = "" }) {
  return (
    <ol className={`divide-y divide-black/5 dark:divide-white/5 ${className}`}>
      {data.map((item) => (
        <li key={item.keyword}>
          <button
            type="button"
            onClick={() => onSelect?.(item.keyword)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-foreground/5 active:bg-foreground/10"
          >
            <span
              className={`w-4 shrink-0 text-sm font-bold tabular-nums ${
                item.rank <= 3 ? "text-rose-500" : "text-foreground"
              }`}
            >
              {item.rank}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {item.keyword}
            </span>
            <StatusMark status={item.status} />
          </button>
        </li>
      ))}
    </ol>
  );
}

/**
 * 검색창 바로 아래에 항상 붙어있는 인기 검색어 미니바 — 평소엔 1위부터 한 줄씩 자동으로
 * 돌아가며 보여주다가, 누르면 그 아래로 전체 10위까지 펼쳐진다. 펼쳐진 동안엔 티커를 멈춘다.
 *
 * @param {{ data?: KeywordItem[], onSelect?: (keyword: string) => void }} props
 *   onSelect: 검색어 클릭 시 호출 — 상위(Home.jsx)의 setProductSearchQuery를 넘겨주면
 *   페이지 이동 없이 그 자리에서 검색창 값이 채워지고 아래 상품 그리드가 필터링된다.
 */
export default function PopularKeywordsSidebar({ data = MOCK_KEYWORDS, onSelect }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // 미니바 티커 — 펼쳐져 있을 땐(이미 전체 목록이 보이므로) 멈춘다.
  useEffect(() => {
    if (open || data.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % data.length);
    }, PREVIEW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [open, data.length]);

  // 펼쳐진 패널 바깥을 클릭하면 닫기 (Sidebar.jsx 검색 플라이아웃과 같은 패턴)
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (keyword) => {
    setOpen(false);
    onSelect?.(keyword);
  };

  const previewItem = data[index % data.length];
  if (!previewItem) return null;

  return (
    <div className="relative mt-2" ref={wrapRef} style={SANS}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="인기 검색어 전체 순위 보기"
        className="popularKeywordMiniBar flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left transition-colors"
      >
        <Flame size={12} className="shrink-0 text-rose-500" />
        <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">인기</span>

        {open ? (
          <span className="min-w-0 flex-1 text-xs text-foreground">전체 순위 보기</span>
        ) : (
          <span key={previewItem.rank} className="popularKeywordTicker flex min-w-0 flex-1 items-baseline gap-1.5 overflow-hidden">
            <span className="shrink-0 text-xs font-bold tabular-nums text-rose-500">{previewItem.rank}</span>
            <span className="min-w-0 flex-1 truncate text-xs text-foreground">{previewItem.keyword}</span>
            <StatusMark status={previewItem.status} />
          </span>
        )}
      </button>

      {open && (
        <div className="popularKeywordDropdown absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl shadow-lg">
          <div className="border-b border-black/10 px-4 py-2.5 dark:border-white/10">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">
              실시간 인기 검색어
            </span>
          </div>

          <PopularKeywordsList data={data} onSelect={handleSelect} className="py-1" />
        </div>
      )}
    </div>
  );
}
