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
import { CartModalProvider } from "./context/CartModalContext";
import { MyPageModalProvider } from "./context/MyPageModalContext";
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
    <ScrollToTop lenis={lenisRef} controller={controllerRef} panelsUnsub={panelsUnsubRef} />
     { /*<DoorIntro /> */}
    <Header />
    <Sidebar />
    <AuthModal />
    <Cart />
    <MyPage />

    <div className="hTrack">
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/welcome" element={<Welcome />} />
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
    </MyPageModalProvider>
    </CartModalProvider>
    </AuthModalProvider>
    </BrowserRouter>
  );
}

export default App;