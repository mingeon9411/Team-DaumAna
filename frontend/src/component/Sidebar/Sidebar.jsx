import "./Sidebar.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuChevronsUp, LuChevronsDown } from "react-icons/lu";
import { useRailStyle } from "../../hooks/useRailStyle";
import { NAV_FLAGS } from "../../utils/navFlags";

// 예전엔 이 파일이 왼쪽에 떠 있던 전체 기능 독(홈/한국관/검색/장바구니/다크모드/
// 로그인 등)을 전부 그리고 있었다. 그 아이콘들은 /settings 페이지의 on/off
// 토글과 헤더(Header.jsx)의 상시 내비게이션으로 이전됐다. 이후 하단 중앙의
// "이전/다음 페이지" 화살표 독도 없애고, 지금은 화면 우하단에 "맨 위로/맨
// 아래로" 두 버튼짜리 위젯 하나만 남아있다.
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
  // 카탈로그라, 맨 위/아래 버튼이 세로 스크롤을 써야 하는지 판단할 때도 한국관
  // 취급을 받아야 한다.
  const isKoreanHallZone = isKoreanHall || location.pathname.startsWith("/product/");
  // 상품 상세 페이지도 세로로 스크롤되는 독립 페이지라 한국관과 동일하게 다룬다.
  const isProductDetail = location.pathname.startsWith("/item/") || location.pathname.startsWith("/product/");
  const isVerticalPage = isKoreanHallZone || isProductDetail;

  // /settings에서 켜고 끌 수 있는 표시 여부 — 값이 아예 없으면(기존 사용자) 기본
  // 켬으로 취급해 이전과 동일하게 보인다. "dockvisibilitychange" 이벤트로 즉시 반영.
  const [showTopButton, setShowTopButton] = useState(() => readFlag("showTopButton"));
  useEffect(() => {
    const sync = () => setShowTopButton(readFlag("showTopButton"));
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

  // resize()를 먼저 불러야 하는 이유 — 방금 마운트된
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
  // 움직여야 한다. 한국관은 자체 세로 Lenis 인스턴스(KoreanHall.jsx가 노출)를 쓰고,
  // 상품 상세(/item/:id, /product/:id)는 창(window)이 아니라 .homeDetailPage
  // 자신이 overflow-y:auto로 스크롤되는 내부 컨테이너라(HomeProductDetail.css/
  // ProductDetail.css) window.scrollTo로는 전혀 움직이지 않는다 — 그 요소를
  // 직접 찾아 스크롤한다.
  const scrollListPageTop = () => {
    if (isKoreanHall && window.khLenis) {
      window.khLenis.scrollTo("top");
      return;
    }
    const container = document.querySelector(".homeDetailPage");
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollListPageBottom = () => {
    if (isKoreanHall && window.khLenis) {
      window.khLenis.scrollTo("bottom");
      return;
    }
    const container = document.querySelector(".homeDetailPage");
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const presetClass = `railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`;

  // 세로 스크롤 페이지(한국관/상품 상세)와 가로 패널 페이지(그 외)를 한 위젯에서
  // 모두 처리 — 버튼 클릭 시 어떤 스크롤 함수를 쓸지만 갈라진다.
  const handleTop = (e) => {
    triggerPop(e);
    if (isVerticalPage) scrollListPageTop();
    else scrollToTop();
  };
  const handleBottom = (e) => {
    triggerPop(e);
    if (isVerticalPage) scrollListPageBottom();
    else scrollToBottom();
  };

  return (
    <>
    {/* 맨 위로/맨 아래로 버튼 — 화면 우하단에 단일 위젯으로 고정. */}
    {showTopButton && (
      <div className={`railTopBtnWrap railTopBtnWrap--pair ${presetClass}`} data-lenis-prevent>
        <button
          type="button"
          className="railBtn"
          aria-label="맨 위로"
          data-tooltip="맨 위로"
          onClick={handleTop}
        >
          <LuChevronsUp />
        </button>
        <button
          type="button"
          className="railBtn"
          aria-label="맨 아래로"
          data-tooltip="맨 아래로"
          onClick={handleBottom}
        >
          <LuChevronsDown />
        </button>
      </div>
    )}
    </>
  );
}

export default Sidebar;
