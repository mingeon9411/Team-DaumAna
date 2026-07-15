import { createContext, useContext, useState, useCallback } from "react";

const CartModalContext = createContext(null);

export function CartModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartModalContext.Provider value={{ isOpen, openCart, closeCart }}>
      {children}
    </CartModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCartModal() {
  const ctx = useContext(CartModalContext);
  if (!ctx) throw new Error("useCartModal must be used within CartModalProvider");
  return ctx;
}
