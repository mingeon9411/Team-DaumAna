import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "../data/legalContent";
import { BUSINESS_INFO } from "../data/businessInfo";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

// 페이지 콘텐츠 맨 아래에 붙는 공용 푸터 — 이용약관·개인정보처리방침 본문을 그 자리에서
// 펼쳐볼 수 있게 하고, 전자상거래법 제10조 사업자 정보(BUSINESS_INFO)를 표시한다.
// 예전엔 별도의 BusinessInfoPanel 페이지가 사업자 정보만 전담했으나, 지금은 이 푸터가
// 상품 목록/룩북/결제/상품 상세 페이지 하단에 각각 박혀 그 역할을 대신한다.
// 문구는 회원가입 약관 박스와 같은 data/legalContent.js를 공유.
function SiteFooter() {
  const [openSection, setOpenSection] = useState(null); // "terms" | "privacy" | null

  const toggle = (section) => setOpenSection((cur) => (cur === section ? null : section));

  return (
    <footer className="max-w-7xl mx-auto w-full mt-16 pt-8 border-t border-border text-muted-foreground" style={SANS}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs mb-4">
        <button
          type="button"
          onClick={() => toggle("terms")}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          이용약관
          <ChevronDown size={12} className={`transition-transform ${openSection === "terms" ? "rotate-180" : ""}`} />
        </button>
        <span aria-hidden="true" className="text-border">|</span>
        <button
          type="button"
          onClick={() => toggle("privacy")}
          className="flex items-center gap-1 font-semibold text-foreground/80 hover:text-foreground transition-colors"
        >
          개인정보처리방침
          <ChevronDown size={12} className={`transition-transform ${openSection === "privacy" ? "rotate-180" : ""}`} />
        </button>
      </div>

      {openSection === "terms" && (
        <div className="text-[11px] leading-relaxed space-y-2 mb-6 max-w-2xl" data-lenis-prevent>
          {TERMS_OF_SERVICE.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>
      )}
      {openSection === "privacy" && (
        <div className="text-[11px] leading-relaxed space-y-2 mb-6 max-w-2xl" data-lenis-prevent>
          {PRIVACY_POLICY.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>
      )}

      <div className="text-[11px] leading-relaxed" style={MONO}>
        {BUSINESS_INFO.map(([label, value], i) => (
          <span key={label}>
            {label} {value}
            {i < BUSINESS_INFO.length - 1 && <span className="mx-1.5 text-border">·</span>}
          </span>
        ))}
      </div>

      <p className="text-[10px] mt-4 pb-6" style={MONO}>© 2026 JIPDAUM. All rights reserved.</p>
    </footer>
  );
}

export default SiteFooter;
