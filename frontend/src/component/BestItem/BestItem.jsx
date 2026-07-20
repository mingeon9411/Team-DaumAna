import "./BestItem.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import products from "../../data/products";
import { getWishlist, toggleWish } from "../../utils/wishlist";
import { addToCart } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";

const PAGE_SIZE = 5;
const bestPages = Array.from(
  { length: Math.ceil(products.length / PAGE_SIZE) },
  (_, i) => products.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
);

function BestItem() {
  const [likedItems, setLikedItems] = useState(() =>
    getWishlist().map((p) => p.id)
  );
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const goToPage = (index) => {
    setPage(Math.min(Math.max(index, 0), bestPages.length - 1));
  };

  const handleLike = (product) => {
    toggleWish(product);
    setLikedItems(getWishlist().map((p) => p.id));
  };

  const handleCart = async (product) => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    try {
      await addToCart({ product: product.id, quantity: 1, option: null });
      window.dispatchEvent(new Event("cartchange"));
      alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };
  return (
    <section className="bestItem">
      <div className="bestHeader">
        <div>
          <p>BEST ITEM</p>
          <h2>오늘의 발견</h2>
        </div>

        <button type="button" className="viewAllBtn">
          전체상품보기
        </button>
      </div>

      <div className="bestGridViewport">
        {bestPages.length > 1 && (
          <button
            type="button"
            className="bestNavBtn bestNavPrev"
            aria-label="이전 상품"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
          >
            <LuChevronLeft />
          </button>
        )}

        <div
          className="bestGridTrack"
          style={{
            transform: `translateX(-${page * 100}%)`,
            width: `${bestPages.length * 100}%`,
          }}
        >
          {bestPages.map((pageProducts, pageIndex) => (
            <div
              className="bestGrid"
              key={pageIndex}
              style={{ width: `${100 / bestPages.length}%` }}
            >
              {pageProducts.map((product, i) => {
                const index = pageIndex * PAGE_SIZE + i;
                return (
                  <article className="bestCard" key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}>
                    <div className="thumbBox">
                      <div className="bestRank">
                        BEST {String(index + 1).padStart(2, "0")}
                      </div>

                      <button
          type="button"
          className={`wishBtn ${
            likedItems.includes(product.id) ? "active" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike(product);
          }}
        >
          {likedItems.includes(product.id) ? "♥" : "♡"}
        </button>

                      <div className="thumbImg">
                       <img
                           src={product.image}
                           alt={product.name}
                           className="mainImg"
                       />

                       {product.hoverImage && (
                       <img
                         src={product.hoverImage}
                         alt={product.name}
                         className="hoverImg"
                        />
                       )}
                      </div>
                    </div>

                    <div className="productText">
                      <h3>{product.name}</h3>
                      <p>{product.desc}</p>

                      <div className="productMeta">
                        <strong>{product.price.toLocaleString()}원</strong>
                        <span> ★ {product.review}</span>
                      </div>

                      <button
                        type="button"
                        className="cartBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCart(product);
                        }}
                      >
                        장바구니 담기
                      </button>

                    </div>
                  </article>
                );
              })}
            </div>
          ))}
        </div>

        {bestPages.length > 1 && (
          <button
            type="button"
            className="bestNavBtn bestNavNext"
            aria-label="다음 상품"
            onClick={() => goToPage(page + 1)}
            disabled={page === bestPages.length - 1}
          >
            <LuChevronRight />
          </button>
        )}
      </div>

      {bestPages.length > 1 && (
        <div className="bestPageDots">
          {bestPages.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`bestPageDot ${i === page ? "active" : ""}`}
              aria-label={`${i + 1}페이지`}
              onClick={() => goToPage(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BestItem;