import { useLocation, useNavigate, Link } from "react-router-dom";
import "./OrderComplete.css";

function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { productName, totalAmount, quantity, shippingAddr } = state || {};

  if (!productName) {
    return (
      <main className="ocPage">
        <p className="ocError">잘못된 접근입니다.</p>
        <button className="ocHomeBtn" onClick={() => navigate("/")}>홈으로</button>
      </main>
    );
  }

  return (
    <main className="ocPage">
      <div className="ocCard">
        <div className="ocIconWrap">
          <div className="ocIcon">✓</div>
        </div>

        <h1 className="ocTitle">주문이 완료되었습니다.</h1>
        <p className="ocSub">결제가 정상적으로 처리되었습니다.</p>

        <div className="ocDivider" />

        <ul className="ocInfo">
          <li>
            <span className="ocLabel">상품명</span>
            <span className="ocValue">{productName}</span>
          </li>
          <li>
            <span className="ocLabel">수량</span>
            <span className="ocValue">{quantity}개</span>
          </li>
          <li>
            <span className="ocLabel">결제 금액</span>
            <span className="ocValue ocAmount">{Number(totalAmount).toLocaleString()}원</span>
          </li>
          <li>
            <span className="ocLabel">배송지</span>
            <span className="ocValue">{shippingAddr}</span>
          </li>
        </ul>

        <div className="ocDivider" />

        <div className="ocBtns">
          <Link to="/" className="ocHomeBtn">홈으로 가기</Link>
          <Link to="/mypage" className="ocMypageBtn">주문 내역 보기</Link>
        </div>
      </div>
    </main>
  );
}

export default OrderComplete;
