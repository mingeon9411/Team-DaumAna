import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import "./KoreanHall.css";
import products from "../../data/products";
import ChatBot from "../MyPage/ChatBot";
import PopularKeywordsSidebar from "../Sidebar/PopularKeywordsSidebar";
import RecentlyViewedSidebar from "../Home/RecentlyViewedSidebar";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { NAV_FLAGS } from "../../utils/navFlags";
import irworobongdo from "../../assets/decor/irworobongdo.svg";

const FILM_SOURCES = ["/videos/jipdaum-hanok.mp4", "/videos/jipdaum-kor.mp4"];
const PRODUCT_CATEGORIES = ["전체", "소파", "테이블", "조명", "수납", "소품"];

// 한국관 전용 인기 검색어 — Home.jsx의 MOCK_KEYWORDS와 마찬가지로 실제 products(위 배열)
// 상품명 속 문구로만 골랐다. 클릭하면 productSearchQuery로 들어가 아래 그리드가 바로 필터링된다.
const KH_POPULAR_KEYWORDS = [
  { rank: 1, keyword: "한지 무드 조명", status: "up" },
  { rank: 2, keyword: "평상 소파", status: "new" },
  { rank: 3, keyword: "서안청 책장", status: "new" },
  { rank: 4, keyword: "월넛 사이드 테이블", status: "same" },
  { rank: 5, keyword: "한지 펜던트 조명", status: "up" },
  { rank: 6, keyword: "나비 문양 수납장", status: "down" },
  { rank: 7, keyword: "꽃잎 화병", status: "new" },
];

function KoreanHall() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const filmVideoRef = useRef(null);
  const gridRef = useRef(null);
  const [filmIndex, setFilmIndex] = useState(0);
  const [filmEnded, setFilmEnded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedMid, setSelectedMid] = useState("전체");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed("korean-hall"));

  // Home.jsx와 동일한 패턴 — 상품 상세 진입/삭제 등으로 다른 곳에서 바뀌면 동기화한다.
  // namespace가 분리돼 있어(recentlyViewedKoreanHall) 메인 페이지 기록과 섞이지 않는다.
  useEffect(() => {
    const sync = () => setRecentlyViewed(getRecentlyViewed("korean-hall"));
    window.addEventListener("recentlyviewedchange", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recentlyviewedchange", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // 대분류를 고를 때만 그 안의 중분류 목록이 의미가 있다 — 전체 보기에선 중분류 탭 자체를 숨긴다.
  const midOptions =
    selectedCategory === "전체"
      ? []
      : [...new Set(products.filter((p) => p.category === selectedCategory).map((p) => p.midCategory))];

  const filteredProducts = (() => {
    const q = productSearchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "전체" || p.category === selectedCategory;
      const matchesMid = selectedMid === "전체" || p.midCategory === selectedMid;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesCategory && matchesMid && matchesQuery;
    });
  })();

  useEffect(() => {
    if (filmIndex === 0) return;
    filmVideoRef.current?.play().catch(() => {});
  }, [filmIndex]);

  // 상품 상세페이지의 "목록으로" 버튼으로 돌아온 경우, 대문·필름 인트로를 다시
  // 보여주지 않고 상품 목록으로 바로 스크롤한다 (Home.jsx의 skipHomeDefaultPanel과 동일한 패턴).
  useEffect(() => {
    if (!sessionStorage.getItem(NAV_FLAGS.SKIP_KOREAN_HALL_INTRO)) return;
    sessionStorage.removeItem(NAV_FLAGS.SKIP_KOREAN_HALL_INTRO);
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFilmEnded = () => {
    if (filmIndex < FILM_SOURCES.length - 1) {
      setFilmIndex((i) => i + 1);
    } else {
      setFilmEnded(true);
    }
  };

  // data-lenis-prevent로 전역 Lenis(App.jsx, 가로 패널 스냅용)는 이 페이지를 건너뛰고
  // 브라우저 기본 스크롤에 맡겨져 있었다 — 그래서 휠 스크롤이 뚝뚝 끊기는 느낌이었다.
  // 이 페이지 전용으로 별도 Lenis 인스턴스를 붙여 부드러운 관성 스크롤을 준다.
  useEffect(() => {
    const wrapper = pageRef.current;
    if (!wrapper) return;
    const lenis = new Lenis({
      wrapper,
      content: wrapper,
      duration: 1.8,
      smoothWheel: true,
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);

  return (
    <div className="khPage" data-hsnap data-lenis-prevent ref={pageRef}>
      <img src={irworobongdo} alt="" aria-hidden="true" className="khWatermark" />
      <div className="khIntro">
        <span className="khLabel">KOREAN HALL</span>
        <h2 className="khTitle">한국관</h2>
        <span className="khHairline" />
        <p className="khDesc">
          한국 전통의 결과 멋을 담은 집다움의 큐레이션.
          <br />
          한지, 나전, 도자의 미감을 현대의 공간에 맞게 다시 그렸습니다.
        </p>
      </div>

      <div className={`khFilm${filmEnded ? " khFilmClosed" : ""}`}>
        <video
          ref={filmVideoRef}
          className="khFilmVideo"
          src={FILM_SOURCES[filmIndex]}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleFilmEnded}
        />
        <div className="khFilmOverlay" />
        <div className="khFilmCaption">
          <span className="khLabel">A MOMENT IN HANOK</span>
          <p className="khFilmText">
            처마 끝에 머무는 볕과 결,
            <br />
            한국관이 담은 공간의 온도.
          </p>
          <span className="khHairline" />
        </div>
      </div>

      <section className="khGridSection" ref={gridRef}>
        <div className="khCategoryMenu">
          <div className="khKeywordWrap">
            <PopularKeywordsSidebar data={KH_POPULAR_KEYWORDS} onSelect={setProductSearchQuery} />
          </div>

          <div className="khCategoryList">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`khCategoryBtn${selectedCategory === cat ? " active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedMid("전체");
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 중분류 탭 — 대분류 안에 세부 유형이 둘 이상일 때만 뜬다. khCategoryMenu 안에 둬야
              sticky 헤더와 같이 붙어 움직인다(밖에 두면 스크롤 시 헤더 밑으로 가려짐). */}
          {midOptions.length > 1 && (
            <div className="khCategoryList khCategoryList--sub">
              {["전체", ...midOptions].map((mid) => (
                <button
                  key={mid}
                  type="button"
                  className={`khCategoryBtn khCategoryBtn--sub${selectedMid === mid ? " active" : ""}`}
                  onClick={() => setSelectedMid(mid)}
                >
                  {mid}
                </button>
              ))}
            </div>
          )}
        </div>

        {productSearchQuery && (
          <p className="khSearchNotice">
            "{productSearchQuery}" 검색 결과 {filteredProducts.length}건
            <button type="button" className="khSearchClear" onClick={() => setProductSearchQuery("")}>
              검색 해제
            </button>
          </p>
        )}

        <ul className="khGrid">
          {filteredProducts.map((product) => (
            <li key={product.id} className="khCard">
              <button
                type="button"
                className="khCardLink"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="khImgWrap">
                  <img src={product.image} alt={product.name} className="khImg" />
                </div>
                <div className="khInfo">
                  <p className="khName">{product.name}</p>
                  <p className="khProductDesc">{product.desc}</p>
                  <p className="khPrice">{product.price.toLocaleString()}원</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {recentlyViewed.length > 0 && (
        <RecentlyViewedSidebar
          items={recentlyViewed}
          onChange={() => setRecentlyViewed(getRecentlyViewed("korean-hall"))}
          detailBasePath="/product"
          namespace="korean-hall"
          variant="korean-hall"
        />
      )}

      <ChatBot
        catalog={products}
        detailBasePath="/product"
        variant="korean-hall"
        botName="한국관 도우미"
        greeting={"어서 오세요, 한국관입니다 🏯\n한옥의 정취를 담은 상품을 안내해드릴게요."}
      />
    </div>
  );
}

export default KoreanHall;
