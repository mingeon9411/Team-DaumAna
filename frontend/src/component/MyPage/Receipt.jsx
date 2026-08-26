import "./Receipt.css";
import { useEffect, useState } from "react";
import JDLogo from "../../assets/J.D 로고.svg";
// -sm: 26px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";

function formatDate(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  return d.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function Receipt({ order, onClose }) {
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  if (!order) return null;

  const itemTotal = order.items.reduce(
    (sum, i) => sum + i.ordered_price * i.quantity, 0
  );

  return (
    <div className="receiptOverlay" onClick={onClose}>
      <div className="receiptModal" data-lenis-prevent onClick={(e) => e.stopPropagation()}>

        {/* 상단 헤더 — J.D + 집다움 한옥 로고 조합 */}
        <div className="receiptHeader">
          <div className="receiptLogoRow">
            <img src={JDLogo} alt="J.D" className="receiptLogoJD" />
            <span className="receiptLogoDivider" />
            <img
              src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
              alt="집다움"
              className="receiptLogoHanok"
            />
          </div>
          <span className="receiptLogoAccent" />
          <p className="receiptSub">영수증</p>
        </div>

        <div className="receiptDash" />

        {/* 주문 기본 정보 */}
        <div className="receiptSection">
          <div className="receiptRow">
            <span>주문 번호</span>
            <span>#{order.id}</span>
          </div>
          <div className="receiptRow">
            <span>주문 일시</span>
            <span>{formatDate(order.order_date)}</span>
          </div>
          <div className="receiptRow">
            <span>배송지역</span>
            <span className="receiptAddr">{order.shipping_addr}</span>
          </div>
        </div>

        <div className="receiptDash" />

        {/* 상품 목록 */}
        <div className="receiptSection">
          <p className="receiptSectionLabel">주문 상품</p>
          {order.items.map((item, idx) => (
            <div className="receiptItemRow" key={idx}>
              <div className="receiptItemLeft">
                <span className="receiptItemName">{item.product_name}</span>
                <span className="receiptItemQty">
                  {item.ordered_price.toLocaleString()}원 × {item.quantity}개
                </span>
              </div>
              <span className="receiptItemAmt">
                {(item.ordered_price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>

        <div className="receiptDash" />

        {/* 금액 합계 */}
        <div className="receiptSection">
          <div className="receiptRow">
            <span>상품 금액</span>
            <span>{itemTotal.toLocaleString()}원</span>
          </div>
          <div className="receiptRow">
            <span>배송비</span>
            <span className="receiptFree">무료</span>
          </div>
        </div>

        <div className="receiptDash receiptDashBold" />

        <div className="receiptTotalRow">
          <span>결제 금액</span>
          <strong>{order.total_amount.toLocaleString()}원</strong>
        </div>

        <div className="receiptDash receiptDashBold" />

        {/* 결제 정보 */}
        <div className="receiptSection">
          <div className="receiptRow">
            <span>결제수단</span>
            <span>{order.payment_method || "-"}</span>
          </div>
          <div className="receiptRow">
            <span>결제일시</span>
            <span>{formatDate(order.paid_at)}</span>
          </div>
          <div className="receiptRow">
            <span>상태</span>
            <span>{order.status_display}</span>
          </div>
        </div>

        {/* 결제완료 스탬프 — 결제 성공 시에만 표시 */}
        {order.payment_status === "SUCCESS" && (
          <div className="receiptStampWrap">
            <div className="receiptStamp">결제완료</div>
          </div>
        )}

        <button className="receiptCloseBtn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default Receipt;