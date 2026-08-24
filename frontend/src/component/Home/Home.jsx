import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, X, Search, Camera, ShoppingBag, Plus } from "lucide-react";
import "./Home.css";
import ChatBot from "../MyPage/ChatBot";
import LookbookViewer from "./LookbookViewer";
import PhotoReviewViewer from "./PhotoReviewViewer";
import PhotoReviewUploadModal from "./PhotoReviewUploadModal";
import RecentlyViewedSidebar from "./RecentlyViewedSidebar";
import PopularKeywordsSidebar from "../Sidebar/PopularKeywordsSidebar";
import BusinessInfoPanel from "./BusinessInfoPanel";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { NAV_FLAGS } from "../../utils/navFlags";
import rugB from "../../assets/products/(러그) 북유럽풍 러그 B형.jpg";
import woodMoodLamp from "../../assets/products/(무드등) 북유럽풍 우드 무드등.jpg";
import smallMoodLamp from "../../assets/products/(무드등) 북유럽풍 침대 작은 무드등.jpg";
import linenWoodSofa from "../../assets/products/(소파) 린넨 우드 소파.jpg";
import nordicSofa from "../../assets/products/(소파) 북유럽 소파.jpg";
import europeanWoodSofa from "../../assets/products/(소파) 유러피안 우드 소파.jpg";
import linenLaundryBasket from "../../assets/products/(소품) 린넨 빨래 바구니.jpg";
import patternLaundryBasket from "../../assets/products/(소품) 북유럽 문양 빨래 바구니.jpg";
import rugA from "../../assets/products/(소품) 북유럽풍 러그 A형.jpg";
import ecoWoodLaundryBasket from "../../assets/products/(소품) 친환경 우드 빨래 바구니.jpg";
import woodChair from "../../assets/products/(의자) 우드 의자.jpg";
import resortChair from "../../assets/products/(의자) 유럽풍 피서지 의자.jpg";
import nordicBed from "../../assets/products/(침대) 북유럽 침대.jpg";
import pastelPatternBed from "../../assets/products/(침대) 북유럽풍 파스텔 문양 침대.jpg";
import { getCartItems, getPhotoReviews } from "../../api";


const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

export const PRODUCTS = [
  { id: 1, no: "No.1", name: "북유럽풍 러그 B형", sub: "멀티 파스텔 아브스트랙트", price: "168,000", originalPrice: "198,000", label: "BESTSELLER",
    desc: "크림 베이스 위에 블루·올리브·더스티핑크가 어우러진 추상 아라베스크 무늬 터프팅 러그입니다. 두툼한 울 파일감이 발끝에 포근하게 감기고, 어느 벽지·바닥재와도 무난하게 어울려 거실이나 침실 중심에 깔기 좋습니다.",
    spec: "SIZE : W160 D230 · MATERIAL : wool, cotton backing",
    image: rugB, alt: "북유럽풍 러그 B형", brand: "집다움", category: "러그" },
  { id: 2, no: "No.2", name: "북유럽풍 우드 무드등", sub: "내추럴 라탄", price: "118,000", label: "NEW",
    desc: "오크 원목 스탠드에 라탄 케인 원통 갓을 씌운 플로어 조명입니다. 불을 켜면 라탄 사이로 은은한 그물무늬 빛이 새어나와 저녁 시간 거실에 따뜻한 분위기를 더합니다.",
    spec: "SIZE : W38 D38 H118 · MATERIAL : oak, rattan cane",
    image: woodMoodLamp, alt: "북유럽풍 우드 무드등", brand: "집다움", category: "조명" },
  { id: 3, no: "No.3", name: "북유럽풍 침대 작은 무드등", sub: "내추럴 우드 & 자연사", price: "49,000", label: "NEW",
    desc: "원뿔형 원목 다리 위에 천연 마사(자연사)를 촘촘히 감아 만든 미니 무드등입니다. 침대 협탁이나 콘솔 위에 올려두면 아늑한 저녁 조명으로 제격입니다.",
    spec: "SIZE : W20 D20 H32 · MATERIAL : wood, jute rope",
    image: smallMoodLamp, alt: "북유럽풍 침대 작은 무드등", brand: "집다움", category: "조명" },
  { id: 4, no: "No.4", name: "린넨 우드 소파", sub: "샌드 베이지", price: "498,000", originalPrice: "560,000", label: "BESTSELLER",
    desc: "오크 프레임 팔걸이를 자연사로 엮고, 두툼한 린넨 쿠션을 올린 2인용 소파입니다. 담백한 프레임과 부드러운 쿠션감이 균형을 이뤄 거실 어디에 두어도 편안한 무게중심이 됩니다.",
    spec: "SIZE : W165 D80 H78 · MATERIAL : linen, oak, rope",
    image: linenWoodSofa, alt: "린넨 우드 소파", brand: "집다움", category: "소파" },
  { id: 5, no: "No.5", name: "북유럽 소파", sub: "아이보리 부클", price: "780,000", originalPrice: "890,000", label: "NEW",
    desc: "곡선을 그리며 이어지는 프레임에 부클 원단을 두른 라운지형 3인 소파입니다. 낮은 좌면과 넉넉한 팔걸이가 몸을 편안히 감싸 주고, 오브제 같은 실루엣이 거실의 시선을 자연스럽게 붙잡습니다.",
    spec: "SIZE : W240 D95 H70 · MATERIAL : boucle, ash wood",
    image: nordicSofa, alt: "북유럽 소파", brand: "집다움", category: "소파" },
  { id: 6, no: "No.6", name: "유러피안 우드 소파", sub: "머스터드 옐로우", price: "560,000", label: "NEW",
    desc: "라탄 케인을 짜 넣은 등받이와 월넛 톤 원목 프레임이 클래식한 무드를 더하는 3인용 소파입니다. 머스터드 컬러 쿠션이 포인트가 되어 차분한 공간에 생기를 불어넣습니다.",
    spec: "SIZE : W205 D85 H82 · MATERIAL : rattan cane, walnut, cotton",
    image: europeanWoodSofa, alt: "유러피안 우드 소파", brand: "집다움", category: "소파" },
  { id: 7, no: "No.7", name: "린넨 빨래 바구니", sub: "민트 그레이 컬러블록", price: "32,000", label: "ECO",
    desc: "민트, 블루, 아이보리가 컬러블록으로 나뉜 패브릭 빨래 바구니입니다. 가벼운 무광 소재에 메탈 손잡이를 달아 옷방과 욕실을 오가며 들고 다니기 편합니다.",
    spec: "SIZE : W36 D36 H40 · MATERIAL : coated fabric, metal handle",
    image: linenLaundryBasket, alt: "린넨 빨래 바구니", brand: "집다움", category: "소품" },
  { id: 8, no: "No.8", name: "북유럽 문양 빨래 바구니", sub: "내추럴 라탄", price: "45,000", label: "NEW",
    desc: "가는 라탄 가닥을 별무늬로 엮어 짠 바스켓으로, 가죽 손잡이가 포인트를 더합니다. 세탁물 정리는 물론 담요나 잡지꽂이로도 어울리는 다용도 소품입니다.",
    spec: "SIZE : W34 D34 H36 · MATERIAL : rattan, leather handle",
    image: patternLaundryBasket, alt: "북유럽 문양 빨래 바구니", brand: "집다움", category: "소품" },
  { id: 9, no: "No.9", name: "북유럽풍 러그 A형", sub: "아이보리 지오메트릭", price: "128,000", label: "NEW",
    desc: "삼각·다이아몬드 패턴을 세이지, 블루그레이 톤으로 촘촘히 터프팅한 러그입니다. 기하학적인 패턴이 공간에 리듬감을 더해 소파 앞이나 침대 곁 포인트 러그로 잘 어울립니다.",
    spec: "SIZE : W140 D200 · MATERIAL : wool, cotton backing",
    image: rugA, alt: "북유럽풍 러그 A형", brand: "집다움", category: "소품" },
  { id: 10, no: "No.10", name: "친환경 우드 빨래 바구니", sub: "내추럴 라탄 & 가죽", price: "39,000", label: "ECO",
    desc: "천연 라탄을 촘촘히 엮고 가죽 손잡이를 덧댄 친환경 소재 바구니입니다. 옷방, 욕실, 아이 방 등 어디에 두어도 자연스럽게 스며드는 내추럴한 분위기를 냅니다.",
    spec: "SIZE : W38 D38 H40 · MATERIAL : rattan, leather handle",
    image: ecoWoodLaundryBasket, alt: "친환경 우드 빨래 바구니", brand: "집다움", category: "소품" },
  { id: 11, no: "No.11", name: "우드 의자", sub: "내추럴 라탄 케인", price: "219,000", label: "NEW",
    desc: "둥근 라탄 케인 등받이와 오크 프레임이 만나는 자그마한 암체어입니다. 넉넉한 리넨 쿠션을 더해 식탁 의자로도, 침실 코너 체어로도 편안하게 쓸 수 있습니다.",
    spec: "SIZE : W64 D58 H74 · MATERIAL : oak, rattan cane, linen",
    image: woodChair, alt: "우드 의자", brand: "집다움", category: "의자" },
  { id: 12, no: "No.12", name: "유럽풍 피서지 의자", sub: "코냑 브라운 레더 스트랩", price: "268,000", originalPrice: "298,000", label: "BESTSELLER",
    desc: "티크 원목 프레임에 가죽 스트랩을 교차로 엮어 만든 로우 라운지 체어입니다. 낮은 좌면과 여유로운 각도가 휴양지에 온 듯한 편안함을 주어, 테라스나 창가 자리에 잘 어울립니다.",
    spec: "SIZE : W68 D75 H68 · MATERIAL : teak wood, leather strap",
    image: resortChair, alt: "유럽풍 피서지 의자", brand: "집다움", category: "의자" },
  { id: 13, no: "No.13", name: "북유럽 침대", sub: "내추럴 오크", price: "890,000", originalPrice: "1,050,000", label: "BESTSELLER",
    desc: "원목의 결과 라이브 엣지를 살린 헤드보드가 인상적인 플랫폼 침대 프레임입니다. 군더더기 없는 낮은 구조로 침실을 한층 넓고 차분하게 만들어 줍니다.",
    spec: "SIZE : W160 D200 H85 (Q) · MATERIAL : solid oak",
    image: nordicBed, alt: "북유럽 침대", brand: "집다움", category: "침대" },
  { id: 14, no: "No.14", name: "북유럽풍 파스텔 문양 침대", sub: "멀티 파스텔 아브스트랙트", price: "950,000", label: "NEW",
    desc: "블루, 세이지, 로즈 톤의 추상 패턴 패브릭으로 감싼 업홀스터리 침대입니다. 높은 헤드보드가 침실의 포인트가 되어 주고, 부드러운 패딩감이 등을 편안하게 받쳐줍니다.",
    spec: "SIZE : W165 D210 H130 (Q) · MATERIAL : polyester fabric, wood frame",
    image: pastelPatternBed, alt: "북유럽풍 파스텔 문양 침대", brand: "집다움", category: "침대" },
];

const PRODUCT_CATEGORIES = ["전체", "소파", "의자", "침대", "조명", "러그", "소품"];

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

// 한국관 에세이(4페이지) 배경 위에 흩날리는 무궁화 꽃잎
const ESSAY_PETALS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 6.3 + 2) % 100,
  delay: (i * 0.78) % 9,
  duration: 9 + ((i * 1.63) % 5),
  scale: 0.7 + ((i * 0.47) % 0.7),
}));

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
  const [photoReviews, setPhotoReviews] = useState([]);
  const [photoReviewViewerIndex, setPhotoReviewViewerIndex] = useState(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [cartCounts, setCartCounts] = useState({});

  // 구매자가 올린 포토리뷰(사진 첨부된 리뷰) — 룩북 갤러리 패널에 실제 데이터로 보여준다.
  const loadPhotoReviews = () => {
    getPhotoReviews()
      .then((res) => setPhotoReviews(res.data))
      .catch(() => {});
  };
  useEffect(() => {
    loadPhotoReviews();
  }, []);
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed());
  const navigate = useNavigate();

  // 다른 탭/페이지에서 "최근 본 상품"이 바뀌면(상품 상세 진입, 삭제 등) 동기화한다.
  // 상품 그리드 패널까지 스크롤해야만 뜨게 해두면 인트로 영상 구간이 많아 체감상
  // 너무 늦게 보이므로, 홈 페이지 안에서는 위치 상관없이 바로 보이게 한다.
  useEffect(() => {
    const sync = () => setRecentlyViewed(getRecentlyViewed());
    window.addEventListener("recentlyviewedchange", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recentlyviewedchange", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

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
  // 인트로 영상 — 도어인트로가 끝나기 전엔 재생하지 않는다. 그 뒤로는 이 페이지에
  // 들어올 때마다(스크롤로 다시 돌아와도) 처음부터 재생하고, 끝나면 소파 사진으로 전환한다.
  const introVideoRef = useRef(null);
  const [introVideoEnded, setIntroVideoEnded] = useState(false);
  const [doorIntroDone, setDoorIntroDone] = useState(false);

  useEffect(() => {
    const onDoorIntroEnd = () => setDoorIntroDone(true);
    window.addEventListener("doorintroend", onDoorIntroEnd);
    return () => window.removeEventListener("doorintroend", onDoorIntroEnd);
  }, []);

  useEffect(() => {
    const el = document.getElementById("home-essay");
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!doorIntroDone) return;
          setIntroVideoEnded(false);
          const v = introVideoRef.current;
          if (v) {
            v.currentTime = 0;
            v.play().catch(() => {});
          }
        } else {
          setIntroVideoEnded(false);
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [doorIntroDone]);

  // 두 번째(복제) 페이지 — 영상 없이 소파 사진에 켄 번즈 확대 연출만 준다. 페이지에
  // 들어올 때마다 연출을 처음부터 다시 보여준 뒤, 눈에 들어올 시간이 지나면 에세이를 펼친다.
  const [introVideo2Ended, setIntroVideo2Ended] = useState(false);
  const [essay2PlayKey, setEssay2PlayKey] = useState(0);

  useEffect(() => {
    const el = document.getElementById("home-essay-2");
    if (!el) return;

    let revealTimer;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(revealTimer);
        if (entry.isIntersecting) {
          setIntroVideo2Ended(false);
          setEssay2PlayKey((k) => k + 1);
          revealTimer = setTimeout(() => setIntroVideo2Ended(true), 3000);
        } else {
          setIntroVideo2Ended(false);
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(revealTimer);
    };
  }, []);

  // 세 번째 인트로 영상("집다움.mp4") — 이 페이지에 처음 들어올 때 딱 한 번만 재생한다.
  const introVideo3Ref = useRef(null);
  const [introVideo3Ended, setIntroVideo3Ended] = useState(false);
  const introVideo3Started = useRef(false);

  useEffect(() => {
    const el = document.getElementById("home-essay-3");
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || introVideo3Started.current) return;
        introVideo3Started.current = true;
        introVideo3Ref.current?.play().catch(() => {});
        io.disconnect();
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 네 번째(한국관 배너) 영상("jipdaum-hanok.mp4") — 이 페이지에 처음 들어올 때 딱
  // 한 번만 재생하고, 끝나면 왼쪽에 한국관으로 초대하는 에세이가 펼쳐진다.
  const introVideo4Ref = useRef(null);
  const [introVideo4Ended, setIntroVideo4Ended] = useState(false);
  const introVideo4Started = useRef(false);

  useEffect(() => {
    const el = document.getElementById("home-essay-4");
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || introVideo4Started.current) return;
        introVideo4Started.current = true;
        introVideo4Ref.current?.play().catch(() => {});
        io.disconnect();
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 첫 번째 인트로 영상이 끝나 에세이가 펼쳐진 뒤 7초 있다가, 사용자가 아직
  // 그 페이지에 머물러 있으면 (복제된) 두 번째 인트로 페이지로 스크롤한다.
  useEffect(() => {
    if (!introVideoEnded) return;

    const holdTimer = setTimeout(() => {
      const essayEl = document.getElementById("home-essay");
      const stillOnEssay = essayEl && Math.abs(essayEl.getBoundingClientRect().left) < 50;
      if (stillOnEssay && window.lenis) {
        const target = document.querySelectorAll("[data-hsnap]")[1];
        if (target) {
          window.lenis.resize();
          window.lenis.scrollTo(target, {
            duration: 5.3,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        }
      }
    }, 7000);

    return () => clearTimeout(holdTimer);
  }, [introVideoEnded]);

  // 두 번째(복제) 페이지의 에세이가 펼쳐진 뒤 7초 있다가, 사용자가 아직 그 페이지에
  // 머물러 있으면 세 번째 인트로 페이지로 스크롤한다.
  useEffect(() => {
    if (!introVideo2Ended) return;

    const holdTimer = setTimeout(() => {
      const essayEl = document.getElementById("home-essay-2");
      const stillOnEssay = essayEl && Math.abs(essayEl.getBoundingClientRect().left) < 50;
      if (stillOnEssay && window.lenis) {
        const target = document.querySelectorAll("[data-hsnap]")[2];
        if (target) {
          window.lenis.resize();
          window.lenis.scrollTo(target, {
            duration: 5.3,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            onComplete: () => {
              // 세 번째 영상은 한 번만 재생하므로, 이미 재생을 시작했다면 다시 되돌리지 않는다.
              if (introVideo3Started.current) return;
              introVideo3Started.current = true;
              introVideo3Ref.current?.play().catch(() => {});
            },
          });
        }
      }
    }, 7000);

    return () => clearTimeout(holdTimer);
  }, [introVideo2Ended]);

  // 세 번째 인트로 영상도 끝나고 7초 있다가, 사용자가 아직 그 페이지에
  // 머물러 있으면 네 번째(한국관 배너) 페이지로 스크롤한다.
  useEffect(() => {
    if (!introVideo3Ended) return;

    const holdTimer = setTimeout(() => {
      const essayEl = document.getElementById("home-essay-3");
      const stillOnEssay = essayEl && Math.abs(essayEl.getBoundingClientRect().left) < 50;
      if (stillOnEssay && window.lenis) {
        const target = document.querySelectorAll("[data-hsnap]")[3];
        if (target) {
          window.lenis.resize();
          window.lenis.scrollTo(target, {
            duration: 5.3,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            onComplete: () => {
              // 네 번째 영상도 한 번만 재생하므로, 이미 재생을 시작했다면 다시 되돌리지 않는다.
              if (introVideo4Started.current) return;
              introVideo4Started.current = true;
              introVideo4Ref.current?.play().catch(() => {});
            },
          });
        }
      }
    }, 7000);

    return () => clearTimeout(holdTimer);
  }, [introVideo3Ended]);

  // 네 번째(한국관 배너) 영상도 끝나고 에세이가 펼쳐진 뒤 7초 있다가, 사용자가 아직
  // 그 페이지에 머물러 있으면 상품 페이지로 스크롤한다.
  useEffect(() => {
    if (!introVideo4Ended) return;

    const holdTimer = setTimeout(() => {
      const essayEl = document.getElementById("home-essay-4");
      const stillOnEssay = essayEl && Math.abs(essayEl.getBoundingClientRect().left) < 50;
      if (stillOnEssay && window.lenis) {
        const target = document.querySelectorAll("[data-hsnap]")[4];
        if (target) {
          window.lenis.resize();
          window.lenis.scrollTo(target, {
            duration: 5.3,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        }
      }
    }, 7000);

    return () => clearTimeout(holdTimer);
  }, [introVideo4Ended]);

  const scrollToProductGrid = () => {
    const target = document.querySelectorAll("[data-hsnap]")[4];
    if (!target) return;
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
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

  // 인트로 영상 옆에 연결해 보여줄 상품 — 영상 속 거실 장면에 어울리는 북유럽 소파
  const featuredProduct = PRODUCTS.find((p) => p.id === 5);

  // 도어인트로를 지나 홈에 들어오면 기본적으로 1번째 패널(에세이)에서 시작한다.
  // (HERO가 전체 상품 페이지 앞으로 옮겨가면서 에세이가 첫 패널이 됨)
  // 사이드바의 "홈"/"상품" 버튼으로 진입한 경우엔 각자 원하는 패널로 직접 이동하므로 건너뛴다.
  useEffect(() => {
    if (sessionStorage.getItem(NAV_FLAGS.SKIP_HOME_DEFAULT_PANEL)) {
      sessionStorage.removeItem(NAV_FLAGS.SKIP_HOME_DEFAULT_PANEL);
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
    <div className="home relative bg-background text-foreground flex flex-row" style={SANS}>

      {/* ESSAY SPREAD — 처음엔 영상이 화면 전체를 채우고, 영상이 끝나면 마지막 장면
          그대로 절반으로 줄어들고, 나머지 절반은 에세이(상품 구매 유도) 페이지가 자연스럽게 펼쳐진다 */}
      <section id="home-essay" data-hide-header data-hsnap className="w-screen h-screen shrink-0 overflow-hidden flex flex-row text-foreground">
        <div
          className="relative h-full overflow-hidden"
          style={{
            width: introVideoEnded ? "50%" : "100%",
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <video
            ref={introVideoRef}
            className="w-full h-full object-cover"
            src="/videos/jipdaum%20video(1).mp4"
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroVideoEnded(true)}
          />
        </div>

        <div
          className="sparkleBg holoMesh relative h-full flex flex-col items-start justify-center overflow-hidden"
          style={{
            width: introVideoEnded ? "50%" : "0%",
            opacity: introVideoEnded ? 1 : 0,
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease-in-out 0.5s",
          }}
        >
          <div className="relative z-10 w-full max-w-md px-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5 whitespace-nowrap" style={MONO}>
              WELCOME TO JIPDAUM
            </p>
            <h3 className="text-3xl md:text-4xl font-light leading-snug mb-6 whitespace-nowrap" style={SERIF}>
              집다움에 오신 것을 환영합니다
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-10 whitespace-nowrap">
              따뜻한 나만의 집다움을 느낄 수 있도록
              <br />
              바로 집다움의 상품을 확인하세요
            </p>
            <button
              type="button"
              onClick={scrollToProductGrid}
              className="px-8 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:opacity-85 transition-opacity whitespace-nowrap"
              style={SANS}
            >
              상품 보러가기 →
            </button>
          </div>
        </div>
      </section>

      {/* ESSAY SPREAD (복제) — 위 페이지와 좌우가 뒤바뀐 두 번째 페이지. 영상 없이 소파
          사진에 켄 번즈 확대 연출만 주고, 화면에 들어와 잠시 지나면 에세이가 왼쪽에 펼쳐진다 */}
      <section id="home-essay-2" data-hide-header data-hsnap className="w-screen h-screen shrink-0 overflow-hidden flex flex-row text-foreground">
        <div
          className="sparkleBg holoMesh relative h-full flex flex-col items-start justify-center overflow-hidden"
          style={{
            width: introVideo2Ended ? "50%" : "0%",
            opacity: introVideo2Ended ? 1 : 0,
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease-in-out 0.5s",
          }}
        >
          <div className="relative z-10 w-full max-w-md px-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5 whitespace-nowrap" style={MONO}>
              FEATURED IN THIS SCENE
            </p>
            <h3 className="text-3xl md:text-4xl font-light leading-snug mb-6 whitespace-nowrap" style={SERIF}>
              사진 속 공간에 놓인
              <br />
              {featuredProduct.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-10 whitespace-nowrap">
              사진에 등장한 상품을 지금 바로 만나보세요.
              <br />
              사진에 관련된 상품을 구매할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/item/${featuredProduct.id}`)}
              className="px-8 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:opacity-85 transition-opacity whitespace-nowrap"
              style={SANS}
            >
              상품 보러가기 →
            </button>
          </div>
        </div>

        <div
          className="relative h-full overflow-hidden"
          style={{
            width: introVideo2Ended ? "50%" : "100%",
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            key={essay2PlayKey}
            src={nordicSofa}
            alt="북유럽 소파"
            className="essaySofaKenBurns w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ESSAY SPREAD 3 — 집다움.mp4, 끝나면 오른쪽 절반에 브랜드 무드 문구가 펼쳐진다 */}
      <section id="home-essay-3" data-hide-header data-hsnap className="w-screen h-screen shrink-0 overflow-hidden flex flex-row text-foreground">
        <div
          className="relative h-full overflow-hidden"
          style={{
            width: introVideo3Ended ? "50%" : "100%",
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <video
            ref={introVideo3Ref}
            className="w-full h-full object-cover"
            src="/videos/jipdaum-brand.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroVideo3Ended(true)}
          />
        </div>

        <div
          className="sparkleBg holoMesh relative h-full flex flex-col items-start justify-center overflow-hidden"
          style={{
            width: introVideo3Ended ? "50%" : "0%",
            opacity: introVideo3Ended ? 1 : 0,
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease-in-out 0.5s",
          }}
        >
          <div className="relative z-10 w-full max-w-md px-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5 whitespace-nowrap" style={MONO}>
              WELCOME TO JIPDAUM
            </p>
            <h3 className="text-3xl md:text-4xl font-light leading-snug whitespace-nowrap" style={SERIF}>
              아늑한 공간, 편안한 느낌
              <br />
              집다움으로 오세요
            </h3>
          </div>
        </div>
      </section>

      {/* KOREAN HALL BANNER — 전체 상품(검색) 페이지 바로 앞에 배치. 처음엔 한옥 영상이
          화면 전체를 채우고, 영상이 끝나면 왼쪽에 한국관으로 초대하는 에세이가 펼쳐진다 */}
      <section id="home-essay-4" data-hide-header data-hsnap className="w-screen h-screen shrink-0 overflow-hidden flex flex-row text-foreground">
        <div
          className="sparkleBg hanjiMesh relative h-full flex flex-col items-start justify-center overflow-hidden"
          style={{
            width: introVideo4Ended ? "50%" : "0%",
            opacity: introVideo4Ended ? 1 : 0,
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease-in-out 0.5s",
          }}
        >
          <div className="essayPetals" aria-hidden="true">
            {ESSAY_PETALS.map((p, i) => (
              <span
                key={i}
                className="essayPetal"
                style={{
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  "--petalScale": p.scale,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 w-full max-w-md px-16">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-5 whitespace-nowrap" style={MONO}>
              THE KOREAN HALL
            </p>
            <h3 className="text-3xl md:text-4xl font-light leading-snug mb-6 whitespace-nowrap" style={SERIF}>
              집다움 한국관으로
              <br />
              오세요
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-10 whitespace-nowrap">
              한지, 나전, 도자의 결을 담은 한국 전통의 미감.
              <br />
              한국관에서 집다움만의 공간을 만나보세요.
            </p>
            <button
              type="button"
              onClick={() => navigate("/korean-hall")}
              className="px-8 py-3.5 bg-foreground text-background text-sm font-medium tracking-wide hover:opacity-85 transition-opacity whitespace-nowrap"
              style={SANS}
            >
              한국관 바로가기 →
            </button>
          </div>
        </div>

        <div
          className="relative h-full overflow-hidden"
          style={{
            width: introVideo4Ended ? "50%" : "100%",
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <video
            ref={introVideo4Ref}
            className="w-full h-full object-cover"
            src="/videos/jipdaum-hanok.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroVideo4Ended(true)}
          />
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section
        id="home-products"
        data-hsnap
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto overscroll-contain flex flex-col justify-start py-20 px-8"
      >
        {/* z-30 — 아래 상품 그리드 래퍼도 z-10이라, 같은 값이면 DOM 순서상 나중에 오는
            그리드가 인기 검색어 드롭다운을 덮어버린다(같은 값끼리는 각자 안의 z-index가
            아니라 그냥 뒤에 오는 요소가 이긴다). 확실히 더 높여서 덮이지 않게 함. */}
        <div className="relative z-30 max-w-7xl mx-auto w-full mb-10 flex items-end justify-end gap-4 flex-wrap">
          <div className="relative w-full sm:w-72">
            <div className="flex items-center gap-2 border-b border-foreground pb-2">
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

            {/* 검색창 바로 아래 항상 붙어있는 인기 검색어 미니바(자동 롤링) */}
            <PopularKeywordsSidebar onSelect={setProductSearchQuery} />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full mb-8 flex items-center gap-2 flex-wrap">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
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
              <article key={p.id} className="group cursor-pointer" onClick={() => navigate(`/item/${p.id}`)}>
                <div className="relative overflow-hidden bg-muted mb-3 aspect-[5/6]">
                  <img src={p.image} alt={p.alt} className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-700" />
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
      {/* justify-center + overflow-y-auto 조합은 콘텐츠가 뷰포트보다 길어지면 위쪽이
          스크롤로 안 닿는 흔한 플렉스박스 버그가 있다(#home-products처럼 justify-start로
          맞춰야 포토리뷰 섹션이 추가된 지금 길이에서도 끝까지 스크롤된다).
          data-lenis-prevent + onWheel stopPropagation도 #home-products와 동일하게 —
          이게 없으면 Lenis가 휠 입력을 가로채 좌우 패널 전환으로 먼저 처리해버려서
          이 패널 안에서 위아래로 스크롤하려 해도 옆 패널로 슬라이드되곤 했다. */}
      <section
        data-hsnap
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto overscroll-contain flex flex-col justify-start"
      >
        <div className="max-w-7xl mx-auto px-8 py-20 w-full">
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

          {/* 구매자 포토리뷰 — 위 큐레이션 사진과 구분해서 별도 섹션으로 둔다.
              위쪽은 관리자가 고른 무드 사진(LookbookViewer가 가짜 좋아요/댓글까지 꾸며서 보여줌),
              아래는 실제 리뷰 데이터라 그 둘을 섞지 않는다. */}
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-foreground" style={SERIF}>고객님이 올린 사진</h3>
                <p className="text-xs text-muted-foreground mt-1" style={MONO}>집다움 상품으로 꾸민 우리 집을 자랑해보세요</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoUploadModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-foreground text-foreground text-xs tracking-widest px-4 py-2 hover:bg-foreground hover:text-background transition-colors shrink-0"
                style={SANS}
              >
                <Plus size={13} />
                사진 올리기
              </button>
            </div>

            {photoReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10" style={SANS}>
                아직 등록된 사진이 없어요. 첫 번째 사진을 올려보세요!
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {photoReviews.map((review, i) => (
                  <button
                    type="button"
                    key={review.id}
                    onClick={() => setPhotoReviewViewerIndex(i)}
                    className="group overflow-hidden bg-muted aspect-square cursor-pointer relative"
                  >
                    <img
                      src={review.review_image_url}
                      alt={`${review.user_nickname}님이 올린 사진`}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-600"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
                    <span
                      className="absolute bottom-1.5 left-2 text-[10px] text-white drop-shadow"
                      style={MONO}
                    >
                      {review.user_nickname}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <BusinessInfoPanel />

      {showPhotoUploadModal && (
        <PhotoReviewUploadModal
          products={PRODUCTS}
          onClose={() => setShowPhotoUploadModal(false)}
          onUploaded={loadPhotoReviews}
        />
      )}

      {photoReviewViewerIndex !== null && (
        <PhotoReviewViewer
          reviews={photoReviews}
          index={photoReviewViewerIndex}
          onClose={() => setPhotoReviewViewerIndex(null)}
          onNavigate={setPhotoReviewViewerIndex}
        />
      )}

      {lookbookViewerIndex !== null && (
        <LookbookViewer
          photos={LOOKBOOK_PHOTOS}
          index={lookbookViewerIndex}
          onClose={() => setLookbookViewerIndex(null)}
          onNavigate={setLookbookViewerIndex}
        />
      )}

      {recentlyViewed.length > 0 && (
        <RecentlyViewedSidebar
          items={recentlyViewed}
          onChange={() => setRecentlyViewed(getRecentlyViewed())}
        />
      )}

      <ChatBot />
    </div>
  );
}

export default Home;
