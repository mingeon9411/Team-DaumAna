import "./Sidebar.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuChevronsUp,
  LuChevronsDown,
} from "react-icons/lu";
import { useRailStyle } from "../../hooks/useRailStyle";
import { NAV_FLAGS } from "../../utils/navFlags";

// 예전엔 이 파일이 왼쪽에 떠 있던 전체 기능 독(홈/한국관/검색/장바구니/다크모드/
// 로그인 등)을 전부 그리고 있었다. 그 아이콘들은 /settings 페이지의 on/off
// 토글과 헤더(Header.jsx)의 상시 내비게이션으로 이전됐고, 이 컴포넌트는 이제
// "페이지 이동 화살표 독"과 "맨 위로 버튼"만 남아있다 — 왼쪽 독과 별개로 항상
// 화면 하단/우하단에 떠 있던 독립된 조각들이라 그대로 유지한다.
//
// railStyle(독 테두리 프리셋)은 더 이상 이 컴포넌트가 소유하지 않고, 다른
// 구독자(RecentlyViewedSidebar 등)와 마찬가지로 useRailStyle() 훅으로 따라간다
// — 실제 값을 바꾸는 UI는 /settings(Settings.jsx)로 옮겨갔다.
function readFlag(key, fallback = true) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}

function Sidebar() {
  const location = useLocation();
  const { railStyle, styleSwitching } = useRailStyle();
  const isHome = location.pathname === "/";
  const isKoreanHall = location.pathname === "/korean-hall";
  // 한국관 상품 상세(/product/:id)는 /korean-hall과 다른 라우트지만 한국관 전용
  // 카탈로그라, 화살표 독 노출 여부를 판단할 때도 한국관 취급을 받아야 한다.
  const isKoreanHallZone = isKoreanHall || location.pathname.startsWith("/product/");
  // 상품 상세 페이지는 Home의 가로 패널 흐름에 속하지 않는 독립된 페이지라,
  // 한국관과 마찬가지로 "다음/이전 페이지" 같은 패널 이동 버튼이 의미가 없다.
  const isProductDetail = location.pathname.startsWith("/item/") || location.pathname.startsWith("/product/");
  // 고객센터·설정은 가로 패널 흐름 바깥의 독립 페이지라 "이전/다음 패널" 화살표 독이 의미가 없다.
  const isStandalonePage = location.pathname === "/customer-center" || location.pathname === "/settings";

  // /settings에서 켜고 끌 수 있는 표시 여부 — 값이 아예 없으면(기존 사용자) 기본
  // 켬으로 취급해 이전과 동일하게 보인다. "dockvisibilitychange" 이벤트로 즉시 반영.
  const [showArrowDock, setShowArrowDock] = useState(() => readFlag("showArrowDock"));
  const [showTopButton, setShowTopButton] = useState(() => readFlag("showTopButton"));
  useEffect(() => {
    const sync = () => {
      setShowArrowDock(readFlag("showArrowDock"));
      setShowTopButton(readFlag("showTopButton"));
    };
    window.addEventListener("dockvisibilitychange", sync);
    return () => window.removeEventListener("dockvisibilitychange", sync);
  }, []);

  // 다른 페이지(헤더의 "회사 정보" 링크)에서 홈으로 넘어온 경우 — 맨 끝
  // (BusinessInfoPanel)까지 스크롤한다. 이 컴포넌트는 라우트와 무관하게 항상
  // 마운트돼 있어서, 홈 도착을 여기서 계속 지켜볼 수 있다.
  useEffect(() => {
    if (!isHome) return;
    if (!sessionStorage.getItem(NAV_FLAGS.PENDING_SCROLL_TO_END)) return;
    sessionStorage.removeItem(NAV_FLAGS.PENDING_SCROLL_TO_END);
    const timer = setTimeout(() => scrollToBottom(), 200);
    return () => clearTimeout(timer);
  }, [isHome]);

  const triggerPop = (e) => {
    const el = e.currentTarget;
    el.classList.remove("railPop");
    void el.offsetWidth; // 리플로우로 애니메이션 재시작 보장
    el.classList.add("railPop");
  };

  // data-hsnap 패널 목록 중 index번째 패널로 바로 이동 (0-based)
  const scrollToPanel = (index, { immediate = false } = {}) => {
    const target = document.querySelectorAll("[data-hsnap]")[index];
    if (!target) return;
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(target, immediate ? { immediate: true } : undefined);
    } else {
      target.scrollIntoView(immediate ? undefined : { behavior: "smooth" });
    }
  };

  // resize()를 먼저 불러야 하는 이유는 scrollToPanel과 동일 — 방금 마운트된
  // 페이지의 콘텐츠 폭을 Lenis가 아직 못 읽었으면 limit(스크롤 가능 범위)이 0으로
  // 잡혀 "end"가 곧장 0으로 계산돼버린다("회사 정보" 링크로 다른 페이지에서
  // 홈으로 막 넘어온 직후 scrollToBottom()이 아무 데도 안 움직이던 버그의 원인).
  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(0);
    } else {
      window.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo("end");
    } else {
      window.scrollTo({ left: document.body.scrollWidth, behavior: "smooth" });
    }
  };

  // 상품 목록(한국관)·상세 페이지 전용 맨 위/맨 아래 버튼 — 이 페이지들은 Home의
  // 가로 패널 흐름 바깥이라 위 scrollToTop/Bottom(가로 스크롤)과는 다르게 세로로
  // 움직여야 한다. 한국관은 자체 세로 Lenis 인스턴스(KoreanHall.jsx가 노출)를,
  // 나머지(상품 상세)는 일반 브라우저 세로 스크롤을 그대로 쓴다.
  const scrollListPageTop = () => {
    if (isKoreanHall && window.khLenis) window.khLenis.scrollTo("top");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollListPageBottom = () => {
    if (isKoreanHall && window.khLenis) window.khLenis.scrollTo("bottom");
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // 현재 뷰포트에 가장 가까운 [data-hsnap] 패널을 기준으로 한 칸 앞/뒤 패널로 이동
  const scrollByPanel = (direction) => {
    const panels = Array.from(document.querySelectorAll("[data-hsnap]"));
    if (panels.length === 0) return;

    let currentIndex = 0;
    let minDist = Infinity;
    panels.forEach((panel, i) => {
      const dist = Math.abs(panel.getBoundingClientRect().left);
      if (dist < minDist) {
        minDist = dist;
        currentIndex = i;
      }
    });

    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), panels.length - 1);
    scrollToPanel(nextIndex);
  };

  const goToPrevPanel = () => scrollByPanel(-1);
  const goToNextPanel = () => scrollByPanel(1);

  const presetClass = `railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`;

  return (
    <>
    {/* 패널 이동 화살표 — 하단 중앙에 독립된 작은 독으로 띄운다. */}
    {showArrowDock && !isKoreanHallZone && !isProductDetail && !isStandalonePage && (
      <div className={`railArrowDock ${presetClass}`} data-lenis-prevent>
        <button
          type="button"
          className="railBtn"
          aria-label="처음으로"
          data-tooltip="처음으로"
          onClick={(e) => { triggerPop(e); scrollToTop(); }}
        >
          <LuChevronsLeft />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="이전 페이지"
          data-tooltip="이전 페이지"
          onClick={(e) => { triggerPop(e); goToPrevPanel(); }}
        >
          <LuChevronLeft />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="다음 페이지"
          data-tooltip="다음 페이지"
          onClick={(e) => { triggerPop(e); goToNextPanel(); }}
        >
          <LuChevronRight />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="끝으로"
          data-tooltip="끝으로"
          onClick={(e) => { triggerPop(e); scrollToBottom(); }}
        >
          <LuChevronsRight />
        </button>
      </div>
    )}

    {/* 맨 위로 버튼 — 화살표 독과 별개로 오른쪽 하단 모서리에 단독으로 띄운다.
        기능은 "처음으로"와 같은 scrollToTop 재사용(이 앱은 가로 패널 스냅이라
        "맨 위"=첫 패널). */}
    {showTopButton && !isKoreanHallZone && !isProductDetail && (
      <div className={`railTopBtnWrap ${presetClass}`} data-lenis-prevent>
        <button
          type="button"
          className="railBtn"
          aria-label="맨 위로"
          data-tooltip="맨 위로"
          onClick={(e) => { triggerPop(e); scrollToTop(); }}
        >
          <LuChevronsUp />
        </button>
      </div>
    )}

    {/* 상품 목록(한국관)·상세 페이지 전용 맨 위/맨 아래 버튼 — 위 railTopBtnWrap과
        정확히 반대 조건(그쪽은 이 페이지들에서 숨김)이라 겹치지 않는다. */}
    {showTopButton && (isKoreanHall || isProductDetail) && (
      <div className={`railTopBtnWrap railTopBtnWrap--pair ${presetClass}`} data-lenis-prevent>
        <button
          type="button"
          className="railBtn"
          aria-label="맨 위로"
          data-tooltip="맨 위로"
          onClick={(e) => { triggerPop(e); scrollListPageTop(); }}
        >
          <LuChevronsUp />
        </button>
        <button
          type="button"
          className="railBtn"
          aria-label="맨 아래로"
          data-tooltip="맨 아래로"
          onClick={(e) => { triggerPop(e); scrollListPageBottom(); }}
        >
          <LuChevronsDown />
        </button>
      </div>
    )}
    </>
  );
}

export default Sidebar;
