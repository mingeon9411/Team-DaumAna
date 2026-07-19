import "./SearchModal.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuSearch } from "react-icons/lu";
import { searchProducts } from "../../api";
import localProducts from "../../data/products";
import { useSearchModal } from "../../context/SearchModalContext";

function SearchModal() {
  const { isOpen, closeSearch } = useSearchModal();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setResults([]);
    setError("");
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const debounce = setTimeout(() => {
      searchProducts(query.trim())
        .then((res) => setResults(res.data))
        .catch(() => setError("검색 중 오류가 발생했습니다."))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const goToAllResults = () => {
    if (!query.trim()) return;
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToAllResults();
  };

  return (
    <div className="searchModalOverlay">
      <div className="searchModalInner">
        <button
          type="button"
          className="searchModalClose"
          onClick={closeSearch}
          aria-label="닫기"
        >
          ×
        </button>

        <form className="searchModalForm" onSubmit={handleSubmit}>
          <LuSearch className="searchModalIcon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명, 브랜드로 검색"
          />
        </form>

        <div className="searchModalResults">
          {!query.trim() && (
            <p className="searchModalHint">찾으시는 상품명이나 브랜드를 입력해보세요.</p>
          )}

          {loading && <p className="searchModalHint">검색 중...</p>}
          {error && <p className="searchModalHint searchModalError">{error}</p>}

          {!loading && !error && query.trim() && results.length === 0 && (
            <p className="searchModalHint">
              "{query.trim()}"에 대한 검색 결과가 없습니다.
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul className="searchResultGrid">
              {results.map((product) => (
                <li key={product.id} className="searchResultCard">
                  <Link
                    to={`/product/${product.id}`}
                    className="searchResultLink"
                    onClick={closeSearch}
                  >
                    <div className="searchResultImgWrap">
                      <img
                        src={
                          localProducts.find((p) => p.name === product.name)?.image ||
                          product.thumbnail_url ||
                          "https://placehold.co/400x400?text=No+Image"
                        }
                        alt={product.name}
                      />
                    </div>
                    <div className="searchResultInfo">
                      <span className="searchResultCategory">{product.category_name}</span>
                      <p className="searchResultName">{product.name}</p>
                      <p className="searchResultBrand">{product.brand}</p>
                      <p className="searchResultPrice">
                        {product.base_price.toLocaleString()}원
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && query.trim() && results.length > 0 && (
          <button type="button" className="searchModalMore" onClick={goToAllResults}>
            "{query.trim()}" 전체 결과 보기 ({results.length}개)
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
