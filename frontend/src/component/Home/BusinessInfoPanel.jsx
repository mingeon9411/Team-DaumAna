import { FaInstagram, FaXTwitter, FaThreads } from "react-icons/fa6";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

// 전자상거래 등에서의 소비자보호에 관한 법률 제10조 — 사이버몰 초기화면에 표시해야
// 하는 사업자 정보. 아직 실제 사업자등록이 없는 학습/포트폴리오 프로젝트라
// 값은 전부 플레이스홀더 — 실제 값이 정해지면 이 배열만 채우면 된다.
const BUSINESS_INFO = [
  ["상호", "집다움(JIPDAUM)"],
  ["대표자", "000"],
  ["사업자등록번호", "000-00-00000"],
  ["통신판매업 신고번호", "제0000-서울강남-00000호"],
  ["영업소 소재지", "서울특별시 강남구 테헤란로 123"],
  ["전화번호", "02-123-4567"],
  ["팩스번호", "02-123-4568"],
  ["이메일", "contact@jipdaum.com"],
  ["개인정보보호책임자", "000"],
];

function BusinessInfoPanel() {
  return (
    <section
      data-hsnap
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col items-center justify-center px-6 text-foreground"
      style={{ background: "linear-gradient(135deg, #e8e8ea 0%, #c9cacd 35%, #f4f4f6 55%, #b0b1b5 80%, #dcdde0 100%)" }}
    >
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <img src={JDLogo} alt="집다움" className="h-8 w-auto" />
          <img src={JipdaumHanokLogo} alt="" aria-hidden="true" className="h-10 w-auto" />
        </div>

        <span className="text-[10px] text-muted-foreground tracking-widest block mb-2" style={MONO}>
          BUSINESS INFORMATION
        </span>
        <h2 className="text-xl font-light text-foreground mb-8" style={SERIF}>사업자 정보</h2>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 mb-10">
          {BUSINESS_INFO.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-xs text-muted-foreground whitespace-nowrap" style={MONO}>{label}</dt>
              <dd className="text-sm text-foreground/85 m-0" style={SANS}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-4 mb-10">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaInstagram size={18} />
          </a>
          <a href="https://threads.net" target="_blank" rel="noreferrer" aria-label="Threads" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaThreads size={18} />
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaXTwitter size={18} />
          </a>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-4" style={MONO}>
          <span>© 2026 JIPDAUM. All rights reserved.</span>
          <span>DaumAna</span>
        </div>
      </div>
    </section>
  );
}

export default BusinessInfoPanel;
