import { Link } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  return (
    <main className="welcomePage" data-hsnap>
      <section className="welcomeBox">
        <p className="welcomeLabel">WELCOME TO JIPDAUM</p>

        <h1>
          집다움에 오신걸
          <br />
          진심으로 환영합니다.
        </h1>

        <p className="welcomeText">
          회원가입 7% 할인쿠폰이 발급되었습니다.
          < br/>
          (발급일로부터 30일 이내)
        </p>

        <div className="couponCard">
          <span>WELCOME COUPON</span>
          <strong>7%</strong>
          <p>신규 회원 전용 할인 쿠폰</p>
        </div>

        <div className="welcomeButtons">
          <Link to="/" className="mainBtn">
            메인으로 가기
          </Link>

          <Link to="/mypage" className="subBtn">
            마이페이지 확인
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Welcome;