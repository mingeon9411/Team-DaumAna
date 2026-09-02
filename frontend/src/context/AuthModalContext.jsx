import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  // 로그인/회원가입은 모달이 아니라 /login, /register 독립 페이지라 여기서
  // 관리할 상태가 아니다 — view는 이제 두 모달(아이디/비밀번호 찾기)만 남는다.
  const [view, setView] = useState(null); // null | 'findId' | 'findPassword'

  const openLogin = useCallback(() => navigate("/login"), [navigate]);
  const openRegister = useCallback(() => navigate("/register"), [navigate]);
  const openFindId = useCallback(() => setView("findId"), []);
  const openFindPassword = useCallback(() => setView("findPassword"), []);
  // 아이디/비밀번호 찾기 모달을 닫는다 — /login, /register 페이지 자체에는
  // 관여하지 않는다(그 페이지들은 closeAuthPage를 따로 쓴다). Login.jsx/
  // Register.jsx가 다른 모달(FindAccount) 위가 아니라 페이지 자체에서 이걸
  // 부르면 view가 애초에 null이라 아무 일도 안 일어나는 무해한 호출이 된다.
  const close = useCallback(() => setView(null), []);
  // /login, /register 페이지의 "×" 닫기 버튼 전용 — CustomerCenter의 "목록으로"와
  // 같은 패턴으로 항상 홈으로 보낸다. close()와 분리한 이유: Login/Register
  // 성공 처리(예: 회원가입 후 navigate("/welcome"))에서 실수로 같이 호출되면
  // "/"로 갔다가 다시 목적지로 가는 이중 네비게이션이 생기기 때문.
  const closeAuthPage = useCallback(() => navigate("/"), [navigate]);

  // 모달(아이디/비밀번호 찾기)이 떠있는 동안 배경 페이지 스크롤을 완전히 멈춘다.
  // 안 그러면 Lenis(스무스 스크롤)로 배경이 계속 움직이면서, hCaptcha 챌린지 팝업이
  // 위젯이 뜬 시점의 화면 좌표에 그대로 남아 모달과 따로 노는 것처럼 보인다.
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

  // 라우트가 바뀌면(예: /login → /) 그 위에 떠 있던 찾기 모달도 같이 접는다 —
  // 안 그러면 로그인 페이지를 벗어난 뒤에도 모달이 계속 떠 있게 된다.
  useEffect(() => {
    setView(null);
  }, [location.pathname]);

  return (
    <AuthModalContext.Provider value={{ view, openLogin, openRegister, openFindId, openFindPassword, close, closeAuthPage }}>
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
