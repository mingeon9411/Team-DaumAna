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

const formatReviewDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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
          onClick={() => {
            // 홈의 인트로 시퀀스(0~3번 패널)를 다시 재생하지 않고, 상품 그리드
            // 패널(4번)로 바로 이동하도록 Sidebar에 세션스토리지로 신호를 남긴다.
            sessionStorage.setItem("skipHomeDefaultPanel", "1");
            sessionStorage.setItem("pendingHomePanelIndex", "4");
            navigate("/");
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <div className="homeDetailGlassCard grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
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
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl font-light text-foreground mb-1" style={SERIF}>리뷰</h2>
              <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>
                REVIEW ({reviews.length})
              </span>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5">
                <Star size={13} className="fill-foreground text-foreground" />
                <span className="text-sm font-medium text-foreground" style={MONO}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <p className="text-xs text-muted-foreground mb-10">리뷰를 불러오는 중...</p>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl py-16 mb-12 max-w-2xl text-center">
              <Star size={22} className="text-border" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                아직 작성된 리뷰가 없습니다.
                <br />
                첫 리뷰를 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 mb-12 max-w-2xl">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-border bg-card/40 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold text-foreground"
                        style={MONO}
                      >
                        {r.user_nickname?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">{r.user_nickname}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              size={10}
                              className={n <= r.rating ? "fill-foreground text-foreground" : "text-border"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0" style={MONO}>
                      {formatReviewDate(r.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          <div className="max-w-2xl rounded-2xl border border-border bg-card/40 p-6">
            <p className="text-xs text-muted-foreground tracking-widest mb-3" style={MONO}>평점을 선택해주세요</p>
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  aria-label={`${n}점`}
                  className="hover:scale-110 transition-transform"
                >
                  <Star size={22} className={n <= reviewRating ? "fill-foreground text-foreground" : "text-border"} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="상품에 대한 리뷰를 남겨주세요"
              rows={3}
              className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground p-3.5 mb-3 resize-none outline-none focus:border-foreground transition-colors"
              style={SANS}
            />
            <button
              type="button"
              onClick={submitReview}
              disabled={reviewSubmitting}
              className="w-full sm:w-auto rounded-lg bg-foreground text-background text-xs tracking-widest py-3 px-8 hover:opacity-85 transition-opacity disabled:opacity-50"
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
