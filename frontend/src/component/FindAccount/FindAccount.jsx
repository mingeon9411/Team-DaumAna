import "../Login/Login.css";
import { useState, useEffect } from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";

function FindAccount({ mode }) {
  const { close, openLogin } = useAuthModal();
  const isId = mode === "id";

  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("※이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("※올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setEmailError("");
    setSubmitted(true);
  };

  return (
    <section className="loginBox">
      <button type="button" className="authModalClose" aria-label="닫기" onClick={close}>×</button>

      <div className="loginLogoRow">
        <img src={JDLogo} alt="J.D" className="loginLogoJD" />
        <span className="loginLogoDivider" />
        <img
          src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
          alt="집다움"
          className="loginLogoHanok"
        />
      </div>

      <h1>{isId ? "아이디 찾기" : "비밀번호 찾기"}</h1>
      <p className="loginDesc">
        {isId
          ? "가입 시 등록한 이메일을 입력하시면 안내를 보내드려요."
          : "가입하신 이메일을 입력하시면 재설정 안내를 보내드려요."}
      </p>

      {submitted ? (
        <p className="findSuccessText">입력하신 이메일로 안내를 보내드렸습니다.</p>
      ) : (
        <form className="loginForm" onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="errorText">{emailError}</p>}

          <button type="submit">{isId ? "아이디 찾기" : "재설정 메일 보내기"}</button>
        </form>
      )}

      <div className="loginLinks">
        <button type="button" className="linkBtn" onClick={openLogin}>로그인으로 돌아가기</button>
      </div>
    </section>
  );
}

export default FindAccount;
