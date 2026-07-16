import "./DoorIntro.css";
import { useEffect, useMemo, useState } from "react";
import JDLogo from "../../assets/J.D 로고.svg";

function DoorIntro() {
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
      Array.from({ length: 45 }, (_, i) => {
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
    []
  );

  return (
    <div className={`doorIntro${darkMode ? " dark" : ""}`}>
      <div className="mistLayer mistLayerA" />
      <div className="mistLayer mistLayerB" />
      <div className="mistLayer mistLayerC" />

      <div className="introStars" />

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

      <div className="introLogo">
        <img src={JDLogo} alt="집다움" />
      </div>
    </div>
  );
}

export default DoorIntro;
