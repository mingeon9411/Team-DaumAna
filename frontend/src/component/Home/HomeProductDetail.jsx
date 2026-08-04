import "./Home.css";
import "./HomeProductDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Star } from "lucide-react";
import { PRODUCTS } from "./Home";
import { addToCart, getReviews, createReview } from "../../api";
import { isWished, toggleWish } from "../../utils/wishlist";
import { useAuthModal } from "../../context/AuthModalContext";
import { useCartModal } from "../../context/CartModalContext";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

function Hairline({ className = "" }) {
  return (
    <div
      className={`h-[2px] ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #2a4d8f 0%, #f5f1ea 25%, #a6342a 50%, #1c1a16 75%, #c9a227 100%)",
      }}
    />
  );
}

function HomeProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { openCart } = useCartModal();

  const product = PRODUCTS.find((p) => p.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    window.scrollTo(0, 0);
    setQuantity(1);
    setWished(isWished(product.id));
    setReviewRating(5);
    setReviewComment("");
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    getReviews(product.id)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product?.id]);

  if (!product) {
    return (
      <main className="homeDetailPage flex items-center justify-center" data-hsnap>
        <p className="text-sm text-muted-foreground" style={SANS}>상품을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const priceNum = Number(product.price.replace(/,/g, ""));

  const handleWish = () => {
    toggleWish({
      id: product.id,
      name: product.name,
      desc: product.desc,
      price: priceNum,
      image: product.image,
      review: reviews.length,
    });
    setWished(isWished(product.id));
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    try {
      await addToCart({ product: product.id, quantity, option: null });
      window.dispatchEvent(new Event("cartchange"));
      alert("장바구니에 담았습니다.");
      openCart();
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const submitReview = async () => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    if (!reviewComment.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await createReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewRating(5);
      setReviewComment("");
    } catch {
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="homeDetailPage" data-lenis-prevent data-hsnap>
      <div className="max-w-6xl mx-auto w-full px-6 md:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          <div className="overflow-hidden bg-muted aspect-[5/6]">
            <img src={product.image} alt={product.alt} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-muted-foreground block mb-3" style={MONO}>
              {product.no} · {product.label}
            </span>
            <h1 className="text-3xl font-light text-foreground mb-2" style={SERIF}>{product.name}</h1>
            <p className="text-sm text-muted-foreground font-light mb-4">{product.sub}</p>
            <p className="text-sm text-foreground/80 font-light leading-relaxed mb-4">{product.desc}</p>
            <p className="text-xs text-muted-foreground mb-6" style={MONO}>{product.spec}</p>
            <Hairline className="mb-6 w-16" />

            <div className="flex items-center justify-between mb-8">
              <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>수량</span>
              <div className="flex items-center gap-4 border border-border px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-foreground hover:opacity-60 transition-opacity"
                  aria-label="수량 감소"
                >
                  −
                </button>
                <span className="text-sm text-foreground w-4 text-center" style={MONO}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-foreground hover:opacity-60 transition-opacity"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-8">
              <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>TOTAL</span>
              <span className="text-3xl font-semibold text-foreground" style={MONO}>
                ₩{(priceNum * quantity).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWish}
                className="w-11 h-11 shrink-0 border border-border flex items-center justify-center text-foreground hover:border-foreground transition-colors"
                aria-label="찜 리스트에 담기"
              >
                <Heart size={16} className={wished ? "fill-foreground text-foreground" : "text-foreground"} />
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-foreground text-background text-xs tracking-widest hover:opacity-85 transition-opacity"
                style={SANS}
              >
                담기
              </button>
            </div>
          </div>
        </div>

        <section className="border-t border-border pt-12 pb-24">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>
              REVIEW ({reviews.length})
            </span>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground" style={MONO}>
                <Star size={11} className="fill-foreground text-foreground" />
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
            )}
          </div>

          {reviewsLoading ? (
            <p className="text-xs text-muted-foreground mb-6">리뷰를 불러오는 중...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground mb-6">아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨보세요.</p>
          ) : (
            <div className="flex flex-col gap-4 mb-10 max-w-2xl">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={10}
                          className={n <= r.rating ? "fill-foreground text-foreground" : "text-border"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground" style={MONO}>{r.user_nickname}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  aria-label={`${n}점`}
                  className="hover:opacity-70 transition-opacity"
                >
                  <Star size={16} className={n <= reviewRating ? "fill-foreground text-foreground" : "text-border"} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="상품에 대한 리뷰를 남겨주세요"
              rows={3}
              className="w-full border border-border bg-transparent text-xs text-foreground placeholder:text-muted-foreground p-2.5 mb-2 resize-none outline-none focus:border-foreground transition-colors"
              style={SANS}
            />
            <button
              type="button"
              onClick={submitReview}
              disabled={reviewSubmitting}
              className="border border-foreground text-foreground text-xs tracking-widest py-2.5 px-6 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              style={SANS}
            >
              {reviewSubmitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomeProductDetail;
