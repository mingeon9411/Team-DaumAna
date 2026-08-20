import "./Header.css";
import { useEffect, useState } from "react";

import JDLogo from "../../assets/J.D 로고.svg";
import Ilwolobongdo from "../../assets/decor/ilwolobongdo.png";
import IlwolobongdoDark from "../../assets/decor/ilwolobongdo-dark.png";
// -sm: 헤더에선 37px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isFooterPanel, setIsFooterPanel] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const isHome = location.pathname === "/";
  const isKoreanHall = location.pathname === "/korean-hall";

  // 홈 화면에서도 페이지 상단 히어로를 지나면 오방색 하이라인을 켜기 위한 스크롤 추적.
  // 한국관(.khPage)은 Lenis의 가로 스크롤에서 제외된(data-lenis-prevent) 자체 세로
  // 스크롤(overflow-y: auto) 페이지라 window에는 scroll 이벤트가 전혀 발생하지 않는다 —
  // 그래서 리스너를 window가 아니라 .khPage 엘리먼트에 따로 붙여야 한다.
  useEffect(() => {
    const koreanHallEl = isKoreanHall ? document.querySelector(".khPage") : null;

    const handleScroll = () => {
      if (isHome) {
        const essay = document.getElementById("home-essay");
        setScrolled(essay ? essay.getBoundingClientRect().left <= 0 : window.scrollX > 50);
      } else if (isKoreanHall) {
        setScrolled((koreanHallEl?.scrollTop ?? 0) > 50);
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

    return () => {
      window.removeEventListener("scroll", handleScroll);
      koreanHallEl?.removeEventListener("scroll", handleScroll);
    };
  }, [isHome, isKoreanHall]);

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

      {!isFooterPanel && (
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
      )}
    </header>
  );
}

export default Header;
