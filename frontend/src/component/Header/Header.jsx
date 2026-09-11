import "./Header.css";
import { useEffect, useRef, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Settings as SettingsIcon } from "lucide-react";
import { getCartItems, logoutUser } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import PopularKeywordsSidebar from "../Sidebar/PopularKeywordsSidebar";
import SearchOverlay from "./SearchOverlay";
import { getRecentSearches, addRecentSearch } from "../../utils/recentSearches";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const isNaturalLanguageSearch = (query) =>
  /\s/.test(query.trim()) && (
    query.trim().split(/\s+/).length >= 3 ||
    /추천|찾아|보여|싶|위한|어울|공간|방|거실|원룸|신혼/.test(query)
  );

// 9월 가을 시즌 연출 — 헤더 배너 위로 단풍잎이 흩날리며 떨어진다. Sidebar.css의
// 옛 한국관 꽃잎 연출(khPetal)과 같은 방식: Math.random() 대신 인덱스 기반
// 의사난수로 좌표·타이밍을 고정해 리렌더될 때마다 잎이 순간이동하지 않게 한다.
const HEADER_LEAVES = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 9.7 + 4) % 100,
  delay: (i * 0.83) % 8,
  duration: 7 + ((i * 1.31) % 5),
  scale: 0.6 + ((i * 0.43) % 0.6),
  hue: i % 4,
}));

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";
  const isItemDetail = location.pathname.startsWith("/item/");
  const isSettingsPage = location.pathname === "/settings";
  const isCustomerCenterPage = location.pathname === "/customer-center";
  const isLookbookPage = location.pathname.startsWith("/lookbook");
  const isNoticePage = location.pathname === "/notice";
  const isMyPage = location.pathname === "/mypage";
  const isCheckoutPage = location.pathname === "/checkout";
  const isSearchPage = location.pathname === "/search";
  // 로그인/회원가입은 이제 모달이 아니라 독립 페이지(/login, /register)라, 사이트
  // 공용 헤더(검색·로그인/회원가입 링크 등)가 같이 떠 있으면 오히려 모달처럼
  // 보인다 — 이 두 라우트에서는 헤더 자체를 렌더링하지 않는다.
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  // 스크롤 시 배너가 생기는 효과(::before 반투명→불투명 전환)는 자체 스크롤
  // 콘텐츠가 있는 페이지 전부에 동일하게 적용한다 — 홈과 똑같이 최상단에선
  // 숨었다가 스크롤해야 나온다. 주문완료(.ocPage)는 카드 한 장짜리 화면이라
  // 스크롤 자체가 없어 이 목록에서 뺐다(넣으면 배너가 영영 안 나타남).
  const isProductPage = isHome || isItemDetail || isSettingsPage || isCustomerCenterPage || isCartPage
    || isLookbookPage || isNoticePage || isMyPage || isCheckoutPage || isSearchPage;
  // 위 페이지 중 배경 자체가 .metallicSilver(파스텔 톤)인 곳만 배너도 같은
  // 파스텔 그러데이션으로 — 결제·검색결과는 배경이 단색이라 배너도 그냥
  // var(--background)로 맞춘 기본 productPageHeader만 쓴다(homePageHeader
  // 없이 아래 CSS의 productPageHeader::before가 이미 그 배경색을 쓴다).
  const isPastelPage = isHome || isItemDetail || isSettingsPage || isCustomerCenterPage || isCartPage
    || isLookbookPage || isNoticePage || isMyPage;

  // 위 페이지들은 최상단에서부터 검색창·링크가 떠 있으면 위화감이 크다(배너
  // 자체가 스크롤 전엔 안 보이는데 그 안의 검색창·링크만 먼저 떠 있으면 배너
  // 없이 붕 떠 보인다) — 스크롤을 내려야 배너와 함께 나타나게 한다. 각 페이지
  // 마다 자체 "목록으로"/뒤로가기 버튼이 따로 있어, 헤더 내비가 잠깐 숨어
  // 있어도 홈으로 돌아갈 수단이 없어지지 않는다. 홈은 에세이 인트로 패널이
  // 없어졌지만, 상품 그리드 맨 위에 여전히 같은 검색창·유틸 링크가 인라인으로
  // 떠 있어서(Home.jsx의 "#home-inline-nav-end" 참고) 그게 화면 밖으로
  // 스크롤되기 전까지는 배너 쪽을 계속 숨겨야 두 벌이 겹쳐 보이지 않는다.
  const showExpandedNav = isProductPage ? scrolled : true;

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
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const closeSearchOverlay = () => {
    setSearchOverlayOpen(false);
    setHeaderSearchQuery("");
  };
  const submitHeaderSearch = (query) => {
    setRecentSearches(addRecentSearch(query));
    if (isHome && !isNaturalLanguageSearch(query)) {
      window.dispatchEvent(new CustomEvent("headerProductSearch", { detail: { query } }));
    } else {
      const semantic = isNaturalLanguageSearch(query) ? "&semantic=1" : "";
      navigate(`/search?q=${encodeURIComponent(query)}${semantic}`);
    }
    closeSearchOverlay();
  };

  // 최근 검색어 — Sidebar 독 검색과 같은 localStorage 키(utils/recentSearches.js)를
  // 공유한다. SearchOverlay(풀스크린 검색 모달)가 아직 입력 전일 때 목록으로 보여준다.
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  useEffect(() => {
    const sync = () => setRecentSearches(getRecentSearches());
    window.addEventListener("recentsearchchange", sync);
    return () => window.removeEventListener("recentsearchchange", sync);
  }, []);

  // Home.jsx 상품 그리드 맨 위에도 같은 검색 트리거가 인라인으로 있다 —
  // headerProductSearch(반대 방향: 여기 → Home.jsx)와 짝을 이루는 이벤트로,
  // 그쪽 버튼을 눌러도 이 오버레이가 뜨게 한다. 검색 UI를 두 벌 따로 만들지
  // 않고 이 오버레이 하나만 공유하기 위함.
  useEffect(() => {
    const open = () => setSearchOverlayOpen(true);
    window.addEventListener("openHeaderSearchOverlay", open);
    return () => window.removeEventListener("openHeaderSearchOverlay", open);
  }, []);

  // 상품상세(.homeDetailPage)·상품목록(#home-products)·설정(.ssPage)·
  // 고객센터(.ccPage)·장바구니(.cartPage)·룩북(.lookbookPage)·공지사항
  // (.noticePage)·마이페이지(.mypagePage)·결제(.checkoutPage)는 전부 Lenis의
  // 가로 스크롤에서 제외된(data-lenis-prevent) 자기만의 세로 스크롤
  // (overflow-y: auto) 영역이라 window에는 scroll 이벤트가 전혀 발생하지
  // 않는다 — 그래서 리스너를 window가 아니라 해당 엘리먼트에 따로 붙여야 하고,
  // "최상단"도 window가 아니라 그 엘리먼트 자신의 scrollTop 기준으로 판단해야
  // 한다. 검색결과(/search)는 반대로 이 목록에 없는 페이지의 예 — 자체 세로
  // 스크롤 영역이 아니라 홈처럼 전역 가로 Lenis 패널의 일부라 아래 else
  // 분기(window.scrollX)가 그대로 맞는다.
  //
  // document.querySelector("[data-lenis-prevent]") 하나로 퉁치지 않고 페이지별
  // 클래스를 그대로 쓰는 이유 — 검색 오버레이(SearchOverlay)·챗봇 패널도 같은
  // data-lenis-prevent 속성을 쓰는데 헤더/챗봇은 페이지 콘텐츠보다 DOM에 먼저
  // 나와서 querySelector가 그쪽을 잘못 집어올 수 있다.
  useEffect(() => {
    const itemDetailEl = isItemDetail ? document.querySelector(".homeDetailPage") : null;
    const productListEl = isHome ? document.querySelector("#home-products") : null;
    // Home.jsx 그리드 맨 위에 이미 같은 검색창·유틸 링크가 인라인으로 떠 있다
    // (Home.jsx의 "#home-inline-nav-end" 참고) — 배너 쪽 검색·유틸 링크는 그게
    // 화면 밖으로 완전히 스크롤된 뒤에만 떠야 두 벌이 동시에 보이는 구간이 안 생긴다.
    const inlineNavEndEl = isHome ? document.querySelector("#home-inline-nav-end") : null;
    const settingsEl = isSettingsPage ? document.querySelector(".ssPage") : null;
    const customerCenterEl = isCustomerCenterPage ? document.querySelector(".ccPage") : null;
    const cartEl = isCartPage ? document.querySelector(".cartPage") : null;
    const lookbookEl = isLookbookPage ? document.querySelector(".lookbookPage") : null;
    const noticeEl = isNoticePage ? document.querySelector(".noticePage") : null;
    const myPageEl = isMyPage ? document.querySelector(".mypagePage") : null;
    const checkoutEl = isCheckoutPage ? document.querySelector(".checkoutPage") : null;
    const selfScrollEl = itemDetailEl || settingsEl || customerCenterEl || cartEl
      || lookbookEl || noticeEl || myPageEl || checkoutEl;

    const handleScroll = () => {
      if (isHome) {
        // 홈은 상품 그리드(#home-products) 말고도 에세이·룩북·사업자정보 같은
        // 가로 스냅 패널이 여러 개 더 있다 — 상품 그리드를 한 번 내려서 배너가
        // 뜬 뒤 오른쪽/왼쪽 다른 패널로 넘어가도 그 엘리먼트의 scrollTop 값은
        // 그대로 남아있어(가로 이동은 세로 스크롤을 초기화하지 않음), 배너가
        // 계속 고정돼 보이는 버그가 있었다. "지금 실제로 보이는 패널이 상품
        // 그리드인지"부터 확인한다.
        const isProductGridActive = productListEl
          ? Math.abs(productListEl.getBoundingClientRect().left) < window.innerWidth / 2
          : false;
        const inlineNavGone = inlineNavEndEl
          ? inlineNavEndEl.getBoundingClientRect().bottom <= 0
          : (productListEl?.scrollTop ?? 0) > 50;
        setScrolled(isProductGridActive && inlineNavGone);
      } else if (selfScrollEl) {
        setScrolled(selfScrollEl.scrollTop > 50);
      } else {
        setScrolled(window.scrollX > 50);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    productListEl?.addEventListener("scroll", handleScroll);
    selfScrollEl?.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      productListEl?.removeEventListener("scroll", handleScroll);
      selfScrollEl?.removeEventListener("scroll", handleScroll);
    };
  }, [
    location.pathname, isHome, isItemDetail, isSettingsPage, isCustomerCenterPage,
    isCartPage, isLookbookPage, isNoticePage, isMyPage, isCheckoutPage,
  ]);

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
    } ${!isHome ? "lightBg" : ""} ${
      isProductPage ? "productPageHeader" : ""
    } ${isPastelPage ? "homePageHeader" : ""} ${showExpandedNav ? "expanded" : ""}`}
    >
      <div className="headerLeaves" aria-hidden="true">
        {HEADER_LEAVES.map((l, i) => (
          <span
            key={i}
            className={`headerLeaf headerLeaf-${l.hue}`}
            style={{
              left: `${l.left}%`,
              animationDelay: `${l.delay}s`,
              animationDuration: `${l.duration}s`,
              "--headerLeafScale": l.scale,
            }}
          />
        ))}
      </div>

      {showExpandedNav && (
        <div className="headerLeft">
          <div className="headerSearchWrap">
            {/* 29CM 레퍼런스 — 클릭하면 그 자리에서 커지는 대신 화면 전체를 덮는
                검색 모달(SearchOverlay)이 뜬다. 이 줄 자체는 그 모달을 여는
                버튼일 뿐, 직접 타이핑은 모달 안 입력창에서 한다. */}
            <button type="button" className="headerSearchTrigger" onClick={() => setSearchOverlayOpen(true)}>
              <Search size={14} className="headerSearchIcon" aria-hidden="true" />
              <span className="headerSearchPlaceholder" style={SANS}>상품명, 브랜드, 라벨 검색</span>
            </button>
            {/* PopularKeywordsSidebar가 자체 mt-2로 입력줄 바로 아래에 붙는다 —
                평소 눈에 띄는 자동 회전 미니바로, 눌러서 펼치면 자체 드롭다운으로
                전체 순위를 보여준다(풀스크린 모달과는 별개의 더 가벼운 경로). */}
            <PopularKeywordsSidebar
              onSelect={(keyword) => { setHeaderSearchQuery(keyword); submitHeaderSearch(keyword); }}
            />
          </div>
        </div>
      )}

      {/* 예전엔 SiteFooter 패널에서만 숨겼는데(isFooterPanel), 로고가 스크롤 중에
          잠깐씩 사라지는 게 오히려 어색해서 항상 보이게 되돌린다. */}
      <Link to="/" className="logo" aria-label="집다움 홈">
        <span className="logoSwap">
          <span className="logoText logoText--ko" style={SANS}>집다움</span>
          <span className="logoText logoText--en">Home, Made Yours</span>
        </span>
      </Link>

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
              <button type="button" onClick={openLogin} className="headerNavLink headerNavLinkAuth">로그인</button>
              <span aria-hidden="true" className="headerNavDivider">|</span>
              <button type="button" onClick={openRegister} className="headerNavLink headerNavLinkAuth">회원가입</button>
            </>
          )}
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/cart")} className="headerNavLink">
            장바구니{cartCount > 0 && ` (${cartCount})`}
          </button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/lookbook")} className="headerNavLink">룩북</button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/notice")} className="headerNavLink">공지사항</button>
          <span aria-hidden="true" className="headerNavDivider">|</span>
          <button type="button" onClick={() => navigate("/customer-center")} className="headerNavLink">고객센터</button>
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

      {searchOverlayOpen && (
        <SearchOverlay
          query={headerSearchQuery}
          onQueryChange={setHeaderSearchQuery}
          onSubmit={submitHeaderSearch}
          onClose={closeSearchOverlay}
          recentSearches={recentSearches}
          setRecentSearches={setRecentSearches}
        />
      )}
    </header>
  );
}

export default Header;
