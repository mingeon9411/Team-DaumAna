import { Link, useLocation } from "react-router-dom";
import { useMyPageModal } from "../../context/MyPageModalContext";
import "./Welcome.css";

function formatDiscount(c) {
  if (c.discount_type === "FIXED") return `${c.discount_value.toLocaleString()}원`;
  return `${c.discount_value}%`;
}

function Welcome() {
  const { openMyPage } = useMyPageModal();
  const { state } = useLocation();
  const coupons = state?.coupons || [];

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
          {coupons.length > 0
            ? `가입을 환영하는 웰컴 쿠폰 ${coupons.length}장이 발급되었습니다.`
            : "회원가입을 환영합니다."}
        </p>

        {coupons.length > 0 && (
          <div className="couponList">
            {coupons.map((c) => (
              <div className="couponCard" key={c.id}>
                <span>{c.name}</span>
                <strong>{formatDiscount(c)}</strong>
                <p>
                  {c.min_order_amount > 0
                    ? `${c.min_order_amount.toLocaleString()}원 이상 구매 시`
                    : "전 상품 사용 가능"}
                  {c.expiry_date && ` · ~${c.expiry_date}까지`}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="welcomeButtons">
          <Link to="/" className="mainBtn">
            메인으로 가기
          </Link>

          <button type="button" className="subBtn" onClick={openMyPage}>
            마이페이지 확인
          </button>
        </div>
      </section>
    </main>
  );
}

export default Welcome;