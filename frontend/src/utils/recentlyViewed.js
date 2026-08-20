// "최근 본 상품"을 기록한다 (쿠팡 스타일 사이드바용).
// wishlist.js와 같은 패턴 — 호출하는 쪽에서 price는 이미 숫자로 변환해서 넘겨야 한다.
//
// namespace: 페이지별로 카탈로그가 분리돼 있어(Home.jsx PRODUCTS vs data/products.js)
// id가 겹쳐도 서로 다른 상품이다 — 그래서 localStorage 키도 namespace별로 따로 둔다.
// 기본값 "main"은 기존 메인 페이지 동작과 100% 동일(같은 키, 같은 시그니처)하게 유지된다.
const NAMESPACE_KEYS = {
  main: "recentlyViewed",
  "korean-hall": "recentlyViewedKoreanHall",
};
const MAX_ITEMS = 20;

const keyFor = (namespace) => NAMESPACE_KEYS[namespace] || NAMESPACE_KEYS.main;

export const getRecentlyViewed = (namespace = "main") => {
  try {
    const list = JSON.parse(localStorage.getItem(keyFor(namespace)) || "[]");
    return Array.isArray(list) ? list.filter((p) => p && p.id != null) : [];
  } catch {
    localStorage.removeItem(keyFor(namespace));
    return [];
  }
};

export const addRecentlyViewed = (product, namespace = "main") => {
  const list = getRecentlyViewed(namespace).filter((p) => p.id !== product.id);
  list.unshift({
    id: product.id,
    name: product.name ?? "",
    price: Number(product.price) || 0,
    image: product.image ?? "",
  });
  const trimmed = list.slice(0, MAX_ITEMS);
  localStorage.setItem(keyFor(namespace), JSON.stringify(trimmed));
  window.dispatchEvent(new Event("recentlyviewedchange"));
  return trimmed;
};

export const removeRecentlyViewed = (id, namespace = "main") => {
  const list = getRecentlyViewed(namespace).filter((p) => p.id !== id);
  localStorage.setItem(keyFor(namespace), JSON.stringify(list));
  window.dispatchEvent(new Event("recentlyviewedchange"));
};

export const clearRecentlyViewed = (namespace = "main") => {
  localStorage.removeItem(keyFor(namespace));
  window.dispatchEvent(new Event("recentlyviewedchange"));
};
