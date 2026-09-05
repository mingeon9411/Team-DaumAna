import { useEffect, useRef } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop";
import Header from "./component/Header/Header";
import MyPage from "./component/MyPage/MyPage";
import WithdrawModal from "./component/WithDraw/WithdrawModal";
import Home from "./component/Home/Home";

import Cart from "./component/Cart/Cart";
import Notice from "./component/Notice/Notice";
import Welcome from "./component/Welcome/Welcome";
import HomeProductDetail from "./component/Home/HomeProductDetail";
import SocialCallback from "./component/SocialCallback/SocialCallback";
import EmailVerify from "./component/EmailVerify/EmailVerify";
import SearchResults from "./component/SearchResults/SearchResults";
import CustomerCenter from "./component/CustomerCenter/CustomerCenter";
import Settings from "./component/Settings/Settings";
import Checkout from "./component/Checkout/Checkout";
import OrderComplete from "./component/OrderComplete/OrderComplete";
import Lookbook from "./component/Lookbook/Lookbook";
import LookbookPost from "./component/Lookbook/LookbookPost";
import AuthModal from "./component/AuthModal/AuthModal";
import AuthPage from "./component/AuthModal/AuthPage";
import CookieConsent from "./component/CookieConsent/CookieConsent";
import { AuthModalProvider } from "./context/AuthModalContext";
import { MyPageModalProvider } from "./context/MyPageModalContext";
import { WithdrawModalProvider } from "./context/WithdrawModalContext";
import { createPagingController } from "./utils/snapSetup";
import "./App.css";

function App() {
    const lenisRef = useRef(null);
    const controllerRef = useRef(null);
    const panelsUnsubRef = useRef(null);

  // 다크모드는 예전엔 Sidebar.jsx(왼쪽 독)가 항상 마운트돼 있다는 전제로 그
  // 컴포넌트의 useEffect가 초기 body.dark 클래스를 적용했다 — 그 독이
  // 사라지고 다크모드 토글이 /settings로 옮겨간 지금은, 사용자가 /settings를
  // 아직 안 들어간 세션에서도 저장된 값이 바로 적용되도록 여기서 한 번 적용한다.
  // 배경 색상(bgColor)·톤(pastelLevel)도 같은 이유로 여기서 적용해야 한다 —
  // Settings.jsx의 chooseBgColor/choosePastelLevel은 클릭 시점에만
  // body.dataset를 설정해서, 그 값이 localStorage에는 저장돼도 새로고침/재방문
  // 시 body에 다시 적용되지 않아 골랐던 배경이 기본값("white", 화이트)으로
  // 돌아가 보이는 문제가 있었다. 톤(deep/medium/light)은 색상이 "pastel"일
  // 때만 실제로 쓰이지만, 값 자체는 항상 넣어둬도 무해하다.
  useEffect(() => {
    document.body.classList.toggle("dark", localStorage.getItem("darkMode") === "1");
    document.body.dataset.bg = localStorage.getItem("bgColor") || "white";
    document.body.dataset.pastel = localStorage.getItem("pastelLevel") || "deep";
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.7,
      orientation: "horizontal",
      // "vertical"로 고정해뒀던 건 데스크톱 마우스 휠(세로 델타)만 염두에 둔 설정 —
      // 이러면 모바일에서 좌우로 스와이프해도(가로 델타) "알 수 없는 제스처"로
      // 무시돼버린다. "both"는 델타가 더 큰 축을 그때그때 골라 쓰므로, 마우스
      // 휠(항상 세로)은 기존과 동일하게 동작하면서 터치 좌우 스와이프도 같이 먹는다.
      gestureOrientation: "both",
      // 터치 드래그를 Lenis의 가상 스크롤과 동기화 — 이게 꺼져있으면(기본값) 터치는
      // 네이티브 스크롤로 빠져서 Snap(스냅 정렬)이 전혀 안 걸린다.
      syncTouch: true,
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

    // 브라우저 창을 최소화/최대화/복원하면 패널(w-screen)의 실제 폭이 바뀌는데,
    // 스크롤 좌표(px)는 리사이즈 전 값 그대로 남는다 — Snap은 resize 시 자기
    // viewport 치수만 갱신할 뿐 현재 위치를 다시 스냅해주지 않아서(lenis-snap.mjs
    // onWindowResize), 두 패널 사이 어중간한 지점에 멈춰 서로 겹쳐 보이는
    // 원인이었다. 리사이즈가 끝나면 보고 있던 패널로 다시 스냅해 보정한다.
    //
    // 지연을 600ms로 둔 이유: Snap이 각 패널의 document 기준 left 좌표를 다시
    // 재는 시점(SnapElement.onWrapperResize)이 자체적으로 500ms 디바운스라서
    // (lenis-snap.mjs), 그보다 먼저 goTo를 부르면 아직 안 갱신된(리사이즈 전)
    // 좌표로 계산해 엉뚱한 위치로 스냅해버려 증상이 오히려 재현된다 — 반드시
    // 그 500ms보다 뒤에 실행되도록 여유를 둬야 한다.
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        lenis.resize();
        snap.goTo(snap.currentSnapIndex ?? 0);
      }, 600);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
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
    <MyPageModalProvider>
    <WithdrawModalProvider>
    <ScrollToTop lenis={lenisRef} controller={controllerRef} panelsUnsub={panelsUnsubRef} />
    <Header />
    <AuthModal />
    <WithdrawModal />
    <CookieConsent />

    <div className="hTrack">
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/welcome" element={<Welcome />} />
        <Route path="/social-callback" element={<SocialCallback />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/lookbook" element={<Lookbook />} />
        <Route path="/lookbook/:id" element={<LookbookPost />} />
        <Route path="/customer-center" element={<CustomerCenter />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route path="/item/:id" element={<HomeProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-complete" element={<OrderComplete />} />

      </Routes>
    </div>
    </WithdrawModalProvider>
    </MyPageModalProvider>
    </AuthModalProvider>
    </BrowserRouter>
  );
}

export default App;