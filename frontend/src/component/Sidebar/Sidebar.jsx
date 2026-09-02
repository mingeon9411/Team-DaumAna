import "./Sidebar.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuChevronsUp, LuChevronsDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useRailStyle } from "../../hooks/useRailStyle";
import { NAV_FLAGS } from "../../utils/navFlags";

// 예전엔 이 파일이 왼쪽에 떠 있던 전체 기능 독(홈/한국관/검색/장바구니/다크모드/
// 로그인 등)을 전부 그리고 있었다. 그 아이콘들은 /settings 페이지의 on/off
// 토글과 헤더(Header.jsx)의 상시 내비게이션으로 이전됐다. 이후 하단 중앙의
// "이전/다음 페이지" 화살표 독도 없애고, 지금은 화면 우하단에 아주 작은 십자(+)
// 모양 4버튼 패드(맨 위로/맨 아래로/이전 페이지/다음 페이지)가 홈의 가로 패널
// 7개(index 0~6) 전부에서 하나씩은 뜬다 — 패널 성격에 따라 위/아래 버튼의 동작만
// 둘로 갈린다(아래 참고).
//
// 첫 번째 패드는 영상 인트로 패널(1~4번째, index 0~3, id="home-essay"~
// "home-essay-4")에서 뜬다 — 이 패널들은 헤더 내비가 접힌 상태(Header.jsx의
// showExpandedNav)라 스크롤 말고는 페이지를 옮길 방법이 없기 때문. 이 패널들은
// overflow-hidden이라 안에 스크롤할 콘텐츠가 없으므로, 위/아래는 홈 전체의 가로
// 패널을 처음/끝으로 넘긴다(window.lenis 가로 스크롤).
//
// 두 번째 패드는 그 다음 패널들(index 4 이상 — 상품 그리드 id="home-products",
// 룩북, BusinessInfoPanel)에서 뜬다. 이 패널들은 전부 자체 overflow-y-auto로
// 세로 스크롤하는 긴 콘텐츠라 위/아래가 "지금 보고 있는 패널 안쪽"의 스크롤
// 위치만 바꾼다 — 어떤 패널이 활성인지는 activePanelIndex로 그때그때 찾는다(id가
// 있는 건 상품 그리드뿐이라 id 대신 인덱스로 요소를 집는다).
//
// 좌/우는 두 패드가 완전히 같은 동작을 한다 — 어느 쪽이든 바로 옆 hsnap 패널로
// 한 칸만 이동(scrollToPanel).
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

// 십자(+) 모양 4버튼 패드 — 위/아래(up/down)는 위젯마다 의미가 다르지만(가로 패널
// 처음/끝 vs 상품 목록 안쪽 스크롤), 좌/우(prev/next 패널)는 두 위젯이 완전히
// 같은 동작을 공유해서 컴포넌트 하나로 묶었다.
function CrossPad({ presetClass, upLabel, downLabel, onUp, onDown, onPrev, onNext }) {
  return (
    <div className={`railTopBtnWrap railTopBtnWrap--cross ${presetClass}`} data-lenis-prevent>
      <button type="button" className="railBtn railBtnUp" aria-label={upLabel} data-tooltip="맨 위로" onClick={onUp}>
        <LuChevronsUp />
      </button>
      <button type="button" className="railBtn railBtnLeft" aria-label="이전 페이지" data-tooltip="이전 페이지" onClick={onPrev}>
        <LuChevronLeft />
      </button>
      <button type="button" className="railBtn railBtnRight" aria-label="다음 페이지" data-tooltip="다음 페이지" onClick={onNext}>
        <LuChevronRight />
      </button>
      <button type="button" className="railBtn railBtnDown" aria-label={downLabel} data-tooltip="맨 아래로" onClick={onDown}>
        <LuChevronsDown />
      </button>
    </div>
  );
}

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

  // 현재 홈에서 몇 번째 가로 패널을 보고 있는지 — 어느 패드를 띄울지(영상 인트로용
  // vs 나머지 패널용) 가르는 데도, 좌/우 버튼의 "다음/이전 패널" 계산에도 그대로
  // 쓰기 위해 인덱스 자체를 상태로 들고 있는다. Home의 가로 Lenis 스크롤은
  // window.scrollX를 움직이므로(Header.jsx도 같은 방식으로 "scrolled" 상태를
  // 판단) window의 "scroll" 이벤트를 그대로 쓴다.
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  useEffect(() => {
    if (!isHome) return;
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
      setActivePanelIndex(activeIndex);
    };
    computeActivePanel();
    window.addEventListener("scroll", computeActivePanel);
    return () => window.removeEventListener("scroll", computeActivePanel);
  }, [isHome]);
  const onVideoPanel = isHome && activePanelIndex < VIDEO_PANEL_COUNT;
  const onContentPanel = isHome && activePanelIndex >= VIDEO_PANEL_COUNT;

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

  // 영상 인트로 이후 패널(상품 그리드/룩북/BusinessInfoPanel)은 가로 패널이
  // 아니라 각자 자체 세로 스크롤 컨테이너라, 위 scrollToTop/scrollToBottom(가로
  // Lenis 패널 이동)과는 다르게 "지금 활성인 패널 요소"의 scrollTop만 바꾼다.
  // 상품 그리드 말고는 id가 없어서 activePanelIndex로 요소를 집는다.
  const scrollActivePanelTop = () => {
    document.querySelectorAll("[data-hsnap]")[activePanelIndex]?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollActivePanelBottom = () => {
    const el = document.querySelectorAll("[data-hsnap]")[activePanelIndex];
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // 좌/우 버튼 공용 — 바로 옆 hsnap 패널로 한 칸만 이동한다(범위를 벗어나면
  // 제자리 유지). Home.jsx의 scrollToProductGrid와 같은 lenis.scrollTo(target)
  // 패턴이되, 여기서는 목표 패널을 인덱스로 계산한다.
  const scrollToPanel = (index) => {
    const panels = document.querySelectorAll("[data-hsnap]");
    const target = panels[Math.max(0, Math.min(index, panels.length - 1))];
    if (!target) return;
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      target.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  const presetClass = `railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`;

  const withPop = (fn) => (e) => {
    triggerPop(e);
    fn();
  };
  const handlePrevPanel = withPop(() => scrollToPanel(activePanelIndex - 1));
  const handleNextPanel = withPop(() => scrollToPanel(activePanelIndex + 1));

  return (
    <>
    {/* 맨 위로/맨 아래로/이전/다음 십자 패드 — 홈의 영상 인트로 패널(1~4번째)
        에서만, 화면 우하단에 고정. */}
    {showTopButton && onVideoPanel && (
      <CrossPad
        presetClass={presetClass}
        upLabel="맨 위로"
        downLabel="맨 아래로"
        onUp={withPop(scrollToTop)}
        onDown={withPop(scrollToBottom)}
        onPrev={handlePrevPanel}
        onNext={handleNextPanel}
      />
    )}

    {/* 맨 위로/맨 아래로/이전/다음 십자 패드 — 상품 그리드부터 그 뒤 모든 패널
        (룩북, BusinessInfoPanel)에서, 같은 자리에 같은 모양(사이드바 독과 동일한
        railStyle 프리셋)으로 뜬다. */}
    {onContentPanel && (
      <CrossPad
        presetClass={presetClass}
        upLabel="맨 위로"
        downLabel="맨 아래로"
        onUp={withPop(scrollActivePanelTop)}
        onDown={withPop(scrollActivePanelBottom)}
        onPrev={handlePrevPanel}
        onNext={handleNextPanel}
      />
    )}
    </>
  );
}

export default Sidebar;
