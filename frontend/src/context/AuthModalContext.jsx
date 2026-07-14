import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [view, setView] = useState(null); // null | 'login' | 'register'

  const openLogin = useCallback(() => setView("login"), []);
  const openRegister = useCallback(() => setView("register"), []);
  const close = useCallback(() => setView(null), []);

  // 전체 페이지 리로드(예: axios 인터셉터의 토큰 만료 처리) 이후에도
  // 로그인 모달을 다시 띄울 수 있도록 sessionStorage 플래그를 확인.
  useEffect(() => {
    if (sessionStorage.getItem("open_login_modal")) {
      sessionStorage.removeItem("open_login_modal");
      setView("login");
    }
  }, []);

  return (
    <AuthModalContext.Provider value={{ view, openLogin, openRegister, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
