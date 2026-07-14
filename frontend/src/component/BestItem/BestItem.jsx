import "./BestItem.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import products from "../../data/products";
import { getWishlist, toggleWish } from "../../utils/wishlist";
import { addToCart } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";

import table from "../../assets/products/table.jpg";
import table2 from "../../assets/products/table2.jpg";
import light from "../../assets/products/light.png";
import light2 from "../../assets/products/light2.png";
import bottle from "../../assets/products/bottle.jpg";
import hover3 from "../../assets/products/hover3.png";

function BestItem() {
  const [likedItems, setLikedItems] = useState(() =>
    getWishlist().map((p) => p.id)
  );
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  /*
  const products = [
    {
      id: 1,
      image: table,
      hoverImage: table2,
      name: "월넛 사이드 테이블",
      desc: "한국적인 곡선미를 담은 원목 테이블",
      price: 128000,
      review: 4.8,
    },
    {
      id: 2,
      image: light,
      hoverImage: light2,
      name: "한지 무드 조명",
      desc: "은은한 빛으로 공간을 채우는 조명",
      price: 89000,
      review: 4.9,
    },
    {
      id: 3,
      image: bottle,
      hoverImage: hover3,
      name: "무자기 꽃잎 화병 Petal vase",
      desc: "피우기 직전의 꽃봉오리를 닮은 화병병",
      price: 64000,
      review: 4.7,
    },
  ];
  */

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

      <div className="bestGrid">
        {products.map((product, index) => (
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
        ))}
      </div>
    </section>
  );
}

export default BestItem;