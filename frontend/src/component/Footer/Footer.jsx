import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FaThreads } from "react-icons/fa6";
import "./Footer.css";
import JipdaumLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";


function Footer() {
  return (
    <footer className="footer">
      <div className="footerTop">
        <div className="footerBrand">
          <img src={JipdaumLogoDark} alt="집다움" className="footerLogo" />
          <p>한국적인 감성과 일상의 취향을 담은 우리만의 집다움</p>
          <p className = "footerNum">
          02-123-4567
          </p>
        </div>

        <div className="footerMenu">
          <div>
            <h4>SHOP</h4>
            <a href="/">가구</a>
            <a href="/">조명</a>
            <a href="/">소품</a>
            <a href="/">패브릭</a>
          </div>

          <div>
            <h4>ABOUT</h4>
            <a href="/">브랜드 스토리</a>
            <a href="/">쇼룸 안내</a>
            <a href="/">공지사항</a>
          </div>

          <div>
            <h4>HELP</h4>
            <a href="/">고객센터</a>
            <a href="/">배송/반품</a>
            <a href="/">문의하기</a>
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

    <div className="footerSNS">

    <a
    href="https://instagram.com"
    target="_blank"
    rel="noreferrer"
  >
    <FaInstagram />
  </a>

  <a
    href="https://threads.net"
    target="_blank"
    rel="noreferrer"
  >
    <FaThreads />
  </a>

  <a
    href="https://x.com"
    target="_blank"
    rel="noreferrer"
  >
    <FaXTwitter />
  </a>

  </div>

export default Footer;