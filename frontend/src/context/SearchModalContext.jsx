import { createContext, useContext, useState, useCallback } from "react";

const SearchModalContext = createContext(null);

export function SearchModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  return (
    <SearchModalContext.Provider value={{ isOpen, openSearch, closeSearch }}>
      {children}
    </SearchModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearchModal() {
  const ctx = useContext(SearchModalContext);
  if (!ctx) throw new Error("useSearchModal must be used within SearchModalProvider");
  return ctx;
}
