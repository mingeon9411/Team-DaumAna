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
  LuChevronsUp,
  LuChevronsDown,
} from "react-icons/lu";
import { logoutUser, getCartItems } from "../../api";

function Sidebar() {
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );

  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const fetchCartCount = () => {
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
    return () => {
      window.removeEventListener("cartchange", fetchCartCount);
      window.removeEventListener("authchange", fetchCartCount);
    };
  }, []);

  useEffect(() => {
    if (isHome && !localStorage.getItem("access_token")) {
      localStorage.removeItem("cartItems");
      setCartCount(0);
    }
  }, [isHome]);

  // 검색 결과 페이지 진입 시 현재 쿼리를 검색창에 표시
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const q = params.get("q") || "";
      setSearchQuery(q);
      setSearchOpen(!!q);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    window.dispatchEvent(new Event("darkmodechange"));
  }, [darkMode]);

  const executeSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") executeSearch();
  };

  const handleSearchIconClick = () => {
    if (searchOpen && searchQuery.trim()) {
      executeSearch();
    } else {
      setSearchOpen(!searchOpen);
    }
  };

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const triggerPop = (e) => {
    const el = e.currentTarget;
    el.classList.remove("railPop");
    void el.offsetWidth; // 리플로우로 애니메이션 재시작 보장
    el.classList.add("railPop");
  };

  const scrollToTop = () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    if (window.lenis) window.lenis.scrollTo("bottom");
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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
        <Link to="/" className="railBtn" aria-label="상품" data-tooltip="상품" onClick={triggerPop}>
          <LuStore />
        </Link>

        <Link to="/" className="railBtn" aria-label="공지사항" data-tooltip="공지사항" onClick={triggerPop}>
          <LuMegaphone />
        </Link>

        <div className="railSearch">
          <button
            type="button"
            className="railBtn"
            aria-label="검색"
            data-tooltip="검색"
            onClick={(e) => { triggerPop(e); handleSearchIconClick(); }}
          >
            <LuSearch />
          </button>

          <div className={`railSearchFlyout ${searchOpen ? "railSearchFlyoutOpen" : ""}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="7월 할인행사 이벤트"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        <span className="railDivider" />

        <Link to="/cart" className="railBtn" aria-label="장바구니" data-tooltip="장바구니" onClick={triggerPop}>
          <LuShoppingBag />
          {cartCount > 0 && <span className="railBadge">{cartCount}</span>}
        </Link>

        <Link to="/mypage" className="railBtn" aria-label="마이페이지" data-tooltip="마이페이지" onClick={triggerPop}>
          <LuUserRound />
        </Link>

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
          <Link to="/login" className="railBtn" aria-label="로그인" data-tooltip="로그인" onClick={triggerPop}>
            <LuUserRoundPlus />
          </Link>
        )}

        <span className="railDivider" />

        <button
          type="button"
          className="railBtn"
          aria-label="맨 위로"
          data-tooltip="맨 위로"
          onClick={(e) => { triggerPop(e); scrollToTop(); }}
        >
          <LuChevronsUp />
        </button>

        <button
          type="button"
          className="railBtn"
          aria-label="맨 아래로"
          data-tooltip="맨 아래로"
          onClick={(e) => { triggerPop(e); scrollToBottom(); }}
        >
          <LuChevronsDown />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
