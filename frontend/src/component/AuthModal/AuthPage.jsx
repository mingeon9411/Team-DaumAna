import { useLocation } from "react-router-dom";
import Login from "../Login/Login";
import Register from "../Register/Register";
import "./AuthPage.css";

// 로그인/회원가입을 모달 대신 /login, /register 독립 페이지로 띄운다.
// 카드(.loginBox/.registerBox)는 AuthModal.jsx가 쓰던 Login/Register를 그대로
// 가져다 써서 디자인은 완전히 동일하고, 배경만 상품 목록·설정·고객센터와 같은
// metallicSilver 파스텔 톤 전면 배경으로 바꾼다.
function AuthPage() {
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";

  return (
    <div className="authPage metallicSilver" data-hsnap data-lenis-prevent>
      <div className="authPagePanel">
        {isRegister ? <Register /> : <Login />}
      </div>
    </div>
  );
}

export default AuthPage;
