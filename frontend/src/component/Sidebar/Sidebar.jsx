import "./Sidebar.css";
import { useEffect, useRef, useState } from "react";
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
  LuChevronsLeft,
  LuChevronsRight,
  LuInfo,
} from "react-icons/lu";
import { logoutUser, getCartItems } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import { useNoticeModal } from "../../context/NoticeModalContext";
import { useCompanyInfoModal } from "../../context/CompanyInfoModalContext";
import { PRODUCTS as HOME_PRODUCTS } from "../Home/Home";
import { products as KOREAN_HALL_PRODUCTS } from "../../data/products";

const RAIL_STYLES = [
  { id: "glass", label: "글래스" },
  { id: "metallic", label: "메탈릭" },
  { id: "pastel", label: "파스텔" },
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
  const { openCart } = useCartModal();
  const { openMyPage } = useMyPageModal();
  const { openNotice } = useNoticeModal();
  const { openCompanyInfo } = useCompanyInfoModal();
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
  const styleWrapRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [homeEntering, setHomeEntering] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [railStyle, setRailStyle] = useState(
    () => localStorage.getItem("railStyle") || "glass"
  );
  const [styleSwitching, setStyleSwitching] = useState(false);
  const railStyleMounted = useRef(false);

  useEffect(() => {
    localStorage.setItem("railStyle", railStyle);
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

  // 메인 페이지로 넘어올 때마다 미니바를 접힌 상태로 뒀다가, 도어인트로가 끝나는
  // 시점(App의 "doorintroend" 이벤트)에 맞춰 펼쳐지는 연출을 재생한다.
  useEffect(() => {
    if (!isHome) return;
    setHomeEntering(true);
    const playOpen = () => setHomeEntering(false);
    window.addEventListener("doorintroend", playOpen);
    return () => window.removeEventListener("doorintroend", playOpen);
  }, [isHome, location.key]);

  const fetchCartCount = () => {
    // 장바구니 개수는 로그인 계정의 백엔드 장바구니만 기준으로 한다.
    // (예전 localStorage "homeCartCounts"는 계정과 무관하게 남아 다른 계정에도 이월되던 버그의 원인이라 제거)
    if (!localStorage.getItem("access_token")) {
      setCartCount(0);
      return;
    }
    getCartItems()
      .then((res) => {
        const total = res.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  };

  const syncLoginState = () => setIsLoggedIn(!!localStorage.getItem("access_token"));

  useEffect(() => {
    syncLoginState();
    fetchCartCount();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("authchange", syncLoginState);
    return () => window.removeEventListener("authchange", syncLoginState);
  }, []);

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartchange", fetchCartCount);
    window.addEventListener("authchange", fetchCartCount);
    window.addEventListener("homecartchange", fetchCartCount);
    return () => {
      window.removeEventListener("cartchange", fetchCartCount);
      window.removeEventListener("authchange", fetchCartCount);
      window.removeEventListener("homecartchange", fetchCartCount);
    };
  }, []);

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
    if (index === null) {
      const stored = sessionStorage.getItem("pendingHomePanelIndex");
      if (stored !== null) {
        sessionStorage.removeItem("pendingHomePanelIndex");
        index = Number(stored);
      }
    }
    if (index === null) return;
    // Home이 실제로 마운트되고 레이아웃/Lenis 콘텐츠 크기가 갱신될 시간을 준 뒤 이동
    const timer = setTimeout(() => scrollToPanel(index), 200);
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
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
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

  // 페이지가 바뀌면 열려있던 검색창/스타일 선택창은 접어둔다
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setStyleOpen(false);
  }, [location.pathname]);

  const triggerPop = (e) => {
    const el = e.currentTarget;
    el.classList.remove("railPop");
    void el.offsetWidth; // 리플로우로 애니메이션 재시작 보장
    el.classList.add("railPop");
  };

  // data-hsnap 패널 목록 중 index번째 패널로 바로 이동 (0-based)
  const scrollToPanel = (index) => {
    const target = document.querySelectorAll("[data-hsnap]")[index];
    if (!target) return;
    if (window.lenis) {
      // 방금 마운트된 페이지의 콘텐츠 폭을 Lenis가 아직 반영하지 못했을 수 있어,
      // 스크롤 한계(limit)를 먼저 다시 계산시킨 뒤 이동한다.
      window.lenis.resize();
      window.lenis.scrollTo(target);
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToKoreanHall = () => navigate("/korean-hall");

  const scrollToTop = () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ left: 0, behavior: "smooth" });
  };

  // "홈" 아이콘은 1번째 패널(에세이)로 이동
  const goHome = () => {
    if (isHome) {
      scrollToPanel(0);
    } else {
      pendingPanelRef.current = 0;
      sessionStorage.setItem("skipHomeDefaultPanel", "1");
      navigate("/");
    }
  };

  const scrollToBottom = () => {
    if (window.lenis) window.lenis.scrollTo("end");
    else window.scrollTo({ left: document.body.scrollWidth, behavior: "smooth" });
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
    } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    window.location.replace("/");
  };

  // 검색은 현재 있는 페이지에 맞는 상품 목록만 대상으로 한다 — 한국관이면 한국관
  // 큐레이션, 그 외(메인 포함)에는 메인 상품 목록.
  const searchCatalog = isKoreanHallZone ? KOREAN_HALL_PRODUCTS : HOME_PRODUCTS;
  const searchResults = searchQuery.trim()
    ? searchCatalog
        .filter((p) => {
          const q = searchQuery.trim().toLowerCase();
          return p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q);
        })
        .slice(0, 8)
    : [];

  const handleSearchSelect = (product) => {
    setSearchOpen(false);
    setSearchQuery("");
    if (isKoreanHallZone) {
      navigate(`/product/${product.id}`);
      return;
    }
    navigate(`/item/${product.id}`);
  };

  return (
    <aside className={`sidebarRail ${(collapsed || homeEntering) ? "collapsed" : ""} ${isKoreanHallZone ? "koreanHallRail" : `railStyle-${railStyle}`} ${styleSwitching ? "styleSwitching" : ""}`}>
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
        onClick={() => setCollapsed(!collapsed)}
      >
        <LuChevronLeft />
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

          {searchOpen && (
            <div className="railSearchFlyout">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKoreanHallZone ? "한국관 상품 검색" : "상품 검색"}
                className="railSearchInput"
              />
              {searchQuery.trim() && (
                <ul className="railSearchResults">
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
              )}
            </div>
          )}
        </div>

        <span className="railDivider" />

        <button
          type="button"
          className="railBtn"
          aria-label="장바구니"
          data-tooltip="장바구니"
          onClick={(e) => { triggerPop(e); openCart(); }}
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

        {!isKoreanHallZone && !isProductDetail && (
          <>
            <span className="railDivider" />

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
          </>
        )}

        <span className="railDivider" />

        <button
          type="button"
          className="railBtn"
          aria-label="회사 정보"
          data-tooltip="회사 정보"
          onClick={(e) => { triggerPop(e); openCompanyInfo(); }}
        >
          <LuInfo />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
