import { useEffect, useRef } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop";
import Header from "./component/Header/Header";
import Sidebar from "./component/Sidebar/Sidebar";
import MyPage from "./component/MyPage/MyPage";
import Withdraw from "./component/WithDraw/WithDraw";
import Home from "./component/Home/Home";

import Cart from "./component/Cart/Cart";
import Welcome from "./component/Welcome/Welcome";
import ProductDetail from "./component/ProductDetail/ProductDetail";
import SocialCallback from "./component/SocialCallback/SocialCallback";
import EmailVerify from "./component/EmailVerify/EmailVerify";
import SearchResults from "./component/SearchResults/SearchResults";
import Checkout from "./component/Checkout/Checkout";
import OrderComplete from "./component/OrderComplete/OrderComplete";
import Footer from "./component/Footer/Footer";
import AuthModal from "./component/AuthModal/AuthModal";
import { AuthModalProvider } from "./context/AuthModalContext";
import { createPagingController } from "./utils/snapSetup";
import "./App.css";

function App() {
    const lenisRef = useRef(null);
    const controllerRef = useRef(null);
    const panelsUnsubRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 0.5,
      orientation: "horizontal",
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    // duration을 넉넉하게 줘서 패널 전환이 스무스하고 느긋하게 느껴지도록 한다.
    const snap = new Snap(lenis, {
      type: "lock",
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    // 살짝만 스크롤해도 다음/이전 패널로 완전히 넘어가도록, 거리 기반 자동
    // 스냅 대신 휠 방향만 보고 next()/previous()를 직접 호출하는 방식.
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
    <ScrollToTop lenis={lenisRef} controller={controllerRef} panelsUnsub={panelsUnsubRef} />
     { /*<DoorIntro /> */}
    <Header />
    <Sidebar />
    <AuthModal />

    <div className="hTrack">
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/social-callback" element={<SocialCallback />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/search" element={<SearchResults />} />

        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-complete" element={<OrderComplete />} />

      </Routes>
      <Footer />
    </div>
    </AuthModalProvider>
    </BrowserRouter>
  );
}

export default App;