import "./DoorIntro.css";
import { useEffect, useMemo, useState } from "react";
import JDLogo from "../../assets/J.D 로고.svg";
// 문 양쪽에 서로 다른 인테리어 사진을 얹는다 — 메인은 모던한 라운지/침실 톤,
// 한국관은 실제 한옥 문·궁중풍 거실 톤으로 테마에 맞춰 다른 사진을 쓴다.
import doorPhotoHoloLeft from "../../assets/scenes/hero1.png";
import doorPhotoHoloRight from "../../assets/scenes/hero3.png";
import doorPhotoHanjiLeft from "../../assets/scenes/hanok-bedroom-doorway.jpg";
import doorPhotoHanjiRight from "../../assets/scenes/korean-royal-modern-interior.jpg";
// 순수 한글 워드마크(한옥 그래픽 없이 "집다움" 글자만) — 다크모드는 로고 이미지와
// 같은 invert 필터로 흰색 처리(별도 흰색본이 없어서).
import JipdaumWordmark from "../../assets/logo/Jipdaum-logo-transparent.png";

function DoorIntro({ logoLight = JDLogo, logoDark = JDLogo, lightEffect = "petals", theme = "holo" }) {
  const [doorPhotoLeft, doorPhotoRight] =
    theme === "hanji" ? [doorPhotoHanjiLeft, doorPhotoHanjiRight] : [doorPhotoHoloLeft, doorPhotoHoloRight];

  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  // 라이트모드에서 흩날리는 무궁화 꽃잎 — 매 등장마다 다르게 흩날리도록 랜덤 배치
  const petals = useMemo(
    () =>
      lightEffect !== "petals"
        ? []
        : Array.from({ length: 45 }, (_, i) => {
            const width = 8 + Math.random() * 8;
            return {
              id: i,
              left: `${Math.random() * 100}%`,
              width: `${width}px`,
              height: `${width * (1.3 + Math.random() * 0.3)}px`,
              duration: `${3.5 + Math.random() * 3}s`,
              delay: `${-(Math.random() * 6).toFixed(2)}s`,
              drift: `${Math.round(Math.random() * 60 - 30)}px`,
              rot0: `${Math.round(Math.random() * 360)}deg`,
              opacity: (0.6 + Math.random() * 0.35).toFixed(2),
            };
          }),
    [lightEffect]
  );

  return (
    <div className={`doorIntro${theme === "hanji" ? " hanji" : ""}${darkMode ? " dark" : ""}`}>
      <div className="mistLayer mistLayerA" />
      <div className="mistLayer mistLayerB" />
      <div className="mistLayer mistLayerC" />

      <div className="introStars" />

      {lightEffect === "sparkle" ? (
        <div className="sparkleField" />
      ) : (
        <div className="petalField">
          {petals.map((p) => (
            <span
              key={p.id}
              className="petal"
              style={{
                left: p.left,
                width: p.width,
                height: p.height,
                opacity: p.opacity,
                animationDuration: p.duration,
                animationDelay: p.delay,
                "--drift": p.drift,
                "--rot0": p.rot0,
              }}
            />
          ))}
        </div>
      )}

      {/* 실제로 두 짝의 문이 갈라져 열리는 연출 — 컴포넌트 이름값을 하게 만든다.
          사진은 CSS 변수로 넘겨서 틴트/테마 그라디언트는 CSS가 계속 관장하게 한다. */}
      <div className="doorPanel doorPanelLeft" style={{ "--door-photo": `url(${doorPhotoLeft})` }} />
      <div className="doorPanel doorPanelRight" style={{ "--door-photo": `url(${doorPhotoRight})` }} />

      <div className="introLogo">
        <img src={darkMode ? logoDark : logoLight} alt="집다움" />
        <span className="introHairline" />
        <img src={JipdaumWordmark} alt="집다움" className="introKorText" />
      </div>
    </div>
  );
}

export default DoorIntro;
