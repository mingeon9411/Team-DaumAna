import { useAuthModal } from "../../context/AuthModalContext";
import Login from "../Login/Login";
import Register from "../Register/Register";
import FindAccount from "../FindAccount/FindAccount";
import "./AuthModal.css";

function AuthModal() {
  const { view, close } = useAuthModal();

  if (!view) return null;

  return (
    <div className="authModalOverlay" onClick={close}>
      <div className="authModalPanel" onClick={(e) => e.stopPropagation()}>
        {view === "login" ? <Login />
          : view === "register" ? <Register />
          : view === "findId" ? <FindAccount mode="id" />
          : <FindAccount mode="password" />}
      </div>
    </div>
  );
}

export default AuthModal;
