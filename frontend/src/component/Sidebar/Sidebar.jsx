import "./Sidebar.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LuHouse,
  LuFlower,
  LuMegaphone,
  LuSearch,
  LuShoppingBag,
  LuUserRound,
  LuUserRoundPlus,
  LuSun,
  LuMoon,
  LuLayers,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
  LuChevronDown,
  LuChevronsLeft,
  LuChevronsRight,
  LuChevronsUp,
  LuChevronsDown,
  LuInfo,
  LuPalette,
  LuHeadset,
  LuClock,
  LuX,
} from "react-icons/lu";
import { logoutUser, getCartItems } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import { useNoticeModal } from "../../context/NoticeModalContext";
import { PRODUCTS as HOME_PRODUCTS } from "../Home/Home";
import { products as KOREAN_HALL_PRODUCTS } from "../../data/products";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

const RAIL_STYLES = [
  { id: "glass", label: "레인보우" },
  { id: "metallic", label: "메탈릭" },
  { id: "pastel", label: "파스텔" },
];

// 상품 그리드(.metallicSilver)·인기 검색어 드롭다운(.popularKeywordDropdown) 배경의
// 파스텔 진하기. body[data-pastel]로 CSS에서 읽는다 — 기본값 deep(현재 배포된 톤).
const PASTEL_LEVELS = [
  { id: "deep", label: "진하게", swatch: "pastelDeep" },
  { id: "medium", label: "보통", swatch: "pastelMedium" },
  { id: "light", label: "연하게", swatch: "pastelLight" },
];

const KH_PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 8.7 + 3) % 100,
  delay: (i * 0.63) % 6,
  duration: 5 + ((i * 1.37) % 3.5),
  scale: 0.7 + ((i * 0.53) % 0.6),
}));

function Sidebar() {
  const [cartCount, setCartCount] = useState(0);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "1"
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { openMyPage } = useMyPageModal();
  const { openNotice } = useNoticeModal();
  const isHome = location.pathname === "/";
  const isKoreanHall = location.pathname === "/korean-hall";
  // 한국관 상품 상세(/product/:id)는 /korean-hall과 다른 라우트지만 한국관 전용
  // 카탈로그라, 독의 룩(koreanHallRail)·꽃잎 장식·검색 카탈로그는 여기도 한국관
  // 취급을 받아야 한다.
  const isKoreanHallZone = isKoreanHall || location.pathname.startsWith("/product/");
  // 상품 상세 페이지는 Home의 가로 패널 흐름에 속하지 않는 독립된 페이지라,
  // 한국관과 마찬가지로 "다음/이전 페이지" 같은 패널 이동 버튼이 의미가 없다.
  const isProductDetail = location.pathname.startsWith("/item/") || location.pathname.startsWith("/product/");
  const pendingPanelRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchFlyoutRef = useRef(null);
  const styleWrapRef = useRef(null);
  const pastelWrapRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // 최근 검색어 — 브라우저(localStorage)에만 남기고 서버로는 보내지 않는다.
  // 한국관/메인 카탈로그가 달라도 "검색했던 단어" 자체는 하나의 목록으로 공유한다
  // (오늘의집도 검색 영역을 구분하지 않음).
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });
  const [homeEntering, setHomeEntering] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [pastelOpen, setPastelOpen] = useState(false);
  const [railStyle, setRailStyle] = useState(
    () => localStorage.getItem("railStyle") || "glass"
  );
  const [pastelLevel, setPastelLevel] = useState(
    () => localStorage.getItem("pastelLevel") || "deep"
  );
  const [styleSwitching, setStyleSwitching] = useState(false);
  const railStyleMounted = useRef(false);

  useEffect(() => {
    localStorage.setItem("railStyle", railStyle);
    // 오른쪽 최근 본 상품 독(RecentlyViewedSidebar)도 같은 스타일을 쓰므로,
    // 여기서 바뀔 때마다 알려줘서 그쪽도 동일하게 맞춰 바뀌게 한다.
    window.dispatchEvent(new Event("railstylechange"));
    // 배경 그러데이션은 CSS transition으로 부드럽게 넘어가지 않으므로,
    // 스타일이 바뀌는 순간에는 대신 짧게 페이드-스케일 애니메이션을 태워
    // 전환이 뚝 끊기지 않고 매끄러워 보이게 한다. (첫 마운트 시엔 재생 안 함)
    if (!railStyleMounted.current) {
      railStyleMounted.current = true;
      return;
    }
    setStyleSwitching(true);
    const timer = setTimeout(() => setStyleSwitching(false), 2000);
    return () => clearTimeout(timer);
  }, [railStyle]);

  // 상품 그리드/인기 검색어 드롭다운 배경 톤 — body 속성으로 내려주면 Home.css·
  // PopularKeywordsSidebar.css의 body[data-pastel=...] 셀렉터가 알아서 반응한다.
  useEffect(() => {
    document.body.dataset.pastel = pastelLevel;
    localStorage.setItem("pastelLevel", pastelLevel);
  }, [pastelLevel]);

  // 메인 페이지로 넘어올 때마다 미니바를 접힌 상태로 뒀다가, 도어인트로가 끝나는
  // 시점(App의 "doorintroend" 이벤트)에 맞춰 펼쳐지는 연출을 재생한다.
  useEffect(() => {
    if (!isHome) return;
    setHomeEntering(true);
    const playOpen = () => setHomeEntering(false);
    window.addEventListener("doorintroend", playOpen);
    return () => window.removeEventListener("doorintroend", playOpen);
  }, [isHome, location.key]);

  // 장바구니 개수는 로그인 계정의 백엔드 장바구니만 기준으로 한다.
  // (예전 localStorage "homeCartCounts"는 계정과 무관하게 남아 다른 계정에도 이월되던 버그의 원인이라 제거)
  //
  // cancelled 플래그 하나만으로는 "같은 effect 인스턴스 안에서" cartchange 등이 연달아
  // 여러 번 발화돼 fetchCartCount가 중복 호출될 때(예: 상품을 짧은 간격으로 두 번 담음)
  // 응답이 요청 순서와 다르게 도착하는 경우까지는 못 막는다. 호출마다 세대(generation)
  // 번호를 매겨, 그 사이 더 최신 호출이 있었으면 오래된 응답은 버리도록 한다.
  const cartFetchGenRef = useRef(0);

  const fetchCartCount = useCallback(() => {
    const gen = ++cartFetchGenRef.current;
    if (!localStorage.getItem("access_token")) {
      setCartCount(0);
      return;
    }
    getCartItems()
      .then((res) => {
        if (gen !== cartFetchGenRef.current) return; // 그 사이 더 최신 요청이 있었으면 폐기
        const items = Array.isArray(res.data) ? res.data : [];
        setCartCount(items.reduce((sum, item) => sum + (item.quantity || 1), 0));
      })
      .catch(() => {
        if (gen === cartFetchGenRef.current) setCartCount(0);
      });
  }, []);

  const syncLoginState = () => setIsLoggedIn(!!localStorage.getItem("access_token"));

  // 라우트 이동마다 재동기화 — 다른 탭에서 로그인/로그아웃한 경우처럼 이 탭엔
  // authchange 이벤트가 안 닿는 케이스를 내비게이션 시점에 보정한다.
  useEffect(() => {
    syncLoginState();
    fetchCartCount();
  }, [location.pathname, fetchCartCount]);

  useEffect(() => {
    window.addEventListener("authchange", syncLoginState);
    return () => window.removeEventListener("authchange", syncLoginState);
  }, []);

  // cartchange/authchange/homecartchange 구독은 mount 시 한 번만 — 이벤트 핸들러가
  // location에 의존하지 않으므로, 라우트 이동마다 해제/재등록할 이유가 없다.
  useEffect(() => {
    window.addEventListener("cartchange", fetchCartCount);
    window.addEventListener("authchange", fetchCartCount);
    window.addEventListener("homecartchange", fetchCartCount);
    return () => {
      window.removeEventListener("cartchange", fetchCartCount);
      window.removeEventListener("authchange", fetchCartCount);
      window.removeEventListener("homecartchange", fetchCartCount);
    };
  }, [fetchCartCount]);

  useEffect(() => {
    if (isHome && !localStorage.getItem("access_token")) {
      localStorage.removeItem("cartItems");
      setCartCount(0);
    }
  }, [isHome]);

  // 다른 페이지에서 "홈"/"상품" 버튼을 눌러 홈으로 이동한 경우 — ScrollToTop이 스크롤을
  // 0으로 되돌리고 패널을 재등록하는 처리가 끝난 뒤에 지정된 패널로 이동한다.
  // pendingPanelRef는 Sidebar가 살아있는 동안(같은 페이지 안)만 쓸 수 있어서, 다른
  // 라우트 컴포넌트(예: 상품 상세 페이지)에서 지정한 경우엔 sessionStorage로 받는다.
  useEffect(() => {
    if (!isHome) return;
    let index = pendingPanelRef.current;
    pendingPanelRef.current = null;
    // 상품 상세페이지에서 돌아오는 경우(sessionStorage 경로)는 인트로 영상 패널을
    // 스쳐 지나가는 스크롤 애니메이션 없이 상품 목록 패널로 즉시 전환한다 —
    // 애니메이션이 보이면 "뒤로가기 했더니 화면이 훑고 지나간다"처럼 느껴진다.
    let immediate = false;
    if (index === null) {
      const stored = sessionStorage.getItem(NAV_FLAGS.PENDING_HOME_PANEL_INDEX);
      if (stored !== null) {
        sessionStorage.removeItem(NAV_FLAGS.PENDING_HOME_PANEL_INDEX);
        index = Number(stored);
        immediate = true;
      }
    }
    if (index === null) return;
    // Home이 실제로 마운트되고 레이아웃/Lenis 콘텐츠 크기가 갱신될 시간을 준 뒤 이동
    const timer = setTimeout(() => scrollToPanel(index, { immediate }), 200);
    return () => clearTimeout(timer);
  }, [isHome]);

  // 다른 페이지에서 독의 "회사 정보" 버튼을 눌러 홈으로 넘어온 경우 — 맨 끝
  // (BusinessInfoPanel)까지 스크롤한다. 클릭으로 시작한 이동이라 애니메이션을
  // 그대로 보여준다(뒤로가기 복귀와 달리 "화면이 훑고 지나간다"는 위화감이 없음).
  useEffect(() => {
    if (!isHome) return;
    if (!sessionStorage.getItem(NAV_FLAGS.PENDING_SCROLL_TO_END)) return;
    sessionStorage.removeItem(NAV_FLAGS.PENDING_SCROLL_TO_END);
    const timer = setTimeout(() => scrollToBottom(), 200);
    return () => clearTimeout(timer);
  }, [isHome]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode ? "1" : "0");
    window.dispatchEvent(new Event("darkmodechange"));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // 검색 플라이아웃 바깥을 클릭하면 닫기
  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e) => {
      const inWrap = searchWrapRef.current && searchWrapRef.current.contains(e.target);
      const inFlyout = searchFlyoutRef.current && searchFlyoutRef.current.contains(e.target);
      if (!inWrap && !inFlyout) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // 스타일 선택 플라이아웃 바깥을 클릭하면 닫기
  useEffect(() => {
    if (!styleOpen) return;
    const handleClickOutside = (e) => {
      if (styleWrapRef.current && !styleWrapRef.current.contains(e.target)) {
        setStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [styleOpen]);

  // 배경 톤 선택 플라이아웃 바깥을 클릭하면 닫기
  useEffect(() => {
    if (!pastelOpen) return;
    const handleClickOutside = (e) => {
      if (pastelWrapRef.current && !pastelWrapRef.current.contains(e.target)) {
        setPastelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pastelOpen]);

  // 페이지가 바뀌면 열려있던 검색창/스타일 선택창은 접어둔다
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setStyleOpen(false);
    setPastelOpen(false);
  }, [location.pathname]);

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
      // 방금 마운트된 페이지의 콘텐츠 폭을 Lenis가 아직 반영하지 못했을 수 있어,
      // 스크롤 한계(limit)를 먼저 다시 계산시킨 뒤 이동한다.
      window.lenis.resize();
      window.lenis.scrollTo(target, immediate ? { immediate: true } : undefined);
    } else {
      target.scrollIntoView(immediate ? undefined : { behavior: "smooth" });
    }
  };

  const goToKoreanHall = () => navigate("/korean-hall");
  const goToCustomerCenter = () => navigate("/customer-center");

  const scrollToTop = () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ left: 0, behavior: "smooth" });
  };

  // "홈" 아이콘은 보통 1번째 패널(에세이)로 이동. 다만 장바구니·상품 상세처럼
  // "목록으로 돌아가기" 의도가 남아있는 페이지(PRODUCT_DETAIL_RETURN_ZONE 플래그가
  // 아직 안 지워진 상태)에서는 그 의도를 우선한다 — 안 그러면 아래 pendingPanelRef=0이
  // 무조건 패널 0을 예약해버려서, DoorIntroController가 세팅하는 상품 목록 패널(4번)
  // 지정을 덮어써버린다(Sidebar의 다른 useEffect가 ref를 sessionStorage보다 먼저 봄).
  const goHome = () => {
    const returnZone = sessionStorage.getItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE);
    if (returnZone === NAV_ZONE.KOREAN_HALL) {
      navigate("/korean-hall");
      return;
    }
    if (returnZone === NAV_ZONE.HOME) {
      navigate("/"); // 플래그는 그대로 둬 DoorIntroController가 상품 목록 패널로 보내게 한다
      return;
    }
    if (isHome) {
      scrollToPanel(0);
    } else {
      pendingPanelRef.current = 0;
      sessionStorage.setItem(NAV_FLAGS.SKIP_HOME_DEFAULT_PANEL, "1");
      navigate("/");
    }
  };

  const scrollToBottom = () => {
    if (window.lenis) window.lenis.scrollTo("end");
    else window.scrollTo({ left: document.body.scrollWidth, behavior: "smooth" });
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

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await logoutUser({ refresh });
    } catch (err) {
      // 서버 로그아웃(리프레시 토큰 폐기)이 실패해도 클라이언트 토큰은 그대로
      // 지우고 진행한다 — 다만 원인 추적이 가능하도록 로그는 남긴다.
      console.error("logout API failed:", err);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    window.location.replace("/");
  };

  // 최근 검색어 max 8개, 중복 입력 시 맨 앞으로 재정렬
  const addRecentSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, 8);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  };

  const removeRecentSearch = (term) => {
    setRecentSearches((prev) => {
      const next = prev.filter((t) => t !== term);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // 검색은 현재 있는 페이지에 맞는 상품 목록만 대상으로 한다 — 한국관이면 한국관
  // 큐레이션, 그 외(메인 포함)에는 메인 상품 목록.
  const searchCatalog = isKoreanHallZone ? KOREAN_HALL_PRODUCTS : HOME_PRODUCTS;
  // "가림" → "인덕션가림막" 같은 연관 검색어 매칭이 되도록 name/brand뿐 아니라
  // 카테고리·설명까지 한데 합쳐서 훑는다 — 두 카탈로그가 필드 구성이 달라도
  // (한국관엔 midCategory/subCategory가 없음) 없는 필드는 그냥 빈 문자열로 빠진다.
  const searchResults = searchQuery.trim()
    ? searchCatalog
        .filter((p) => {
          const q = searchQuery.trim().toLowerCase();
          const haystack = [p.name, p.brand, p.category, p.midCategory, p.subCategory, p.desc]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
        .slice(0, 8)
    : [];

  const handleSearchSelect = (product) => {
    addRecentSearch(searchQuery);
    setSearchOpen(false);
    setSearchQuery("");
    if (isKoreanHallZone) {
      navigate(`/product/${product.id}`);
      return;
    }
    navigate(`/item/${product.id}`);
  };

  // 화살표 독·맨 위로 버튼은 한국관에서 렌더링 자체가 안 되니(조건부 렌더)
  // koreanHallRail 분기 없이 항상 왼쪽 독과 같은 railStyle 프리셋 클래스만 준다.
  const presetClass = `railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`;

  return (
    <>
    {/* data-lenis-prevent — 이 독은 클릭 전용 내비게이션이라, 위에서 스크롤해도
        페이지 본문처럼 가로 패널 전환으로 먹히면 안 된다. 독 위에서 휠을 굴리면
        Lenis가 이 dock을 그냥 지나쳐 배경(가로 트랙)을 스크롤해버려서 상품 목록
        같은 페이지를 보다가 옆 패널로 튕겨나가는 원인이었다. */}
    <aside className={`sidebarRail ${(collapsed || homeEntering) ? "collapsed" : ""} ${isKoreanHallZone ? "koreanHallRail" : `railStyle-${railStyle}`} ${styleSwitching ? "styleSwitching" : ""}`} data-lenis-prevent>
      {isKoreanHallZone && (
        <div className="khPetals" aria-hidden="true">
          {KH_PETALS.map((p, i) => (
            <span
              key={i}
              className="khPetal"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--khPetalScale": p.scale,
              }}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        className="railToggle"
        aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <LuChevronDown /> : <LuChevronUp />}
      </button>

      <div className="railItems">
        <button
          type="button"
          className="railBtn"
          aria-label="홈"
          data-tooltip="홈"
          onClick={(e) => { triggerPop(e); goHome(); }}
        >
          <LuHouse />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="한국관"
          data-tooltip="한국관"
          onClick={(e) => { triggerPop(e); goToKoreanHall(); }}
        >
          <LuFlower />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="공지사항"
          data-tooltip="공지사항"
          onClick={(e) => { triggerPop(e); openNotice(); }}
        >
          <LuMegaphone />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="고객센터"
          data-tooltip="고객센터"
          onClick={(e) => { triggerPop(e); goToCustomerCenter(); }}
        >
          <LuHeadset />
        </button>

        <div className="railSearchWrap" ref={searchWrapRef}>
          <button
            type="button"
            className="railBtn"
            aria-label="검색"
            data-tooltip="검색"
            onClick={(e) => { triggerPop(e); setSearchOpen((v) => !v); }}
          >
            <LuSearch />
          </button>
        </div>

        {/* railSearchWrap 안이 아니라 railItems 바로 아래 둔다 — railSearchWrap은
            등장 애니메이션 때문에 transform이 걸려 있어서(scale(1)이라도) 그 안에
            두면 absolute 자식의 기준 박스가 독 전체가 아니라 이 좁은 wrap이 돼버려
            검색창이 독 왼쪽으로 치우쳐 뜨는 문제가 있었다. transform이 없는
            railItems 아래로 옮겨 .sidebarRail(fixed) 기준으로 가로 중앙에 뜨게 함. */}
        {searchOpen && (
          <div className="railSearchFlyout" ref={searchFlyoutRef}>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addRecentSearch(searchQuery); }}
              placeholder={isKoreanHallZone ? "한국관 상품 검색" : "상품 검색"}
              className="railSearchInput"
            />
            {searchQuery.trim() ? (
              <ul className="railSearchResults" data-lenis-prevent>
                {searchResults.length === 0 ? (
                  <li className="railSearchEmpty">검색 결과가 없습니다</li>
                ) : (
                  searchResults.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => handleSearchSelect(p)}>
                        <img src={p.image} alt="" />
                        <span>
                          <strong>{p.name}</strong>
                          {p.desc && <small className="railSearchDesc">{p.desc}</small>}
                          <em>{p.price.toLocaleString()}원</em>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : (
              recentSearches.length > 0 && (
                <div className="railRecentSearches">
                  <div className="railRecentSearchesHead">
                    <span>최근 검색어</span>
                    <button type="button" onClick={clearRecentSearches}>전체 삭제</button>
                  </div>
                  <ul data-lenis-prevent>
                    {recentSearches.map((term) => (
                      <li key={term}>
                        <button type="button" onClick={() => setSearchQuery(term)}>
                          <LuClock aria-hidden="true" />
                          {term}
                        </button>
                        <button
                          type="button"
                          className="railRecentSearchRemove"
                          aria-label={`"${term}" 검색어 삭제`}
                          onClick={() => removeRecentSearch(term)}
                        >
                          <LuX aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        )}

        <span className="railDivider" />

        <button
          type="button"
          className="railBtn"
          aria-label="장바구니"
          data-tooltip="장바구니"
          onClick={(e) => { triggerPop(e); navigate(isKoreanHallZone ? "/korean-hall/cart" : "/cart"); }}
        >
          <LuShoppingBag />
          {cartCount > 0 && <span className="railBadge">{cartCount}</span>}
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label={darkMode ? "라이트모드" : "다크모드"}
          data-tooltip={darkMode ? "라이트모드" : "다크모드"}
          onClick={(e) => { triggerPop(e); setDarkMode(!darkMode); }}
        >
          {darkMode ? <LuSun /> : <LuMoon />}
        </button>

        {!isKoreanHallZone && (
          <div className="railStyleWrap" ref={styleWrapRef}>
            <button
              type="button"
              className="railBtn"
              aria-label="사이드바 스타일"
              data-tooltip="사이드바 스타일"
              onClick={(e) => { triggerPop(e); setStyleOpen((v) => !v); }}
            >
              <LuLayers />
            </button>

            {styleOpen && (
              <div className="railStyleFlyout">
                {RAIL_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`railStyleOption${railStyle === s.id ? " active" : ""}`}
                    onClick={() => { setRailStyle(s.id); setStyleOpen(false); }}
                  >
                    <span className={`railStyleSwatch railStyleSwatch-${s.id}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!isKoreanHallZone && (
          <div className="railStyleWrap" ref={pastelWrapRef}>
            <button
              type="button"
              className="railBtn"
              aria-label="배경 톤"
              data-tooltip="배경 톤"
              onClick={(e) => { triggerPop(e); setPastelOpen((v) => !v); }}
            >
              <LuPalette />
            </button>

            {pastelOpen && (
              <div className="railStyleFlyout">
                {PASTEL_LEVELS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`railStyleOption${pastelLevel === p.id ? " active" : ""}`}
                    onClick={() => { setPastelLevel(p.id); setPastelOpen(false); }}
                  >
                    <span className={`railStyleSwatch railStyleSwatch-${p.swatch}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="railDivider" />

        {isLoggedIn ? (
          <>
            <button
              type="button"
              className="railBtn"
              aria-label="마이페이지"
              data-tooltip="마이페이지"
              onClick={(e) => { triggerPop(e); openMyPage(); }}
            >
              <LuUserRound />
            </button>

            <button
              type="button"
              className="railBtn"
              aria-label="로그아웃"
              data-tooltip="로그아웃"
              onClick={(e) => { triggerPop(e); handleLogout(); }}
            >
              <LuLogOut />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="railBtn"
            aria-label="로그인"
            data-tooltip="로그인"
            onClick={(e) => { triggerPop(e); openLogin(); }}
          >
            <LuUserRoundPlus />
          </button>
        )}

        <span className="railDivider" />

        <button
          type="button"
          className="railBtn railInfoBtn"
          aria-label="회사 정보"
          data-tooltip="회사 정보"
          onClick={(e) => {
            triggerPop(e);
            if (isHome) {
              scrollToBottom();
              return;
            }
            sessionStorage.setItem(NAV_FLAGS.PENDING_SCROLL_TO_END, "1");
            navigate("/");
          }}
        >
          <LuInfo />
        </button>
      </div>
    </aside>

    {/* 패널 이동 화살표 — 왼쪽 사이드바(.sidebarRail)와는 별도로 하단 중앙에
        독립된 작은 독으로 띄운다. 왼쪽 독의 접힘 상태와 무관하게 항상 같은
        자리에 있어야 하므로 .sidebarRail 바깥의 형제로 두되, 배경 스타일
        프리셋(presetClass)만은 왼쪽 독과 항상 같게 맞춘다. */}
    {!isKoreanHallZone && !isProductDetail && (
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
        "맨 위"=첫 패널). 배경 스타일 프리셋은 여기도 왼쪽 독과 동일하게. */}
    {!isKoreanHallZone && !isProductDetail && (
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
    {(isKoreanHall || isProductDetail) && (
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
