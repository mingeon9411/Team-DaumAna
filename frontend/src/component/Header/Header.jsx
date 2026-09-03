import "./Header.css";
import { useEffect, useRef, useState } from "react";

import JDLogo from "../../assets/J.D 로고.svg";
import Ilwolobongdo from "../../assets/decor/ilwolobongdo.png";
import IlwolobongdoDark from "../../assets/decor/ilwolobongdo-dark.png";
// -sm: 헤더에선 37px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Clock, X, Settings as SettingsIcon } from "lucide-react";
import { getCartItems, logoutUser } from "../../api";
import { NAV_FLAGS } from "../../utils/navFlags";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import PopularKeywordsSidebar from "../Sidebar/PopularKeywordsSidebar";
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "../../utils/recentSearches";
import { KH_POPULAR_KEYWORDS } from "../../data/koreanHallKeywords";

const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isFooterPanel, setIsFooterPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";
  const isKoreanHall = location.pathname === "/korean-hall";
  // /product/:id는 한국관 상품만 다루는 상세페이지(App.jsx 라우팅) — 로고·인기
  // 검색어는 한국관 기준으로 보여준다. 스크롤 배너 전환(showExpandedNav 등)까지
  // isKoreanHall에 얹으면 이 페이지의 상시 노출 헤더가 스크롤 전엔 숨어버리므로
  // 그쪽엔 관여하지 않고, 로고/검색어 표시에만 별도로 쓴다.
  const isKoreanHallProduct = location.pathname.startsWith("/product/");
  const isItemDetail = location.pathname.startsWith("/item/");
  const isSettingsPage = location.pathname === "/settings";
  const isCustomerCenterPage = location.pathname === "/customer-center";
  // 로그인/회원가입은 이제 모달이 아니라 독립 페이지(/login, /register)라, 사이트
  // 공용 헤더(검색·로그인/회원가입 링크 등)가 같이 떠 있으면 오히려 모달처럼
  // 보인다 — 이 두 라우트에서는 헤더 자체를 렌더링하지 않는다.
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  // 스크롤 시 배너가 생기는 효과(::before 반투명→불투명 전환)는 상품목록(홈)·
  // 상품상세·설정·고객센터 페이지에만 적용.
  const isProductPage = isHome || isItemDetail || isSettingsPage || isCustomerCenterPage;

  // 로그인/장바구니 등 유틸 링크와 검색은 왼쪽 사이드바 독이 사라지며 헤더가
  // 유일한 상시 내비게이션이 된 페이지(장바구니 등)에서는 스크롤 여부와 무관하게
  // 항상 노출한다 — 이 페이지들은 헤더 말고는 빠져나갈 다른 수단이 없기 때문.
  //
  // 상품 목록(홈)·상품상세·설정·고객센터·한국관 페이지는 최상단에서부터 검색창·
  // 링크가 떠 있으면 위화감이 크다(홈·한국관은 전체화면 인트로 영상, 설정·고객
  // 센터는 파스텔 배경의 첫 화면, 상품상세는 배너 자체가 스크롤 전엔 안 보이는데
  // 그 안의 검색창·링크만 먼저 떠 있으면 배너 없이 붕 떠 보인다) — 이 다섯 곳은
  // 스크롤을 내려야 배너와 함께 나타나게 한다. 고객센터는 자체 "목록으로" 버튼
  // (CustomerCenter.jsx)이, 한국관은 항상 떠 있는 로고(홈 이동)와 하단 독바가,
  // 상품상세는 자체 "목록으로" 버튼(HomeProductDetail.jsx)이 따로 있어, 헤더
  // 내비가 잠깐 숨어 있어도 홈으로 돌아갈 수단이 없어지지 않는다.
  const showExpandedNav = (isHome || isSettingsPage || isCustomerCenterPage || isKoreanHall || isItemDetail) ? scrolled : true;

  // 유틸 링크(로그인/회원가입 · 마이페이지/로그아웃 · 장바구니)용 — Home.jsx의
  // 카테고리 위 유틸 링크와 같은 기준(access_token)·같은 이벤트로 동기화한다.
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [cartCount, setCartCount] = useState(0);
  const { openLogin, openRegister } = useAuthModal();
  const { openMyPage } = useMyPageModal();

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    window.addEventListener("authchange", sync);
    return () => window.removeEventListener("authchange", sync);
  }, []);

  // 장바구니 배지는 showExpandedNav(상품목록·상품상세 배너)에서만 보이니, 그
  // 외 페이지에서까지 매번 API를 부를 필요는 없다.
  useEffect(() => {
    if (!isProductPage) return;
    const fetchCartCount = () => {
      if (!localStorage.getItem("access_token")) {
        setCartCount(0);
        return;
      }
      getCartItems()
        .then((res) => setCartCount(res.data.reduce((sum, item) => sum + (item.quantity || 1), 0)))
        .catch(() => setCartCount(0));
    };
    fetchCartCount();
    window.addEventListener("cartchange", fetchCartCount);
    window.addEventListener("authchange", fetchCartCount);
    return () => {
      window.removeEventListener("cartchange", fetchCartCount);
      window.removeEventListener("authchange", fetchCartCount);
    };
  }, [isProductPage]);

  // 예전엔 왼쪽 사이드바 독의 "회사 정보" 버튼이 하던 일 — 전자상거래법상 사업자
  // 정보 표시 요건 때문에 어느 페이지에서든 닿을 수 있어야 한다. 사업자 정보는
  // 이제 SiteFooter(룩북 패널 맨 아래 등)에 있으므로, 홈이면 바로 맨 끝까지 스크롤,
  // 다른 페이지면 홈으로 이동 후 Sidebar.jsx가 PENDING_SCROLL_TO_END 신호를 보고
  // 이어서 스크롤한다.
  const goToBusinessInfo = () => {
    if (isHome) {
      window.lenis?.resize();
      window.lenis?.scrollTo("end");
      return;
    }
    sessionStorage.setItem(NAV_FLAGS.PENDING_SCROLL_TO_END, "1");
    navigate("/");
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await logoutUser({ refresh });
    } catch (err) {
      console.error("logout API failed:", err);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    window.location.replace("/");
  };

  // 홈에서는 Home.jsx가 이미 마운트돼 있으니 커스텀 이벤트로 그 자리에서 바로
  // 필터링한다(headerProductSearch). 그 외 페이지(상품상세 등)는 Home.jsx가
  // 없어 이벤트를 받을 곳이 없으므로, 검색 결과 페이지(/search)로 이동한다.
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [headerSearchFocused, setHeaderSearchFocused] = useState(false);
  const submitHeaderSearch = (query) => {
    setRecentSearches(addRecentSearch(query));
    if (isHome) {
      window.dispatchEvent(new CustomEvent("headerProductSearch", { detail: { query } }));
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // 최근 검색어 — Sidebar 독 검색과 같은 localStorage 키(utils/recentSearches.js)를
  // 공유한다. 검색창에 포커스를 주면(아직 입력 전) 아래에 목록으로 뜬다.
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  useEffect(() => {
    const sync = () => setRecentSearches(getRecentSearches());
    window.addEventListener("recentsearchchange", sync);
    return () => window.removeEventListener("recentsearchchange", sync);
  }, []);
  const showRecentSearches = headerSearchFocused && !headerSearchQuery.trim() && recentSearches.length > 0;

  // 한국관(.khPage)·상품상세(.homeDetailPage)·상품목록(#home-products)·설정
  // (.ssPage)·고객센터(.ccPage)는 전부 Lenis의 가로 스크롤에서 제외된
  // (data-lenis-prevent) 자기만의 세로 스크롤(overflow-y: auto) 영역이라
  // window에는 scroll 이벤트가 전혀 발생하지 않는다 — 그래서 리스너를 window가
  // 아니라 해당 엘리먼트에 따로 붙여야 하고, "최상단"도 window가 아니라 그
  // 엘리먼트 자신의 scrollTop 기준으로 판단해야 한다.
  useEffect(() => {
    const koreanHallEl = isKoreanHall ? document.querySelector(".khPage") : null;
    const itemDetailEl = isItemDetail ? document.querySelector(".homeDetailPage") : null;
    const productListEl = isHome ? document.querySelector("#home-products") : null;
    const settingsEl = isSettingsPage ? document.querySelector(".ssPage") : null;
    const customerCenterEl = isCustomerCenterPage ? document.querySelector(".ccPage") : null;

    const handleScroll = () => {
      if (isHome) {
        // 홈은 상품 그리드(#home-products) 말고도 에세이·룩북·사업자정보 같은
        // 가로 스냅 패널이 여러 개 더 있다 — 상품 그리드를 한 번 내려서 배너가
        // 뜬 뒤 오른쪽/왼쪽 다른 패널로 넘어가도 그 엘리먼트의 scrollTop 값은
        // 그대로 남아있어(가로 이동은 세로 스크롤을 초기화하지 않음), 배너가
        // 계속 고정돼 보이는 버그가 있었다. isFooterPanel과 같은 방식으로
        // "지금 실제로 보이는 패널이 상품 그리드인지"부터 확인한다.
        const isProductGridActive = productListEl
          ? Math.abs(productListEl.getBoundingClientRect().left) < window.innerWidth / 2
          : false;
        setScrolled(isProductGridActive && (productListEl?.scrollTop ?? 0) > 50);
      } else if (isKoreanHall) {
        setScrolled((koreanHallEl?.scrollTop ?? 0) > 50);
      } else if (isItemDetail) {
        setScrolled((itemDetailEl?.scrollTop ?? 0) > 50);
      } else if (isSettingsPage) {
        setScrolled((settingsEl?.scrollTop ?? 0) > 50);
      } else if (isCustomerCenterPage) {
        setScrolled((customerCenterEl?.scrollTop ?? 0) > 50);
      } else {
        setScrolled(window.scrollX > 50);
      }

      // 푸터 패널에 도달했는지 — 헤더 로고는 그 패널에서만 숨긴다.
      // (한국관처럼 푸터 자체가 없는 라우트에서는 항상 false)
      const footerPanel = document.querySelector(".footer");
      setIsFooterPanel(
        footerPanel ? footerPanel.getBoundingClientRect().left <= window.innerWidth / 2 : false
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    koreanHallEl?.addEventListener("scroll", handleScroll);
    itemDetailEl?.addEventListener("scroll", handleScroll);
    productListEl?.addEventListener("scroll", handleScroll);
    settingsEl?.addEventListener("scroll", handleScroll);
    customerCenterEl?.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      koreanHallEl?.removeEventListener("scroll", handleScroll);
      itemDetailEl?.removeEventListener("scroll", handleScroll);
      productListEl?.removeEventListener("scroll", handleScroll);
      settingsEl?.removeEventListener("scroll", handleScroll);
      customerCenterEl?.removeEventListener("scroll", handleScroll);
    };
  }, [isHome, isKoreanHall, isItemDetail, isSettingsPage, isCustomerCenterPage]);

  // 다크모드는 Sidebar가 소유 — body.dark 클래스 변경을 이벤트로 전달받아 일월오봉도만 동기화
  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  // 이 헤더는 fixed + height:auto라 상태(scrolled/검색창 포커스 등)에 따라 실제
  // 높이가 계속 바뀐다 — RecentlyViewedSidebar(오른쪽 최근 본 상품 독)가 예전엔
  // "top-32(128px)" 같은 고정값으로 그 아래 여백을 어림짐작했는데, 헤더가 그
  // 값보다 조금이라도 더 자라면(예: 최근 검색어 목록이 펼쳐질 때) 독의 윗부분이
  // z-index 더 높은 헤더 배너에 가려 안 보였다. 실제 렌더링된 높이를 CSS
  // 변수로 공개해두면, 헤더가 앞으로 또 커지더라도 독이 항상 그 아래에 맞춰
  // 따라붙는다(한쪽 값만 고치면 되는 근본 수정 — 매번 여백 숫자를 다시 맞추는
  // 대신 아예 좌표 계산 자체를 헤더에 맡긴다).
  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publishHeight = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isAuthPage) return null;

  return (

    <header ref={headerRef} className={`header ${scrolled ? "scrolled" : ""} ${
      isCartPage ? "cartHeader" : ""
    } ${!isHome ? "lightBg" : ""} ${isKoreanHall ? "koreanHallHeader" : ""} ${
      isProductPage ? "productPageHeader" : ""
    } ${isProductPage ? "homePageHeader" : ""} ${showExpandedNav ? "expanded" : ""}`}
    >
      {isKoreanHall && (
        <>
          <div className="starField" />
          <span className="headerMoon" />
          <span className="headerSun" />
          <img src={darkMode ? IlwolobongdoDark : Ilwolobongdo} alt="" aria-hidden="true" className="headerIlwol" />
        </>
      )}

      {/* 검색창에 포커스가 가면 확대해 부각시키고, 배경은 스크림으로 살짝 눌러
          시선을 검색창에 모은다(29CM류 검색 모달의 축소판 — 별도 페이지/모달
          없이 이 배너 안에서 크기만 순간적으로 커졌다 줄어드는 정도로 구현). */}
      <div className={`headerSearchScrim${headerSearchFocused ? " headerSearchScrimVisible" : ""}`} aria-hidden="true" />

      {showExpandedNav && (
        <div className="headerLeft">
          <div className={`headerSearchWrap${headerSearchFocused ? " headerSearchWrapFocused" : ""}`}>
            <form
              className="headerSearchInputRow"
              onSubmit={(e) => { e.preventDefault(); submitHeaderSearch(headerSearchQuery); setHeaderSearchFocused(false); }}
            >
              <Search size={14} className="headerSearchIcon" aria-hidden="true" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onFocus={() => setHeaderSearchFocused(true)}
                onBlur={() => setHeaderSearchFocused(false)}
                placeholder="상품명, 브랜드, 라벨 검색"
                aria-label="전체 상품 검색"
                className="headerSearchInput"
                style={SANS}
              />
            </form>
            {/* 입력줄에 포커스를 준 채 아직 아무것도 안 쳤으면(빈 값) 최근 검색어를,
                그 외엔 기존 인기 검색어 티커를 보여준다 — 버튼들은 onMouseDown에서
                preventDefault로 막아 클릭 전에 input이 blur되어 목록이 먼저
                사라지는 걸 방지한다(Sidebar.jsx 독 검색 플라이아웃과 동일 패턴). */}
            {showRecentSearches ? (
              <div className="headerRecentSearches">
                <div className="headerRecentSearchesHead">
                  <span>최근 검색어</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                  >
                    전체 삭제
                  </button>
                </div>
                <ul>
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setHeaderSearchQuery(term); submitHeaderSearch(term); setHeaderSearchFocused(false); }}
                      >
                        <Clock size={13} aria-hidden="true" />
                        {term}
                      </button>
                      <button
                        type="button"
                        className="headerRecentSearchRemove"
                        aria-label={`"${term}" 검색어 삭제`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setRecentSearches(removeRecentSearch(term))}
                      >
                        <X size={13} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              /* PopularKeywordsSidebar가 자체 mt-2로 입력줄 바로 아래에 붙는다 —
                 예전엔 이걸 위 form 안에 한 줄(flex row)로 같이 넣어서 좁은 폭
                 안에서 입력창과 겹쳐 보였다. 이제 검색줄과 별도의 블록으로 분리. */
              <PopularKeywordsSidebar
                data={isKoreanHall || isKoreanHallProduct ? KH_POPULAR_KEYWORDS : undefined}
                onSelect={(keyword) => { setHeaderSearchQuery(keyword); submitHeaderSearch(keyword); }}
              />
            )}
          </div>
        </div>
      )}

      {!isFooterPanel && (
        <Link to={isKoreanHall || isKoreanHallProduct ? "/korean-hall" : "/"} className="logo" aria-label="집다움 홈">
          {isKoreanHall || isKoreanHallProduct ? (
            <img
              src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
              alt="집다움"
              className="logoImg logoImgHanok"
            />
          ) : (
            <img src={JDLogo} alt="J.D" className="logoImg" />
          )}
        </Link>
      )}

      {showExpandedNav && (
        <div className="headerRight" style={SANS}>
          {isLoggedIn ? (
            <>
              <button type="button" onClick={openMyPage} className="headerNavLink">마이페이지</button>
              <span aria-hidden="true" className="headerNavDivider">|</span>
              <button type="button" onClick={handleLogout} className="headerNavLink">로그아웃</button>
            </>
          ) : (
            <>
              <button type="button" onClick={openLogin} className="headerNavLink">로그인</button>
              <span aria-hidden="true" className="headerNavDivider">|</span>
              <button type="button" onClick={openRegister} className="headerNavLink">회원가입</button>
            </>
          )}
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/cart")} className="headerNavLink">
            장바구니{cartCount > 0 && ` (${cartCount})`}
          </button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          {/* 한국관 안에서는 "한국관" 탭이 제자리 이동이라 무의미 — 메인으로 돌아가는
              기능으로 바꾼다. */}
          <button type="button" onClick={() => navigate(isKoreanHall ? "/" : "/korean-hall")} className="headerNavLink">
            {isKoreanHall ? "메인페이지" : "한국관"}
          </button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/notice")} className="headerNavLink">공지사항</button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/customer-center")} className="headerNavLink">고객센터</button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={goToBusinessInfo} className="headerNavLink">회사 정보</button>
        </div>
      )}

      {/* 링크 줄과 같이 흘러가지 않고 배너 우상단 모서리에 고정 — 다른 항목보다
          한 단 위(코너 배지)로 항상 눈에 띄는 자리를 준다. */}
      {showExpandedNav && (
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="headerSettingsBtn"
          aria-label="설정"
          data-tooltip="설정"
        >
          <SettingsIcon size={15} />
        </button>
      )}
    </header>
  );
}

export default Header;
