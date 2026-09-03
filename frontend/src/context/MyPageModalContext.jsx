import { createContext, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const MyPageModalContext = createContext(null);

// 마이페이지는 모달이 아니라 /mypage 독립 페이지(MyPage.jsx)다 — AuthModalContext의
// openLogin/openRegister와 같은 패턴으로, 호출부는 그대로 openMyPage()만 부르면 된다.
export function MyPageModalProvider({ children }) {
  const navigate = useNavigate();

  const openMyPage = useCallback(() => navigate("/mypage"), [navigate]);
  const closeMyPage = useCallback(() => navigate("/"), [navigate]);

  return (
    <MyPageModalContext.Provider value={{ openMyPage, closeMyPage }}>
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
