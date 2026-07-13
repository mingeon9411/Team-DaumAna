import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, ArrowUpRight } from "lucide-react";
import "./Home.css";
import heroDay from "../../assets/scenes/hanok-bedroom.jpg";
import heroNight from "../../assets/scenes/hanok-bedroom-night.jpg";
import heroOverhead from "../../assets/scenes/hanok-bedroom-overhead.jpg";
import heroDoorway from "../../assets/scenes/hanok-bedroom-doorway.jpg";
import heroWardrobe from "../../assets/scenes/hanok-wardrobe.jpg";
import heroTea from "../../assets/scenes/hanok-bedroom-tea.jpg";
import heroSitting from "../../assets/scenes/hanok-bedroom-sitting.jpg";
import heroStanding from "../../assets/scenes/hanok-bedroom-standing.jpg";
import storageCabinet from "../../assets/products/storage-cabinet.jpg";
import koreanRoyalInterior from "../../assets/scenes/korean-royal-modern-interior.jpg";
import royalCourtyardView from "../../assets/scenes/royal-modern-courtyard-view.jpg";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const HERO_SLIDES = [
  { src: heroTea, alt: "집다움 히어로 - 한옥에서 차를 따르는 모습" },
  { src: heroSitting, alt: "집다움 히어로 - 침대에 앉아 있는 모습" },
  { src: heroStanding, alt: "집다움 히어로 - 한옥에 서 있는 모습" },
  { src: heroDay, alt: "집다움 히어로 - 한옥 침실" },
  { src: heroNight, alt: "집다움 히어로 - 한옥 침실 야경" },
  { src: heroOverhead, alt: "집다움 히어로 - 한옥 침실 위에서" },
  { src: heroDoorway, alt: "집다움 히어로 - 한옥 침실 문 너머로" },
  { src: heroWardrobe, alt: "집다움 히어로 - 한옥 장롱" },
];

const FEATURES = [
  {
    no: "01", kw: "고요한 아침",
    headline: "정리된 공간이\n만드는 여백",
    body: "물건을 덜어낼수록 공간은 말을 시작한다. 비움의 미학으로 완성되는 집다움.",
    image: koreanRoyalInterior,
    alt: "한국 궁중 모던 인테리어 - 단청 천장과 한옥 창호가 있는 거실",
  },
  {
    no: "02", kw: "빛과 질감",
    headline: "자연 소재의\n따뜻한 언어",
    body: "린넨, 세라믹, 원목. 손끝에서 느껴지는 재료의 솔직함.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=640&h=480&fit=crop&auto=format",
    alt: "원목 소파와 소품",
  },
  {
    no: "03", kw: "침묵의 침실",
    headline: "잠들기 전\n마지막 숨결",
    body: "침실은 세상에서 가장 솔직한 공간이다.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=640&h=480&fit=crop&auto=format",
    alt: "모던 침실",
  },
];

const PRODUCTS = [
  { id: 1, no: "No.1", name: "린넨 암체어", sub: "내추럴 베이지", price: "328,000", label: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=620&fit=crop&auto=format", alt: "린넨 암체어" },
  { id: 2, no: "No.2", name: "월넛 사이드 테이블", sub: "블랙 월넛", price: "168,000", label: "NEW",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&h=620&fit=crop&auto=format", alt: "월넛 사이드 테이블" },
  { id: 3, no: "No.3", name: "세라믹 꽃병 세트", sub: "화이트 / 세이지", price: "89,000", label: "CURATED",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&h=620&fit=crop&auto=format", alt: "세라믹 꽃병" },
  { id: 4, no: "No.4", name: "대나무 트레이", sub: "내추럴", price: "54,000", label: "ECO",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=620&fit=crop&auto=format", alt: "대나무 트레이" },
  { id: 5, no: "No.5", name: "한국 모던 나비 문양 수납장", sub: "월넛 / 브라스", price: "148,000", label: "NEW",
    image: storageCabinet, alt: "한국 모던 나비 문양 수납장" },
];

const SPREAD = {
  quote: "집은 취향의 모음집이 아니라\n삶의 방식을 선택하는 나만의 공간이다.",
  author: "고객의 말",
  image: royalCourtyardView,
  alt: "한옥 중정 전경 - 단청 처마와 연못이 보이는 마루",
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
  const carouselRef = useRef(null);

  const toggleWish = (id) =>
    setWishlist((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (dir) =>
    carouselRef.current?.scrollBy({ left: dir === "right" ? 380 : -380, behavior: "smooth" });

  return (
    <div className="home bg-background text-foreground" style={SANS}>

      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] overflow-hidden bg-muted">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2500ms] ease-in-out ${
              i === heroSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

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

      {/* EDITORIAL GRID */}
      <section id="home-essay" className="max-w-7xl mx-auto px-8 py-20">
        <Hairline className="mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer">
            <img src={FEATURES[0].image} alt={FEATURES[0].alt}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-32">
            <img src={FEATURES[1].image} alt={FEATURES[1].alt}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-64">
            <img src={FEATURES[2].image} alt={FEATURES[2].alt}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* EDITORIAL GRID — 오른쪽에서 왼쪽으로 내려가는 배치 */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-64">
            <img src={heroOverhead} alt="집다움 - 한옥 침실 위에서"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-32">
            <img src={heroDoorway} alt="집다움 - 한옥 침실 문 너머로"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer">
            <img src={heroWardrobe} alt="집다움 - 한옥 장롱"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* EDITORIAL GRID — 왼쪽에서 오른쪽으로 내려가는 배치 */}
      <section className="max-w-7xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer">
            <img src={heroDay} alt="집다움 - 한옥 침실"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-32">
            <img src={heroTea} alt="집다움 - 한옥에서 차를 따르는 모습"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
          <div className="overflow-hidden bg-muted aspect-[3/4] group cursor-pointer md:mt-64">
            <img src={heroNight} alt="집다움 - 한옥 침실 야경"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* PULL QUOTE SPREAD */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[56vh]">
        <div className="overflow-hidden bg-muted h-72 md:h-auto">
          <img src={SPREAD.image} alt={SPREAD.alt} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-1000" />
        </div>
        <div className="bg-secondary flex flex-col justify-center px-12 md:px-16 py-16 md:py-0">
          <Label className="mb-8 block">{SPREAD.author}</Label>
          <blockquote className="text-2xl md:text-3xl font-light leading-[1.55] text-foreground whitespace-pre-line mb-10" style={SERIF}>
            {SPREAD.quote}
          </blockquote>
          <Hairline className="mb-8 w-16" />
          <a href="#" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors" style={SANS}>
            에디터 레터 읽기 <ArrowUpRight size={12} />
          </a>
        </div>
      </section>

      {/* PRODUCT CAROUSEL */}
      <section className="py-20">
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
          <div ref={carouselRef} className="flex gap-7 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {PRODUCTS.map((p) => (
              <article key={p.id} className="group flex-shrink-0 w-64 md:w-72 cursor-pointer">
                <div className="relative overflow-hidden bg-muted mb-5 aspect-[5/6]">
                  <img src={p.image} alt={p.alt} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  <button onClick={() => toggleWish(p.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Heart size={14} className={wishlist.includes(p.id) ? "fill-foreground text-foreground" : "text-foreground"} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-foreground text-background py-3 text-center text-xs tracking-widest" style={SANS}>담기</div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1" style={MONO}>{p.no} · {p.label}</span>
                    <h4 className="text-sm font-medium text-foreground mb-0.5" style={SANS}>{p.name}</h4>
                    <p className="text-xs text-muted-foreground font-light">{p.sub}</p>
                  </div>
                  <span className="text-2xl font-semibold text-foreground shrink-0 ml-3" style={MONO}>₩{p.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-accent text-accent-foreground py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Label className="block mb-6 text-accent-foreground/50">OUR PHILOSOPHY</Label>
          <p className="text-3xl md:text-4xl font-light leading-[1.6] mb-10" style={SERIF}>
            한국의 향을 느껴보세요.<br />당신이 살고 싶은 하루를 선택합니다.
          </p>
          <Hairline className="border-accent-foreground/20 mb-10 max-w-xs mx-auto" />
          <a href="#" className="inline-flex items-center gap-2 text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors" style={SANS}>
            브랜드 이야기 <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      {/* LOOKBOOK */}
      <section className="py-20 max-w-7xl mx-auto px-8">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <Label className="block mb-3">@jipdaum.official</Label>
            <h2 className="text-3xl font-light text-foreground" style={SERIF}>갤러리</h2>
          </div>
        </div>
        <Hairline className="mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=500&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&h=500&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=500&h=500&fit=crop&auto=format",
          ].map((src, i) => (
            <div key={i} className="group overflow-hidden bg-muted aspect-square cursor-pointer relative">
              <img src={src} alt={`리빙 갤러리 ${i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-600" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border py-20 px-8 bg-secondary">
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
    </div>
  );
}

export default Home;
