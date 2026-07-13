const KEY = "wishlist";

export const getWishlist = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return list.filter((p) => p && p.id != null && p.price != null);
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
};

export const isWished = (id) =>
  getWishlist().some((p) => p.id === id);

export const toggleWish = (product) => {
  const list = getWishlist();
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push({
      id: product.id,
      name: product.name ?? "",
      desc: product.desc ?? "",
      price: Number(product.price) || 0,
      image: product.image ?? "",
      review: Number(product.review) || 0,
    });
  }
  localStorage.setItem(KEY, JSON.stringify(list));
  return idx < 0;
};

export const removeWish = (id) => {
  const list = getWishlist().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
};
