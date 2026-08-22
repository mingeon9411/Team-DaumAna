import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop";
import DoorIntro from "./component/DoorIntro/DoorIntro";
import JipdaumHanokLogo from "./assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "./assets/logo/Jipdaum-logo-Dark-transparent.png";
import Header from "./component/Header/Header";
import Sidebar from "./component/Sidebar/Sidebar";
import MyPage from "./component/MyPage/MyPage";
import WithdrawModal from "./component/WithDraw/WithdrawModal";
import Home from "./component/Home/Home";

import Cart from "./component/Cart/Cart";
import NoticeModal from "./component/NoticeModal/NoticeModal";
import Welcome from "./component/Welcome/Welcome";
import ProductDetail from "./component/ProductDetail/ProductDetail";
import HomeProductDetail from "./component/Home/HomeProductDetail";
import SocialCallback from "./component/SocialCallback/SocialCallback";
import EmailVerify from "./component/EmailVerify/EmailVerify";
import SearchResults from "./component/SearchResults/SearchResults";
import KoreanHall from "./component/KoreanHall/KoreanHall";
import Checkout from "./component/Checkout/Checkout";
import CheckoutKoreanHall from "./component/Checkout/CheckoutKoreanHall";
import OrderComplete from "./component/OrderComplete/OrderComplete";
import CompanyInfoModal from "./component/CompanyInfoModal/CompanyInfoModal";
import AuthModal from "./component/AuthModal/AuthModal";
import { AuthModalProvider } from "./context/AuthModalContext";
import { CartModalProvider } from "./context/CartModalContext";
import { MyPageModalProvider } from "./context/MyPageModalContext";
import { NoticeModalProvider } from "./context/NoticeModalContext";
import { CompanyInfoModalProvider } from "./context/CompanyInfoModalContext";
import { WithdrawModalProvider } from "./context/WithdrawModalContext";
import { createPagingController } from "./utils/snapSetup";
import { NAV_FLAGS, NAV_ZONE } from "./utils/navFlags";
import "./App.css";

// 탭 파비콘 — 한국관("/korean-hall")에서는 집다움 한옥 로고, 그 외 페이지에서는 JD 로고를 사용한다.
function FaviconController() {
  const { pathname } = useLocation();

  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    link.href = pathname === "/korean-hall" ? "/jipdaum-logo-light.png" : "/favicon-jd.png";
  }, [pathname]);

  return null;
}

function DoorIntroController() {
  const { pathname, key } = useLocation();
  const [showDoorIntro, setShowDoorIntro] = useState(false);
  const isKoreanHall = pathname === "/korean-hall";

  useEffect(() => {
    if (pathname !== "/" && !isKoreanHall) {
      setShowDoorIntro(false);
      return;
    }

    // 상품 상세페이지(HomeProductDetail/ProductDetail)는 마운트될 때 자신이
    // "home"/"korean-hall" 중 어느 쪽 상세페이지인지 productDetailReturnZone에
    // 남겨둔다. 여기서 그 흔적을 보고 "방금 그 상세페이지를 보다가 여기로
    // 돌아왔다"를 판단하면, "목록으로" 버튼 클릭(PUSH)이든 브라우저 뒤로가기
    // (POP)든 트리거 방식과 무관하게 동일하게 처리된다 — 대문 애니메이션 없이
    // 곧장 상품 목록으로. 이 페이지에 도착한 이상(스킵 대상이든 아니든) 다음
    // 방문에 잘못 재사용되지 않도록 항상 지운다.
    const returnZone = sessionStorage.getItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE);
    sessionStorage.removeItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE);
    const skip = returnZone === (isKoreanHall ? NAV_ZONE.KOREAN_HALL : NAV_ZONE.HOME);

    if (skip) {
      if (isKoreanHall) {
        sessionStorage.setItem(NAV_FLAGS.SKIP_KOREAN_HALL_INTRO, "1");
      } else {
        sessionStorage.setItem(NAV_FLAGS.SKIP_HOME_DEFAULT_PANEL, "1");
        sessionStorage.setItem(NAV_FLAGS.PENDING_HOME_PANEL_INDEX, "4");
      }
    }

    // doorintroend 이벤트(사이드바 펼침 등)는 건너뛸 때도 그대로 쏴줘야 하므로
    // 지연시간만 0으로 줄인다(리스너가 붙을 다음 틱까지 기다리기 위해 0ms 유지).
    setShowDoorIntro(!skip);
    const timer = setTimeout(() => {
      setShowDoorIntro(false);
      window.dispatchEvent(new Event("doorintroend"));
    }, skip ? 0 : 7700);
    return () => clearTimeout(timer);
  }, [key, pathname, isKoreanHall]);

  if (!showDoorIntro) return null;

  return isKoreanHall ? (
    <DoorIntro logoLight={JipdaumHanokLogo} logoDark={JipdaumHanokLogoDark} theme="hanji" />
  ) : (
    <DoorIntro lightEffect="sparkle" />
  );
}

function App() {
    const lenisRef = useRef(null);
    const controllerRef = useRef(null);
    const panelsUnsubRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.7,
      orientation: "horizontal",
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // "proximity"(기본값)는 스크롤이 멈춘 지점이 다음 패널과 거리 임계값(뷰포트의
    // 50%) 이상 떨어져 있으면 스냅을 포기하고 그 자리에 멈춰버려, 전체화면 패널
    // 두 개가 반반씩 걸친 어중간한 상태로 남을 수 있다. "mandatory"는 임계값 없이
    // 스크롤이 멈출 때마다 항상 가장 가까운 패널로 스냅해 이 상태를 방지한다.
    // (스크롤 도중엔 자유롭게 흐르고, 멈췄을 때만 반드시 한 패널로 완성된다.)
    const snap = new Snap(lenis, {
      type: "mandatory",
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    const controller = createPagingController(lenis, snap);
    controllerRef.current = controller;

    // ScrollToTop의 라우트 변경 이펙트가 이 이펙트보다 먼저 실행될 수 있어(자식이 부모보다 먼저 커밋됨),
    // 최초 마운트 시점의 패널 등록은 여기서 직접 처리한다.
    panelsUnsubRef.current = controller.registerPanels();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      panelsUnsubRef.current?.();
      controller.destroy();
      snap.destroy();
      controllerRef.current = null;
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
    <AuthModalProvider>
    <CartModalProvider>
    <MyPageModalProvider>
    <NoticeModalProvider>
    <CompanyInfoModalProvider>
    <WithdrawModalProvider>
    <ScrollToTop lenis={lenisRef} controller={controllerRef} panelsUnsub={panelsUnsubRef} />
    <FaviconController />
    <DoorIntroController />
    <Header />
    <Sidebar />
    <AuthModal />
    <Cart />
    <MyPage />
    <NoticeModal />
    <CompanyInfoModal />
    <WithdrawModal />

    <div className="hTrack">
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/welcome" element={<Welcome />} />
        <Route path="/social-callback" element={<SocialCallback />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/korean-hall" element={<KoreanHall />} />

        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/item/:id" element={<HomeProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/korean-hall/checkout" element={<CheckoutKoreanHall />} />
        <Route path="/order-complete" element={<OrderComplete />} />

      </Routes>
    </div>
    </WithdrawModalProvider>
    </CompanyInfoModalProvider>
    </NoticeModalProvider>
    </MyPageModalProvider>
    </CartModalProvider>
    </AuthModalProvider>
    </BrowserRouter>
  );
}

export default App;