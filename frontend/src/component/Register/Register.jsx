// #회원가입 페이지
import "./Register.css";
import "../Login/Login.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { registerUser, checkNicknameAPI } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent.png";

function Register() {
  const navigate = useNavigate();
  const { close, openLogin } = useAuthModal();
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

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

  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [termsAgree, setTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);

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

  const handleRegister = async (e) => {
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

    if (!isValid) return;

    try {
      await registerUser({ email, nickname, password, password_confirm: passwordConfirm });
      localStorage.setItem("nickname", nickname);
      close();
      navigate("/welcome");
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
    }
  };

  return (
      <section className="registerBox">
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
            <div className="termsBox">
              <h4>이용약관</h4>
              <p>
                집다움은 회원에게 한국적인 라이프스타일 큐레이션 서비스를
                제공합니다. 회원은 서비스 이용 시 관련 법령 및 본 약관을
                준수해야 합니다.
              </p>

              <h4>개인정보 처리방침</h4>
              <p>
                집다움은 회원가입, 서비스 제공 및 고객 문의 응대를 위해 이메일,
                닉네임 등의 개인정보를 수집합니다. 수집된 정보는 서비스 제공
                목적 외에는 사용되지 않습니다.
              </p>
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
          </div>

          <button type="submit">회원가입</button>
        </form>

        <div className="registerLinks">
          <span>이미 계정이 있으신가요?</span>
          <button type="button" className="linkBtn" onClick={openLogin}>로그인</button>
        </div>
      </section>
  );
}

export default Register;
