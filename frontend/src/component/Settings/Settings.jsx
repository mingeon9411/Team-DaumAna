import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuSun, LuMoon, LuLayers, LuPalette, LuCompass, LuArrowUpToLine, LuClock } from "react-icons/lu";
import "./Settings.css";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

const RAIL_STYLES = [
  { id: "glass", label: "레인보우" },
  { id: "metallic", label: "메탈릭" },
  { id: "pastel", label: "파스텔" },
];

const PASTEL_LEVELS = [
  { id: "deep", label: "진하게" },
  { id: "medium", label: "보통" },
  { id: "light", label: "연하게" },
];

// 예전엔 왼쪽 사이드바 독(Sidebar.jsx)의 아이콘 버튼으로 즉석에서 바꾸던 값들을
// 이 설정 페이지로 옮겼다. localStorage 키/이벤트 이름은 전부 왼쪽 독이 쓰던 것을
// 그대로 재사용 — 다른 컴포넌트(우측 독, 화살표 독, 상품 그리드 등)는 수정 없이
// 그대로 이 페이지가 쓰는 신호를 계속 따라간다.
function readFlag(key, fallback = true) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}

function Settings() {
  const navigate = useNavigate();

  const [darkMode, setDarkModeState] = useState(
    () => document.body.classList.contains("dark")
  );
  const [railStyle, setRailStyleState] = useState(
    () => localStorage.getItem("railStyle") || "glass"
  );
  const [pastelLevel, setPastelLevelState] = useState(
    () => localStorage.getItem("pastelLevel") || "deep"
  );
  // 화살표 이동 독 / 맨 위로 버튼 / 우측 "최근 본 상품" 독 — 새로 추가한 on/off
  // 토글. 값이 아예 없으면(기존 사용자) 기본 켬(true)으로 취급해 이전과 동일하게 보인다.
  const [showArrowDock, setShowArrowDockState] = useState(() => readFlag("showArrowDock"));
  const [showTopButton, setShowTopButtonState] = useState(() => readFlag("showTopButton"));
  const [showRecentDock, setShowRecentDockState] = useState(() => readFlag("showRecentDock"));

  // Cart.jsx/CustomerCenter.jsx와 동일한 신호 — "목록으로" 클릭이든 브라우저
  // 뒤로가기든, "/" 도착 시 대문 애니메이션·인트로 영상 없이 곧장 상품 목록으로.
  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

  const goBack = () => navigate("/");

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkModeState(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next ? "1" : "0");
    window.dispatchEvent(new Event("darkmodechange"));
  };

  const chooseRailStyle = (id) => {
    setRailStyleState(id);
    localStorage.setItem("railStyle", id);
    window.dispatchEvent(new Event("railstylechange"));
  };

  const choosePastelLevel = (id) => {
    setPastelLevelState(id);
    document.body.dataset.pastel = id;
    localStorage.setItem("pastelLevel", id);
  };

  const setDockFlag = (key, setter, value) => {
    setter(value);
    localStorage.setItem(key, value ? "1" : "0");
    window.dispatchEvent(new Event("dockvisibilitychange"));
  };

  return (
    <div className="ssPage metallicSilver" data-hsnap data-lenis-prevent>
      <div className="ssWrap">
        <button type="button" className="ssBackBtn" onClick={goBack}>
          <LuChevronLeft size={14} /> 목록으로
        </button>

        <section className="ssHero">
          <p className="ssHeroGreeting">화면 설정 ⚙️</p>
          <h1 className="ssHeroTitle">나에게 맞는 집다움으로.</h1>
          <p className="ssHeroSub">테마와 화면에 뜨는 기능들을 원하는 대로 켜고 꺼보세요.</p>
        </section>

        <section className="ssSection">
          <h2 className="ssSectionTitle">화면 테마</h2>

          <div className="ssRow">
            <div className="ssRowLabel">
              {darkMode ? <LuMoon className="ssRowIcon" /> : <LuSun className="ssRowIcon" />}
              <div>
                <p className="ssRowTitle">다크 모드</p>
                <p className="ssRowDesc">화면을 어둡게 표시합니다.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              className={`ssSwitch${darkMode ? " on" : ""}`}
              onClick={toggleDarkMode}
            >
              <span className="ssSwitchKnob" />
            </button>
          </div>

          <div className="ssRow ssRowStack">
            <div className="ssRowLabel">
              <LuLayers className="ssRowIcon" />
              <div>
                <p className="ssRowTitle">독 스타일</p>
                <p className="ssRowDesc">화살표 독·최근 본 상품 독의 테두리 스타일입니다.</p>
              </div>
            </div>
            <div className="ssChipRow">
              {RAIL_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`ssChip${railStyle === s.id ? " active" : ""}`}
                  onClick={() => chooseRailStyle(s.id)}
                >
                  <span className={`ssChipSwatch ssChipSwatch-${s.id}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ssRow ssRowStack">
            <div className="ssRowLabel">
              <LuPalette className="ssRowIcon" />
              <div>
                <p className="ssRowTitle">배경 톤</p>
                <p className="ssRowDesc">상품 목록·설정 화면 같은 파스텔 배경의 진하기입니다.</p>
              </div>
            </div>
            <div className="ssChipRow">
              {PASTEL_LEVELS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`ssChip${pastelLevel === p.id ? " active" : ""}`}
                  onClick={() => choosePastelLevel(p.id)}
                >
                  <span className={`ssChipSwatch ssChipSwatch-${p.id}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ssSection">
          <h2 className="ssSectionTitle">바로가기 기능</h2>
          <p className="ssSectionDesc">
            예전에 왼쪽 사이드바 독에 있던 기능들이에요. 지금은 아래에서 필요한 것만 켜서
            화면에 띄울 수 있고, 홈·한국관·장바구니·로그인 같은 핵심 이동 메뉴는 상단
            헤더에서 항상 이용하실 수 있습니다.
          </p>

          <div className="ssRow">
            <div className="ssRowLabel">
              <LuCompass className="ssRowIcon" />
              <div>
                <p className="ssRowTitle">페이지 이동 화살표 독</p>
                <p className="ssRowDesc">화면 하단 중앙에 이전/다음 페이지 이동 버튼을 띄웁니다.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showArrowDock}
              className={`ssSwitch${showArrowDock ? " on" : ""}`}
              onClick={() => setDockFlag("showArrowDock", setShowArrowDockState, !showArrowDock)}
            >
              <span className="ssSwitchKnob" />
            </button>
          </div>

          <div className="ssRow">
            <div className="ssRowLabel">
              <LuArrowUpToLine className="ssRowIcon" />
              <div>
                <p className="ssRowTitle">맨 위로 버튼</p>
                <p className="ssRowDesc">화면 우하단에 맨 위로 이동 버튼을 띄웁니다.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showTopButton}
              className={`ssSwitch${showTopButton ? " on" : ""}`}
              onClick={() => setDockFlag("showTopButton", setShowTopButtonState, !showTopButton)}
            >
              <span className="ssSwitchKnob" />
            </button>
          </div>

          <div className="ssRow">
            <div className="ssRowLabel">
              <LuClock className="ssRowIcon" />
              <div>
                <p className="ssRowTitle">최근 본 상품 독</p>
                <p className="ssRowDesc">화면 오른쪽 위에 최근 본 상품을 이미지로 띄웁니다.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showRecentDock}
              className={`ssSwitch${showRecentDock ? " on" : ""}`}
              onClick={() => setDockFlag("showRecentDock", setShowRecentDockState, !showRecentDock)}
            >
              <span className="ssSwitchKnob" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
