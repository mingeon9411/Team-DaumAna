import "../Login/Login.css";
import { useState, useEffect } from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import {
  getSecurityQuestion,
  sendFindIdCode,
  verifyFindId,
  verifyFindPasswordIdentity,
  resetPassword,
} from "../../api";
import JDLogo from "../../assets/J.D 로고.svg";
// -sm: 48px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // 아이디 찾기: email → verify → result / 비밀번호 찾기: identity → answer → reset → done
  const [step, setStep] = useState(isId ? "email" : "identity");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [foundUsername, setFoundUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fail = (err, fallback) => setError(err.response?.data?.error || fallback);

  // 아이디 찾기 1단계: 이메일 → 보안질문 조회(미가입/미설정이면 여기서 바로 안내) + 인증코드 발송
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const qRes = await getSecurityQuestion(email);
      setSecurityQuestion(qRes.data.security_question);
      await sendFindIdCode(email);
      setStep("verify");
    } catch (err) {
      fail(err, "이메일을 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    try {
      await sendFindIdCode(email);
    } catch (err) {
      fail(err, "인증 코드 재발송에 실패했습니다.");
    }
  };

  // 아이디 찾기 2단계: 인증코드 + 보안답 확인
  const handleVerifyId = async (e) => {
    e.preventDefault();
    if (!code.trim() || !securityAnswer.trim()) {
      setError("인증 코드와 답변을 모두 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await verifyFindId(email, code.trim(), securityAnswer);
      setFoundUsername(res.data.username);
      setStep("result");
    } catch (err) {
      fail(err, "확인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 비밀번호 찾기 1단계: 닉네임+이메일 → 보안질문 조회
  const handleLookupQuestion = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await getSecurityQuestion(email);
      setSecurityQuestion(res.data.security_question);
      setStep("answer");
    } catch (err) {
      fail(err, "이메일을 확인해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 비밀번호 찾기 2단계: 닉네임+이메일+보안답 일치 확인 → 재설정 토큰 발급
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setError("답변을 입력해주세요.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await verifyFindPasswordIdentity(nickname.trim(), email, securityAnswer);
      setResetToken(res.data.reset_token);
      setStep("reset");
    } catch (err) {
      fail(err, "본인확인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 비밀번호 찾기 3단계: 새 비밀번호 입력
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      fail(err, "비밀번호 재설정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
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

      {isId && step === "email" && (
        <>
          <p className="loginDesc">가입 시 등록한 이메일을 입력하시면 인증코드를 보내드려요.</p>
          <form className="loginForm" onSubmit={handleSendCode} noValidate>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="errorText">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "확인 중..." : "인증 코드 받기"}
            </button>
          </form>
        </>
      )}

      {isId && step === "verify" && (
        <>
          <p className="loginDesc">보안 질문: <strong>{securityQuestion}</strong></p>
          <form className="loginForm" onSubmit={handleVerifyId} noValidate>
            <input
              type="text"
              placeholder="인증 코드 (6자리)"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
            <input
              type="text"
              placeholder="보안 질문 답변"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            {error && <p className="errorText">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "확인 중..." : "확인"}
            </button>
            <button type="button" className="linkBtn" onClick={handleResendCode}>인증 코드 재발송</button>
          </form>
        </>
      )}

      {isId && step === "result" && (
        <p className="findSuccessText">회원님의 아이디는 <strong>{foundUsername}</strong> 입니다.</p>
      )}

      {!isId && step === "identity" && (
        <>
          <p className="loginDesc">마이페이지에 등록된 닉네임과 가입하신 이메일을 입력해주세요.</p>
          <form className="loginForm" onSubmit={handleLookupQuestion} noValidate>
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="errorText">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "확인 중..." : "다음"}
            </button>
          </form>
        </>
      )}

      {!isId && step === "answer" && (
        <>
          <p className="loginDesc">보안 질문: <strong>{securityQuestion}</strong></p>
          <form className="loginForm" onSubmit={handleVerifyPassword} noValidate>
            <input
              type="text"
              placeholder="보안 질문 답변"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            {error && <p className="errorText">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "확인 중..." : "확인"}
            </button>
          </form>
        </>
      )}

      {!isId && step === "reset" && (
        <>
          <p className="loginDesc">새로 사용할 비밀번호를 입력해주세요.</p>
          <form className="loginForm" onSubmit={handleResetPassword} noValidate>
            <input
              type="password"
              placeholder="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
            {error && <p className="errorText">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        </>
      )}

      {!isId && step === "done" && (
        <p className="findSuccessText">비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.</p>
      )}

      <div className="loginLinks">
        <button type="button" className="linkBtn" onClick={openLogin}>로그인으로 돌아가기</button>
      </div>
    </section>
  );
}

export default FindAccount;
