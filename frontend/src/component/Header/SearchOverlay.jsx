import { useEffect, useRef } from "react";
import { Search, Clock, X } from "lucide-react";
import { PopularKeywordsList, MOCK_KEYWORDS } from "../Sidebar/PopularKeywordsSidebar";
import { removeRecentSearch, clearRecentSearches } from "../../utils/recentSearches";
import "./SearchOverlay.css";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };

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

  useEffect(() => {
    inputRef.current?.focus();
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
    <div className="searchOverlay">
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
