// #회원가입 페이지
import "./Register.css";
import "../Login/Login.css";
import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { LuChevronLeft } from "react-icons/lu";
import { registerUser, checkNicknameAPI } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { useRailStyle } from "../../hooks/useRailStyle";
import JDLogo from "../../assets/J.D 로고.svg";
// -sm: 48px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "../../data/legalContent";

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

function Register() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const { openLogin, closeAuthPage } = useAuthModal();
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );
  // 로그인창과 동일한 레인보우(글래스)/메탈릭/파스텔 배경 프리셋을 회원가입창에도 그대로 반영
  const { railStyle, styleSwitching } = useRailStyle();

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  const [showTerms, setShowTerms] = useState(false);

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [agreeError, setAgreeError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // 개발 모드 StrictMode 이중 마운트 대응: hCaptcha 위젯이 아직 완전히 준비되기 전에
  // 첫 execute()가 실행되면 한 번 실패할 수 있다. 사용자에게 에러를 보여주기 전에
  // 시도당 한 번만 조용히 재시도한다(프로덕션 빌드는 애초에 이 경로를 안 탐).
  const captchaRetriedRef = useRef(false);

  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [termsAgree, setTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [ageConfirmError, setAgeConfirmError] = useState("");
  const [marketingAgree, setMarketingAgree] = useState(false);

  const checkNickname = async () => {
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      setNicknameChecked(false);
      return;
    }

    try {
      const res = await checkNicknameAPI(nickname);
      if (res.data.available) {
        setNicknameError("사용 가능한 닉네임입니다.");
        setNicknameChecked(true);
      } else {
        setNicknameError(res.data.message);
        setNicknameChecked(false);
      }
    } catch {
      setNicknameError("중복 확인 중 오류가 발생했습니다.");
      setNicknameChecked(false);
    }
  };

  // "회원가입" 버튼을 누르는 순간에만 캡차가 뜨도록 — hCaptcha를 invisible 모드로 두고
  // 필드 검증 통과 시 execute()로 그때 트리거한다. 실제 가입 API 호출은 onVerify에서 진행.
  const handleRegister = (e) => {
    e.preventDefault();

    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      isValid = false;
    } else if (!nicknameChecked) {
      setNicknameError("닉네임 중복확인을 해주세요.");
      isValid = false;
    } else {
      setNicknameError("");
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("비밀번호는 6자 이상 입력해주세요.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!passwordConfirm) {
      setPasswordConfirmError("비밀번호 확인을 입력해주세요.");
      isValid = false;
    } else if (password !== passwordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      isValid = false;
    } else {
      setPasswordConfirmError("");
    }

    if (!termsAgree || !privacyAgree) {
      setAgreeError("필수 약관에 동의해주세요.");
      isValid = false;
    } else {
      setAgreeError("");
    }

    if (!ageConfirm) {
      setAgeConfirmError("만 14세 이상만 가입할 수 있습니다.");
      isValid = false;
    } else {
      setAgeConfirmError("");
    }

    if (!isValid) return;

    setCaptchaError("");
    setSubmitting(true);
    captchaRetriedRef.current = false;
    recaptchaRef.current?.execute();
  };

  const handleCaptchaVerify = async (token) => {
    try {
      const res = await registerUser({
        email,
        nickname,
        password,
        password_confirm: passwordConfirm,
        recaptcha_token: token,
      });
      localStorage.setItem("nickname", nickname);
      navigate("/welcome", { state: { coupons: res.data.coupons || [] } });
    } catch (err) {
      const data = err.response?.data;
      if (!data) {
        setEmailError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      if (data.email) setEmailError(Array.isArray(data.email) ? data.email[0] : data.email);
      if (data.nickname) setNicknameError(Array.isArray(data.nickname) ? data.nickname[0] : data.nickname);
      if (data.password) setPasswordError(Array.isArray(data.password) ? data.password[0] : data.password);
      if (data.password_confirm) setPasswordConfirmError(Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm);
      if (data.non_field_errors) setPasswordError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
      // hCaptcha 검증 실패 등 필드에 안 묶이는 에러는 {"error": "..."} 형태로 옴 (Spring AuthException)
      if (data.error) setCaptchaError(`※${data.error}`);
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
      <section className={`loginBox registerBox railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""}`}>
        {/* 로그인창과 같은 패턴으로 돌아가기 버튼을 둔다(closeAuthPage는 항상 홈으로 보낸다) */}
        <button type="button" className="loginBackBtn" onClick={closeAuthPage}>
          <LuChevronLeft size={14} /> 돌아가기
        </button>

        <Link to="/" className="loginLogoRow" aria-label="집다움 홈으로">
          <img src={JDLogo} alt="J.D" className="loginLogoJD" />
          <span className="loginLogoDivider" />
          <img
            src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
            alt="집다움"
            className="loginLogoHanok"
          />
        </Link>

        <h1>회원가입</h1>
        <p className="registerDesc">
          집다움의 공간 큐레이션을 시작해보세요.
        </p>

        <form className="registerForm" onSubmit={handleRegister} noValidate>
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="errorText">{emailError}</p>}

          <div className="nicknameRow">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameChecked(false);
                setNicknameError("");
              }}
            />

            <button type="button" onClick={checkNickname}>
              중복확인
            </button>
          </div>

          {nicknameError && (
            <p className={nicknameChecked ? "successText" : "errorText"}>
              {nicknameError}
            </p>
          )}

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);

              if (passwordConfirm && e.target.value !== passwordConfirm) {
                setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
              } else {
                setPasswordConfirmError("");
              }
            }}
          />
          {passwordError && <p className="errorText">{passwordError}</p>}

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);

              if (password !== e.target.value) {
                setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
              } else {
                setPasswordConfirmError("");
              }
            }}
          />
          {passwordConfirmError && (
            <p className="errorText">{passwordConfirmError}</p>
          )}

          <button
            type="button"
            className="termsBtn"
            onClick={() => setShowTerms(!showTerms)}
          >
            {showTerms ? "약관 닫기 ▲" : "약관 보기 ▼"}
          </button>

          {showTerms && (
            <div className="termsBox" data-lenis-prevent>
              <h4>이용약관</h4>
              {TERMS_OF_SERVICE.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}

              <h4>개인정보 처리방침</h4>
              {PRIVACY_POLICY.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          <div className="agreeGroup">
            <label className="agreeCheck">
              <input
                type="checkbox"
                checked={termsAgree}
                onChange={(e) => setTermsAgree(e.target.checked)}
              />
              이용약관 동의 (필수)
            </label>

            <label className="agreeCheck">
              <input
                type="checkbox"
                checked={privacyAgree}
                onChange={(e) => setPrivacyAgree(e.target.checked)}
              />
              개인정보 처리방침 동의 (필수)
            </label>

            {agreeError && <p className="errorText">{agreeError}</p>}

            <label className="agreeCheck">
              <input
                type="checkbox"
                checked={ageConfirm}
                onChange={(e) => setAgeConfirm(e.target.checked)}
              />
              만 14세 이상입니다 (필수)
            </label>
            {ageConfirmError && <p className="errorText">{ageConfirmError}</p>}

            <label className="agreeCheck">
              <input
                type="checkbox"
                checked={marketingAgree}
                onChange={(e) => setMarketingAgree(e.target.checked)}
              />
              이벤트·혜택 정보 수신에 동의합니다 (선택)
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
            {submitting ? "확인 중..." : "회원가입"}
          </button>
        </form>

        <div className="registerLinks">
          <span>이미 계정이 있으신가요?</span>
          <button type="button" className="linkBtn" onClick={openLogin}>로그인</button>
        </div>
      </section>
  );
}

export default Register;
