import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";
import { createOrder, readyPayment, verifyPayment, getMyCoupons, validateCoupon } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import "./Checkout.css";

const PAYMENT_METHODS = [
  { key: "KAKAO", label: "카카오페이", provider: "KAKAOPAY" },
  { key: "NAVER", label: "네이버페이", provider: "NAVERPAY" },
];

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const items = state?.cartItems
    || (state?.product ? [{ ...state.product, quantity: state.quantity }] : null);

  const [form, setForm] = useState({ recipient: "", phone: "", address: "", detail: "" });
  const [payMethod, setPayMethod] = useState("KAKAO");
  const [isPaying, setIsPaying] = useState(false);

  const [myCoupons, setMyCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    getMyCoupons()
      .then((res) => setMyCoupons(res.data))
      .catch(() => {});
  }, []);

  // 상품 없이 직접 접근 또는 새로고침 시 장바구니로 리다이렉트
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items || items.length === 0) {
    return null;
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const handleSelectCoupon = async (coupon) => {
    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError("");
      return;
    }
    setCouponError("");
    try {
      const res = await validateCoupon(coupon.code, totalAmount);
      setAppliedCoupon(res.data);
      setDiscountAmount(res.data.discount_amount);
      setCouponInput("");
    } catch (e) {
      setCouponError(e.response?.data?.error || "쿠폰 적용에 실패했습니다.");
    }
  };

  const handleApplyCouponCode = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const res = await validateCoupon(couponInput.trim().toUpperCase(), totalAmount);
      setAppliedCoupon(res.data);
      setDiscountAmount(res.data.discount_amount);
    } catch (e) {
      setCouponError(e.response?.data?.error || "쿠폰 적용에 실패했습니다.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePay = async () => {
    if (!form.recipient.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("수령인, 연락처, 주소를 모두 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }

    const shippingAddr = [form.address, form.detail].filter(Boolean).join(" ");
    const selected = PAYMENT_METHODS.find((m) => m.key === payMethod);

    setIsPaying(true);
    try {
      let orderRes;
      try {
        orderRes = await createOrder({
          shipping_addr: shippingAddr,
          coupon_code: appliedCoupon?.code || "",
          items: items.map((i) => ({
            product_id: i.id,
            option_id: i.option_id || null,
            quantity: i.quantity,
          })),
        });
      } catch (e) {
        alert(`[주문 생성 오류] ${e.response?.data?.message || e.message}`);
        return;
      }
      const { order_id } = orderRes.data;

      let readyRes;
      try {
        readyRes = await readyPayment({ order_id, method: payMethod });
      } catch (e) {
        alert(`[결제 준비 오류] ${e.response?.data?.message || e.message}`);
        return;
      }
      const { merchant_uid, amount } = readyRes.data;

      const paymentResponse = await PortOne.requestPayment({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        paymentId: merchant_uid,
        orderName: items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`,
        totalAmount: amount,   // 백엔드가 할인 적용 후 금액을 반환
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        easyPay: { easyPayProvider: selected.provider },
      });

      if (paymentResponse?.code != null) {
        alert(paymentResponse.message || "결제가 취소되었습니다.");
        return;
      }

      try {
        await verifyPayment({ payment_id: paymentResponse.paymentId, merchant_uid });
        navigate("/order-complete", {
          replace: true,
          state: {
            productName: items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`,
            totalAmount,
            quantity: items.reduce((s, i) => s + i.quantity, 0),
            shippingAddr,
          },
        });
      } catch (e) {
        alert(`[검증 오류] ${e.response?.data?.message || e.message}`);
      }
    } catch (e) {
      alert(`[결제 오류] ${e.message || "알 수 없는 오류가 발생했습니다."}`);
      console.error(e);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="checkoutPage" data-lenis-prevent data-hsnap>
      <div className="checkoutInner">
        <h1 className="checkoutTitle">주문 / 결제</h1>

        <div className="checkoutBody">
          {/* ── 왼쪽: 주문 상품 + 결제 수단 ── */}
          <div className="checkoutLeft">
            <section className="checkoutCard">
              <h2 className="checkoutCardTitle">주문 상품</h2>
              <div className="checkoutProductList">
                {items.map((item, idx) => (
                  <div className="checkoutProduct" key={idx}>
                    <img src={item.image} alt={item.name} className="checkoutThumb" />
                    <div className="checkoutProductInfo">
                      <p className="checkoutProductName">{item.name}</p>
                      <p className="checkoutProductQty">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </p>
                    </div>
                    <p className="checkoutProductAmt">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
              {items.length > 1 && (
                <div className="checkoutSubtotal">
                  합계 <strong>{totalAmount.toLocaleString()}원</strong>
                </div>
              )}
            </section>

            <section className="checkoutCard">
              <h2 className="checkoutCardTitle">결제 수단</h2>
              <div className="payMethodGroup">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.key}
                    className={`payMethodBtn ${m.key.toLowerCase()}${payMethod === m.key ? " active" : ""}`}
                    onClick={() => setPayMethod(m.key)}
                    type="button"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ── 쿠폰 ── */}
          <section className="checkoutCard couponCard">
            <h2 className="checkoutCardTitle">쿠폰</h2>

            {/* 보유 쿠폰 목록 */}
            {myCoupons.length > 0 && (
              <div className="couponList">
                {myCoupons.map((c) => (
                  <div
                    key={c.id}
                    className={"couponItem" + (appliedCoupon?.code === c.code ? " active" : "")}
                    onClick={() => handleSelectCoupon(c)}
                  >
                    <div className="couponItemLeft">
                      <span className="couponName">{c.name}</span>
                      <span className="couponCond">
                        {c.min_order_amount > 0
                          ? `${c.min_order_amount.toLocaleString()}원 이상 구매 시`
                          : "금액 제한 없음"}
                        {c.expiry_date && ` · ~${c.expiry_date}`}
                      </span>
                    </div>
                    <span className="couponValue">
                      {c.discount_type === "FIXED"
                        ? `${c.discount_value.toLocaleString()}원 할인`
                        : `${c.discount_value}% 할인`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 코드 직접 입력 */}
            <div className="couponInputRow">
              <input
                className="couponInput"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="쿠폰 코드 입력"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCouponCode()}
              />
              <button className="couponApplyBtn" onClick={handleApplyCouponCode}>
                적용
              </button>
            </div>

            {couponError && <p className="couponError">{couponError}</p>}

            {appliedCoupon && (
              <div className="couponApplied">
                <span>"{appliedCoupon.name}" 적용 — {discountAmount.toLocaleString()}원 할인</span>
                <button onClick={handleRemoveCoupon}>취소</button>
              </div>
            )}
          </section>

          {/* ── 오른쪽: 배송 정보 + 결제 요약 ── */}
          <div className="checkoutRight">
            <section className="checkoutCard">
              <h2 className="checkoutCardTitle">배송 정보</h2>
              <div className="checkoutForm">
                <label>
                  수령인
                  <input
                    name="recipient"
                    value={form.recipient}
                    onChange={handleChange}
                    placeholder="홍길동"
                  />
                </label>
                <label>
                  연락처
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                  />
                </label>
                <label>
                  주소
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                </label>
                <label>
                  상세주소
                  <input
                    name="detail"
                    value={form.detail}
                    onChange={handleChange}
                    placeholder="101동 202호 (선택)"
                  />
                </label>
              </div>
            </section>

            <div className="checkoutSummaryCard">
              <div className="checkoutSummaryRow">
                <span>상품 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              {discountAmount > 0 && (
                <div className="checkoutSummaryRow couponDiscount">
                  <span>쿠폰 할인</span>
                  <span>-{discountAmount.toLocaleString()}원</span>
                </div>
              )}
              <div className="checkoutSummaryRow">
                <span>배송비</span>
                <span className="checkoutFree">무료</span>
              </div>
              <div className="checkoutSummaryDivider" />
              <div className="checkoutSummaryTotal">
                <span>최종 결제 금액</span>
                <strong>{finalAmount.toLocaleString()}원</strong>
              </div>
              <button
                className="checkoutPayBtn"
                onClick={handlePay}
                disabled={isPaying}
              >
                {isPaying ? "결제 처리 중..." : `${finalAmount.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
