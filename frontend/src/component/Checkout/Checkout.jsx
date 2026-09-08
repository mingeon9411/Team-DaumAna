import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";
import { createOrder, readyPayment, verifyPayment, validateCoupon } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useNestedLenis } from "../../hooks/useNestedLenis";
import SiteFooter from "../SiteFooter";
import "./Checkout.css";

const PAYMENT_METHODS = [
  { key: "KAKAO", label: "카카오페이", provider: "KAKAOPAY" },
];

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  // data-lenis-prevent로 전역 가로 Lenis(App.jsx)는 건너뛰므로, 이 페이지 전용
  // 세로 스크롤에도 부드러운 관성을 붙인다.
  const pageRef = useRef(null);
  useNestedLenis(pageRef);

  const items = state?.cartItems
    || (state?.product ? [{ ...state.product, quantity: state.quantity }] : null);

  const [form, setForm] = useState({ recipient: "", phone: "", address: "", detail: "" });
  const [payMethod, setPayMethod] = useState("KAKAO");
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState(0);

  const STEPS = ["배송 정보", "결제 수단", "최종 확인"];

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // 상품 없이 직접 접근 또는 새로고침 시 장바구니 페이지로 보낸다
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cart.jsx에서 미리 적용해본 쿠폰이 있으면 이어서 적용한다 — handleApplyCouponCode와
  // 완전히 같은 방식(validateCoupon 재검증)이라 myCoupons 목록이 아직 안 와도 된다.
  // 실패해도 조용히 무시 — 여기서 다시 직접 고르거나 코드를 입력하면 된다.
  useEffect(() => {
    const code = state?.couponCode;
    if (!code || !items || items.length === 0) return;
    const amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    validateCoupon(code, amount)
      .then((res) => {
        setAppliedCoupon({ ...res.data, code, name: res.data.coupon_name });
        setDiscountAmount(res.data.discount_amount);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items || items.length === 0) {
    return null;
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  /*
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
      // validateCoupon 응답엔 code/name이 없고 coupon_name만 온다 — 실제 사용한 code와
      // 화면 표시용 name을 직접 채워 넣는다(안 하면 주문 생성 시 coupon_code가 빈 값으로 나감).
      setAppliedCoupon({ ...res.data, code: coupon.code, name: res.data.coupon_name });
      setDiscountAmount(res.data.discount_amount);
      setCouponInput("");
    } catch (e) {
      setCouponError(e.response?.data?.error || "쿠폰 적용에 실패했습니다.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError("");
  };

  */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goNext = () => {
    if (step === 0 && (!form.recipient.trim() || !form.phone.trim() || !form.address.trim())) {
      alert("수령인, 연락처, 주소를 모두 입력해주세요.");
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const handlePrimaryAction = () => {
    if (step < STEPS.length - 1) goNext();
    else handlePay();
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
      const { order_id, payment_required } = orderRes.data;
      if (!payment_required) {
        navigate("/order-complete", {
          replace: true,
          state: { productName: items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`, totalAmount: 0,
            quantity: items.reduce((s, i) => s + i.quantity, 0), shippingAddr, orderItems: items },
        });
        return;
      }

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
            orderItems: items,
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

  const itemSummaryLabel =
    items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`;
  const selectedPayLabel = PAYMENT_METHODS.find((m) => m.key === payMethod)?.label;

  return (
    <main className="checkoutPage metallicSilver" data-lenis-prevent data-hsnap ref={pageRef}>
      <div className="checkoutInner">
        <p className="coEyebrow">SECURE CHECKOUT</p>
        <h1 className="checkoutTitle">주문 / 결제</h1>

        {/* ── 진행 단계 ── */}
        <div className="coStepper">
          {STEPS.map((label, i) => (
            <div className="coStepperItem" key={label}>
              <button
                type="button"
                className={"coStepCircle" + (i === step ? " active" : "") + (i < step ? " done" : "")}
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
              >
                {i < step ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 13 10 18 19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              <span className={"coStepLabel" + (i === step ? " active" : "")}>{label}</span>
              {i < STEPS.length - 1 && <div className={"coStepLine" + (i < step ? " done" : "")} />}
            </div>
          ))}
        </div>

        <div className="checkoutBody">
          {/* ── 왼쪽: 단계별 패널 ── */}
          <div className="checkoutLeft">
            <div className="coStepPanel" key={step}>
              {step === 0 && (
                <section className="checkoutCard">
                  <h2 className="checkoutCardTitle">배송 정보</h2>
                  <div className="checkoutForm">
                    <label>
                      수령인
                      <input name="recipient" value={form.recipient} onChange={handleChange} placeholder="홍길동" />
                    </label>
                    <label>
                      연락처
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" />
                    </label>
                    <label>
                      주소
                      <input name="address" value={form.address} onChange={handleChange} placeholder="서울시 강남구 테헤란로 123" />
                    </label>
                    <label>
                      상세주소
                      <input name="detail" value={form.detail} onChange={handleChange} placeholder="101동 202호 (선택)" />
                    </label>
                  </div>
                </section>
              )}

              {step === 1 && (
                <>
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

                  {/* 쿠폰 선택은 장바구니에서만 제공한다.
                  <section className="checkoutCard couponCard">
                    <h2 className="checkoutCardTitle">쿠폰</h2>

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

                    {couponError && <p className="couponError">{couponError}</p>}

                    {appliedCoupon && (
                      <div className="couponApplied">
                        <span>"{appliedCoupon.name}" 적용 — {discountAmount.toLocaleString()}원 할인</span>
                        <button onClick={handleRemoveCoupon}>취소</button>
                      </div>
                    )}
                  </section>
                  */}
                </>
              )}

              {step === 2 && (
                <>
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
                  </section>

                  <section className="checkoutCard">
                    <h2 className="checkoutCardTitle">최종 확인</h2>
                    <div className="coRecapRow">
                      <div className="coRecapLeft">
                        <span className="coRecapLabel">배송지</span>
                        <span className="coRecapValue">
                          {form.recipient} · {form.phone}<br />
                          {[form.address, form.detail].filter(Boolean).join(" ")}
                        </span>
                      </div>
                      <button type="button" className="coRecapEdit" onClick={() => setStep(0)}>수정</button>
                    </div>
                    <div className="coRecapRow">
                      <div className="coRecapLeft">
                        <span className="coRecapLabel">결제 수단</span>
                        <span className="coRecapValue">{selectedPayLabel}</span>
                      </div>
                      <button type="button" className="coRecapEdit" onClick={() => setStep(1)}>수정</button>
                    </div>
                    {appliedCoupon && (
                      <div className="coRecapRow">
                        <div className="coRecapLeft">
                          <span className="coRecapLabel">쿠폰</span>
                          <span className="coRecapValue">{appliedCoupon.name}</span>
                        </div>
                        <button type="button" className="coRecapEdit" onClick={() => setStep(1)}>수정</button>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>

          {/* ── 오른쪽: 결제 요약 (항상 노출) ── */}
          <div className="checkoutRight">
            <div className="checkoutSummaryCard">
              <p className="coSummaryItemLabel">{itemSummaryLabel}</p>
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

              <div className="coActionRow">
                {step > 0 && (
                  <button type="button" className="coBackBtn" onClick={goPrev}>
                    이전
                  </button>
                )}
                <button
                  className="checkoutPayBtn"
                  onClick={handlePrimaryAction}
                  disabled={isPaying}
                >
                  {step < STEPS.length - 1
                    ? "다음"
                    : isPaying
                      ? "결제 처리 중..."
                      : `${finalAmount.toLocaleString()}원 결제하기`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}

export default Checkout;
