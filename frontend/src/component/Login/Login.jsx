import "./Login.css";
import { useNavigate } from "react-router-dom";
import { SiKakaotalk, SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { loginUser, requestSocialCaptchaTicket } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useRailStyle } from "../../hooks/useRailStyle";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";

const SPRING = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8081";
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

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
  const [submitting, setSubmitting] = useState(false);
  // 개발 모드 StrictMode 이중 마운트 대응: hCaptcha 위젯이 아직 완전히 준비되기 전에
  // 첫 execute()가 실행되면 한 번 실패할 수 있다. 사용자에게 에러를 보여주기 전에
  // 시도당 한 번만 조용히 재시도한다(프로덕션 빌드는 애초에 이 경로를 안 탐).
  const captchaRetriedRef = useRef(false);
  // 일반 로그인 폼과 SNS 버튼 3개가 hCaptcha 위젯 하나를 공유하므로, execute() 결과를
  // onVerify에서 어느 액션으로 처리할지 구분하기 위한 값 — 'login' 또는 provider 이름.
  const pendingActionRef = useRef(null);

  // "로그인" 버튼을 누르는 순간에만 캡차가 뜨도록 — hCaptcha를 invisible 모드로 두고
  // 필드 검증 통과 시 execute()로 그때 트리거한다. 실제 로그인 API 호출은 onVerify에서 진행.
  const handleLogin = (e) => {
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

    if (!isValid) return;

    pendingActionRef.current = "login";
    setCaptchaError("");
    setSubmitting(true);
    captchaRetriedRef.current = false;
    recaptchaRef.current?.execute();
  };

  // 카카오/네이버/구글 버튼도 같은 hCaptcha 위젯을 트리거만 다르게 해서 재사용한다.
  // /oauth2/authorization/{provider}는 브라우저가 직접 이동하는 GET이라 토큰을 JSON으로
  // 못 실어보내므로, 먼저 /api/auth/social-captcha로 토큰을 검증받아 1회용 ticket을 받고
  // 그 ticket을 쿼리 파라미터로 붙여 이동한다(SocialLoginCaptchaFilter가 검사).
  const handleSocialClick = (provider) => {
    pendingActionRef.current = provider;
    setCaptchaError("");
    setSubmitting(true);
    captchaRetriedRef.current = false;
    recaptchaRef.current?.execute();
  };

  const handleCaptchaVerify = async (token) => {
    const action = pendingActionRef.current;

    if (action && action !== "login") {
      try {
        const res = await requestSocialCaptchaTicket(token);
        window.location.href = `${SPRING}/oauth2/authorization/${action}?ticket=${encodeURIComponent(res.data.ticket)}`;
      } catch (err) {
        const msg = err.response?.data?.error || "보안 인증에 실패했습니다. 다시 시도해주세요.";
        setCaptchaError(`※${msg}`);
        recaptchaRef.current?.resetCaptcha();
        setSubmitting(false);
      }
      return;
    }

    try {
      const res = await loginUser({ username: email, password, recaptcha_token: token });
      sessionStorage.setItem("pending_access_token", res.data.access);
      sessionStorage.setItem("pending_refresh_token", res.data.refresh);
      sessionStorage.setItem("pending_nickname", res.data.user.nickname);
      close();
      navigate("/email-verify");
    } catch (err) {
      const msg = err.response?.data?.error || "로그인에 실패했습니다. 다시 시도해주세요.";
      setEmailError(`※${msg}`);
    } finally {
      recaptchaRef.current?.resetCaptcha();
      setSubmitting(false);
    }
  };

  const handleCaptchaError = () => {
    if (!captchaRetriedRef.current) {
      captchaRetriedRef.current = true;
      recaptchaRef.current?.resetCaptcha();
      recaptchaRef.current?.execute();
      return;
    }
    setCaptchaError("※보안 인증에 실패했습니다. 다시 시도해주세요.");
    setSubmitting(false);
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

          <HCaptcha
            ref={recaptchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            size="invisible"
            languageOverride="ko"
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpire={() => setSubmitting(false)}
          />
          {captchaError && <p className="errorText">{captchaError}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "확인 중..." : "로그인"}
          </button>
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

          <button
            className="kakaoBtn"
            disabled={submitting}
            onClick={() => handleSocialClick("kakao")}
          >
            <SiKakaotalk className="snsIcon" />
            카카오로 로그인하기
          </button>

          <button
            className="naverBtn"
            disabled={submitting}
            onClick={() => handleSocialClick("naver")}
          >
            <SiNaver className="snsIcon" />
            네이버로 로그인하기
          </button>

          <button
            className="googleBtn"
            disabled={submitting}
            onClick={() => handleSocialClick("google")}
          >
            <FcGoogle className="snsIcon" />
            Google로 로그인하기
          </button>
        </div>
      </section>
  );
}

export default Login;
