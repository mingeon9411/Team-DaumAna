import "./CompanyInfoModal.css";
import { FaInstagram, FaXTwitter, FaThreads } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useCompanyInfoModal } from "../../context/CompanyInfoModalContext";
import JDLogo from "../../assets/J.D 로고.svg";
// -sm: 56px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";

const CLOSING_QUOTE = "집이란 나의 공간에\n나만의 색을 더해가는 또다른 세상이다.";

function CompanyInfoModal() {
  const { isOpen, closeCompanyInfo } = useCompanyInfoModal();
  // 한국관 존(/korean-hall, /product/:id, /korean-hall/checkout)에서 열면
  // 파스텔 톤 대신 ProductDetail.css의 .pdPage와 같은 한지 베이지 톤을 쓴다.
  const { pathname } = useLocation();
  const isKoreanHallZone =
    pathname === "/korean-hall" ||
    pathname.startsWith("/product/") ||
    pathname === "/korean-hall/checkout";

  if (!isOpen) return null;

  return (
    <div className="companyInfoOverlay" onClick={closeCompanyInfo}>
      <div
        className={`companyInfoInner${isKoreanHallZone ? " companyInfoHanji" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="companyInfoClose"
          onClick={closeCompanyInfo}
          aria-label="닫기"
        >
          ×
        </button>

        <p className="companyInfoQuote">{CLOSING_QUOTE}</p>

        <div className="companyInfoDetails">
          <div className="companyInfoLogoRow">
            <img src={JDLogo} alt="집다움" className="companyInfoLogo" />
            <img src={JipdaumHanokLogo} alt="" aria-hidden="true" className="companyInfoHanokLogo" />
          </div>

          <span className="companyInfoDivider" aria-hidden="true" />

          <div className="companyInfoAddressBlock">
            <p className="companyInfoAddress">서울특별시 강남구 테헤란로 123</p>
            <p className="companyInfoNum">02-123-4567</p>
          </div>
        </div>

        <div className="companyInfoSNS">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://threads.net" target="_blank" rel="noreferrer">
            <FaThreads />
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer">
            <FaXTwitter />
          </a>
        </div>

        <div className="companyInfoBottom">
          <p>© 2026 JIPDAUM. All rights reserved.</p>
          <p>DaumAna</p>
        </div>
      </div>
    </div>
  );
}

export default CompanyInfoModal;
