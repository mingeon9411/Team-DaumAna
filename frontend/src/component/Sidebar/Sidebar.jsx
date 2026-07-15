import "./Sidebar.css";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuStore,
  LuMegaphone,
  LuSearch,
  LuShoppingBag,
  LuUserRound,
  LuUserRoundPlus,
  LuSun,
  LuMoon,
  LuLogOut,
  LuChevronLeft,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { logoutUser, getCartItems } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import { useSearchModal } from "../../context/SearchModalContext";

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
  const { openSearch } = useSearchModal();
  const isHome = location.pathname === "/";
  const pendingProductScrollRef = useRef(false);

  const getHomeCartTotal = () => {
    try {
      const counts = JSON.parse(localStorage.getItem("homeCartCounts")) || {};
      return Object.values(counts).reduce((sum, n) => sum + n, 0);
    } catch {
      return 0;
    }
  };

  const fetchCartCount = () => {
    const homeTotal = getHomeCartTotal();
    if (!localStorage.getItem("access_token")) {
      setCartCount(homeTotal);
      return;
    }
    getCartItems()
      .then((res) => {
        const total = res.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total + homeTotal);
      })
      .catch(() => setCartCount(homeTotal));
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

  // 다른 페이지에서 "상품" 버튼을 눌러 홈으로 이동한 경우 — ScrollToTop이 스크롤을
  // 0으로 되돌리고 패널을 재등록하는 처리가 끝난 뒤에 6번째 패널(전체 상품)로 이동한다.
  useEffect(() => {
    if (isHome && pendingProductScrollRef.current) {
      pendingProductScrollRef.current = false;
      // Home이 실제로 마운트되고 레이아웃/Lenis 콘텐츠 크기가 갱신될 시간을 준 뒤 이동
      const timer = setTimeout(() => scrollToProductsPanel(), 200);
      return () => clearTimeout(timer);
    }
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

  const triggerPop = (e) => {
    const el = e.currentTarget;
    el.classList.remove("railPop");
    void el.offsetWidth; // 리플로우로 애니메이션 재시작 보장
    el.classList.add("railPop");
  };

  // 전체 상품이 나열된 6번째 패널(data-hsnap 6번째 섹션)로 바로 이동
  const scrollToProductsPanel = () => {
    const target = document.querySelectorAll("[data-hsnap]")[5];
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

  const goToProductsPage = () => {
    if (isHome) {
      scrollToProductsPanel();
    } else {
      pendingProductScrollRef.current = true;
      navigate("/");
    }
  };

  const scrollToTop = () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ left: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    if (window.lenis) window.lenis.scrollTo("end");
    else window.scrollTo({ left: document.body.scrollWidth, behavior: "smooth" });
  };

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

  return (
    <aside className={`sidebarRail ${collapsed ? "collapsed" : ""}`}>
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
          aria-label="상품"
          data-tooltip="상품"
          onClick={(e) => { triggerPop(e); goToProductsPage(); }}
        >
          <LuStore />
        </button>

        <Link to="/" className="railBtn" aria-label="공지사항" data-tooltip="공지사항" onClick={triggerPop}>
          <LuMegaphone />
        </Link>

        <button
          type="button"
          className="railBtn"
          aria-label="검색"
          data-tooltip="검색"
          onClick={(e) => { triggerPop(e); openSearch(); }}
        >
          <LuSearch />
        </button>

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
          aria-label="마이페이지"
          data-tooltip="마이페이지"
          onClick={(e) => { triggerPop(e); openMyPage(); }}
        >
          <LuUserRound />
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

        <span className="railDivider" />

        {isLoggedIn ? (
          <button
            type="button"
            className="railBtn"
            aria-label="로그아웃"
            data-tooltip="로그아웃"
            onClick={(e) => { triggerPop(e); handleLogout(); }}
          >
            <LuLogOut />
          </button>
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
          aria-label="끝으로"
          data-tooltip="끝으로"
          onClick={(e) => { triggerPop(e); scrollToBottom(); }}
        >
          <LuChevronsRight />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
