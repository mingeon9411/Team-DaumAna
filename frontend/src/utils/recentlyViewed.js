// 메인 페이지 상품을 "최근 본 상품"으로 기록한다 (쿠팡 스타일 사이드바용).
// wishlist.js와 같은 패턴 — 호출하는 쪽에서 price는 이미 숫자로 변환해서 넘겨야 한다.
const KEY = "recentlyViewed";
const MAX_ITEMS = 20;

export const getRecentlyViewed = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((p) => p && p.id != null) : [];
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
};

export const addRecentlyViewed = (product) => {
  const list = getRecentlyViewed().filter((p) => p.id !== product.id);
  list.unshift({
    id: product.id,
    name: product.name ?? "",
    price: Number(product.price) || 0,
    image: product.image ?? "",
  });
  const trimmed = list.slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("recentlyviewedchange"));
  return trimmed;
};

export const removeRecentlyViewed = (id) => {
  const list = getRecentlyViewed().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("recentlyviewedchange"));
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("recentlyviewedchange"));
};
