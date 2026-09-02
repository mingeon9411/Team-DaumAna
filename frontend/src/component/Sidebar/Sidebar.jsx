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
// 아래로" 두 버튼짜리 위젯 두 개만 남아있다(패널에 따라 둘 중 하나만 뜬다).
//
// 첫 번째 위젯은 홈의 영상 인트로 패널(1~4번째, id="home-essay"~"home-essay-4")
// 에서만 뜬다 — 이 패널들은 헤더 내비가 접힌 상태(Header.jsx의 showExpandedNav)라
// 스크롤 말고는 페이지를 옮길 방법이 없기 때문. 여기서는 홈 전체의 가로 패널을
// 처음/끝으로 넘긴다(window.lenis 가로 스크롤).
//
// 두 번째 위젯은 상품 그리드 패널(5번째, id="home-products", hsnap 인덱스 4)에서만
// 뜬다 — 이 패널은 자체 overflow-y-auto로 세로 스크롤하는 상품 목록이라, 목록이
// 길어지면 맨 위/맨 아래로 바로 이동할 수단이 필요하다. 여기서는 가로 패널 이동이
// 아니라 #home-products 안쪽 세로 스크롤 위치만 바꾼다.
//
// railStyle(독 테두리 프리셋)은 더 이상 이 컴포넌트가 소유하지 않고, 다른
// 구독자(RecentlyViewedSidebar 등)와 마찬가지로 useRailStyle() 훅으로 따라간다
// — 실제 값을 바꾸는 UI는 /settings(Settings.jsx)로 옮겨갔다.
function readFlag(key, fallback = true) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}

// 홈의 영상 인트로 패널 4개는 data-hsnap 순서상 맨 앞 0~3번 인덱스를 차지한다
// (home-essay, home-essay-2, home-essay-3, home-essay-4 — 그 다음이 상품 그리드).
const VIDEO_PANEL_COUNT = 4;

function Sidebar() {
  const location = useLocation();
  const { railStyle, styleSwitching } = useRailStyle();
  const isHome = location.pathname === "/";

  // /settings에서 켜고 끌 수 있는 표시 여부 — 값이 아예 없으면(기존 사용자) 기본
  // 켬으로 취급해 이전과 동일하게 보인다. "dockvisibilitychange" 이벤트로 즉시 반영.
  const [showTopButton, setShowTopButton] = useState(() => readFlag("showTopButton"));
  useEffect(() => {
    const sync = () => setShowTopButton(readFlag("showTopButton"));
    window.addEventListener("dockvisibilitychange", sync);
    return () => window.removeEventListener("dockvisibilitychange", sync);
  }, []);

  // 현재 홈에서 몇 번째 가로 패널을 보고 있는지 — 영상 인트로 패널(0~3번)/상품
  // 그리드 패널(4번)에 있을 때만 각자의 위젯을 띄우기 위해 스크롤할 때마다 다시
  // 계산한다. Home의 가로 Lenis 스크롤은 window.scrollX를 움직이므로(Header.jsx도
  // 같은 방식으로 "scrolled" 상태를 판단) window의 "scroll" 이벤트를 그대로 쓴다.
  const [onVideoPanel, setOnVideoPanel] = useState(false);
  const [onProductGrid, setOnProductGrid] = useState(false);
  useEffect(() => {
    if (!isHome) {
      setOnVideoPanel(false);
      setOnProductGrid(false);
      return;
    }
    const computeActivePanel = () => {
      const panels = document.querySelectorAll("[data-hsnap]");
      let activeIndex = 0;
      let minDist = Infinity;
      panels.forEach((panel, i) => {
        const dist = Math.abs(panel.getBoundingClientRect().left);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = i;
        }
      });
      setOnVideoPanel(activeIndex < VIDEO_PANEL_COUNT);
      setOnProductGrid(activeIndex === VIDEO_PANEL_COUNT);
    };
    computeActivePanel();
    window.addEventListener("scroll", computeActivePanel);
    return () => window.removeEventListener("scroll", computeActivePanel);
  }, [isHome]);

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

  // 상품 그리드(#home-products)는 가로 패널이 아니라 자체 세로 스크롤 컨테이너라,
  // 위 scrollToTop/scrollToBottom(가로 Lenis 패널 이동)과는 다르게 그 요소의
  // scrollTop만 바꾼다.
  const scrollProductGridTop = () => {
    document.getElementById("home-products")?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollProductGridBottom = () => {
    const el = document.getElementById("home-products");
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const presetClass = `railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`;

  const handleTop = (e) => {
    triggerPop(e);
    scrollToTop();
  };
  const handleBottom = (e) => {
    triggerPop(e);
    scrollToBottom();
  };
  const handleProductGridTop = (e) => {
    triggerPop(e);
    scrollProductGridTop();
  };
  const handleProductGridBottom = (e) => {
    triggerPop(e);
    scrollProductGridBottom();
  };

  return (
    <>
    {/* 맨 위로/맨 아래로 버튼 — 홈의 영상 인트로 패널(1~4번째)에서만, 화면
        우하단에 단일 위젯으로 고정. */}
    {showTopButton && onVideoPanel && (
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

    {/* 맨 위로/맨 아래로 버튼 — 상품 그리드 패널에서만, 같은 자리에 같은
        모양(사이드바 독과 동일한 railStyle 프리셋)으로 뜬다. */}
    {onProductGrid && (
      <div className={`railTopBtnWrap railTopBtnWrap--pair ${presetClass}`} data-lenis-prevent>
        <button
          type="button"
          className="railBtn"
          aria-label="상품 목록 맨 위로"
          data-tooltip="맨 위로"
          onClick={handleProductGridTop}
        >
          <LuChevronsUp />
        </button>
        <button
          type="button"
          className="railBtn"
          aria-label="상품 목록 맨 아래로"
          data-tooltip="맨 아래로"
          onClick={handleProductGridBottom}
        >
          <LuChevronsDown />
        </button>
      </div>
    )}
    </>
  );
}

export default Sidebar;
