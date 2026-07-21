import { createContext, useContext, useState, useCallback } from "react";

const WithdrawModalContext = createContext(null);

export function WithdrawModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openWithdraw = useCallback(() => setIsOpen(true), []);
  const closeWithdraw = useCallback(() => setIsOpen(false), []);

  return (
    <WithdrawModalContext.Provider value={{ isOpen, openWithdraw, closeWithdraw }}>
      {children}
    </WithdrawModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWithdrawModal() {
  const ctx = useContext(WithdrawModalContext);
  if (!ctx) throw new Error("useWithdrawModal must be used within WithdrawModalProvider");
  return ctx;
}
