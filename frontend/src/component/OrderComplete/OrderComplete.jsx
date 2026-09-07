import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMyPageModal } from "../../context/MyPageModalContext";
import "./OrderComplete.css";

function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { openMyPage } = useMyPageModal();

  const { productName, totalAmount, shippingAddr, orderItems = [] } = state || {};

  if (!productName) {
    return (
      <main className="ocPage metallicSilver" data-hsnap>
        <p className="ocError">잘못된 접근입니다.</p>
        <button className="ocHomeBtn" onClick={() => navigate("/")}>홈으로</button>
      </main>
    );
  }

  return (
    <main className="ocPage metallicSilver" data-hsnap>
      <div className="ocCard">
        <div className="ocIconWrap">
          <div className="ocIcon">✓</div>
        </div>

        <h1 className="ocTitle">주문이 완료되었습니다.</h1>
        <p className="ocSub">결제가 정상적으로 처리되었습니다.</p>

        <div className="ocDivider" />

        <section className="ocProducts" aria-label="주문 상품">
          <p className="ocProductsTitle">주문 상품</p>
          {orderItems.map((item) => (
            <article className="ocProduct" key={`${item.id}-${item.option_id || "default"}`}>
              {item.image && <img src={item.image} alt="" className="ocProductImage" />}
              <div className="ocProductInfo">
                <p className="ocProductName">{item.name}</p>
                <p className="ocProductMeta">{Number(item.price || 0).toLocaleString()}원 · {item.quantity}개</p>
              </div>
            </article>
          ))}
        </section>

        <ul className="ocInfo">
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
          <button type="button" className="ocMypageBtn" onClick={openMyPage}>주문 내역 보기</button>
        </div>
      </div>
    </main>
  );
}

export default OrderComplete;
