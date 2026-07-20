import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FaThreads } from "react-icons/fa6";
import "./Footer.css";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";

const CLOSING_QUOTE = "집이란 나의 공간에\n나만의 색을 더해가는 또다른 세상이다.";

function Footer() {
  return (
    <footer className="footer" data-hsnap>
      <div className="footerQuote">
        <p>{CLOSING_QUOTE}</p>
      </div>

      <div className="footerTop">
        <div className="footerBrand">
          <div className="footerLogoRow">
            <img src={JDLogo} alt="집다움" className="footerLogo" />
            <img src={JipdaumHanokLogo} alt="" aria-hidden="true" className="footerHanokLogo" />
          </div>
          <p>서울특별시 강남구 테헤란로 123</p>
          <p className = "footerNum">
          02-123-4567
          </p>

          <div className="footerSNS">
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
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 JIPDAUM. All rights reserved.</p>
        <p>DaumAna</p>
      </div>
    </footer>
  );
}

export default Footer;