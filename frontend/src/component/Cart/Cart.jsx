import "./Cart.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Trash2, ShoppingBag, Ticket, ChevronDown, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { getCartItems, updateCartItem, deleteCartItem, getMyCoupons } from "../../api";
import { PRODUCTS as products } from "../Home/Home";
import { getWishlist, toggleWish } from "../../utils/wishlist";
import { useAuthModal } from "../../context/AuthModalContext";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

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

  // HomeProductDetail.jsx와 같은 신호 재사용 — 마운트 시점에 남겨둬야 닫기 버튼
  // 클릭이든 브라우저 뒤로가기든 상관없이, "/" 도착 시 DoorIntroController가 이
  // 흔적을 보고 대문 애니메이션·기본 패널 없이 곧장 상품 목록으로 스크롤한다.
  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [myCoupons, setMyCoupons] = useState([]);
  const [couponBannerOpen, setCouponBannerOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => getWishlist().map((p) => p.id));
  // utils/wishlist.js는 price를 숫자로 저장 — Home 카탈로그의 "168,000" 콤마 문자열을
  // 그대로 넘기면 Number()가 NaN → 0으로 깨지므로 여기서 벗겨서 넘긴다.
  const handleToggleWish = (product) => {
    toggleWish({ ...product, price: String(product.price).replace(/,/g, "") });
    setWishlist(getWishlist().map((p) => p.id));
  };

  // 쿠폰 실제 적용은 결제 단계(Checkout.jsx)에서만 하므로, 여기서는 보유 쿠폰을
  // 미리 보여주는 배너만 — getMyCoupons()가 반환하는 필드도 Checkout.jsx와 동일.
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

  const checkedItems = cartItems.filter((i) => i.checked);
  const displayTotal = (
    checkedItems.length > 0 ? checkedItems : cartItems
  ).reduce((sum, i) => sum + i.price * i.quantity, 0);

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

  const goToCheckout = (items) => {
    navigate("/checkout", { state: { cartItems: items } });
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
    goToCheckout(selected.map(toCheckoutItem));
  };

  return (
    <main className="cartPage metallicSilver" data-hsnap data-lenis-prevent>
      <div className="cartInner">
        <button type="button" className="cartModalClose" onClick={goBack} aria-label="닫기">
          ×
        </button>

        <div className="cartHeader">
          <p className="cartEyebrow">SHOPPING BAG</p>
          <h1>장바구니</h1>
          <p className="cartHeaderSub">로그인 후, 집다움에서 혜택을 확인하세요.</p>
        </div>

        <div className="cartTabs">
          <button className="active">일반배송</button>
        </div>

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
                      <Ticket size={15} /> 사용 가능한 쿠폰이 {myCoupons.length}장 있어요
                    </span>
                    <ChevronDown size={14} className={couponBannerOpen ? "cartCouponChevron open" : "cartCouponChevron"} />
                  </button>
                  {couponBannerOpen && (
                    <div className="cartCouponList">
                      {myCoupons.map((c) => (
                        <div className="cartCouponItem" key={c.id}>
                          <span className="cartCouponName">{c.name}</span>
                          <span className="cartCouponValue">
                            {c.discount_type === "FIXED"
                              ? `${c.discount_value.toLocaleString()}원 할인`
                              : `${c.discount_value}% 할인`}
                          </span>
                        </div>
                      ))}
                      <p className="cartCouponNote">결제 단계에서 적용할 쿠폰을 선택할 수 있어요.</p>
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
                {cartItems.map((item) => (
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
                          const local = products.find((p) => p.id === item.product_id);
                          if (local?.image) e.target.src = local.image;
                        }}
                      />
                    </div>

                    <div className="cartItemBody">
                      <h3>{item.product_name}</h3>
                      {item.option_name && <p className="cartItemOption">{item.option_name}</p>}

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
                    </div>

                    <div className="cartItemRight">
                      <strong className="cartItemPrice">
                        ₩{(item.price * item.quantity).toLocaleString()}
                      </strong>
                      <div className="cartItemActions">
                        <button
                          className="cartBuyNowBtn"
                          onClick={() => {
                            if (!localStorage.getItem("access_token")) {
                              setShowLoginModal(true);
                              return;
                            }
                            goToCheckout([toCheckoutItem(item)]);
                          }}
                        >
                          바로구매
                        </button>
                        <button className="cartRemoveBtn" onClick={() => handleDelete(item.id)} aria-label="삭제">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="cartSummarySidebar">
              <p className="cartSummaryEyebrow">ORDER SUMMARY</p>
              <div className="cartSummaryReceipt">
                <div className="cartSummaryRow">
                  <span>총 상품금액</span>
                  <span>{displayTotal.toLocaleString()}원</span>
                </div>
                <div className="cartSummaryRow">
                  <span>배송비</span>
                  <span className="cartFree">0원</span>
                </div>
                <div className="cartSummaryRow">
                  <span>할인금액</span>
                  <span>0원</span>
                </div>
                <div className="cartSummaryDivider" />
                <div className="cartSummaryTotal">
                  <span>총 주문금액</span>
                  <strong>{displayTotal.toLocaleString()}원</strong>
                </div>
              </div>

              <div className="cartActions">
                <button className="cartOrderBtn" onClick={handleBuySelected}>
                  선택상품 주문
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
