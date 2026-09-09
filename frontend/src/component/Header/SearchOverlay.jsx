import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Heart, X } from "lucide-react";
import { PopularKeywordsList, MOCK_KEYWORDS } from "../Sidebar/PopularKeywordsSidebar";
import { removeRecentSearch, clearRecentSearches } from "../../utils/recentSearches";
import { PRODUCTS } from "../Home/Home";
import { getMostLikedPost } from "../Lookbook/posts";
import { loadRecentlyViewed } from "../../utils/recentlyViewed";
import "./SearchOverlay.css";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };

// 검색 전 빈 화면을 게시판(코르크보드)처럼 채우는 카드들 — 핀으로 꽂아둔
// 종이처럼 살짝씩 다르게 기울인다. 카드 개수가 늘어도 순환하도록 넉넉히 잡아둠.
const ROTATIONS = [-4, 3, -2, 5, -5, 2, -3, 4, -2.5, 3.5];
const rotFor = (i) => `${ROTATIONS[i % ROTATIONS.length]}deg`;

/**
 * 29CM 검색 모달 레퍼런스 — 검색 아이콘을 누르면 화면 전체를 덮는 오버레이가
 * 뜨고, 그 안에 큰 검색창과 인기 검색어 전체 목록(없으면 최근 검색어)이 뜬다.
 * Header.jsx의 인라인 확장 방식(헤더 배너 안에서 살짝 커지던 것)을 대체한다.
 *
 * @param {{
 *   query: string, onQueryChange: (v: string) => void, onSubmit: (v: string) => void,
 *   onClose: () => void, recentSearches: string[], setRecentSearches: (v: string[]) => void,
 * }} props
 */
export default function SearchOverlay({ query, onQueryChange, onSubmit, onClose, recentSearches, setRecentSearches }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // 코르크보드 카드용 데이터 — 인기 상품 몇 개, 좋아요 제일 많은 룩북 1개,
  // 최근 본 상품 몇 개. 검색어를 입력하기 전(빈 화면)에만 보여준다.
  const popularProducts = PRODUCTS.filter((p) => p.label === "BESTSELLER").slice(0, 3);
  const featuredPost = getMostLikedPost();
  const featuredCover = featuredPost ? PRODUCTS.find((p) => p.id === featuredPost.coverId) : null;
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const hasBoard = popularProducts.length > 0 || (featuredPost && featuredCover) || recentlyViewed.length > 0;

  const goTo = (path) => {
    onClose();
    navigate(path);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    loadRecentlyViewed().then((items) => setRecentlyViewed(items.slice(0, 4).map((item) => {
      const local = PRODUCTS.find((product) => product.id === item.id);
      return local ? { ...item, image: local.image, name: local.name } : item;
    }))).catch(() => setRecentlyViewed([]));
  }, []);

  // AuthModalContext.jsx와 같은 패턴 — 오버레이가 떠 있는 동안 배경 스크롤을 멈추고,
  // Esc로도 닫을 수 있게 한다.
  useEffect(() => {
    window.lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.lenis?.start();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleSelect = (keyword) => {
    onQueryChange(keyword);
    onSubmit(keyword);
  };

  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <div className="searchOverlay" data-lenis-prevent>
      <button type="button" className="searchOverlayClose" aria-label="검색창 닫기" onClick={onClose}>
        <X size={22} />
      </button>

      <form
        className="searchOverlayForm"
        onSubmit={(e) => { e.preventDefault(); onSubmit(query); }}
      >
        <Search size={20} className="searchOverlayIcon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="상품명, 브랜드, 라벨 검색"
          aria-label="전체 상품 검색"
          className="searchOverlayInput"
          style={SANS}
        />
      </form>

      <div className="searchOverlayBody">
        {!query.trim() && hasBoard && (
          <section className="searchOverlayBoardWrap">
            <div className="corkBoard">
              {popularProducts.map((p, i) => (
                <button
                  key={`pop-${p.id}`}
                  type="button"
                  className="corkNote"
                  style={{ "--rot": rotFor(i) }}
                  onClick={() => goTo(`/item/${p.id}`)}
                >
                  <span className="corkPin" />
                  <span className="corkNoteTag">인기 상품</span>
                  <img src={p.image} alt={p.name} className="corkNoteImg" />
                  <span className="corkNoteTitle">{p.name}</span>
                  <span className="corkNotePrice" style={SANS}>₩{p.price}</span>
                </button>
              ))}

              {featuredPost && featuredCover && (
                <button
                  type="button"
                  className="corkNote corkNoteWide"
                  style={{ "--rot": rotFor(popularProducts.length) }}
                  onClick={() => goTo(`/lookbook/${featuredPost.id}`)}
                >
                  <span className="corkPin" />
                  <span className="corkNoteTag">인기 룩북</span>
                  <img
                    src={featuredCover.interiorImage || featuredCover.image}
                    alt={featuredPost.title}
                    className="corkNoteImg corkNoteImgWide"
                  />
                  <span className="corkNoteTitle">{featuredPost.title}</span>
                  <span className="corkNoteLikes">
                    <Heart size={11} fill="currentColor" /> {featuredPost.likes}
                  </span>
                </button>
              )}

              {recentlyViewed.map((item, i) => (
                <button
                  key={`recent-${item.id}`}
                  type="button"
                  className="corkNote"
                  style={{ "--rot": rotFor(popularProducts.length + 1 + i) }}
                  onClick={() => goTo(`/item/${item.id}`)}
                >
                  <span className="corkPin" />
                  <span className="corkNoteTag">최근 본 상품</span>
                  <img src={item.image} alt={item.name} className="corkNoteImg" />
                  <span className="corkNoteTitle">{item.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showRecent && (
          <section className="searchOverlaySection">
            <div className="searchOverlaySectionHead">
              <span>최근 검색어</span>
              <button type="button" onClick={() => { clearRecentSearches(); setRecentSearches([]); }}>
                전체 삭제
              </button>
            </div>
            <ul className="searchOverlayRecentList">
              {recentSearches.map((term) => (
                <li key={term}>
                  <button type="button" onClick={() => handleSelect(term)}>
                    <Clock size={14} aria-hidden="true" />
                    {term}
                  </button>
                  <button
                    type="button"
                    aria-label={`"${term}" 검색어 삭제`}
                    onClick={() => setRecentSearches(removeRecentSearch(term))}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="searchOverlaySection">
          <div className="searchOverlaySectionHead">
            <span>인기 검색어</span>
          </div>
          <PopularKeywordsList data={MOCK_KEYWORDS} onSelect={handleSelect} className="searchOverlayPopularList" />
        </section>
      </div>
    </div>
  );
}
