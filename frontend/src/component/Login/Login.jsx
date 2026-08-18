import "./Login.css";
import { useNavigate } from "react-router-dom";
import { SiKakaotalk, SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { loginUser } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useRailStyle } from "../../hooks/useRailStyle";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";

const SPRING = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8081";
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
const IS_DEV = import.meta.env.DEV;

function Login() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const { close, openRegister, openFindId, openFindPassword } = useAuthModal();
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  // 하단 독바와 같은 레인보우(글래스)/메탈릭/파스텔 스타일을 로그인창에도 그대로 반영
  const { railStyle, styleSwitching } = useRailStyle();

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("※이메일을 입력해주세요.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("※올바른 이메일 형식을 입력해주세요.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("※비밀번호를 입력해주세요.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("※비밀번호는 6자 이상 입력해주세요.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!IS_DEV && !captchaToken) {
      setCaptchaError("※로봇이 아님을 확인해주세요.");
      isValid = false;
    } else {
      setCaptchaError("");
    }

    if (!isValid) return;

    try {
      const res = await loginUser({ username: email, password, recaptcha_token: captchaToken });
      sessionStorage.setItem("pending_access_token", res.data.access);
      sessionStorage.setItem("pending_refresh_token", res.data.refresh);
      sessionStorage.setItem("pending_nickname", res.data.user.nickname);
      close();
      navigate("/email-verify");
    } catch (err) {
      const msg = err.response?.data?.error || "로그인에 실패했습니다. 다시 시도해주세요.";
      setEmailError(`※${msg}`);
      // 실패 시 hCaptcha 초기화
      recaptchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    }
  };

  return (
      <section className={`loginBox railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`}>
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

        <h1>로그인</h1>
        <p className="loginDesc">집다움의 감성을 내 공간에 담아보세요.</p>

        <form className="loginForm" onSubmit={handleLogin} noValidate>
          <input
            type="email"
            placeholder="아이디 혹은 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="errorText">{emailError}</p>}

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p className="errorText">{passwordError}</p>}

          <div className="keepLogin">
            <label>
              <input type="checkbox" />
              로그인 상태 유지
            </label>

            <label>
              <input type="checkbox" />
              아이디 저장
            </label>
          </div>

          <div className="recaptchaWrap">
            {!IS_DEV && (
              <HCaptcha
                ref={recaptchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={(token) => { setCaptchaToken(token); setCaptchaError(""); }}
                onExpire={() => setCaptchaToken(null)}
              />
            )}
            {captchaError && <p className="errorText">{captchaError}</p>}
          </div>

          <button type="submit">로그인</button>
        </form>

        <div className="loginLinks">
          <button type="button" className="linkBtn" onClick={openFindId}>아이디 찾기</button>
          <span></span>
          <button type="button" className="linkBtn" onClick={openFindPassword}>비밀번호 찾기</button>
          <span></span>
          <button type="button" className="linkBtn" onClick={openRegister}>회원가입</button>
        </div>

        <div className="snsLogin">
          <p>SNS 계정을 통해 빠르게 로그인 하실 수 있습니다.</p>
          
          {!IS_DEV && !captchaToken && (
            <p className="snsDisabledNotice">위 reCAPTCHA를 먼저 완료해주세요.</p>
          )}

          <button
            className="kakaoBtn"
            disabled={!IS_DEV && !captchaToken}
            onClick={() => { window.location.href = `${SPRING}/oauth2/authorization/kakao`; }}
          >
            <SiKakaotalk className="snsIcon" />
            카카오로 로그인하기
          </button>

          <button
            className="naverBtn"
            disabled={!IS_DEV && !captchaToken}
            onClick={() => { window.location.href = `${SPRING}/oauth2/authorization/naver`; }}
          >
            <SiNaver className="snsIcon" />
            네이버로 로그인하기
          </button>

          <button
            className="googleBtn"
            disabled={!IS_DEV && !captchaToken}
            onClick={() => { window.location.href = `${SPRING}/oauth2/authorization/google`; }}
          >
            <FcGoogle className="snsIcon" />
            Google로 로그인하기
          </button>
        </div>
      </section>
  );
}

export default Login;
