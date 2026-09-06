import "./Cart.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShoppingBag, Ticket, ChevronDown, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { getCartItems, updateCartItem, deleteCartItem, getMyCoupons, validateCoupon } from "../../api";
import { PRODUCTS as products } from "../Home/Home";
import { useWishlist } from "../../hooks/useWishlist";
import { useAuthModal } from "../../context/AuthModalContext";

const RECOMMEND_PAGE_SIZE = 5;

// p.price/originalPrice는 "168,000" 같은 콤마 포함 문자열 — Home.jsx ProductCard와 동일한 계산.
const getDiscountPct = (p) => {
  const priceNum = Number(String(p.price).replace(/,/g, ""));
  const originalNum = p.originalPrice ? Number(String(p.originalPrice).replace(/,/g, "")) : 0;
  return originalNum > priceNum ? Math.round((1 - priceNum / originalNum) * 100) : 0;
};

// 29CM 장바구니 참고 — "다른 고객이 함께 구매한 상품" / "비슷한 취향의 고객이 담은 상품"
// 두 섹션에 공용으로 쓰는 페이지네이션 카드 그리드.
function RecommendCarousel({ title, items, wishlist, onToggleWish, onNavigate }) {
  const [page, setPage] = useState(0);
  if (items.length === 0) return null;
  const totalPages = Math.ceil(items.length / RECOMMEND_PAGE_SIZE);
  const pageItems = items.slice(page * RECOMMEND_PAGE_SIZE, page * RECOMMEND_PAGE_SIZE + RECOMMEND_PAGE_SIZE);

  return (
    <section className="cartRecommend">
      <h2 className="cartRecommendTitle">{title}</h2>
      <div className="cartRecommendGrid">
        {pageItems.map((p) => {
          const discountPct = getDiscountPct(p);
          const wished = wishlist.includes(p.id);
          return (
            <div key={p.id} className="cartRecommendCard" onClick={() => onNavigate(p.id)}>
              <div className="cartRecommendImg">
                <img src={p.image} alt={p.name} />
                <button
                  type="button"
                  className={`cartRecommendWish ${wished ? "active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); onToggleWish(p); }}
                  aria-label="찜하기"
                >
                  <Heart size={13} fill={wished ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="cartRecommendName">{p.name}</p>
              <div className="cartRecommendPriceRow">
                {discountPct > 0 && <span className="cartRecommendDiscount">{discountPct}%</span>}
                <span className="cartRecommendPrice">₩{p.price}</span>
              </div>
              <div className="cartRecommendTags">
                <span>무료배송</span>
                {p.label === "NEW" && <span>신상품</span>}
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="cartRecommendPager">
          <button type="button" onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={page === 0} aria-label="이전 페이지">
            <ChevronLeft size={14} />
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button type="button" onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))} disabled={page === totalPages - 1} aria-label="다음 페이지">
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}

function Cart() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const goBack = () => navigate("/");

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [couponBannerOpen, setCouponBannerOpen] = useState(false);
  // 쿠폰 자체는 Checkout.jsx의 validateCoupon과 완전히 같은 방식으로 여기서도
  // 미리 적용해볼 수 있다 — 실제 최종 검증·주문 반영은 여전히 결제 단계에서
  // 하지만(그쪽 handleSelectCoupon과 동일 로직), 여기서 고른 코드를 그대로
  // navigate state로 넘겨 Checkout에 도착하자마자 같은 쿠폰이 이어서 적용되게 한다.
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const { wishlist: wishItems, toggleWish: handleToggleWish } = useWishlist();
  const wishlist = wishItems.map((item) => item.id);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    getMyCoupons()
      .then((res) => setMyCoupons(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMyCoupons([]));
  }, []);

  const fetchCart = useCallback(() => {
    if (!localStorage.getItem("access_token")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCartItems()
      .then((res) =>
        setCartItems(res.data.map((item) => ({ ...item, checked: false })))
      )
      .catch((err) => {
        console.error("장바구니 조회 실패:", err.response?.status, err.response?.data);
        setCartItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const allChecked =
    cartItems.length > 0 && cartItems.every((item) => item.checked);

  const handleAllCheck = (e) => {
    const checked = e.target.checked;
    setCartItems((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const handleItemCheck = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleQuantityChange = async (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
    try {
      await updateCartItem({ item_id: id, quantity: newQty });
    } catch {
      fetchCart();
    }
  };

  const handleDelete = async (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteCartItem(id);
      window.dispatchEvent(new Event("cartchange"));
    } catch {
      fetchCart();
    }
  };

  const handleDeleteSelected = async () => {
    const selected = cartItems.filter((item) => item.checked);
    if (selected.length === 0) {
      alert("삭제할 상품을 선택해주세요.");
      return;
    }
    setCartItems((prev) => prev.filter((item) => !item.checked));
    try {
      await Promise.all(selected.map((item) => deleteCartItem(item.id)));
      window.dispatchEvent(new Event("cartchange"));
    } catch {
      fetchCart();
    }
  };

  // 체크된 상품이 하나도 없으면 결제 금액도 0원부터 시작해야 한다 — 예전엔
  // 전부 해제해도 장바구니 전체 합계를 그대로 보여줘서(cartItems로 폴백),
  // "선택한 것만 결제한다"는 체크박스의 의미와 화면 금액이 어긋났다.
  const displayItems = cartItems.filter((i) => i.checked);
  // 29CM 장바구니 참고 — "총 주문 금액"은 정가(카탈로그 originalPrice) 합계,
  // "총 할인 금액"은 그 정가와 실제 판매가(item.price, 이미 할인 적용된 값) 차이의
  // 합계, "총 결제 금액"이 쿠폰까지 뺀 뒤 실제로 내는 돈이다. 카탈로그에 없는
  // 상품(옵션 상품 등)은 할인 없음(정가=판매가)으로 취급한다.
  const displayFinalTotal = displayItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const displayOrderTotal = displayItems.reduce((sum, i) => {
    const local = products.find((p) => p.id === i.product_id);
    const originalNum = local?.originalPrice ? Number(String(local.originalPrice).replace(/,/g, "")) : 0;
    return sum + Math.max(originalNum, i.price) * i.quantity;
  }, 0);
  const displayDiscount = displayOrderTotal - displayFinalTotal;
  const displayPayable = Math.max(0, displayFinalTotal - couponDiscount);

  // Checkout.jsx의 handleSelectCoupon과 완전히 같은 로직 — validateCoupon이
  // 실제 최종 검증까지 해주므로(최소 주문금액 등), 여기 미리보기도 결제 단계와
  // 어긋나지 않는다. 같은 쿠폰을 다시 누르면 해제.
  const handleSelectCoupon = async (coupon) => {
    if (appliedCoupon?.code === coupon.code) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError("");
      return;
    }
    setCouponError("");
    try {
      const res = await validateCoupon(coupon.code, displayFinalTotal);
      setAppliedCoupon({ ...res.data, code: coupon.code, name: res.data.coupon_name });
      setCouponDiscount(res.data.discount_amount);
    } catch (e) {
      setCouponError(e.response?.data?.error || "쿠폰 적용에 실패했습니다.");
    }
  };

  // 사이드바 카드 안 select용 — "선택 안 함"이면 해제, 아니면 handleSelectCoupon 재사용.
  const handleCouponSelectChange = (code) => {
    if (!code) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError("");
      return;
    }
    const coupon = myCoupons.find((c) => c.code === code);
    if (coupon) handleSelectCoupon(coupon);
  };

  // "다른 고객이 함께 구매한 상품" — 실제 co-purchase 통계 없이, 장바구니에 담긴 상품과
  // 같은 카테고리를 우선 노출하는 간단한 추천이다(카탈로그 자체가 카테고리 필드를 이미
  // 갖고 있어 별도 API 없이도 가능). "비슷한 취향의 고객이 담은 상품"은 첫 섹션과
  // 안 겹치게 뺀 나머지 중 할인율이 높은 순 — 둘 다 실사용 데이터 기반은 아님.
  // ponytail: 휴리스틱 추천 — 실사용 데이터 기반이 필요해지면 백엔드 주문 이력 집계 API로 교체.
  const detailBasePath = "/item";
  const cartProductIds = new Set(cartItems.map((i) => i.product_id));
  const cartCategories = new Set(
    cartItems.map((i) => products.find((p) => p.id === i.product_id)?.category).filter(Boolean)
  );
  const coPurchased = products
    .filter((p) => !cartProductIds.has(p.id))
    .sort((a, b) => (cartCategories.has(b.category) ? 1 : 0) - (cartCategories.has(a.category) ? 1 : 0))
    .slice(0, 15);
  const coPurchasedIds = new Set(coPurchased.map((p) => p.id));
  const similarTaste = products
    .filter((p) => !cartProductIds.has(p.id) && !coPurchasedIds.has(p.id))
    .sort((a, b) => getDiscountPct(b) - getDiscountPct(a))
    .slice(0, 15);

  const toCheckoutItem = (item) => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    option_id: item.option_id || null,
  });

  const goToCheckout = (items, couponCode) => {
    navigate("/checkout", { state: { cartItems: items, couponCode } });
  };

  const handleBuySelected = () => {
    if (!localStorage.getItem("access_token")) {
      setShowLoginModal(true);
      return;
    }
    const selected = cartItems.filter((i) => i.checked);
    if (selected.length === 0) {
      alert("주문할 상품을 선택해주세요.");
      return;
    }
    // 여기서 미리 적용해본 쿠폰은 결제 단계에 도착하자마자 이어서 적용된다 —
    // "바로 구매"(상품 1개, 여기 아래 cartActionBtn)는 장바구니 전체 기준으로
    // 검증한 이 쿠폰과 금액이 안 맞을 수 있어 넘기지 않는다.
    goToCheckout(selected.map(toCheckoutItem), appliedCoupon?.code);
  };

  return (
    <main className="cartPage metallicSilver" data-hsnap data-lenis-prevent>
      <div className="cartInner">
        {/* 29CM 참고 — 모달 카드가 아니라 CustomerCenter.jsx/Settings.jsx와 같은
            독립 페이지 톤: "×" 닫기 대신 "목록으로" 백 링크, 장식적인 부제/탭 없이
            제목 하나만. */}
        <button type="button" className="cartBackBtn" onClick={goBack}>
          <ChevronLeft size={14} /> 목록으로
        </button>

        <h1 className="cartTitle">장바구니</h1>

        {loading ? (
          <div className="emptyCart">
            <p>불러오는 중...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="emptyCart">
            <span className="emptyCartIcon"><ShoppingBag size={26} /></span>
            <p>장바구니에 담긴 상품이 없습니다.</p>
            <button onClick={goBack}>쇼핑 계속하기</button>
          </div>
        ) : (
          // 오늘의집 등 커머스 카트의 흔한 2단 구성 — 왼쪽은 상품 목록(스크롤),
          // 오른쪽은 결제 요약이 스크롤을 따라 붙어있는(sticky) 카드.
          <>
          <div className="cartLayout">
            <div className="cartMain">
              {myCoupons.length > 0 && (
                <div className="cartCouponBanner">
                  <button
                    type="button"
                    className="cartCouponBannerRow"
                    onClick={() => setCouponBannerOpen((v) => !v)}
                  >
                    <span className="cartCouponBannerLabel">
                      <Ticket size={15} />
                      {appliedCoupon
                        ? `"${appliedCoupon.name}" 적용 중 — ${couponDiscount.toLocaleString()}원 할인`
                        : `사용 가능한 쿠폰이 ${myCoupons.length}장 있어요`}
                    </span>
                    <ChevronDown size={14} className={couponBannerOpen ? "cartCouponChevron open" : "cartCouponChevron"} />
                  </button>
                  {couponBannerOpen && (
                    <div className="cartCouponList">
                      {myCoupons.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`cartCouponItem${appliedCoupon?.code === c.code ? " active" : ""}`}
                          onClick={() => handleSelectCoupon(c)}
                        >
                          <span className="cartCouponItemLeft">
                            <span className="cartCouponName">{c.name}</span>
                            <span className="cartCouponCond">
                              {c.min_order_amount > 0
                                ? `${c.min_order_amount.toLocaleString()}원 이상 구매 시`
                                : "금액 제한 없음"}
                              {c.expiry_date && ` · ~${c.expiry_date}`}
                            </span>
                          </span>
                          <span className="cartCouponValue">
                            {c.discount_type === "FIXED"
                              ? `${c.discount_value.toLocaleString()}원 할인`
                              : `${c.discount_value}% 할인`}
                          </span>
                        </button>
                      ))}
                      {couponError && <p className="cartCouponError">{couponError}</p>}
                      <p className="cartCouponNote">여기서 미리 적용해보고, 결제 단계에도 그대로 이어집니다.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="cartToolbar">
                <label className="cartAllCheck">
                  <span className="cartCheckbox">
                    <input type="checkbox" checked={allChecked} onChange={handleAllCheck} />
                    <span className="cartCheckboxBox"><Check size={13} /></span>
                  </span>
                  전체선택 <span className="cartAllCheckCount">({cartItems.length})</span>
                </label>
                <button type="button" className="cartDeleteSelectedLink" onClick={handleDeleteSelected}>
                  선택삭제
                </button>
              </div>

              <div className="cartList">
                {cartItems.map((item) => {
                  const local = products.find((p) => p.id === item.product_id);
                  const originalNum = local?.originalPrice ? Number(String(local.originalPrice).replace(/,/g, "")) : 0;
                  const itemDiscountPct = originalNum > item.price ? Math.round((1 - item.price / originalNum) * 100) : 0;
                  return (
                  <div className="cartItemRow" key={item.id}>
                    <label className="cartItemCheck">
                      <span className="cartCheckbox">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleItemCheck(item.id)}
                        />
                        <span className="cartCheckboxBox"><Check size={13} /></span>
                      </span>
                    </label>

                    <div className="cartItemThumb">
                      <img
                        src={item.image}
                        alt={item.product_name}
                        onError={(e) => {
                          if (local?.image) e.target.src = local.image;
                        }}
                      />
                    </div>

                    <div className="cartItemBody">
                      <h3>{item.product_name}</h3>
                      {item.option_name && <p className="cartItemOption">{item.option_name}</p>}

                      <div className="cartItemPriceRow">
                        {itemDiscountPct > 0 && <span className="cartItemDiscountPct">{itemDiscountPct}%</span>}
                        <strong className="cartItemPrice">₩{(item.price * item.quantity).toLocaleString()}</strong>
                        {itemDiscountPct > 0 && (
                          <span className="cartItemOriginalPrice">₩{(originalNum * item.quantity).toLocaleString()}</span>
                        )}
                      </div>

                      <div className="cartItemBottomRow">
                        <div className="cartQty">
                          <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <span className="cartItemShipBadge">무료배송</span>
                      </div>

                      <div className="cartItemActions">
                        <button className="cartActionBtn" onClick={() => handleDelete(item.id)}>
                          삭제
                        </button>
                        <button
                          className="cartActionBtn cartBuyNowBtn"
                          onClick={() => {
                            if (!localStorage.getItem("access_token")) {
                              setShowLoginModal(true);
                              return;
                            }
                            goToCheckout([toCheckoutItem(item)]);
                          }}
                        >
                          바로 구매
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <aside className="cartSummarySidebar">
              <h2 className="cartSummaryTitle">총 주문 금액 <strong>{displayOrderTotal.toLocaleString()}원</strong></h2>

              {myCoupons.length > 0 && (
                <div className="cartSidebarCoupon">
                  <label htmlFor="cartCouponSelect" className="cartSidebarCouponLabel">
                    <Ticket size={14} /> 쿠폰 적용
                  </label>
                  <select
                    id="cartCouponSelect"
                    value={appliedCoupon?.code || ""}
                    onChange={(e) => handleCouponSelectChange(e.target.value)}
                  >
                    <option value="">쿠폰 선택 안 함</option>
                    {myCoupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.discount_type === "FIXED" ? `${c.discount_value.toLocaleString()}원` : `${c.discount_value}%`} 할인)
                      </option>
                    ))}
                  </select>
                  {couponError && <p className="cartCouponError">{couponError}</p>}
                </div>
              )}

              <div className="cartSummaryReceipt">
                <div className="cartSummaryRow cartSummarySub">
                  <span>ㄴ 상품 금액</span>
                  <span>{displayOrderTotal.toLocaleString()}원</span>
                </div>
                <div className="cartSummaryRow cartSummarySub">
                  <span>ㄴ 배송비</span>
                  <span className="cartFree">무료</span>
                </div>

                {displayDiscount > 0 && (
                  <>
                    <div className="cartSummaryDivider" />
                    <div className="cartSummaryRow">
                      <span>총 할인 금액</span>
                      <span className="cartDiscountAmount">-{displayDiscount.toLocaleString()}원</span>
                    </div>
                  </>
                )}

                {appliedCoupon && (
                  <div className="cartSummaryRow">
                    <span>쿠폰 할인</span>
                    <span className="cartDiscountAmount">-{couponDiscount.toLocaleString()}원</span>
                  </div>
                )}

                <div className="cartSummaryDivider" />
                <div className="cartSummaryTotal">
                  <span>총 결제 금액</span>
                  <strong>{displayPayable.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="cartActions">
                <button className="cartOrderBtn" onClick={handleBuySelected}>
                  결제하기
                </button>
                <button className="cartSecondaryBtn" onClick={goBack}>
                  쇼핑계속하기
                </button>
              </div>
            </aside>
          </div>

          <RecommendCarousel
            title="다른 고객이 함께 구매한 상품"
            items={coPurchased}
            wishlist={wishlist}
            onToggleWish={handleToggleWish}
            onNavigate={(id) => navigate(`${detailBasePath}/${id}`)}
          />
          <RecommendCarousel
            title="비슷한 취향의 고객이 담은 상품"
            items={similarTaste}
            wishlist={wishlist}
            onToggleWish={handleToggleWish}
            onNavigate={(id) => navigate(`${detailBasePath}/${id}`)}
          />
          </>
        )}

        {showLoginModal && (
          <div
            className="loginModalOverlay"
            onClick={() => setShowLoginModal(false)}
          >
            <div
              className="loginModal"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="loginModalMsg">로그인 이후 주문이 가능합니다.</p>
              <div className="loginModalBtns">
                <button
                  className="loginModalCancel"
                  onClick={() => setShowLoginModal(false)}
                >
                  취소
                </button>
                <button
                  className="loginModalConfirm"
                  onClick={() => { setShowLoginModal(false); openLogin(); }}
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
