import {
  addRecentlyViewedProduct,
  clearRecentlyViewedProducts,
  deleteRecentlyViewedProduct,
  getRecentlyViewedProducts,
  mergeRecentlyViewedProducts,
} from "../api";

const NAMESPACE_KEYS = { main: "recentlyViewed" };
const MAX_ITEMS = 20;

const keyFor = (namespace) => NAMESPACE_KEYS[namespace] || NAMESPACE_KEYS.main;
const getAuthToken = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("pending_access_token");
const isLoggedIn = () => !!getAuthToken();
const notify = () => window.dispatchEvent(new Event("recentlyviewedchange"));

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
  const productId = Number(product?.id);
  if (!Number.isInteger(productId)) return Promise.resolve([]);
  if (isLoggedIn()) return addRecentlyViewedProduct(productId).then(notify).catch(() => {});

  const list = getRecentlyViewed(namespace).filter((p) => Number(p.id) !== productId);
  list.unshift({
    id: productId,
    name: product.name ?? "",
    price: Number(product.price) || 0,
    image: product.image ?? "",
  });
  const trimmed = list.slice(0, MAX_ITEMS);
  localStorage.setItem(keyFor(namespace), JSON.stringify(trimmed));
  notify();
  return trimmed;
};

export const removeRecentlyViewed = (id, namespace = "main") => {
  if (isLoggedIn()) return deleteRecentlyViewedProduct(id).then(notify);
  const list = getRecentlyViewed(namespace).filter((p) => p.id !== id);
  localStorage.setItem(keyFor(namespace), JSON.stringify(list));
  notify();
};

export const clearRecentlyViewed = (namespace = "main") => {
  if (isLoggedIn()) return clearRecentlyViewedProducts().then(notify);
  localStorage.removeItem(keyFor(namespace));
  notify();
};

const legacyUserItems = (namespace) => {
  const nickname = localStorage.getItem("nickname");
  if (!nickname) return [];
  try {
    const list = JSON.parse(localStorage.getItem(`${keyFor(namespace)}:${nickname}`) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const loadRecentlyViewed = async (namespace = "main") => {
  if (!isLoggedIn()) return getRecentlyViewed(namespace);

  const localItems = [...getRecentlyViewed(namespace), ...legacyUserItems(namespace)];
  const productIds = [...new Set(localItems.map((item) => item?.id).filter(Number.isInteger))];
  if (productIds.length) {
    await mergeRecentlyViewedProducts(productIds);
    localStorage.removeItem(keyFor(namespace));
    const nickname = localStorage.getItem("nickname");
    if (nickname) localStorage.removeItem(`${keyFor(namespace)}:${nickname}`);
  }
  const { data } = await getRecentlyViewedProducts();
  return Array.isArray(data) ? data : [];
};
