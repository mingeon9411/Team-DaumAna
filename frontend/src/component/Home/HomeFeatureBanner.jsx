import "./HomeFeatureBanner.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { getReviews } from "../../api";

const SERIF = { fontFamily: "'GmarketSans', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

// "추천 상품"은 인기/리뷰/할인처럼 수치로 정해지는 게 아니라 직접 고르는
// 자리라 상품 id를 못박아둔다 — 다크 브라운 고급 소파(No.35). 카탈로그에서
// 빠지는 등 못 찾으면 예전처럼 NEW 라벨 중 아무거나로 자연스럽게 대체된다.
const RECOMMENDED_PRODUCT_ID = 35;

// 인기/추천/할인 3장은 이미 있는 데이터로 바로 고를 수 있다 — 같은 상품이
// 두 칸에 겹쳐 보이지 않도록 고를 때마다 usedIds에 표시해가며 순서대로 뽑는다.
// (리뷰 많은 상품은 API 응답이 있어야 알 수 있어 컴포넌트 쪽에서 별도로 뽑는다.)
function pickBaseFeatured(products) {
  const usedIds = new Set();
  const pick = (predicate) => {
    const found = products.find((p) => !usedIds.has(p.id) && predicate(p));
    if (found) usedIds.add(found.id);
    return found;
  };

  const popularProduct = pick((p) => p.label === "BESTSELLER");
  const recommendedProduct = pick((p) => p.id === RECOMMENDED_PRODUCT_ID) || pick((p) => p.label === "NEW");

  const discountPct = (p) => {
    const priceNum = Number(p.price.replace(/,/g, ""));
    const originalNum = p.originalPrice ? Number(p.originalPrice.replace(/,/g, "")) : 0;
    return originalNum > priceNum ? Math.round((1 - priceNum / originalNum) * 100) : 0;
  };
  const discountProduct = products
    .filter((p) => !usedIds.has(p.id) && discountPct(p) > 0)
    .sort((a, b) => discountPct(b) - discountPct(a))[0];
  if (discountProduct) usedIds.add(discountProduct.id);

  return { popularProduct, recommendedProduct, discountProduct, usedIds };
}

// 홈 히어로 배너(HomeHeroBanner.jsx) 바로 아래에 놓는 이케아류 5칸 배너 —
// 왼쪽은 브랜드 필름 영상, 오른쪽 4칸은 인기/추천/리뷰 많은/할인 상품 각 1개.
// products는 Home.jsx가 이미 들고 있는 PRODUCTS를 그대로 넘겨받는다 — 여기서
// "./Home"을 직접 import하면 Home.jsx→이 파일→Home.jsx로 순환 참조가 생긴다
// (HomeHeroBanner.jsx가 같은 이유로 PRODUCTS 대신 자체 이미지를 쓰는 것과 동일한 사정).
function HomeFeatureBanner({ products }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const { popularProduct, recommendedProduct, discountProduct, usedIds } = useMemo(
    () => pickBaseFeatured(products),
    [products]
  );

  // 리뷰 많은 상품 — 상품별 리뷰 수를 캐싱해두는 API가 따로 없어서, 홈 진입
  // 시 한 번 전체 상품의 리뷰를 병렬로 조회해 실제 1위를 계산한다.
  const [reviewedProduct, setReviewedProduct] = useState(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      products.filter((p) => !usedIds.has(p.id)).map((p) =>
        getReviews(p.id)
          .then((res) => ({ product: p, count: Array.isArray(res.data) ? res.data.length : 0 }))
          .catch(() => ({ product: p, count: 0 }))
      )
    ).then((results) => {
      if (cancelled || results.length === 0) return;
      const best = results.reduce((top, cur) => (cur.count > top.count ? cur : top));
      setReviewedProduct(best.product);
    });
    return () => { cancelled = true; };
  }, [products, usedIds]);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setPlaying((v) => !v);
  };

  const cards = [
    { tag: "인기 많은 상품", product: popularProduct },
    { tag: "추천 상품", product: recommendedProduct },
    { tag: "리뷰 많은 상품", product: reviewedProduct },
    { tag: "할인 많은 상품", product: discountProduct },
  ];

  return (
    <div className="featBannerGrid">
      <div className="featBannerVideo">
        <video
          ref={videoRef}
          className="featBannerVideoEl"
          src="/videos/jipdaum-brand.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <span className="featBannerNewBadge" style={MONO}>New</span>
        <button
          type="button"
          className="featBannerPauseBtn"
          onClick={toggleVideo}
          aria-label={playing ? "영상 일시정지" : "영상 재생"}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <p className="featBannerCaption" style={SERIF}>집다움이 만드는 공간, 브랜드 필름</p>
      </div>

      {cards.map((c, i) =>
        c.product ? (
          <button
            type="button"
            key={c.product.id}
            className={`featBannerCard featBannerCard-${i + 1}`}
            onClick={() => navigate(`/item/${c.product.id}`)}
          >
            {/* 스튜디오 컷과 인테리어 컷을 한 자리에 겹쳐두고, CSS 애니메이션으로
                번갈아 크로스페이드 — ProductCard(Home.jsx)는 마우스를 올려야
                바뀌지만, 이 배너는 훑어보고 지나가는 자리라 저절로 순환시킨다. */}
            <span className="featBannerCardImgWrap">
              <img src={c.product.image} alt={c.product.name} className="featBannerCardImg" />
              {c.product.interiorImage && (
                <img src={c.product.interiorImage} alt="" aria-hidden="true" className="featBannerCardImg featBannerCardImgInterior" />
              )}
            </span>
            <span className="featBannerCardTag" style={MONO}>{c.tag}</span>
            <span className="featBannerCardInfo">
              <span className="featBannerCardName" style={SANS}>{c.product.name}</span>
              <span className="featBannerCardPrice" style={MONO}>₩{c.product.price}</span>
            </span>
          </button>
        ) : (
          // 리뷰 조회가 끝나기 전(또는 해당 조건의 상품이 없을 때) 자리만 비워둔다 —
          // 그리드 칸이 갑자기 사라졌다 나타나면 배너가 덜컹거려 보인다.
          <div key={c.tag} className={`featBannerCard featBannerCard-${i + 1} featBannerCardEmpty`} />
        )
      )}
    </div>
  );
}

export default HomeFeatureBanner;
