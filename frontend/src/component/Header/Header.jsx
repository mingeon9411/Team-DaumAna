import "./Header.css";
import { useEffect, useState } from "react";

import JDLogo from "../../assets/J.D 로고.svg";
import Ilwolobongdo from "../../assets/decor/ilwolobongdo.png";
import IlwolobongdoDark from "../../assets/decor/ilwolobongdo-dark.png";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";
  const isKoreanHall = location.pathname === "/korean-hall";

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

  // 다크모드는 Sidebar가 소유 — body.dark 클래스 변경을 이벤트로 전달받아 일월오봉도만 동기화
  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  return (

    <header className={`header ${scrolled ? "scrolled" : ""} ${
      isCartPage ? "cartHeader" : ""
    } ${!isHome ? "lightBg" : ""} ${isKoreanHall ? "koreanHallHeader" : ""}`}
    >
      {isKoreanHall && (
        <>
          <div className="starField" />
          <span className="headerMoon" />
          <span className="headerSun" />
          <img src={darkMode ? IlwolobongdoDark : Ilwolobongdo} alt="" aria-hidden="true" className="headerIlwol" />
        </>
      )}

      <Link to={isKoreanHall ? "/korean-hall" : "/"} className="logo" aria-label="집다움 홈">
        {isKoreanHall ? (
          <img
            src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
            alt="집다움"
            className="logoImg logoImgHanok"
          />
        ) : (
          <img src={JDLogo} alt="J.D" className="logoImg" />
        )}
      </Link>
    </header>
  );
}

export default Header;
