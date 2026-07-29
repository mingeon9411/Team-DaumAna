import "./ProductDetail.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductDetail, addToCart } from "../../api";
import products from "../../data/products";
import { isWished, toggleWish } from "../../utils/wishlist";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";

function ProductDetail() {
  const { id } = useParams();
  const [apiProduct, setApiProduct] = useState(null);
  const localProduct = products.find((item) => item.id === Number(id));

  useEffect(() => {
    getProductDetail(id)
      .then((res) => setApiProduct(res.data))
      .catch(() => setApiProduct(null));
  }, [id]);

  const product = localProduct
    ? {
        ...localProduct,
        name: apiProduct?.name || localProduct.name,
        desc: apiProduct?.description || localProduct.desc,
        price: apiProduct?.base_price || localProduct.price,
      }
    : null;

  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { openCart } = useCartModal();
  const [quantity, setQuantity] = useState(0);
  const [wished, setWished] = useState(() => isWished(Number(id)));

  const handleWish = () => {
    if (!product) return;
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
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const [reviews, setReviews] = useState(() => {
    return JSON.parse(localStorage.getItem(`reviews-${id}`)) || [];
  });

  useEffect(() => {
    localStorage.setItem(`reviews-${id}`, JSON.stringify(reviews));
  }, [reviews, id]);

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) {
      alert("리뷰를 입력해주세요.");
      return;
    }

    const newReview = {
      id: Date.now(),
      content: reviewText,
      rating: rating,
      date: new Date().toLocaleDateString(),
    };

    setReviews([newReview, ...reviews]);
    setReviewText("");
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

  if (!product) return <main>상품을 찾을 수 없습니다.</main>;

  return (
    <main className="detailPage" data-lenis-prevent data-hsnap>
      <section className="detailLayout">
        <div className="detailLeft">
          <img src={product.image} alt={product.name} />
        </div>

        <aside className="detailRight">
          <div className="detailInfoBox">
            <p className="detailDesc">{product.desc}</p>
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
            <strong>{product.price.toLocaleString()}원</strong>

            <div className="detailSpec">
              <p>SIZE : W 25 H 13 D 102</p>
              <p>MATERIAL : ceramic / wood</p>
            </div>

            <div className="optionArea">
              <span>type</span>
              <div className="optionBtns">
                <button>basic</button>
                <button>premium</button>
                <button>set</button>
              </div>
            </div>

            <div className="quantityArea">
              <span>수량</span>
              <div className="quantityControl">
                <button onClick={() => setQuantity(q => Math.max(0, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
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
              <button className="buyNow" onClick={handleKakaoPay}>지금 구매하기</button>
              <button className="addCart" onClick={handleAddToCart}>장바구니에 추가</button>
            </div>
          </div>
        </aside>
      </section>

      <section className="reviewSection">
        <div className="reviewHeader">
          <h2>REVIEW</h2>
          <span className="reviewCount">{reviews.length}개의 리뷰</span>
        </div>

        <div className="reviewForm">
          <div className="ratingBox">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "star active" : "star"}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="리뷰를 작성해주세요."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button className="reviewSubmit" onClick={handleReviewSubmit}>리뷰 등록하기</button>
        </div>

        <div className="reviewList">
          {reviews.length === 0 ? (
            <p className="emptyReview">
              아직 작성된 리뷰가 없습니다.
              <br />첫 번째 리뷰를 남겨보세요!
            </p>
          ) : (
            reviews.map((review) => (
              <div className="reviewItem" key={review.id}>
                <div className="reviewItemTop">
                  <span className="reviewStars">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="reviewDate">{review.date}</span>
                </div>
                <p>{review.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;