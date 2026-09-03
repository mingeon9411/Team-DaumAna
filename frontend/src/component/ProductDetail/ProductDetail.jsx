import "../Home/Home.css";
import "../Home/HomeProductDetail.css";
import "./ProductDetail.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Star, Share2, Truck } from "lucide-react";
import { getProductDetail, addToCart, getReviews, createReview } from "../../api";
import products from "../../data/products";
import KorLogo from "../../assets/logo/Kor_logo.png";
import WhiteLogo from "../../assets/logo/white_logo.png";
import { isWished, toggleWish } from "../../utils/wishlist";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import { useAuthModal } from "../../context/AuthModalContext";
import { useNestedLenis } from "../../hooks/useNestedLenis";
import SiteFooter from "../SiteFooter";

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

  // data-lenis-prevent로 전역 가로 Lenis(App.jsx)는 건너뛰므로, 이 페이지 전용
  // 세로 스크롤에도 KoreanHall.jsx와 같은 부드러운 관성을 붙인다.
  const pageRef = useRef(null);
  useNestedLenis(pageRef);

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
  const [activeImage, setActiveImage] = useState(0);
  const [wished, setWished] = useState(false);
  // 헤더의 한옥 로고와는 별개로, 상세페이지 자체에 한글 워드마크를 하나 더 둔다.
  // 초기값은 body.dark 클래스가 아니라 localStorage(Sidebar.jsx가 쓰는 것과 동일한
  // 키)에서 직접 읽는다 — 마운트 시점엔 Sidebar의 다크모드 useEffect가 아직 body에
  // 클래스를 붙이기 전이라, body 클래스를 읽으면 새로고침 때마다 라이트로 오판했다.
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "1");
  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    window.scrollTo(0, 0);
    setQuantity(1);
    setActiveImage(0);
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
  // 오늘의집류 커머스 상세페이지와 같은 정보 구조(할인율 배지, 별점, 배송 안내 등)를
  // 쓰기 위한 파생값들 — Home.jsx 쪽 HomeProductDetail.jsx와 동일한 공식.
  const originalNum = product.originalPrice ? Number(product.originalPrice) : 0;
  const hasDiscount = originalNum > priceNum;
  const discountPct = hasDiscount ? Math.round((1 - priceNum / originalNum) * 100) : 0;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const galleryImages = [product.image, product.hoverImage].filter(Boolean);

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

  const handleShare = async () => {
    const shareData = { title: product.name, text: product.desc, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 공유 시트에서 취소한 경우 등 — 무시
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("상품 링크가 복사되었습니다.");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
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
    <main className="homeDetailPage pdPage" data-lenis-prevent data-hsnap ref={pageRef}>
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

      <div className="pdContent max-w-7xl mx-auto w-full px-6 md:px-10">
        {/* 헤더의 한옥 로고와 별개로, 상세페이지 안에서도 한글 워드마크로 바로
            메인 상품페이지("/")로 갈 수 있게 둔다 — 아래 "목록으로"는 한국관
            목록으로 돌아가는 것이라 동작이 다르다. */}
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="집다움 메인으로"
          className="detailLogoLink"
        >
          <img src={darkMode ? WhiteLogo : KorLogo} alt="집다움" className="detailLogoImg" />
        </button>

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

        <div className="homeDetailGlassCard grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20">
          {/* 왼쪽: 썸네일 레일 + 메인 이미지 — 오늘의집 등 상용 커머스 상세페이지의
              공통 갤러리 구조. 촬영 컷이 1장뿐인 상품은 레일 없이 이미지 하나만 보인다. */}
          <div className="pdGallery">
            {galleryImages.length > 1 && (
              <div className="pdThumbRail">
                {galleryImages.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`pdThumbBtn${activeImage === i ? " active" : ""}`}
                    aria-label={`상품 이미지 ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="overflow-hidden bg-muted aspect-5/6 flex-1 min-w-0">
              <img src={galleryImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* 오른쪽: 구매 정보 패널 — 브랜드/카테고리 → 제목+찜/공유 → 별점 → 가격
              → 배송 → 수량/주문금액 → 장바구니/바로구매 순서로, 국내 커머스에서
              가장 익숙한 상세페이지 정보 순서를 그대로 따른다. */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] text-muted-foreground tracking-wide" style={MONO}>
                KOREAN HALL · {[product.category, product.midCategory].filter(Boolean).join(" · ")}
              </span>
              {product.label && (
                <span className="text-[10px] font-semibold text-foreground/70 border border-border rounded px-1.5 py-0.5" style={MONO}>
                  {product.label}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-light text-foreground" style={SERIF}>{product.name}</h1>
              <div className="flex items-center gap-1.5 shrink-0 pt-1">
                <button
                  onClick={handleWish}
                  className="w-8 h-8 flex items-center justify-center border border-border rounded-full hover:border-foreground transition-colors"
                  aria-label="찜 리스트에 담기"
                >
                  <Heart size={14} className={wished ? "fill-foreground text-foreground" : "text-foreground"} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-8 h-8 flex items-center justify-center border border-border rounded-full hover:border-foreground transition-colors"
                  aria-label="상품 공유하기"
                >
                  <Share2 size={14} className="text-foreground" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-5">
              {avgRating ? (
                <>
                  <Star size={13} className="fill-foreground text-foreground" />
                  <span className="text-sm font-medium text-foreground" style={MONO}>{avgRating}</span>
                  <span className="text-xs text-muted-foreground">리뷰 {reviews.length}개</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">아직 리뷰가 없어요</span>
              )}
            </div>

            <div className="mb-5">
              {hasDiscount && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-bold text-white bg-[#c0392b] rounded px-1.5 py-0.5 tracking-wide" style={MONO}>
                    {discountPct}% OFF
                  </span>
                  <span className="text-sm text-muted-foreground line-through" style={MONO}>₩{originalNum.toLocaleString()}</span>
                </div>
              )}
              <span className="text-3xl font-bold text-foreground" style={MONO}>₩{priceNum.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-lg px-3.5 py-2.5 mb-6">
              <Truck size={14} className="text-foreground shrink-0" />
              <span>무료배송</span>
            </div>

            <Hairline className="mb-6 w-16" />

            <div className="flex items-center justify-between mb-4">
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

            <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-border">
              <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>주문금액</span>
              <span className="text-2xl font-semibold text-foreground" style={MONO}>
                ₩{(priceNum * quantity).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-foreground text-foreground text-xs tracking-widest py-3.5 hover:bg-foreground/5 transition-colors"
                style={SANS}
              >
                장바구니
              </button>
              <button
                onClick={handleKakaoPay}
                className="flex-1 bg-foreground text-background text-xs tracking-widest py-3.5 hover:opacity-85 transition-opacity"
                style={SANS}
              >
                바로 구매하기
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
            {avgRating && (
              <div className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5">
                <Star size={13} className="fill-foreground text-foreground" />
                <span className="text-sm font-medium text-foreground" style={MONO}>{avgRating}</span>
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

        <SiteFooter />
      </div>
    </main>
  );
}

export default ProductDetail;
