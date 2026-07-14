import "./Header.css";
import { useEffect, useState } from "react";

import JipdaumLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";
import JipdaumLogoPlain from "../../assets/logo/Jipdaum-logo-transparent.png";
import Ilwolobongdo from "../../assets/decor/ilwolobongdo.png";
import IlwolobongdoDark from "../../assets/decor/ilwolobongdo-dark.png";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";

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

  // 다크모드는 Sidebar가 소유 — body.dark 클래스 변경을 이벤트로 전달받아 로고만 동기화
  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  return (

    <header className={`header ${scrolled ? "scrolled" : ""} ${
      isCartPage ? "cartHeader" : ""
    } ${!isHome ? "lightBg" : ""}`}
    >
      <div className="starField" />
      <span className="headerMoon" />
      <span className="headerSun" />
      <img src={darkMode ? IlwolobongdoDark : Ilwolobongdo} alt="" aria-hidden="true" className="headerIlwol" />

      <Link to="/" className="logo" aria-label="집다움 홈">
        <span className="logoStack">
          <img
            src={JipdaumLogoPlain}
            alt="집다움"
            className={`logoImg logoImgPlain logoLayer ${isHome && !scrolled ? "logoLayerActive" : ""}`}
          />
          <img
            src={darkMode ? JipdaumLogoDark : JipdaumLogo}
            alt="집다움"
            className={`logoImg logoLayer ${isHome && !scrolled ? "" : "logoLayerActive"}`}
          />
        </span>
      </Link>
    </header>
  );
}

export default Header;
