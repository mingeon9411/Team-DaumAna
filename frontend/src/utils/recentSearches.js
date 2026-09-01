// "최근 검색어" — Sidebar 독 검색과 Header 배너 검색(홈 상품목록 스크롤 시 확장)이
// 이제 같은 localStorage 키를 공유해, 어느 쪽에서 검색하든 하나의 목록으로 보인다.
// recentlyViewed.js와 같은 패턴 — 변경 시 이벤트를 쏴서 동시에 마운트된 다른 검색창도 동기화한다.
const KEY = "recentSearches";
const MAX_ITEMS = 8;

export const getRecentSearches = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
};

// 최근 검색어 max 8개, 중복 입력 시 맨 앞으로 재정렬
export const addRecentSearch = (term) => {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();
  const next = [trimmed, ...getRecentSearches().filter((t) => t !== trimmed)].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("recentsearchchange"));
  return next;
};

export const removeRecentSearch = (term) => {
  const next = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("recentsearchchange"));
  return next;
};

export const clearRecentSearches = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("recentsearchchange"));
};
