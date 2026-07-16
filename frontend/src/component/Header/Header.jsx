import "./Header.css";
import { useEffect, useState } from "react";

import JDLogo from "../../assets/J.D 로고.svg";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";

  // 홈 화면에서도 페이지 상단 히어로를 지나면 오방색 하이라인을 켜기 위한 스크롤 추적
  useEffect(() => {
    const handleScroll = () => {
      if (isHome) {
        const essay = document.getElementById("home-essay");
        setScrolled(essay ? essay.getBoundingClientRect().left <= 0 : window.scrollX > 50);
      } else {
        setScrolled(window.scrollX > 50);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

  return (

    <header className={`header ${scrolled ? "scrolled" : ""} ${
      isCartPage ? "cartHeader" : ""
    } ${!isHome ? "lightBg" : ""}`}
    >
      <div className="starField" />
      <span className="headerMoon" />
      <span className="headerSun" />

      <Link to="/" className="logo" aria-label="집다움 홈">
        <img src={JDLogo} alt="J.D" className="logoImg" />
      </Link>
    </header>
  );
}

export default Header;
