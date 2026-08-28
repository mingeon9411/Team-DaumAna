import "../Home/Home.css";
import "../Home/HomeProductDetail.css";
import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Star } from "lucide-react";
import { getProductDetail, addToCart, getReviews, createReview } from "../../api";
import products from "../../data/products";
import { isWished, toggleWish } from "../../utils/wishlist";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import { useAuthModal } from "../../context/AuthModalContext";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 9.7 + 4) % 100,
  delay: (i * 0.71) % 6,
  duration: 6 + ((i * 1.29) % 4),
  scale: 0.7 + ((i * 0.47) % 0.6),
}));

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

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const localProduct = products.find((p) => p.id === Number(id));
  const [apiProduct, setApiProduct] = useState(null);

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
    // 한국관 상품은 별도 namespace로 기록 — 메인 페이지 "최근 본 상품"과 id가 겹쳐도 섞이지 않는다.
    addRecentlyViewed(product, "korean-hall");
    // "목록으로" 버튼 클릭이든 브라우저 뒤로가기든, 여기서 한국관으로 돌아가면
    // 대문 애니메이션 없이 상품 목록으로 바로 이어지도록 App.jsx의
    // DoorIntroController가 참고할 흔적을 남긴다.
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.KOREAN_HALL);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    setReviewsLoading(true);
    getReviews(product.id)
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
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

  const priceNum = Number(product.price);

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
      navigate("/korean-hall/cart");
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleKakaoPay = () => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    navigate("/korean-hall/checkout", {
      state: {
        cartItems: [{
          id: product.id,
          name: product.name,
          price: priceNum,
          image: product.image,
          quantity,
          option_id: null,
        }],
      },
    });
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
    <main className="homeDetailPage pdPage" data-lenis-prevent data-hsnap>
      <div className="pdPetals" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="pdPetal"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--pdPetalScale": p.scale,
            }}
          />
        ))}
      </div>

      <div className="pdContent max-w-6xl mx-auto w-full px-6 md:px-10">
        {/* 대문 애니메이션 스킵 + 상품 목록으로 바로 스크롤은 App.jsx의
            DoorIntroController가 productDetailReturnZone(마운트 시 기록)을 보고
            처리한다 — 브라우저 뒤로가기로 돌아갈 때도 똑같이 적용된다. */}
        <button
          type="button"
          onClick={() => navigate("/korean-hall")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <div className="homeDetailGlassCard grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          <div className="overflow-hidden bg-muted aspect-[5/6]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-muted-foreground block mb-3" style={MONO}>
              KOREAN HALL · {product.brand}
            </span>
            <h1 className="text-3xl font-light text-foreground mb-4" style={SERIF}>{product.name}</h1>
            <p className="text-sm text-foreground/80 font-light leading-relaxed mb-6">{product.desc}</p>
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
                onClick={handleKakaoPay}
                className="flex-1 border border-foreground text-foreground text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors"
                style={SANS}
              >
                바로 구매하기
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

        <section className="border-t border-border pt-16 pb-16">
          <div className="text-center mb-14">
            <span className="text-[10px] text-muted-foreground tracking-widest block mb-2" style={MONO}>
              PRODUCT DETAIL
            </span>
            <h2 className="text-2xl font-light text-foreground" style={SERIF}>상세정보</h2>
          </div>

          {/* 히어로 배너 */}
          <div className="relative overflow-hidden rounded-3xl mb-16 aspect-[16/9] max-w-4xl mx-auto">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-[10px] tracking-widest opacity-80 block mb-2" style={MONO}>
                KOREAN HALL
              </span>
              <h3 className="text-3xl font-light" style={SERIF}>{product.name}</h3>
              <p className="text-sm opacity-90 mt-2 font-light max-w-md">{product.desc}</p>
            </div>
          </div>

          {/* 이미지+텍스트 블록 — data/products.js에 상품별 longDesc가 이미 있어 그대로 사용 */}
          {product.longDesc && (
            <div className="flex flex-col md:flex-row items-center gap-10 max-w-4xl mx-auto mb-20">
              <div className="w-full md:w-1/2 overflow-hidden rounded-2xl aspect-[4/3] shrink-0">
                <img
                  src={product.hoverImage || product.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-[10px] text-muted-foreground tracking-widest block mb-2" style={MONO}>
                  ABOUT
                </span>
                <h4 className="text-xl font-light text-foreground mb-3" style={SERIF}>{product.name}, 그 결과 이야기</h4>
                <p className="text-sm text-foreground/80 leading-loose font-light">{product.longDesc}</p>
              </div>
            </div>
          )}

          {/* 클로징 배너 — 한지 톤 */}
          <div
            className="max-w-4xl mx-auto rounded-3xl p-10 text-center"
            style={{
              background: "linear-gradient(135deg, #efe0bd 0%, #e3caa0 50%, #d9bd8f 100%)",
              border: "1px solid rgba(120, 74, 30, 0.25)",
            }}
          >
            <p className="text-xs text-black/60 font-light mb-3 tracking-widest" style={MONO}>JIPDAUM PROMISE</p>
            <p className="text-lg text-black/85 font-light leading-relaxed" style={SERIF}>
              집다움은 한국적인 아름다움을 담은 공간을 큐레이션합니다.
              <br />
              {product.name}, 오늘의 집에 어울리는 선택이 되기를 바랍니다.
            </p>
          </div>
        </section>

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

export default ProductDetail;
