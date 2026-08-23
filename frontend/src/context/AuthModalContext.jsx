import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [view, setView] = useState(null); // null | 'login' | 'register' | 'findId' | 'findPassword'

  const openLogin = useCallback(() => setView("login"), []);
  const openRegister = useCallback(() => setView("register"), []);
  const openFindId = useCallback(() => setView("findId"), []);
  const openFindPassword = useCallback(() => setView("findPassword"), []);
  const close = useCallback(() => setView(null), []);

  // 전체 페이지 리로드(예: axios 인터셉터의 토큰 만료 처리) 이후에도
  // 로그인 모달을 다시 띄울 수 있도록 sessionStorage 플래그를 확인.
  useEffect(() => {
    if (sessionStorage.getItem("open_login_modal")) {
      sessionStorage.removeItem("open_login_modal");
      setView("login");
    }
  }, []);

  // 모달이 떠있는 동안 배경 페이지 스크롤을 완전히 멈춘다.
  // 안 그러면 Lenis(스무스 스크롤)로 배경이 계속 움직이면서, PASS 인증 팝업이
  // 뜬 시점의 화면 좌표에 그대로 남아 모달과 따로 노는 것처럼 보인다.
  useEffect(() => {
    if (!view) return;
    window.lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [view]);

  return (
    <AuthModalContext.Provider value={{ view, openLogin, openRegister, openFindId, openFindPassword, close }}>
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
