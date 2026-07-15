import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, ArrowUpRight, X } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import "./Home.css";
import jipdaumBrushes from "../../assets/scenes/jipdaum-brushes.png";
import jipdaumColorBurst from "../../assets/scenes/jipdaum-color-burst.png";
import storageCabinet from "../../assets/products/storage-cabinet.jpg";
import royalCourtyardView from "../../assets/scenes/royal-modern-courtyard-view.jpg";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const HERO_SLIDES = [
  { src: jipdaumBrushes, alt: "집다움 히어로 - 오방색 붓끝이 모여 만든 별 모양" },
  { src: jipdaumColorBurst, alt: "집다움 히어로 - 오방색 물감이 터지는 모습" },
];

const PRODUCTS = [
  { id: 1, no: "No.1", name: "린넨 암체어", sub: "내추럴 베이지", price: "328,000", label: "BESTSELLER",
    desc: "부드러운 린넨과 낮은 팔걸이로 온몸을 편안히 감싸는 체어. 거실 어디에 놓아도 공간의 무게중심이 됩니다.",
    spec: "SIZE : W68 D72 H76 · MATERIAL : linen, oak",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=620&fit=crop&auto=format", alt: "린넨 암체어" },
  { id: 2, no: "No.2", name: "월넛 사이드 테이블", sub: "블랙 월넛", price: "168,000", label: "NEW",
    desc: "짙은 월넛 원목의 결을 살린 사이드 테이블. 소파 옆, 침대 곁 어디서나 조용히 제 역할을 합니다.",
    spec: "SIZE : W45 D45 H50 · MATERIAL : walnut",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&h=620&fit=crop&auto=format", alt: "월넛 사이드 테이블" },
  { id: 3, no: "No.3", name: "세라믹 꽃병 세트", sub: "화이트 / 세이지", price: "89,000", label: "CURATED",
    desc: "화이트와 세이지, 두 가지 톤으로 구성된 세라믹 꽃병 세트. 마른 가지 하나만 꽂아도 공간이 정돈됩니다.",
    spec: "SIZE : H18 / H24 · MATERIAL : ceramic",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&h=620&fit=crop&auto=format", alt: "세라믹 꽃병" },
  { id: 4, no: "No.4", name: "대나무 트레이", sub: "내추럴", price: "54,000", label: "ECO",
    desc: "대나무를 엮어 만든 트레이. 차 한 잔, 작은 화분, 협탁 위 소품 정리에 두루 어울립니다.",
    spec: "SIZE : W38 D26 H4 · MATERIAL : bamboo",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=620&fit=crop&auto=format", alt: "대나무 트레이" },
  { id: 5, no: "No.5", name: "한국 모던 나비 문양 수납장", sub: "월넛 / 브라스", price: "148,000", label: "NEW",
    desc: "브라스 나비 손잡이가 포인트인 원목 수납장. 전통 문양을 현대적인 비례로 다시 그렸습니다.",
    spec: "SIZE : W80 D40 H85 · MATERIAL : walnut, brass",
    image: storageCabinet, alt: "한국 모던 나비 문양 수납장" },
];

const SPREAD = {
  quote: "집은 취향의 모음집이 아니라\n삶의 방식을 선택하는 나만의 공간이다.",
  image: royalCourtyardView,
  alt: "한옥 중정 전경 - 단청 처마와 연못이 보이는 마루",
};

const ESSAY = {
  title: "여러분이 생각하는 집다움은 \n 어떤 공간인가요?",
};

const ESSAY_2 = {
  title: "누군가에게는 편안함이고,\n누군가에게는 따뜻한 온기입니다.",
};

const ESSAY_3 = {
  title: "하지만 정답은 없습니다.\n나를 표현한 공간이면 충분합니다.",
};

const LOOKBOOK_PHOTOS = [
  "photo-1484101403633-562f891dc89a",
  "photo-1493663284031-b7e3aefcae8e",
  "photo-1507003211169-0a1dd7228f2d",
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
  "photo-1573883431205-98b5f10aaedb",
  "photo-1583847268964-b28dc8f51f92",
  "photo-1586023492125-27b2c045efd7",
  "photo-1594026112284-02bb6f3352fe",
  "photo-1595526114035-0d45ed16cfbf",
  "photo-1599619351208-3e6c839d6828",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600585154340-be6161a56a0c",
  "photo-1606760227091-3dd870d97f1d",
  "photo-1615529182904-14819c35db37",
  "photo-1616486338812-3dadae4b4ace",
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
  const [heroSlide, setHeroSlide] = useState(0);
  const [lookbookPage, setLookbookPage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [cartCounts, setCartCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("homeCartCounts")) || {};
    } catch {
      return {};
    }
  });
  const carouselRef = useRef(null);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
  };

  const addToHomeCart = (id, qty) => {
    setCartCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + qty };
      localStorage.setItem("homeCartCounts", JSON.stringify(next));
      return next;
    });
    window.dispatchEvent(new Event("homecartchange"));
  };

  const lookbookPageCount = Math.ceil(LOOKBOOK_PHOTOS.length / LOOKBOOK_PAGE_SIZE);
  const lookbookPhotos = LOOKBOOK_PHOTOS.slice(
    lookbookPage * LOOKBOOK_PAGE_SIZE,
    lookbookPage * LOOKBOOK_PAGE_SIZE + LOOKBOOK_PAGE_SIZE
  );

  const toggleWish = (id) =>
    setWishlist((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (dir) =>
    carouselRef.current?.scrollBy({ left: dir === "right" ? 560 : -560, behavior: "smooth" });

  return (
    <div className="home bg-background text-foreground flex flex-row" style={SANS}>

      {/* HERO */}
      <section data-hsnap className="relative w-screen h-screen shrink-0 overflow-hidden bg-background">
        <div
          className="absolute inset-0 flex h-full transition-transform duration-[900ms] ease-in-out"
          style={{ transform: `translateX(calc(-${heroSlide} * 100vw))` }}
        >
          {HERO_SLIDES.map((slide) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className="w-screen h-full object-cover shrink-0"
            />
          ))}
        </div>

        <div className="absolute bottom-16 right-10 md:right-16 flex gap-2 z-10">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`${i + 1}번째 사진 보기`}
              onClick={() => setHeroSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === heroSlide ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ESSAY SPREAD */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center bg-background text-foreground py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-light leading-[1.6] mb-10 whitespace-pre-line" style={SERIF}>
            {ESSAY.title}
          </p>
          <Hairline className="border-foreground/20 mb-10 max-w-xs mx-auto" />
        </div>
      </section>

      {/* ESSAY SPREAD 2 */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center bg-background text-foreground py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-light leading-[1.6] mb-10 whitespace-pre-line" style={SERIF}>
            {ESSAY_2.title}
          </p>
          <Hairline className="border-foreground/20 mb-10 max-w-xs mx-auto" />
        </div>
      </section>

      {/* ESSAY SPREAD 3 */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center bg-background text-foreground py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-3xl md:text-4xl font-light leading-[1.6] mb-10 whitespace-pre-line" style={SERIF}>
            {ESSAY_3.title}
          </p>
          <Hairline className="border-foreground/20 mb-10 max-w-xs mx-auto" />
        </div>
      </section>

      {/* PULL QUOTE SPREAD (복제 3) */}
      <section data-hsnap className="grid grid-cols-1 md:grid-cols-2 w-screen h-screen shrink-0 overflow-y-auto">
        <div className="overflow-hidden bg-muted h-72 md:h-auto">
          <img src={SPREAD.image} alt={SPREAD.alt} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-1000" />
        </div>
        <div className="bg-secondary flex flex-col justify-center px-12 md:px-16 py-16 md:py-0">
          <Label className="mb-8 block">{SPREAD.author}</Label>
          <blockquote className="text-2xl md:text-3xl font-light leading-[1.55] text-foreground whitespace-pre-line mb-10" style={SERIF}>
            {SPREAD.quote}
          </blockquote>
          <Hairline className="mb-8 w-16" />
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center py-20 px-8">
        <div className="max-w-7xl mx-auto w-full mb-10">
          <Label className="block mb-3">전체 상품</Label>
          <h2 className="text-3xl font-light text-foreground" style={SERIF}>집다움의 모든 상품</h2>
        </div>
        <Hairline className="max-w-7xl mx-auto w-full mb-10" />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="group cursor-pointer" onClick={() => openQuickView(p)}>
              <div className="relative overflow-hidden bg-muted mb-3 aspect-[5/6]">
                <img src={p.image} alt={p.alt} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                <button onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                  className="absolute top-3 right-3 w-7 h-7 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Heart size={12} className={wishlist.includes(p.id) ? "fill-foreground text-foreground" : "text-foreground"} />
                </button>
                {cartCounts[p.id] > 0 && (
                  <span className="absolute top-3 left-3 min-w-[20px] h-[20px] px-1 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center" style={MONO}>
                    {cartCounts[p.id]}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground block mb-1" style={MONO}>{p.no} · {p.label}</span>
              <h4 className="text-sm font-medium text-foreground mb-0.5" style={SANS}>{p.name}</h4>
              <span className="text-base font-semibold text-foreground" style={MONO}>₩{p.price}</span>
            </article>
          ))}
        </div>
      </section>

      {/* PRODUCT CAROUSEL */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center py-20">
        <div className="max-w-7xl mx-auto px-8 mb-10">
          <div className="flex items-baseline justify-between">
            <div>
              <Label className="block mb-3">이달의 상품</Label>
              <h2 className="text-3xl font-light text-foreground" style={SERIF}>고객의 추천 상품</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => scroll("left")} className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={() => scroll("right")} className="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
      </div>
        <Hairline className="max-w-7xl mx-auto px-8 mb-10" />
        <div className="max-w-7xl mx-auto px-8">
          <div ref={carouselRef} className="flex gap-10 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {PRODUCTS.map((p) => (
              <article key={p.id} className="group flex-shrink-0 w-96 md:w-[30rem] cursor-pointer" onClick={() => openQuickView(p)}>
                <div className="relative overflow-hidden bg-muted mb-5 aspect-[5/6]">
                  <img src={p.image} alt={p.alt} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <button onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Heart size={14} className={wishlist.includes(p.id) ? "fill-foreground text-foreground" : "text-foreground"} />
                  </button>
                  {cartCounts[p.id] > 0 && (
                    <span className="absolute top-4 left-4 min-w-[22px] h-[22px] px-1 rounded-full bg-foreground text-background text-[11px] font-semibold flex items-center justify-center" style={MONO}>
                      {cartCounts[p.id]}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); addToHomeCart(p.id, 1); }}
                    className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-foreground text-background py-3 text-center text-xs tracking-widest"
                    style={SANS}
                  >
                    담기
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1" style={MONO}>{p.no} · {p.label}</span>
                    <h4 className="text-lg font-medium text-foreground mb-0.5" style={SANS}>{p.name}</h4>
                    <p className="text-sm text-muted-foreground font-light">{p.sub}</p>
                  </div>
                  <span className="text-4xl font-semibold text-foreground shrink-0 ml-3" style={MONO}>₩{p.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center bg-background text-foreground py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Label className="block mb-6 text-accent-foreground/50">OUR PHILOSOPHY</Label>
          <p className="text-3xl md:text-4xl font-light leading-[1.6] mb-10" style={SERIF}>
            한국 고유의 향을 느껴보세요.<br />당신이 살고 싶은 공간을 선택합니다.
          </p>
          <Hairline className="border-foreground/20 mb-10 max-w-xs mx-auto" />
          <a href="#" className="inline-flex items-center gap-2 text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors" style={SANS}>
            브랜드 이야기 <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-8 py-10 w-full">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <Label className="block mb-2">@jipdaum.official</Label>
              <h2 className="text-3xl font-light text-foreground" style={SERIF}>갤러리</h2>
            </div>
          </div>
          <Hairline className="mb-4" />
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {lookbookPhotos.map((src, i) => (
              <div key={src} className="group overflow-hidden bg-muted aspect-square cursor-pointer relative">
                <img src={src} alt={`리빙 갤러리 ${lookbookPage * LOOKBOOK_PAGE_SIZE + i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-600" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
                <FaInstagram className="absolute top-2 right-2 text-white drop-shadow" size={14} />
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

      {/* NEWSLETTER */}
      <section data-hsnap className="w-screen h-screen shrink-0 overflow-y-auto flex flex-col justify-center border-t border-border py-20 px-8 bg-secondary">
        <div className="max-w-lg mx-auto text-center">
          <Label className="block mb-5">LETTER FROM EDITOR</Label>
          <h3 className="text-3xl font-light text-foreground mb-4" style={SERIF}>집다움만의 소식을 들어보세요.</h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-10">격주마다 공간 큐레이션, 인터뷰, 새로운 오브제 소식을 전해드립니다.</p>
          <div className="flex border-b border-foreground">
            <input type="email" placeholder="이메일 주소"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-3 px-0" style={SANS} />
            <button className="text-xs tracking-widest text-foreground hover:text-muted-foreground transition-colors py-3 pl-6 shrink-0" style={MONO}>SUBSCRIBE</button>
          </div>
        </div>
      </section>

      {quickViewProduct && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 backdrop-blur-sm p-6"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[calc(100vh-48px)] overflow-y-auto grid grid-cols-1 md:grid-cols-2 bg-background"
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
                  aria-label="위시리스트"
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
    </div>
  );
}

export default Home;
