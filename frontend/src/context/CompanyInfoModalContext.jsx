import { createContext, useContext, useState, useCallback } from "react";

const CompanyInfoModalContext = createContext(null);

export function CompanyInfoModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCompanyInfo = useCallback(() => setIsOpen(true), []);
  const closeCompanyInfo = useCallback(() => setIsOpen(false), []);

  return (
    <CompanyInfoModalContext.Provider value={{ isOpen, openCompanyInfo, closeCompanyInfo }}>
      {children}
    </CompanyInfoModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompanyInfoModal() {
  const ctx = useContext(CompanyInfoModalContext);
  if (!ctx) throw new Error("useCompanyInfoModal must be used within CompanyInfoModalProvider");
  return ctx;
}
