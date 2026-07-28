import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";
import { createOrder, readyPayment, verifyPayment, getMyCoupons, validateCoupon } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";
import "./CheckoutKoreanHall.css";

const PAYMENT_METHODS = [
  { key: "KAKAO", label: "카카오페이", provider: "KAKAOPAY" },
];

const KH_PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 9.7 + 4) % 100,
  delay: (i * 0.71) % 6,
  duration: 6 + ((i * 1.29) % 4),
  scale: 0.7 + ((i * 0.47) % 0.6),
}));

function CheckoutKoreanHall() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { openCart } = useCartModal();

  const items = state?.cartItems
    || (state?.product ? [{ ...state.product, quantity: state.quantity }] : null);

  const [form, setForm] = useState({ recipient: "", phone: "", address: "", detail: "" });
  const [payMethod, setPayMethod] = useState("KAKAO");
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState(0);

  const STEPS = ["배송 정보", "결제 수단", "최종 확인"];

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

  // 상품 없이 직접 접근 또는 새로고침 시 한국관으로 보내고 장바구니 모달을 띄운다
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate("/korean-hall", { replace: true });
      openCart();
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

  const itemSummaryLabel =
    items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`;
  const selectedPayLabel = PAYMENT_METHODS.find((m) => m.key === payMethod)?.label;

  return (
    <main className="khcoPage" data-lenis-prevent data-hsnap>
      <div className="khcoPetals" aria-hidden="true">
        {KH_PETALS.map((p, i) => (
          <span
            key={i}
            className="khcoPetal"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--khcoPetalScale": p.scale,
            }}
          />
        ))}
      </div>

      <div className="khcoInner">
        <p className="khcoEyebrow">KOREAN HALL CHECKOUT</p>
        <h1 className="khcoTitle">한국관 주문 / 결제</h1>

        {/* ── 진행 단계 ── */}
        <div className="khcoStepper">
          {STEPS.map((label, i) => (
            <div className="khcoStepperItem" key={label}>
              <button
                type="button"
                className={"khcoStepCircle" + (i === step ? " active" : "") + (i < step ? " done" : "")}
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
              <span className={"khcoStepLabel" + (i === step ? " active" : "")}>{label}</span>
              {i < STEPS.length - 1 && <div className={"khcoStepLine" + (i < step ? " done" : "")} />}
            </div>
          ))}
        </div>

        <div className="khcoBody">
          {/* ── 왼쪽: 단계별 패널 ── */}
          <div className="khcoLeft">
            <div className="khcoStepPanel" key={step}>
              {step === 0 && (
                <section className="khcoCard">
                  <h2 className="khcoCardTitle">배송 정보</h2>
                  <div className="khcoForm">
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
                  <section className="khcoCard">
                    <h2 className="khcoCardTitle">결제 수단</h2>
                    <div className="khcoPayMethodGroup">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.key}
                          className={`khcoPayMethodBtn ${m.key.toLowerCase()}${payMethod === m.key ? " active" : ""}`}
                          onClick={() => setPayMethod(m.key)}
                          type="button"
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="khcoCard khcoCouponCard">
                    <h2 className="khcoCardTitle">쿠폰</h2>

                    {myCoupons.length > 0 && (
                      <div className="khcoCouponList">
                        {myCoupons.map((c) => (
                          <div
                            key={c.id}
                            className={"khcoCouponItem" + (appliedCoupon?.code === c.code ? " active" : "")}
                            onClick={() => handleSelectCoupon(c)}
                          >
                            <div className="khcoCouponItemLeft">
                              <span className="khcoCouponName">{c.name}</span>
                              <span className="khcoCouponCond">
                                {c.min_order_amount > 0
                                  ? `${c.min_order_amount.toLocaleString()}원 이상 구매 시`
                                  : "금액 제한 없음"}
                                {c.expiry_date && ` · ~${c.expiry_date}`}
                              </span>
                            </div>
                            <span className="khcoCouponValue">
                              {c.discount_type === "FIXED"
                                ? `${c.discount_value.toLocaleString()}원 할인`
                                : `${c.discount_value}% 할인`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="khcoCouponInputRow">
                      <input
                        className="khcoCouponInput"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="쿠폰 코드 입력"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCouponCode()}
                      />
                      <button className="khcoCouponApplyBtn" onClick={handleApplyCouponCode}>
                        적용
                      </button>
                    </div>

                    {couponError && <p className="khcoCouponError">{couponError}</p>}

                    {appliedCoupon && (
                      <div className="khcoCouponApplied">
                        <span>"{appliedCoupon.name}" 적용 — {discountAmount.toLocaleString()}원 할인</span>
                        <button onClick={handleRemoveCoupon}>취소</button>
                      </div>
                    )}
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  <section className="khcoCard">
                    <h2 className="khcoCardTitle">주문 상품</h2>
                    <div className="khcoProductList">
                      {items.map((item, idx) => (
                        <div className="khcoProduct" key={idx}>
                          <img src={item.image} alt={item.name} className="khcoThumb" />
                          <div className="khcoProductInfo">
                            <p className="khcoProductName">{item.name}</p>
                            <p className="khcoProductQty">
                              {item.price.toLocaleString()}원 × {item.quantity}개
                            </p>
                          </div>
                          <p className="khcoProductAmt">
                            {(item.price * item.quantity).toLocaleString()}원
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="khcoCard">
                    <h2 className="khcoCardTitle">최종 확인</h2>
                    <div className="khcoRecapRow">
                      <div className="khcoRecapLeft">
                        <span className="khcoRecapLabel">배송지</span>
                        <span className="khcoRecapValue">
                          {form.recipient} · {form.phone}<br />
                          {[form.address, form.detail].filter(Boolean).join(" ")}
                        </span>
                      </div>
                      <button type="button" className="khcoRecapEdit" onClick={() => setStep(0)}>수정</button>
                    </div>
                    <div className="khcoRecapRow">
                      <div className="khcoRecapLeft">
                        <span className="khcoRecapLabel">결제 수단</span>
                        <span className="khcoRecapValue">{selectedPayLabel}</span>
                      </div>
                      <button type="button" className="khcoRecapEdit" onClick={() => setStep(1)}>수정</button>
                    </div>
                    {appliedCoupon && (
                      <div className="khcoRecapRow">
                        <div className="khcoRecapLeft">
                          <span className="khcoRecapLabel">쿠폰</span>
                          <span className="khcoRecapValue">{appliedCoupon.name}</span>
                        </div>
                        <button type="button" className="khcoRecapEdit" onClick={() => setStep(1)}>수정</button>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>

          {/* ── 오른쪽: 결제 요약 (항상 노출) ── */}
          <div className="khcoRight">
            <div className="khcoSummaryCard">
              <p className="khcoSummaryItemLabel">{itemSummaryLabel}</p>
              <div className="khcoSummaryRow">
                <span>상품 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
              {discountAmount > 0 && (
                <div className="khcoSummaryRow khcoCouponDiscount">
                  <span>쿠폰 할인</span>
                  <span>-{discountAmount.toLocaleString()}원</span>
                </div>
              )}
              <div className="khcoSummaryRow">
                <span>배송비</span>
                <span className="khcoFree">무료</span>
              </div>
              <div className="khcoSummaryDivider" />
              <div className="khcoSummaryTotal">
                <span>최종 결제 금액</span>
                <strong>{finalAmount.toLocaleString()}원</strong>
              </div>

              <div className="khcoActionRow">
                {step > 0 && (
                  <button type="button" className="khcoBackBtn" onClick={goPrev}>
                    이전
                  </button>
                )}
                <button
                  className="khcoPayBtn"
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
      </div>
    </main>
  );
}

export default CheckoutKoreanHall;
