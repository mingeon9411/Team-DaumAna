import "./Cart.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Trash2, ShoppingBag } from "lucide-react";
import { getCartItems, updateCartItem, deleteCartItem } from "../../api";
import koreanHallProducts from "../../data/products";
import { PRODUCTS as homeProducts } from "../Home/Home";
import { useAuthModal } from "../../context/AuthModalContext";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  // 모달 시절엔 현재 열려있는 페이지(/korean-hall)로 구역을 판단했지만, 이제 카트
  // 자체가 페이지(/cart, /korean-hall/cart)라 자기 경로로 판단한다 — checkout과 동일한 규칙.
  const isKoreanHall = location.pathname.startsWith("/korean-hall");
  // 한국관/메인은 상품 id가 겹쳐도 서로 다른 상품이므로, 현재 페이지에 맞는 목록에서만 대체 이미지를 찾는다.
  const products = isKoreanHall ? koreanHallProducts : homeProducts;
  const { openLogin } = useAuthModal();
  const goBack = () => navigate(isKoreanHall ? "/korean-hall" : "/");

  // ProductDetail.jsx와 같은 신호 재사용 — 마운트 시점에 남겨둬야 닫기 버튼 클릭이든
  // 브라우저 뒤로가기든 상관없이, "/korean-hall" 도착 시 DoorIntroController가 이 흔적을
  // 보고 대문 애니메이션 없이 곧장 상품 목록으로 스크롤한다.
  useEffect(() => {
    if (isKoreanHall) {
      sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.KOREAN_HALL);
    }
  }, [isKoreanHall]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  // 한국관 상품은 백엔드 Product 데이터를 신뢰하지 않는다(id 충돌 + 로컬 파일 경로가
  // 그대로 저장돼 있어 이미지 URL로 못 씀) — 항상 로컬 카탈로그 이미지를 우선한다.
  const toCheckoutItem = (item) => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    image: isKoreanHall
      ? products.find((p) => p.id === item.product_id)?.image
      : item.image,
    quantity: item.quantity,
    option_id: item.option_id || null,
  });

  const goToCheckout = (items) => {
    navigate(isKoreanHall ? "/korean-hall/checkout" : "/checkout", { state: { cartItems: items } });
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
    <main className={`cartPage${isKoreanHall ? " koreanHallCart" : ""}`} data-hsnap data-lenis-prevent>
      <div className={`cartInner${isKoreanHall ? " koreanHallCart" : ""}`}>
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

        {!loading && cartItems.length > 0 && (
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
        )}

        <div className="cartList">
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
            cartItems.map((item) => (
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
                    src={
                      isKoreanHall
                        ? products.find((p) => p.id === item.product_id)?.image
                        : item.image
                    }
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
            ))
          )}
        </div>

        {!loading && cartItems.length > 0 && (
          <>
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
              <button className="cartSecondaryBtn" onClick={goBack}>
                쇼핑계속하기
              </button>
              <button className="cartOrderBtn" onClick={handleBuySelected}>
                선택상품 주문
              </button>
            </div>
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
