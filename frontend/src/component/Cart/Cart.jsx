import "./Cart.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Trash2, ShoppingBag, Ticket, ChevronDown } from "lucide-react";
import { getCartItems, updateCartItem, deleteCartItem, getMyCoupons } from "../../api";
import { PRODUCTS as products } from "../Home/Home";
import { useAuthModal } from "../../context/AuthModalContext";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

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

  // "함께 구매하면 좋은 상품" — 실제 co-purchase 통계 없이, 장바구니에 담긴 상품과
  // 같은 카테고리를 우선 노출하는 간단한 추천이다(카탈로그 자체가 카테고리 필드를 이미
  // 갖고 있어 별도 API 없이도 가능). 담은 상품은 제외하고 최대 5개.
  // ponytail: 카테고리 매칭 휴리스틱 — 실사용 데이터 기반 추천이 필요해지면 백엔드
  // 주문 이력 집계 API로 교체.
  const detailBasePath = "/item";
  const cartProductIds = new Set(cartItems.map((i) => i.product_id));
  const cartCategories = new Set(
    cartItems.map((i) => products.find((p) => p.id === i.product_id)?.category).filter(Boolean)
  );
  const recommended = products
    .filter((p) => !cartProductIds.has(p.id))
    .sort((a, b) => (cartCategories.has(b.category) ? 1 : 0) - (cartCategories.has(a.category) ? 1 : 0))
    .slice(0, 5);
  const formatPrice = (price) =>
    (typeof price === "number" ? price : Number(String(price).replace(/,/g, ""))).toLocaleString();

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

          {recommended.length > 0 && (
            <section className="cartRecommend">
              <h2 className="cartRecommendTitle">함께 구매하면 좋은 상품</h2>
              <div className="cartRecommendGrid">
                {recommended.map((p) => (
                  <div
                    key={p.id}
                    className="cartRecommendCard"
                    onClick={() => navigate(`${detailBasePath}/${p.id}`)}
                  >
                    <div className="cartRecommendImg">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <p className="cartRecommendName">{p.name}</p>
                    <p className="cartRecommendPrice">₩{formatPrice(p.price)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
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
