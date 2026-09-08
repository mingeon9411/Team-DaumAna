import "./Home.css";
import "./HomeProductDetail.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Heart, Star, Sparkles, Ruler, ShieldCheck, ImagePlus, X, Share2 } from "lucide-react";
import { PRODUCTS, labelKo, LABEL_BADGE, isTodayShipAvailable } from "./Home";
import { addToCart, getReviews, createReview, uploadReviewImage, getProductDetail } from "../../api";
import { useWishlist } from "../../hooks/useWishlist";
import { addRecentlyViewed } from "../../utils/recentlyViewed";
import { useAuthModal } from "../../context/AuthModalContext";
import { useNestedLenis } from "../../hooks/useNestedLenis";
import SiteFooter from "../SiteFooter";

const SERIF = { fontFamily: "'GmarketSans', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

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

  // data-lenis-prevent로 전역 가로 Lenis(App.jsx)는 건너뛰므로, 이 페이지 전용
  // 세로 스크롤에도 부드러운 관성을 붙인다.
  const pageRef = useRef(null);
  useNestedLenis(pageRef);

  const localProduct = PRODUCTS.find((p) => p.id === Number(id));
  // 이름/가격/설명은 DB(JIPDAUM_PRODUCT, collection='main')에서 받아와 로컬 값
  // 위에 덮어쓴다 — Korean Hall의 ProductDetail.jsx와 동일한 패턴. 이미지/
  // 인테리어 컷/뱃지/할인 전 가격처럼 DB 스키마에 없는 필드는 로컬 값 그대로.
  const [apiProduct, setApiProduct] = useState(null);
  useEffect(() => {
    if (!localProduct) return;
    getProductDetail(localProduct.id)
      .then((res) => setApiProduct(res.data))
      .catch(() => setApiProduct(null));
  }, [localProduct?.id]);

  const product = localProduct
    ? {
        ...localProduct,
        name: apiProduct?.name || localProduct.name,
        desc: apiProduct?.description || localProduct.desc,
        price: typeof apiProduct?.base_price === "number"
          ? apiProduct.base_price.toLocaleString()
          : localProduct.price,
        originalPrice: typeof apiProduct?.original_price === "number"
          ? apiProduct.original_price.toLocaleString()
          : localProduct.originalPrice,
      }
    : null;

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  // colors[]가 있는 상품은 "옵션을 선택해주세요" 드롭다운에서 직접 골라야 구매할 수 있도록
  // null(미선택)에서 시작한다 — 갤러리 미리보기(activeImage)는 선택 여부와 무관하게 0번부터 보여준다.
  const [colorIdx, setColorIdx] = useState(null);
  const [optionOpen, setOptionOpen] = useState(false);
  const { wishlist, toggleWish } = useWishlist();
  const wished = wishlist.some((item) => item.id === Number(id));
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
    setActiveImage(0);
    setColorIdx(null);
    setOptionOpen(false);
    setReviewRating(5);
    setReviewTitle("");
    setReviewComment("");
    setReviewImageFile(null);
    setReviewImagePreview(null);
    addRecentlyViewed({
      ...product,
      price: Number(product.price.replace(/,/g, "")),
    });
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
      <main className="homeDetailPage metallicSilver flex items-center justify-center" data-hsnap>
        <p className="text-sm text-muted-foreground" style={SANS}>상품을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const priceNum = Number(product.price.replace(/,/g, ""));
  // 오늘의집류 커머스 상세페이지와 같은 정보 구조(할인율 배지, 별점, 배송 안내 등)를
  // 쓰기 위한 파생값들 — 상품 카드(Home.jsx)의 할인율 계산과 동일한 공식.
  const originalNum = product.originalPrice ? Number(String(product.originalPrice).replace(/,/g, "")) : 0;
  const hasDiscount = originalNum > priceNum;
  const discountPct = hasDiscount ? Math.round((1 - priceNum / originalNum) * 100) : 0;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  // 색상 옵션(colors)이 있는 상품은 고른 색상의 사진을 갤러리로, sub 문구도 그 색상 것으로 보여준다.
  // 실제 주문 가능한 옵션 id는 DB(apiProduct.options)에서 option_value가 같은 것을 찾아 매칭한다 —
  // 로컬 colors[]는 사진/문구용이고, 재고·가격 등 실데이터는 백엔드 옵션 쪽이 갖고 있다.
  const selectedColor = product.colors ? product.colors[colorIdx] : null;
  const selectedOptionId = selectedColor
    ? apiProduct?.options?.find((o) => o.option_value === selectedColor.value)?.id ?? null
    : null;
  const displaySub = selectedColor ? selectedColor.label : product.sub;
  const galleryImages = product.colors
    ? product.colors.map((c) => c.image)
    : [product.image, product.interiorImage].filter(Boolean);
  // 상세정보 섹션(히어로 배너, 이미지+텍스트 블록)도 고른 색상 사진을 그대로 쓴다.
  const heroImage = galleryImages[activeImage] || product.image;

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
      title: `${displaySub}, 공간에 자연스럽게 스며드는 컬러`,
      text: `${product.desc} 은은한 ${displaySub} 톤은 화이트, 우드, 그레이 등 어떤 인테리어 베이스와도 무리 없이 어우러져 공간의 톤을 해치지 않습니다.`,
    },
    {
      title: "매일 마주해도 질리지 않는 디테일",
      text: `매일 눈에 닿는 자리이기에 마감 하나하나에 신경 썼습니다. ${product.category} 본연의 기능과 완성도 높은 디테일을 함께 담아, 오래 두고 써도 자연스럽게 곁을 지키는 가구가 되도록 만들었습니다.`,
    },
  ];

  const specRows = [
    ["브랜드", product.brand],
    ["카테고리", [product.category, product.midCategory, product.subCategory].filter(Boolean).join(" > ")],
    ["컬러", displaySub],
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
    if (product.colors && !selectedColor) {
      alert("옵션을 선택해주세요.");
      return;
    }
    try {
      await addToCart({ product: product.id, quantity, option: selectedOptionId });
      window.dispatchEvent(new Event("cartchange"));
      alert("장바구니에 담았습니다.");
      navigate("/cart");
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleBuyNow = () => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    if (product.colors && !selectedColor) {
      alert("옵션을 선택해주세요.");
      return;
    }
    navigate("/checkout", {
      state: {
        cartItems: [{
          id: product.id,
          name: product.name,
          price: priceNum,
          image: galleryImages[activeImage] || product.image,
          quantity,
          option_id: selectedOptionId,
        }],
      },
    });
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

  const labelBadge = LABEL_BADGE[product.label];
  const todayShipAvailable = apiProduct?.same_day_shipping && isTodayShipAvailable();

  return (
    <main className="homeDetailPage metallicSilver" data-lenis-prevent data-hsnap ref={pageRef}>
      {/* max-w-7xl(1280px)→1440px — 아래 "상세정보" 프로즈 섹션들은 이미 각자
          더 좁은 max-w-4xl/2xl로 따로 잡혀있어 이 폭 변화의 영향을 안 받고,
          카드(homeDetailGlassCard)만 그 폭을 그대로 채우므로 카드만 넓어진다. */}
      <div className="max-w-360 mx-auto w-full px-6 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/")}
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
                    onClick={() => { setActiveImage(i); if (product.colors) setColorIdx(i); }}
                    className={`pdThumbBtn${activeImage === i ? " active" : ""}`}
                    aria-label={`상품 이미지 ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative overflow-hidden rounded-2xl bg-muted aspect-5/6 flex-1 min-w-0">
              <img src={galleryImages[activeImage]} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70" />
              <img src={galleryImages[activeImage]} alt={selectedColor?.alt || product.alt} className="relative w-full h-full object-contain" />
            </div>
          </div>

          {/* 오른쪽: 구매 정보 패널 — 브랜드/카테고리 → 제목+찜/공유 → 별점 → 가격
              → 배송 → 수량/주문금액 → 장바구니/바로구매 순서로, 국내 커머스에서
              가장 익숙한 상세페이지 정보 순서를 그대로 따른다. */}
          <div className="flex flex-col justify-start rounded-2xl bg-background/70 backdrop-blur-sm px-6 py-7 md:px-8 md:py-9 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground tracking-wide" style={MONO}>
                {[product.category, product.midCategory, product.subCategory].filter(Boolean).map((seg, i, arr) => (
                  <span key={seg} className="flex items-center gap-1">
                    {seg}
                    {i < arr.length - 1 && <ChevronRight size={10} />}
                  </span>
                ))}
              </div>
              {/* 상품 라벨 + 배송 태그를 한 줄에 — 29cm처럼 제목 위 작은 태그 묶음으로,
                  아래 가격 옆에 따로 있던 큰 무료배송 박스는 배송정보 줄로 옮겼다. */}
              <div className="flex flex-wrap items-center gap-1.5">
                {product.label && (
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 border ${labelBadge?.className || "text-foreground border-border"}`} style={MONO}>
                    {labelKo(product.label)}
                  </span>
                )}
                {todayShipAvailable && (
                  <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300" style={MONO}>
                    ⚡ 오늘 발송
                  </span>
                )}
                {todayShipAvailable && (
                  <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300" style={MONO}>
                    14:00 전 주문 시 당일 배송
                  </span>
                )}
                <span className="text-[11px] font-medium text-muted-foreground rounded-full px-2 py-0.5 border border-border" style={MONO}>
                  무료배송
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={SERIF}>{product.name}</h1>
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
            <p className="text-sm text-muted-foreground font-light mb-4">{displaySub}</p>

            {avgRating ? (
              <button
                type="button"
                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex items-center gap-1.5 mb-6 hover:opacity-70 transition-opacity"
              >
                <Star size={13} className="fill-foreground text-foreground" />
                <span className="text-sm font-medium text-foreground" style={MONO}>{avgRating}</span>
                <span className="text-xs text-muted-foreground underline underline-offset-2">리뷰 {reviews.length}개 보기</span>
              </button>
            ) : (
              <span className="text-xs text-muted-foreground mb-6 block">아직 리뷰가 없어요</span>
            )}

            {/* 이 아래(Hairline)에서 이미 한 번 여백을 주므로, 여기서 또 mb-6을
                겹쳐 쌓지 않는다 — 겹치면 앞뒤 다른 줄 간격(mb-5 등)보다 두 배 가까이
                떠서 이 구간만 유난히 넓어 보였다(줄 간격이 안 맞는다는 지적 지점). */}
            <div className="flex flex-col gap-2 text-xs">
              {/* w-16(64px)이면 "배송정보"(4글자+tracking-wide)가 폭을 넘쳐서 그
                  옆 값이 "배송비" 줄의 값보다 오른쪽으로 밀려 보였다(대칭 안 맞음
                  지적 지점) — 두 라벨 다 여유 있게 들어가는 w-20으로 넓힌다. */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-20 shrink-0 tracking-wide" style={MONO}>배송정보</span>
                <span>{todayShipAvailable ? "평일 14:00 이전 결제 시 오늘 발송" : "결제 완료 후 평균 2~5일 내 출고"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-20 shrink-0 tracking-wide" style={MONO}>배송비</span>
                <span className="font-medium text-foreground">무료배송</span>
              </div>
            </div>

            <Hairline className="my-6 w-16" />

            {product.colors ? (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground tracking-widest block mb-2" style={MONO}>옵션</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOptionOpen((v) => !v)}
                    className="w-full flex items-center justify-between border border-border px-3.5 py-3 text-sm text-foreground hover:border-foreground transition-colors"
                  >
                    옵션을 선택해주세요
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ${optionOpen ? "rotate-180" : ""}`} />
                  </button>
                  {optionOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 border border-border bg-background z-10 max-h-56 overflow-auto">
                      {product.colors.map((c, i) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => { setColorIdx(i); setActiveImage(i); setOptionOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-card/60 transition-colors"
                        >
                          <span className="w-5 h-5 rounded-full border border-border shrink-0 overflow-hidden">
                            <img src={c.image} alt="" className="w-full h-full object-cover" />
                          </span>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedColor && (
                  <div className="flex items-center justify-between gap-3 border border-border px-3.5 py-3 mt-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full border border-border shrink-0 overflow-hidden">
                        <img src={selectedColor.image} alt="" className="w-full h-full object-cover" />
                      </span>
                      <span className="text-sm text-foreground truncate">{selectedColor.label}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-full px-3 py-1">
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
                      <button
                        type="button"
                        onClick={() => setColorIdx(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="옵션 제거"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>수량</span>
                <div className="flex items-center gap-4 bg-muted/50 rounded-full px-4 py-1.5">
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
            )}

            {/* 정가/할인율 — 예전엔 별점 아래 중간에 따로 있었는데, 구매 직전
                금액(주문금액)과 붙여서 "얼마나 할인받는지"가 바로 옆에서 보이게 옮겼다. */}
            {hasDiscount && (
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-muted-foreground line-through" style={MONO}>₩{product.originalPrice}</span>
                <span className="font-bold text-[#c0392b]" style={MONO}>{discountPct}% 할인</span>
              </div>
            )}

            <div className="flex items-baseline justify-between mb-7 pb-7 border-b border-border">
              <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>주문금액</span>
              <span className="text-2xl font-bold text-foreground" style={MONO}>
                ₩{(priceNum * quantity).toLocaleString()}
              </span>
            </div>

            {/* 모바일에서는 이 버튼 대신 화면 하단 스티키 바(아래)를 쓴다 —
                상세 이미지·리뷰까지 스크롤이 긴 페이지에서 구매 버튼이 화면 밖으로
                사라지지 않도록. */}
            <div className="hidden md:flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-xl border border-foreground text-foreground text-xs tracking-widest py-3.5 hover:bg-foreground/5 transition-colors"
                style={SANS}
              >
                장바구니
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-xl bg-foreground text-background text-xs tracking-widest py-3.5 hover:opacity-85 transition-opacity"
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
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70"
            />
            <img
              src={heroImage}
              alt={selectedColor?.alt || product.alt}
              className="relative w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-[11px] tracking-widest opacity-90 block mb-2" style={MONO}>
                {product.no} · {labelKo(product.label)}
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
              <div className="relative w-full md:w-1/2 overflow-hidden rounded-2xl aspect-[4/3] shrink-0">
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70"
                />
                <img
                  src={heroImage}
                  alt=""
                  className="relative w-full h-full object-contain"
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

        <section id="reviews" className="border-t border-border pt-12 pb-32 md:pb-24">
          <div className="max-w-2xl mx-auto">
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

        <SiteFooter />
      </div>

      {/* 모바일 전용 스티키 구매 바 — 데스크톱 버튼(위)이 숨는 위치라, 어디까지
          스크롤하든 찜/장바구니/바로구매를 항상 화면 하단에 붙여둔다. */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 bg-background/95 backdrop-blur-sm border-t border-border px-4 pt-2.5"
        style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={handleWish}
          className="w-11 h-11 flex items-center justify-center border border-border rounded-xl shrink-0"
          aria-label="찜 리스트에 담기"
        >
          <Heart size={16} className={wished ? "fill-foreground text-foreground" : "text-foreground"} />
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 h-11 rounded-xl border border-foreground text-foreground text-xs tracking-widest"
          style={SANS}
        >
          장바구니
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-[1.4] h-11 rounded-xl bg-foreground text-background text-xs tracking-widest"
          style={SANS}
        >
          바로 구매 · ₩{(priceNum * quantity).toLocaleString()}
        </button>
      </div>
    </main>
  );
}

export default HomeProductDetail;
