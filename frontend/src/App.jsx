import { useEffect, useRef } from "react";
import Lenis from "lenis";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./component/ScrollToTop";
import Header from "./component/Header/Header";
import Sidebar from "./component/Sidebar/Sidebar";
import MyPage from "./component/MyPage/MyPage";
import Withdraw from "./component/WithDraw/WithDraw";
import Home from "./component/Home/Home";

import Cart from "./component/Cart/Cart";
import Login from "./component/Login/Login";
import Welcome from "./component/Welcome/Welcome";
import Register from "./component/Register/Register";
import ProductDetail from "./component/ProductDetail/ProductDetail";
import SocialCallback from "./component/SocialCallback/SocialCallback";
import EmailVerify from "./component/EmailVerify/EmailVerify";
import SearchResults from "./component/SearchResults/SearchResults";
import Checkout from "./component/Checkout/Checkout";
import OrderComplete from "./component/OrderComplete/OrderComplete";
import Footer from "./component/Footer/Footer";
import "./App.css";

function App() {
    const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 0.5, 
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []); 

  return (
    <BrowserRouter>
    <ScrollToTop lenis={lenisRef} />
     { /*<DoorIntro /> */}
    <Header />
    <Sidebar />

      <Routes>

        <Route path="/" element={<Home />} />
        
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/register" element={<Register />} />      
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
    </BrowserRouter>
  );
}

export default App;