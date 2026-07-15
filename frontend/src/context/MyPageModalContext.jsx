import { createContext, useContext, useState, useCallback } from "react";

const MyPageModalContext = createContext(null);

export function MyPageModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMyPage = useCallback(() => setIsOpen(true), []);
  const closeMyPage = useCallback(() => setIsOpen(false), []);

  return (
    <MyPageModalContext.Provider value={{ isOpen, openMyPage, closeMyPage }}>
      {children}
    </MyPageModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMyPageModal() {
  const ctx = useContext(MyPageModalContext);
  if (!ctx) throw new Error("useMyPageModal must be used within MyPageModalProvider");
  return ctx;
}
