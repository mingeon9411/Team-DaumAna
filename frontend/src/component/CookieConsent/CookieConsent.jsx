import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft } from "react-icons/lu";
import "./CookieConsent.css";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };

const STORAGE_KEY = "cookieConsent";

// IKEA 웹사이트의 쿠키 동의 배너 문구를 그대로 가져오고 브랜드명만 집다움으로
// 바꿨다 — 필수 쿠키는 항상 켜져 있고(못 끔), 통계/맞춤 설정/마케팅 3개
// 카테고리만 선택적으로 고른다. 이 사이트엔 실제 분석/광고 스크립트가 아직
// 없어서 선택 결과가 무언가를 켜고 끄지는 않지만, 나중에 그런 스크립트를 붙일
// 때 이 저장값(localStorage)을 기준으로 삼으면 된다.
// bullet: 배너에서 보여줄 짧은 문구(IKEA 원문 그대로), desc: 쿠키 설정
// 화면에서 보여줄 좀 더 풀어쓴 설명.
const CATEGORIES = [
  {
    id: "statistics",
    label: "통계 쿠키",
    bullet: "사이트 이용 방식에 대한 통계 수집",
    desc: "사이트를 어떻게 이용하는지 분석해 서비스를 개선하는 데 씁니다.",
  },
  {
    id: "personalization",
    label: "맞춤 설정 쿠키",
    bullet: "개인의 사이트 맞춤 설정 지원",
    desc: "관심 있을 만한 상품이나 콘텐츠를 보여주는 데 씁니다.",
  },
  {
    id: "marketing",
    label: "마케팅 쿠키",
    bullet: "마케팅 및 소셜 미디어 광고에 활용",
    desc: "다른 사이트에서 보여지는 광고를 맞추는 데 씁니다.",
  },
];

function readStoredConsent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function CookieConsent() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => !!readStoredConsent());
  const [view, setView] = useState("banner"); // "banner" | "settings"
  const [prefs, setPrefs] = useState({ statistics: false, personalization: false, marketing: false });

  if (dismissed) return null;

  const save = (values) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...values, decidedAt: Date.now() }));
    setDismissed(true);
  };

  const acceptAll = () => save({ statistics: true, personalization: true, marketing: true });
  const saveSelection = () => save(prefs);
  const toggle = (id) => setPrefs((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="cookieConsent" data-lenis-prevent>
      {view === "banner" ? (
        <>
          <h2 className="cookieTitle" style={SANS}>집다움을 이용하시는 고객님은 쿠키 허용 여부를 선택할 수 있습니다</h2>
          <p className="cookieDesc" style={SANS}>
            집다움과 집다움의 디지털 파트너는 이 사이트에서 쿠키를 사용합니다. 사이트
            운영을 위해 필수적으로 사용되는 쿠키도 있고, 다음의 목적을 위해 선택적으로
            사용되는 쿠키도 있습니다.
          </p>
          <ul className="cookieList" style={SANS}>
            {CATEGORIES.map((c) => (
              <li key={c.id}>{c.bullet}</li>
            ))}
          </ul>
          <button type="button" className="cookieMoreLink" style={SANS} onClick={() => navigate("/customer-center")}>
            쿠키에 관해 자세히 알아보기
          </button>
          <div className="cookieActions">
            <button type="button" className="cookieBtnGhost" style={SANS} onClick={() => setView("settings")}>
              쿠키 설정
            </button>
            <button type="button" className="cookieBtnPrimary" style={SANS} onClick={acceptAll}>
              모든 쿠키 허용
            </button>
          </div>
        </>
      ) : (
        <>
          <button type="button" className="cookieBack" style={SANS} onClick={() => setView("banner")}>
            <LuChevronLeft size={14} /> 뒤로
          </button>
          <h2 className="cookieTitle" style={SANS}>쿠키 설정</h2>

          <div className="cookieRow">
            <div>
              <p className="cookieRowTitle" style={SANS}>필수 쿠키</p>
              <p className="cookieRowDesc" style={SANS}>로그인 유지, 장바구니 등 사이트 운영에 꼭 필요합니다.</p>
            </div>
            <span className="cookieRowLocked" style={SANS}>항상 켬</span>
          </div>

          {CATEGORIES.map((c) => (
            <div className="cookieRow" key={c.id}>
              <div>
                <p className="cookieRowTitle" style={SANS}>{c.label}</p>
                <p className="cookieRowDesc" style={SANS}>{c.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[c.id]}
                className={`cookieSwitch${prefs[c.id] ? " on" : ""}`}
                onClick={() => toggle(c.id)}
              >
                <span className="cookieSwitchKnob" />
              </button>
            </div>
          ))}

          <div className="cookieActions">
            <button type="button" className="cookieBtnPrimary" style={SANS} onClick={saveSelection}>
              선택 저장
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CookieConsent;
