import { useAuthModal } from "../../context/AuthModalContext";
import FindAccount from "../FindAccount/FindAccount";
import "./AuthModal.css";

// 로그인/회원가입은 /login, /register 독립 페이지(AuthPage.jsx)로 옮겨가서,
// 이 모달은 이제 아이디/비밀번호 찾기 두 뷰만 띄운다.
function AuthModal() {
  const { view } = useAuthModal();

  if (!view) return null;

  return (
    <div className="authModalOverlay">
      <div className="authModalPanel" data-lenis-prevent>
        {view === "findId" ? <FindAccount mode="id" /> : <FindAccount mode="password" />}
      </div>
    </div>
  );
}

export default AuthModal;
