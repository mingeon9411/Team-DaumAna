import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X, Search, Camera, ShoppingBag } from "lucide-react";
import "./Home.css";
import ChatBot from "../MyPage/ChatBot";
import LookbookViewer from "./LookbookViewer";
import moonJarLamp from "../../assets/달항아리 램프.png";
import patchworkBedding from "../../assets/조각보 침구 세트.png";
import koreanModernSofa from "../../assets/products/Korean Modern Sofa — Ivory Leather.png";
import floorLoungeSofa from "../../assets/products/플로어 라운지 소파.png";
import moonJarArmchair from "../../assets/products/달항아리 암체어.png";
import { addToCart, getCartItems } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";

const HERO_LEFT_IMAGES = [
  { src: moonJarLamp, alt: "달항아리 램프 - 은은한 조명이 켜진 도자 램프" },
];

const HERO_RIGHT_IMAGES = [
  { src: patchworkBedding, alt: "조각보 침구 세트 - 전통 조각보 패턴의 침구와 베개" },
];

const HERO_SLIDE_INTERVAL = 4800;

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

export const PRODUCTS = [
  { id: 1, no: "No.1", name: "린넨 암체어", sub: "내추럴 베이지", price: "328,000", originalPrice: "398,000", label: "BESTSELLER",
    desc: "부드러운 린넨과 낮은 팔걸이로 온몸을 편안히 감싸는 체어. 거실 어디에 놓아도 공간의 무게중심이 됩니다.",
    spec: "SIZE : W68 D72 H76 · MATERIAL : linen, oak",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=620&fit=crop&auto=format", alt: "린넨 암체어", brand: "집다움", category: "의자" },
  { id: 2, no: "No.2", name: "월넛 사이드 테이블", sub: "블랙 월넛", price: "168,000", originalPrice: "198,000", label: "NEW",
    desc: "짙은 월넛 원목의 결을 살린 사이드 테이블. 소파 옆, 침대 곁 어디서나 조용히 제 역할을 합니다.",
    spec: "SIZE : W45 D45 H50 · MATERIAL : walnut",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&h=620&fit=crop&auto=format", alt: "월넛 사이드 테이블", brand: "집다움", category: "테이블" },
  { id: 3, no: "No.3", name: "대나무 트레이", sub: "내추럴", price: "54,000", label: "ECO",
    desc: "대나무를 엮어 만든 트레이. 차 한 잔, 작은 화분, 협탁 위 소품 정리에 두루 어울립니다.",
    spec: "SIZE : W38 D26 H4 · MATERIAL : bamboo",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=620&fit=crop&auto=format", alt: "대나무 트레이", brand: "집다움", category: "소품" },
  { id: 4, no: "No.4", name: "한국 모던 소파", sub: "아이보리 레더", price: "398,000", originalPrice: "460,000", label: "NEW",
    desc: "아이보리 가죽과 완만한 곡선이 어우러진 2인용 소파. 어느 각도에서 봐도 매끈한 실루엣을 완성합니다.",
    spec: "SIZE : W150 D80 H75 · MATERIAL : leather, steel",
    image: koreanModernSofa, alt: "한국 모던 소파", brand: "집다움", category: "소파" },
  { id: 5, no: "No.5", name: "플로어 라운지 소파", sub: "아이보리 부클", price: "328,000", originalPrice: "398,000", label: "NEW",
    desc: "낮은 좌면과 넉넉한 쿠션이 편안한 좌식형 라운지 소파. 바닥 생활에 어울리는 낮은 무게중심이 특징입니다.",
    spec: "SIZE : W180 D95 H55 · MATERIAL : boucle, sponge",
    image: floorLoungeSofa, alt: "플로어 라운지 소파", brand: "집다움", category: "소파" },
  { id: 7, no: "No.6", name: "달항아리 암체어", sub: "카멜 부클", price: "358,000", label: "NEW",
    desc: "달항아리의 둥근 선을 닮은 부클 원단 윙백 암체어. 어느 자리에 두어도 공간의 중심이 됩니다.",
    spec: "SIZE : W85 D90 H105 · MATERIAL : boucle, wood",
    image: moonJarArmchair, alt: "달항아리 암체어", brand: "집다움", category: "의자" },
  { id: 8, no: "No.7", name: "한지 그림자 조명", sub: "블랙 스틸", price: "98,000", originalPrice: "128,000", label: "NEW",
    desc: "얇은 스틸 프레임 위에 한지를 발라, 켜졌을 때 은은한 그림자 무늬가 벽에 드리우는 스탠드 조명입니다. 침실 협탁이나 거실 코너에 두면 공간에 조용한 리듬감을 더합니다.",
    spec: "SIZE : W24 D24 H48 · MATERIAL : hanji, steel",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=620&fit=crop&auto=format", alt: "한지 그림자 조명", brand: "집다움", category: "조명" },
  { id: 9, no: "No.8", name: "자작나무 오픈 책장", sub: "화이트 오크", price: "248,000", label: "NEW",
    desc: "자작나무 합판을 오크 톤으로 마감한 5단 오픈 책장. 칸막이 없이 뚫려있어 책과 소품을 자유롭게 배치할 수 있고, 거실이나 서재 어디에 두어도 무게감 없이 어울립니다.",
    spec: "SIZE : W80 D32 H160 · MATERIAL : birch plywood, oak veneer",
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=500&h=620&fit=crop&auto=format", alt: "자작나무 오픈 책장", brand: "집다움", category: "수납" },
  { id: 10, no: "No.9", name: "백자 유약 접시 세트", sub: "순백 (4p)", price: "72,000", originalPrice: "89,000", label: "ECO",
    desc: "전통 백자 유약 기법으로 구운 접시 4개 세트. 은은한 광택과 매끄러운 곡선이 어떤 음식을 담아도 자연스럽게 어우러지며, 식기세척기 사용도 가능해 관리가 편합니다.",
    spec: "SIZE : Ø24 H2.5 (4p) · MATERIAL : porcelain",
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500&h=620&fit=crop&auto=format", alt: "백자 유약 접시 세트", brand: "집다움", category: "소품" },
  { id: 11, no: "No.10", name: "황동 프레임 원형 거울", sub: "골드 브라스", price: "186,000", originalPrice: "220,000", label: "NEW",
    desc: "가느다란 황동 프레임으로 두른 원형 거울. 현관이나 화장대 위에 걸면 공간에 은은한 광채를 더하고, 시간이 지날수록 자연스럽게 변하는 브라스의 색감이 멋을 더합니다.",
    spec: "SIZE : Ø56 D3 · MATERIAL : brass, glass",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&h=620&fit=crop&auto=format", alt: "황동 프레임 원형 거울", brand: "집다움", category: "소품" },
  { id: 12, no: "No.11", name: "리넨 누빔 침구 세트", sub: "오트밀 베이지", price: "156,000", originalPrice: "188,000", label: "BESTSELLER",
    desc: "100% 순면 리넨을 누빔 방식으로 마감한 침구 세트. 사계절 내내 보송한 촉감을 유지하고, 세탁 후에도 뭉침 없이 오래 사용할 수 있습니다.",
    spec: "SIZE : 이불 210x230 · MATERIAL : linen, cotton fill",
    image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=500&h=620&fit=crop&auto=format", alt: "리넨 누빔 침구 세트", brand: "집다움", category: "침구" },
  { id: 13, no: "No.12", name: "무자기 오브제 화병", sub: "백자", price: "64,000", label: "NEW",
    desc: "정갈한 여백을 살린 무자기 화병. 미니멀한 형태와 무광 마감으로 꽃 한 송이만 꽂아도, 비워두어도 그 자체로 공간의 포인트가 됩니다.",
    spec: "SIZE : Ø14 H26 · MATERIAL : porcelain",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&h=620&fit=crop&auto=format", alt: "무자기 오브제 화병", brand: "집다움", category: "소품" },
  { id: 14, no: "No.13", name: "울 혼방 러그", sub: "그레이시 베이지", price: "138,000", originalPrice: "168,000", label: "NEW",
    desc: "울과 면을 섞어 짠 러그로, 폭신한 두께감과 은은한 색감이 거실 바닥에 차분한 톤을 더합니다. 소파 앞이나 침실 협탁 곁에 깔면 공간이 한층 따뜻해집니다.",
    spec: "SIZE : W200 D140 · MATERIAL : wool, cotton",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=620&fit=crop&auto=format", alt: "울 혼방 러그", brand: "집다움", category: "소품" },
  { id: 15, no: "No.14", name: "원목 스툴", sub: "내추럴 애쉬", price: "88,000", originalPrice: "108,000", label: "ECO",
    desc: "애쉬 원목을 통으로 깎아 만든 스툴. 보조 의자로도, 협탁 대용으로도 쓸 수 있는 다용도 가구로, 어느 공간에 두어도 무게감 없이 자연스럽게 스며듭니다.",
    spec: "SIZE : W36 D36 H44 · MATERIAL : ash wood",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&h=620&fit=crop&auto=format", alt: "원목 스툴", brand: "집다움", category: "의자" },
];

const PRODUCT_CATEGORIES = ["전체", "소파", "의자", "테이블", "침구", "조명", "수납", "소품"];

const LOOKBOOK_PHOTOS = [
  "photo-1484101403633-562f891dc89a",
  "photo-1493663284031-b7e3aefcae8e",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1519710164239-da123dc03ef4",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1522771739844-6a9f6d5f14af",
  "photo-1524758631624-e2822e304c36",
  "photo-1533090161767-e6ffed986c88",
  "photo-1540932239986-30128078f3c5",
  "photo-1550581190-9c1c48d21d6c",
  "photo-1554995207-c18c203602cb",
  "photo-1556228453-efd6c1ff04f6",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1567016376408-0226e4d0c1ea",
  "photo-1567016432779-094069958ea5",
  "photo-1567538096630-e0c55bd6374c",
  "photo-1583847268964-b28dc8f51f92",
  "photo-1586023492125-27b2c045efd7",
  "photo-1594026112284-02bb6f3352fe",
  "photo-1595526114035-0d45ed16cfbf",
  "photo-1599619351208-3e6c839d6828",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600585154340-be6161a56a0c",
  "photo-1606760227091-3dd870d97f1d",
  "photo-1616627561950-9f746e330187",
  "photo-1618220179428-22790b461013",
  "photo-1618221195710-dd6b41faaea6",
  "photo-1631679706909-1844bbd07221",
  "photo-1631889993959-41b4e9c6e3c5",
].map((id) => `https://images.unsplash.com/${id}?w=400&h=400&fit=crop&auto=format`);

const LOOKBOOK_PAGE_SIZE = 21;

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

function Label({ children, className = "" }) {
  return (
    <span className={`text-[10px] tracking-[0.25em] text-muted-foreground uppercase ${className}`} style={MONO}>
      {children}
    </span>
  );
}

function Home() {
  const [wishlist, setWishlist] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [lookbookPage, setLookbookPage] = useState(0);
  const [lookbookViewerIndex, setLookbookViewerIndex] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [cartCounts, setCartCounts] = useState({});
  const { openLogin } = useAuthModal();

  // 상품 카드 배지는 로그인 계정의 실제 백엔드 장바구니만 기준으로 한다.
  // (localStorage 기반 카운터는 계정과 무관하게 남아 실제로 담지 않아도 표시되는 버그가 있어 제거)
  const fetchCartCounts = () => {
    if (!localStorage.getItem("access_token")) {
      setCartCounts({});
      return;
    }
    getCartItems()
      .then((res) =>
        setCartCounts(
          res.data.reduce((acc, item) => {
            acc[item.product_id] = (acc[item.product_id] || 0) + (item.quantity || 1);
            return acc;
          }, {})
        )
      )
      .catch(() => setCartCounts({}));
  };

  useEffect(() => {
    fetchCartCounts();
    window.addEventListener("cartchange", fetchCartCounts);
    window.addEventListener("authchange", fetchCartCounts);
    return () => {
      window.removeEventListener("cartchange", fetchCartCounts);
      window.removeEventListener("authchange", fetchCartCounts);
    };
  }, []);
  // 인트로 영상 — 도어인트로가 끝나기 전엔 재생하지 않고, "doorintroend" 이벤트를 받은
  // 뒤에야 재생을 시작한다. 한 번만 재생하고, 끝나면 소파 상품 사진으로 부드럽게 전환한다.
  const introVideoRef = useRef(null);
  const [introVideoEnded, setIntroVideoEnded] = useState(false);

  useEffect(() => {
    const startVideo = () => {
      introVideoRef.current?.play().catch(() => {});
    };
    window.addEventListener("doorintroend", startVideo);
    return () => window.removeEventListener("doorintroend", startVideo);
  }, []);

  // 히어로 섹션 — 좌우 이미지를 일정 간격으로 크로스페이드하며 전환
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((i) => (i + 1) % HERO_LEFT_IMAGES.length);
    }, HERO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // 사이드바 검색 플라이아웃에서 선택한 상품을 퀵뷰로 연다.
  // 같은 페이지에 있는 동안은 커스텀 이벤트로, 다른 페이지에서 넘어온 직후에는
  // sessionStorage에 남겨둔 id를 마운트 시 확인해서 연다.
  useEffect(() => {
    const openById = (id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (product) openQuickView(product);
    };

    const pendingId = sessionStorage.getItem("pendingHomeProductId");
    if (pendingId) {
      sessionStorage.removeItem("pendingHomeProductId");
      setTimeout(() => openById(Number(pendingId)), 250);
    }

    const handler = (e) => openById(e.detail);
    window.addEventListener("open-home-product", handler);
    return () => window.removeEventListener("open-home-product", handler);
  }, []);

  // 인트로 영상이 끝나 소파 사진으로 전환된 뒤 3초 있다가, 사용자가 아직 에세이
  // 페이지에 머물러 있으면 상품 페이지로 천천히 스크롤한다.
  useEffect(() => {
    if (!introVideoEnded) return;

    const holdTimer = setTimeout(() => {
      const essayEl = document.getElementById("home-essay");
      const stillOnEssay = essayEl && Math.abs(essayEl.getBoundingClientRect().left) < 50;
      if (stillOnEssay && window.lenis) {
        const target = document.querySelectorAll("[data-hsnap]")[2];
        if (target) {
          window.lenis.resize();
          window.lenis.scrollTo(target, {
            duration: 5.3,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        }
      }
    }, 3000);

    return () => clearTimeout(holdTimer);
  }, [introVideoEnded]);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
  };

  const addToHomeCart = async (id, qty) => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    try {
      await addToCart({ product: id, quantity: qty, option: null });
      window.dispatchEvent(new Event("cartchange"));
    } catch {
      alert("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const filteredProducts = (() => {
    const q = productSearchQuery.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === "전체" || p.category === selectedCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sub.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  })();

  const lookbookPageCount = Math.ceil(LOOKBOOK_PHOTOS.length / LOOKBOOK_PAGE_SIZE);
  const lookbookPhotos = LOOKBOOK_PHOTOS.slice(
    lookbookPage * LOOKBOOK_PAGE_SIZE,
    lookbookPage * LOOKBOOK_PAGE_SIZE + LOOKBOOK_PAGE_SIZE
  );

  const toggleWish = (id) =>
    setWishlist((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // 인트로 영상 옆에 연결해 보여줄 상품 — 영상 속 거실 장면에 어울리는 플로어 라운지 소파
  const featuredProduct = PRODUCTS.find((p) => p.id === 5);

  // 도어인트로를 지나 홈에 들어오면 기본적으로 1번째 패널(에세이)에서 시작한다.
  // (HERO가 전체 상품 페이지 앞으로 옮겨가면서 에세이가 첫 패널이 됨)
  // 사이드바의 "홈"/"상품" 버튼으로 진입한 경우엔 각자 원하는 패널로 직접 이동하므로 건너뛴다.
  useEffect(() => {
    if (sessionStorage.getItem("skipHomeDefaultPanel")) {
      sessionStorage.removeItem("skipHomeDefaultPanel");
      return;
    }
    const target = document.querySelectorAll("[data-hsnap]")[0];
    if (!target) return;
    const timer = setTimeout(() => {
      if (window.lenis) {
        window.lenis.resize();
        window.lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home bg-background text-foreground flex flex-row" style={SANS}>

      {/* ESSAY SPREAD — 영상 절반 + 영상 속 상품 구매 유도 절반으로 구성된 인트로 무대 */}
      <section id="home-essay" data-hide-header data-hsnap className="w-screen h-screen shrink-0 overflow-hidden flex flex-row text-foreground">
        <div className="relative w-1/2 h-full overflow-hidden">
          <video
            ref={introVideoRef}
            className="w-full h-full object-cover"
            src="/videos/jipdaum%20video(1).mp4"
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroVideoEnded(true)}
          />
          <img
            src={floorLoungeSofa}
            alt="플로어 라운지 소파"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
              introVideoEnded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <div className="sparkleBg holoMesh relative w-1/2 h-full flex flex-col items-start justify-center px-16">
          <div className="relative z-10">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5" style={MONO}>
              FEATURED IN THIS FILM
            </p>
            <h3 className="text-3xl md:text-4xl font-light leading-snug mb-6" style={SERIF}>
              영상 속 공간에 놓인
              <br />
              {featuredProduct.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-10">
              영상에 등장한 상품을 지금 바로 만나보세요.
              <br />
              영상에 관련된 상품을 구매할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => openQuickView(featuredProduct)}
              className="px-8 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:opacity-85 transition-opacity"
              style={SANS}
            >
              상품 보러가기 →
            </button>
          </div>
        </div>
      </section>

      {/* HERO — 전체 상품(검색) 페이지 바로 앞에 배치, 좌우 이미지가 크로스페이드로 순환 */}
      <section data-hsnap className="relative w-screen h-screen shrink-0 overflow-hidden bg-background flex flex-row">
        <div className="relative w-1/2 h-full overflow-hidden">
          {HERO_LEFT_IMAGES.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={`heroSlideImg absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
                i === heroSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="relative w-1/2 h-full overflow-hidden">
          {HERO_RIGHT_IMAGES.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={`heroSlideImg absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
                i === heroSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section data-hsnap data-lenis-prevent className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-start py-20 px-8">
        <div className="relative z-10 max-w-7xl mx-auto w-full mb-10 flex items-end justify-end gap-8 flex-wrap">
          <div className="flex items-center gap-2 border-b border-foreground w-full sm:w-72 pb-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              placeholder="상품명, 브랜드, 라벨 검색"
              aria-label="전체 상품 검색"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              style={SANS}
            />
            {productSearchQuery && (
              <button
                type="button"
                onClick={() => setProductSearchQuery("")}
                aria-label="검색어 지우기"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full mb-8 flex items-center gap-2 flex-wrap">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
              style={SANS}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="relative z-10 max-w-7xl mx-auto w-full text-center text-sm text-muted-foreground py-16" style={SANS}>
            {productSearchQuery
              ? `"${productSearchQuery}"에 대한 검색 결과가 없습니다.`
              : `${selectedCategory} 카테고리에 상품이 없습니다.`}
          </p>
        ) : (
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const priceNum = Number(p.price.replace(/,/g, ""));
            const originalNum = p.originalPrice ? Number(p.originalPrice.replace(/,/g, "")) : 0;
            const hasDiscount = originalNum > priceNum;
            const discountPct = hasDiscount ? Math.round((1 - priceNum / originalNum) * 100) : 0;

            return (
              <article key={p.id} className="group cursor-pointer" onClick={() => openQuickView(p)}>
                <div className="relative overflow-hidden bg-muted mb-3 aspect-[5/6]">
                  <img src={p.image} alt={p.alt} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <button onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                    className="absolute top-3 right-3 w-7 h-7 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Heart size={12} className={wishlist.includes(p.id) ? "fill-foreground text-foreground" : "text-foreground"} />
                  </button>
                  {cartCounts[p.id] > 0 && (
                    <span
                      className="cartCountBadge absolute top-3 left-3 min-w-[20px] h-[20px] px-1.5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center gap-1 justify-center"
                      style={MONO}
                      data-tooltip={`현재 장바구니에 ${cartCounts[p.id]}개의 상품이 담겨 있습니다.`}
                    >
                      <ShoppingBag size={9} />
                      {cartCounts[p.id]}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground block mb-1" style={MONO}>{p.no} · {p.label}</span>
                <h4 className="text-sm font-medium text-foreground mb-0.5" style={SANS}>{p.name}</h4>
                <div className="mt-1 flex flex-col items-end gap-1">
                  <div className={`flex items-center gap-1.5 ${hasDiscount ? "" : "invisible"}`}>
                    <span className="text-[10px] font-bold text-white bg-[#c0392b] rounded px-1.5 py-0.5 tracking-wide" style={MONO}>
                      {discountPct}% OFF
                    </span>
                    <span className="text-xs text-muted-foreground line-through" style={MONO}>₩{p.originalPrice || p.price}</span>
                  </div>
                  <span className="text-right text-2xl font-bold text-foreground" style={MONO}>₩{p.price}</span>
                </div>
              </article>
            );
          })}
        </div>
        )}
      </section>

      {/* LOOKBOOK */}
      <section data-hsnap className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-8 py-10 w-full">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {lookbookPhotos.map((src, i) => (
              <div
                key={src}
                className="group overflow-hidden bg-muted aspect-square cursor-pointer relative"
                onClick={() => setLookbookViewerIndex(lookbookPage * LOOKBOOK_PAGE_SIZE + i)}
              >
                <img src={src} alt={`리빙 갤러리 ${lookbookPage * LOOKBOOK_PAGE_SIZE + i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-600" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
                <Camera className="absolute top-2 right-2 text-white drop-shadow" size={14} />
              </div>
            ))}
          </div>

          {lookbookPageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                aria-label="이전 페이지"
                onClick={() => setLookbookPage((p) => Math.max(0, p - 1))}
                disabled={lookbookPage === 0}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: lookbookPageCount }, (_, i) => (
                <button 
                  key={i}
                  type="button"
                  aria-label={`${i + 1}페이지`}
                  onClick={() => setLookbookPage(i)}
                  className={`w-8 h-8 text-sm flex items-center justify-center transition-colors ${
                    i === lookbookPage
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={MONO}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                aria-label="다음 페이지"
                onClick={() => setLookbookPage((p) => Math.min(lookbookPageCount - 1, p + 1))}
                disabled={lookbookPage === lookbookPageCount - 1}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {quickViewProduct && (
        <div
          className="quickViewOverlay fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-6"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="quickViewPanel relative w-full max-w-4xl max-h-[calc(100vh-48px)] overflow-y-auto grid grid-cols-1 md:grid-cols-2 quickViewMetallicBg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm text-foreground hover:opacity-70 transition-opacity"
            >
              <X size={18} />
            </button>

            <div className="overflow-hidden bg-muted aspect-[5/6] md:aspect-auto">
              <img src={quickViewProduct.image} alt={quickViewProduct.alt} className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col justify-center px-8 py-10 md:px-10">
              <span className="text-[10px] text-muted-foreground block mb-3" style={MONO}>{quickViewProduct.no} · {quickViewProduct.label}</span>
              <h3 className="text-2xl font-light text-foreground mb-2" style={SERIF}>{quickViewProduct.name}</h3>
              <p className="text-sm text-muted-foreground font-light mb-4">{quickViewProduct.sub}</p>
              <p className="text-sm text-foreground/80 font-light leading-relaxed mb-4">{quickViewProduct.desc}</p>
              <p className="text-xs text-muted-foreground mb-6" style={MONO}>{quickViewProduct.spec}</p>
              <Hairline className="mb-6 w-16" />

              <div className="flex items-center justify-between mb-8">
                <span className="text-xs text-muted-foreground tracking-widest" style={MONO}>수량</span>
                <div className="flex items-center gap-4 border border-border px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                    className="text-foreground hover:opacity-60 transition-opacity"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <span className="text-sm text-foreground w-4 text-center" style={MONO}>{quickViewQty}</span>
                  <button
                    type="button"
                    onClick={() => setQuickViewQty((q) => q + 1)}
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
                  ₩{(Number(quickViewProduct.price.replace(/,/g, "")) * quickViewQty).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => toggleWish(quickViewProduct.id)}
                  className="w-11 h-11 shrink-0 border border-border flex items-center justify-center text-foreground hover:border-foreground transition-colors"
                  aria-label="찜 리스트에 담기"
                >
                  <Heart size={16} className={wishlist.includes(quickViewProduct.id) ? "fill-foreground text-foreground" : "text-foreground"} />
                </button>
                <button
                  onClick={() => addToHomeCart(quickViewProduct.id, quickViewQty)}
                  className="flex-1 bg-foreground text-background text-xs tracking-widest hover:opacity-85 transition-opacity"
                  style={SANS}
                >
                  담기
                </button>
              </div>
              {cartCounts[quickViewProduct.id] > 0 && (
                <p className="text-xs text-muted-foreground" style={MONO}>
                  장바구니에 {cartCounts[quickViewProduct.id]}개 담겨있어요
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {lookbookViewerIndex !== null && (
        <LookbookViewer
          photos={LOOKBOOK_PHOTOS}
          index={lookbookViewerIndex}
          onClose={() => setLookbookViewerIndex(null)}
          onNavigate={setLookbookViewerIndex}
        />
      )}

      <ChatBot />
    </div>
  );
}

export default Home;
