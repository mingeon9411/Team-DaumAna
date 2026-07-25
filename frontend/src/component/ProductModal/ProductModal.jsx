import "./ProductModal.css";
import "../ProductDetail/ProductDetail.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../../api";
import products from "../../data/products";
import { isWished, toggleWish } from "../../utils/wishlist";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";
import { useProductModal } from "../../context/ProductModalContext";

function ProductModal() {
  const { isOpen, productId, closeProduct } = useProductModal();
  // 한국관은 자체 로컬 카탈로그(data/products.js)만 사용한다 — 백엔드 상품 마스터(MySQL)에는
  // 별개인 홈 화면 상품이 들어있어서, id가 우연히 겹치면 엉뚱한 이름/가격으로 덮어써지는
  // 버그가 있었다. 백엔드 조회 없이 로컬 데이터만 신뢰한다.
  const product = products.find((item) => item.id === productId);

  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { openCart } = useCartModal();
  const [quantity, setQuantity] = useState(0);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    if (productId != null) setWished(isWished(productId));
  }, [productId]);

  useEffect(() => {
    setQuantity(0);
  }, [productId]);

  if (!isOpen || !product) return null;

  const handleWish = () => {
    toggleWish({
      id: product.id,
      name: product.name,
      desc: product.desc,
      price: product.price,
      image: product.image,
      review: product.review || 0,
    });
    setWished(isWished(product.id));
  };

  const handleAddToCart = async () => {
    if (quantity < 1) {
      alert("수량을 선택해주세요.");
      return;
    }
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    try {
      await addToCart({ product: product.id, quantity, option: null });
      window.dispatchEvent(new Event("cartchange"));
      openCart();
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleKakaoPay = () => {
    if (quantity < 1) {
      alert("수량을 선택해주세요.");
      return;
    }
    closeProduct();
    navigate("/korean-hall/checkout", {
      state: {
        cartItems: [{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          option_id: null,
        }],
      },
    });
  };

  return (
    <div className="productModalOverlay" onClick={closeProduct}>
      <div className="productModal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="productModalClose"
          onClick={closeProduct}
          aria-label="닫기"
        >
          ×
        </button>

        <section className="detailLayout">
          <div className="detailLeft">
            <img src={product.image} alt={product.name} />
          </div>

          <aside className="detailRight">
            <div className="detailInfoBox">
              <span className="detailLabel">KOREAN HALL</span>
              <div className="detailTitleRow">
                <h1>{product.name}</h1>
                <button
                  type="button"
                  className={`detailWishBtn${wished ? " active" : ""}`}
                  onClick={handleWish}
                  aria-label="위시리스트"
                >
                  {wished ? "♥" : "♡"}
                </button>
              </div>
              <span className="detailHairline" />
              <p className="detailDesc">{product.longDesc || product.desc}</p>
              <strong>{product.price.toLocaleString()}원</strong>

              <div className="quantityArea">
                <span>수량</span>
                <div className="quantityControl">
                  <button onClick={() => setQuantity((q) => Math.max(0, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="buyBox">
              <div className="totalLine">
                <span>TOTAL</span>
                <strong>
                  {(product.price * quantity).toLocaleString()}원
                  <em> ({quantity}개)</em>
                </strong>
              </div>

              <div className="buyBtns">
                <button className="buyNow" onClick={handleKakaoPay}>바로 구매하기</button>
                <button className="addCart" onClick={handleAddToCart}>장바구니에 담기</button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default ProductModal;
