import "./Cart.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCartItems, updateCartItem, deleteCartItem } from "../../api";
import products from "../../data/products";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";

function Cart() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { isOpen, closeCart } = useCartModal();
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
    if (isOpen) fetchCart();
  }, [isOpen, fetchCart]);

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

  const toCheckoutItem = (item) => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    option_id: item.option_id || null,
  });

  const goToCheckout = (items) => {
    closeCart();
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

  if (!isOpen) return null;

  return (
    <div className="cartModalOverlay" onClick={closeCart}>
      <div className="cartInner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cartModalClose" onClick={closeCart} aria-label="닫기">
          ×
        </button>

        <div className="cartHeader">
          <h1>장바구니</h1>
          <p>로그인 후, JIPDAUM에서 혜택을 확인하세요.</p>
        </div>

        <div className="cartTabs">
          <button className="active">일반배송</button>
        </div>

        <div className="cartTable">
          <div className="cartTableHead">
            <label>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllCheck}
                disabled={cartItems.length === 0}
              />
              전체선택
            </label>
            <span>상품정보</span>
            <span>판매금액</span>
            <span>수량</span>
            <span>배송정보</span>
            <span>선택</span>
          </div>

          {loading ? (
            <div className="emptyCart">
              <p>불러오는 중...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="emptyCart">
              <p>장바구니에 담긴 상품이 없습니다.</p>
              <button onClick={closeCart}>쇼핑 계속하기</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cartRow" key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleItemCheck(item.id)}
                  />
                </label>

                <div className="productInfo">
                  <div className="productImg">
                    <img
                      src={item.image || products.find((p) => p.id === item.product_id)?.image}
                      alt={item.product_name}
                      className="cartThumb"
                      onError={(e) => {
                        const local = products.find((p) => p.id === item.product_id);
                        if (local?.image) e.target.src = local.image;
                      }}
                    />
                  </div>
                  <div>
                    <h3>{item.product_name}</h3>
                    {item.option_name && (
                      <p className="option">{item.option_name}</p>
                    )}
                    <button className="optionBtn">옵션변경</button>
                  </div>
                </div>

                <strong>{(item.price * item.quantity).toLocaleString()}원</strong>

                <div className="qty">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="delivery">
                  <strong>무료배송</strong>
                  <p>일반</p>
                </div>

                <div className="rowBtns">
                  <button
                    className="blackBtn"
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
                  <button onClick={() => handleDelete(item.id)}>삭제하기</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cartTotal">
          <span>
            총 상품금액 <strong>{displayTotal.toLocaleString()}원</strong>
          </span>
          <b>+</b>
          <span>
            배송비 <strong>0원</strong>
          </span>
          <b>-</b>
          <span>
            할인금액 <strong>0원</strong>
          </span>
          <b>=</b>
          <span className="finalPrice">
            총 주문금액 <strong>{displayTotal.toLocaleString()}원</strong>
          </span>
        </div>

        <div className="cartActions">
          <button onClick={handleDeleteSelected}>선택상품 삭제</button>
          <button onClick={closeCart}>쇼핑계속하기</button>
          <button className="orderBtn" onClick={handleBuySelected}>
            선택상품 주문
          </button>
        </div>

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
                  onClick={() => { setShowLoginModal(false); closeCart(); openLogin(); }}
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
