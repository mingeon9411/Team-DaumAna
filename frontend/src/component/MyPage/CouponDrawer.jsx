import "./CouponDrawer.css";

function CouponDrawer({ coupons, onClose }) {
  const formatDiscount = (c) => {
    if (c.discount_type === "FIXED")
      return `${c.discount_value.toLocaleString()}원 할인`;
    let txt = `${c.discount_value}% 할인`;
    if (c.max_discount_amount)
      txt += ` (최대 ${c.max_discount_amount.toLocaleString()}원)`;
    return txt;
  };

  return (
    <div className="cdOverlay" onClick={onClose}>
      <aside className="cdPanel" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="cdHeader">
          <div>
            <p className="cdHeaderSub">MY COUPON</p>
            <h2 className="cdHeaderTitle">보유 쿠폰</h2>
          </div>
          <button className="cdClose" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 쿠폰 수 */}
        <div className="cdCountBar">
          총 <strong>{coupons.length}</strong>개의 쿠폰을 보유하고 있습니다
        </div>

        {/* 쿠폰 목록 */}
        <div className="cdList">
          {coupons.length === 0 ? (
            <div className="cdEmpty">
              <span className="cdEmptyIcon">🎫</span>
              <p>보유한 쿠폰이 없습니다</p>
              <span>이벤트 또는 관리자를 통해 쿠폰을 받아보세요</span>
            </div>
          ) : (
            coupons.map((c) => (
              <div
                className={"cdCard" + (c.discount_type === "PERCENT" ? " percent" : " fixed")}
                key={c.id}
              >
                {/* 왼쪽 할인 값 */}
                <div className="cdCardLeft">
                  <span className="cdValue">
                    {c.discount_type === "FIXED"
                      ? `${c.discount_value.toLocaleString()}원`
                      : `${c.discount_value}%`}
                  </span>
                  <span className="cdValueLabel">쿠폰 할인</span>
                </div>

                {/* 구분선 */}
                <div className="cdDivider">
                  <span className="cdNotchTop" />
                  <span className="cdNotchBottom" />
                </div>

                {/* 오른쪽 쿠폰 정보 */}
                <div className="cdCardRight">
                  <p className="cdName">{c.name}</p>
                  <p className="cdDesc">{formatDiscount(c)}</p>
                  {c.min_order_amount > 0 && (
                    <p className="cdCond">
                      {c.min_order_amount.toLocaleString()}원 이상 구매 시
                    </p>
                  )}
                  <div className="cdBottom">
                    <span className="cdCode">{c.code}</span>
                    {c.expiry_date ? (
                      <span className="cdExpiry">~ {c.expiry_date}</span>
                    ) : (
                      <span className="cdExpiry noExpiry">기간 제한 없음</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 안내 */}
        <p className="cdFootNote">쿠폰은 결제 페이지에서 적용할 수 있습니다</p>
      </aside>
    </div>
  );
}

export default CouponDrawer;
