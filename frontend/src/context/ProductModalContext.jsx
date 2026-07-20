import { createContext, useContext, useState, useCallback } from "react";

const ProductModalContext = createContext(null);

export function ProductModalProvider({ children }) {
  const [productId, setProductId] = useState(null);

  const openProduct = useCallback((id) => setProductId(id), []);
  const closeProduct = useCallback(() => setProductId(null), []);

  return (
    <ProductModalContext.Provider
      value={{ isOpen: productId !== null, productId, openProduct, closeProduct }}
    >
      {children}
    </ProductModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error("useProductModal must be used within ProductModalProvider");
  return ctx;
}
