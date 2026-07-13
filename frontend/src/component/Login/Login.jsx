import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { SiKakaotalk, SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { loginUser } from "../../api";

const SPRING = "http://localhost:8081";
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
const IS_DEV = import.meta.env.DEV;

function Login() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

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
    <main className="loginPage">
      <div className="loginOverlay"></div>

      <section className="loginBox">
        <p className="loginLabel">JIPDAUM MEMBER</p>

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
          <a href="#">아이디 찾기</a>
          <span></span>
          <a href="#">비밀번호 찾기</a>
          <span></span>
          <Link to="/register">회원가입</Link>
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
    </main>
  );
}

export default Login;
