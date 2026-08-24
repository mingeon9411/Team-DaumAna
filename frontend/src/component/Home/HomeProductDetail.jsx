import "./Home.css";
import "./HomeProductDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Star, Sparkles, Ruler, ShieldCheck, ImagePlus, X } from "lucide-react";
import { PRODUCTS } from "./Home";
import { addToCart, getReviews, createReview, uploadReviewImage } from "../../api";
import { isWished, toggleWish } from "../../utils/wishlist";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
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
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewImageFile, setReviewImageFile] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);

  useEffect(() => {
    if (!product) return;
    window.scrollTo(0, 0);
    setQuantity(1);
    setWished(isWished(product.id));
    setReviewRating(5);
    setReviewTitle("");
    setReviewComment("");
    setReviewImageFile(null);
    setReviewImagePreview(null);
    addRecentlyViewed({
      ...product,
      price: Number(product.price.replace(/,/g, "")),
    });
    // "목록으로" 버튼 클릭이든 브라우저 뒤로가기든, 여기서 홈으로 돌아가면
    // 대문 애니메이션 없이 상품 목록으로 바로 이어지도록 App.jsx의
    // DoorIntroController가 참고할 흔적을 남긴다.
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
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

  const priceNum = Number(product.price.replace(/,/g, ""));

  // 실제 촬영 이미지가 한 장뿐이라 상세페이지 구간마다 같은 사진을 다른 비율/포커스로
  // 재사용한다 — 상품별 추가 사진을 받으면 여기 image 값만 교체하면 됨.
  const materialText = product.spec.split("MATERIAL :")[1]?.trim() || product.spec;
  const sizeText = product.spec.split("·")[0]?.replace("SIZE :", "").trim() || product.spec;

  const highlights = [
    { icon: Sparkles, title: "고급스러운 소재감", text: `${materialText} 소재를 사용해 은은한 광택과 촉감, 내구성을 함께 잡았습니다.` },
    { icon: Ruler, title: "정확한 사이즈", text: `${sizeText}. 공간에 배치하기 전 사이즈를 꼭 확인해주세요.` },
    { icon: ShieldCheck, title: "꼼꼼한 품질 검수", text: "출고 전 모든 제품을 하나하나 검수해 안심하고 사용하실 수 있습니다." },
  ];

  const detailBlocks = [
    {
      title: `${product.sub}, 공간에 자연스럽게 스며드는 컬러`,
      text: `${product.desc} 은은한 ${product.sub} 톤은 화이트, 우드, 그레이 등 어떤 인테리어 베이스와도 무리 없이 어우러져 공간의 톤을 해치지 않습니다.`,
    },
    {
      title: "매일 마주해도 질리지 않는 디테일",
      text: `매일 눈에 닿는 자리이기에 마감 하나하나에 신경 썼습니다. ${product.category} 본연의 기능과 완성도 높은 디테일을 함께 담아, 오래 두고 써도 자연스럽게 곁을 지키는 가구가 되도록 만들었습니다.`,
    },
  ];

  const specRows = [
    ["브랜드", product.brand],
    ["카테고리", product.category],
    ["컬러", product.sub],
    ["사이즈", sizeText],
    ["소재", materialText],
  ];

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

  const handleReviewImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    setReviewImageFile(file);
    setReviewImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveReviewImage = () => {
    setReviewImageFile(null);
    setReviewImagePreview(null);
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
      let imageUrl = null;
      if (reviewImageFile) {
        const uploadRes = await uploadReviewImage(reviewImageFile);
        imageUrl = uploadRes.data.url;
      }
      const res = await createReview(product.id, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        review_image_url: imageUrl,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      handleRemoveReviewImage();
    } catch {
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <main className="homeDetailPage" data-lenis-prevent data-hsnap>
      <div className="max-w-6xl mx-auto w-full px-6 md:px-10">
        {/* 대문 애니메이션 스킵 + 상품 그리드로 바로 점프는 App.jsx의
            DoorIntroController가 productDetailReturnZone(마운트 시 기록)을 보고
            처리한다 — 브라우저 뒤로가기로 돌아갈 때도 똑같이 적용된다. */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <div className="homeDetailGlassCard grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
          <div className="overflow-hidden bg-muted aspect-[5/6]">
            <img src={product.image} alt={product.alt} className="w-full h-full object-contain" />
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
              alt={product.alt}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-[10px] tracking-widest opacity-80 block mb-2" style={MONO}>
                {product.no} · {product.label}
              </span>
              <h3 className="text-3xl font-light" style={SERIF}>{product.name}</h3>
              <p className="text-sm opacity-90 mt-2 font-light max-w-md">{product.desc}</p>
            </div>
          </div>

          {/* 특징 3가지 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-border bg-card/40"
              >
                <h.icon size={22} className="text-foreground" />
                <h4 className="text-sm font-medium text-foreground" style={SANS}>{h.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-light">{h.text}</p>
              </div>
            ))}
          </div>

          {/* 이미지+텍스트 교차 블록 */}
          {detailBlocks.map((b, i) => (
            <div
              key={b.title}
              className={`flex flex-col ${i % 2 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 max-w-4xl mx-auto mb-20`}
            >
              <div className="w-full md:w-1/2 overflow-hidden rounded-2xl aspect-[4/3] shrink-0">
                <img
                  src={product.image}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-[10px] text-muted-foreground tracking-widest block mb-2" style={MONO}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="text-xl font-light text-foreground mb-3" style={SERIF}>{b.title}</h4>
                <p className="text-sm text-foreground/80 leading-loose font-light">{b.text}</p>
              </div>
            </div>
          ))}

          {/* 제품 사양표 */}
          <div className="max-w-2xl mx-auto mb-20">
            <h4 className="text-lg font-light text-foreground mb-5" style={SERIF}>제품 사양</h4>
            <div className="rounded-2xl border border-border overflow-hidden">
              {specRows.map((row, i) => (
                <div key={row[0]} className={`flex text-sm ${i ? "border-t border-border" : ""}`}>
                  <span className="w-28 shrink-0 px-5 py-4 bg-card/60 text-muted-foreground" style={MONO}>
                    {row[0]}
                  </span>
                  <span className="flex-1 px-5 py-4 text-foreground/80 font-light">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 클로징 배너 */}
          <div
            className="max-w-4xl mx-auto rounded-3xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, #f5c6e0 0%, #c9d9f7 50%, #bdeed0 100%)" }}
          >
            <p className="text-xs text-black/60 font-light mb-3 tracking-widest" style={MONO}>JIPDAUM PROMISE</p>
            <p className="text-lg text-black/85 font-light leading-relaxed" style={SERIF}>
              집다움은 공간을 채우는 모든 순간에 정성을 담습니다.
              <br />
              {product.name}, 오늘의 집에 어울리는 선택이 되기를 바랍니다.
            </p>
          </div>
        </section>

        <section className="border-t border-border pt-12 pb-24">
          <div className="max-w-2xl mx-auto">
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
              <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl py-16 mb-12 text-center">
                <Star size={22} className="text-border" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  아직 작성된 리뷰가 없습니다.
                  <br />
                  첫 리뷰를 남겨보세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 mb-12">
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
                    {r.title && (
                      <h4 className="text-sm font-semibold text-foreground mb-1">{r.title}</h4>
                    )}
                    <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                    {r.review_image_url && (
                      <img
                        src={r.review_image_url}
                        alt="리뷰 사진"
                        className="mt-3 w-28 h-28 rounded-lg object-cover border border-border"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card/40 p-6">
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
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="제목 (선택)"
                maxLength={100}
                className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground p-3.5 mb-3 outline-none focus:border-foreground transition-colors"
                style={SANS}
              />
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="상품에 대한 리뷰를 남겨주세요"
                rows={3}
                className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground p-3.5 mb-3 resize-none outline-none focus:border-foreground transition-colors"
                style={SANS}
              />

              <div className="flex items-center gap-3 mb-4">
                {reviewImagePreview ? (
                  <div className="relative w-16 h-16 shrink-0">
                    <img
                      src={reviewImagePreview}
                      alt="첨부한 사진 미리보기"
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveReviewImage}
                      aria-label="사진 제거"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="reviewImageInput"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 cursor-pointer hover:text-foreground hover:border-foreground transition-colors"
                    style={SANS}
                  >
                    <ImagePlus size={14} />
                    사진 추가
                  </label>
                )}
                <input
                  id="reviewImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleReviewImageSelect}
                  className="hidden"
                />
              </div>

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
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomeProductDetail;
