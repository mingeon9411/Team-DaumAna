import { createContext, useContext, useState, useCallback } from "react";

const NoticeModalContext = createContext(null);

export function NoticeModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNotice = useCallback(() => setIsOpen(true), []);
  const closeNotice = useCallback(() => setIsOpen(false), []);

  return (
    <NoticeModalContext.Provider value={{ isOpen, openNotice, closeNotice }}>
      {children}
    </NoticeModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNoticeModal() {
  const ctx = useContext(NoticeModalContext);
  if (!ctx) throw new Error("useNoticeModal must be used within NoticeModalProvider");
  return ctx;
}
