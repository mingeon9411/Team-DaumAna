import { useState, useEffect, useRef } from "react";
import "./LogoAnim.css";
import KorLogo from "../../assets/logo/Kor_logo.png";
import WhiteLogo from "../../assets/logo/white_logo.png";

// 부채 펼쳐진 위치 (중심에서 arc 형태로 배치)
// pivot = (0, 26), radius = 62, 각도 -80° ~ +80°
const FAN_POS = [
  { x: -61, y: 17, r: -25 }, // ㅈ
  { x: -52, y: -6, r: -18 }, // ㅣ
  { x: -35, y:-23, r: -11 }, // ㅂ
  { x: -12, y:-32, r:  -4 }, // ㄷ
  { x:  12, y:-32, r:   4 }, // ㅏ
  { x:  35, y:-23, r:  11 }, // ㅇ
  { x:  52, y: -6, r:  18 }, // ㅜ
  { x:  61, y: 17, r:  25 }, // ㅁ
];

const JAMO = ["ㅈ","ㅣ","ㅂ","ㄷ","ㅏ","ㅇ","ㅜ","ㅁ"];

// closed → open → close → show → repeat
const TIMINGS = { open: 300, close: 2600, show: 3800, reset: 30000 };

function LogoAnim({ white }) {
  const [phase, setPhase] = useState("closed");
  const timers = useRef([]);

  useEffect(() => {
    const clear = () => timers.current.forEach(clearTimeout);
    const run = () => {
      clear();
      setPhase("closed");
      timers.current = [
        setTimeout(() => setPhase("open"),  TIMINGS.open),
        setTimeout(() => setPhase("close"), TIMINGS.close),
        setTimeout(() => setPhase("show"),  TIMINGS.show),
        setTimeout(() => run(),             TIMINGS.reset),
      ];
    };
    const t0 = setTimeout(run, 300);
    return () => { clearTimeout(t0); clear(); };
  }, []);

  return (
    <div className={`logoAnim phase-${phase} ${white ? "logoAnimWhite" : ""}`}>
      {/* 자모 레이어 */}
      <div className="logoAnimJamo">
        {JAMO.map((ch, i) => (
          <span
            key={i}
            className="logoAnimChar"
            style={{
              "--fx":    `${FAN_POS[i].x}px`,
              "--fy":    `${FAN_POS[i].y}px`,
              "--fr":    `${FAN_POS[i].r}deg`,
              "--delay": `${i * 65}ms`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* 완성 로고 */}
      <div className="logoAnimLogo">
        <img src={white ? WhiteLogo : KorLogo} alt="집다움" className="logoAnimHouse" />
      </div>
    </div>
  );
}

export default LogoAnim;
