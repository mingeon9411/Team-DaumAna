import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { SiKakaotalk, SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { Sparkles, Ruler, ShieldCheck, UserPlus, UserX, Mail, User, Lock, ChevronDown, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, ArrowLeft, LogIn } from "lucide-react";
import "./ChatBot.css";
import { sendChatMessage, createOrder, readyPayment, verifyPayment, registerUser, loginUser, checkNicknameAPI, requestSocialCaptchaTicket, withdrawUser } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import { NAV_FLAGS } from "../../utils/navFlags";
import { PRODUCTS } from "../Home/Home";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "../../data/legalContent";
import JDLogo from "../../assets/J.D 로고.svg";
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;
const SPRING_URL = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8081";

const DEFAULT_GREETING = "안녕하세요! 집다움 AI 어시스턴트입니다 😊\n궁금한 점을 편하게 물어보세요.";

// 비회원이 챗봇을 처음 열었을 때 보여줄 브랜드 소개 + 회원가입 유도 메시지.
// action:"signup"이 붙은 메시지는 말풍선 아래에 회원가입 유도 버튼이 함께 렌더된다.
const GUEST_BRAND_INTRO =
  "집다움은 한국적인 감성을 담아 공간을 큐레이션하는 라이프스타일 브랜드예요. 엄선된 가구와 소품으로 나만의 공간을 완성해보세요 🏡";
const GUEST_SIGNUP_NUDGE = "지금 회원가입하면 다양한 혜택을 바로 누리실 수 있어요. 아래 버튼으로 여기서 바로 간편하게 가입해보세요!";

// 질문에 회원가입 의도가 담겨 있으면 오른쪽에 간편 회원가입 패널을 띄운다.
const SIGNUP_KEYWORDS = /회원가입|가입해\s?줘|가입할래|가입하고\s?싶|계정\s?만들/;

// 질문에 회원탈퇴 의도가 담겨 있으면(로그인 상태에서만) 오른쪽에 탈퇴 패널을 띄운다.
const WITHDRAW_KEYWORDS = /회원탈퇴|탈퇴할래|탈퇴하고\s?싶|탈퇴해\s?줘|계정\s?삭제|계정\s?해지/;

// 로그인 계정의 대화 기록을 페이지 이동/챗봇 재오픈에도 유지하는 모듈 스코프 저장소.
// 새로고침하면 초기화된다("메모리에 저장" 요구사항) — 로그아웃하면 clearChatMemory()가 비운다.
// variant("default" | "korean-hall")별로 따로 저장해 메인/한국관 챗봇 기록이 섞이지 않는다.
const chatMemory = {};
function clearChatMemory() {
  for (const k of Object.keys(chatMemory)) delete chatMemory[k];
}

const QUICK_REPLIES = ["배송 조회", "반품·교환 안내", "회원 등급 혜택", "매장 위치 안내"];

const formatTime = (ms) =>
  new Date(ms).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

// 질문 문장에서 상품 추천 패널을 띄울지 판단한다.
// 카테고리 키워드(있으면 필터) + 조건 키워드(할인/신상/베스트/친환경 중 하나) 조합으로 PRODUCTS를 좁힌다.
const CATEGORY_KEYWORDS = ["소파", "의자", "테이블", "조명", "수납", "침구", "소품"];
const CONDITION_RULES = [
  { test: (t) => /할인|세일|특가|저렴/.test(t), match: (p) => !!p.originalPrice, title: "🔥 할인 중인 상품" },
  { test: (t) => /신상|신제품|최신/.test(t), match: (p) => p.label === "NEW", title: "🆕 신상품" },
  { test: (t) => /베스트|인기/.test(t), match: (p) => p.label === "BESTSELLER", title: "⭐ 인기 상품" },
  { test: (t) => /친환경|에코/.test(t), match: (p) => p.label === "ECO", title: "🌿 친환경 상품" },
];

function matchProducts(text, catalog) {
  if (!text) return null;
  const t = text.replace(/\s/g, "");
  const category = CATEGORY_KEYWORDS.find((c) => t.includes(c));
  const rule = CONDITION_RULES.find((r) => r.test(t));
  if (!category && !rule) return null;

  const items = catalog.filter((p) => {
    const catOk = category ? p.category === category : true;
    const condOk = rule ? rule.match(p) : true;
    return catOk && condOk;
  }).slice(0, 6);
  if (items.length === 0) return null;

  const title = rule ? rule.title : `${category} 상품`;
  return { title, items };
}

const parseWon = (v) => Number(String(v).replace(/,/g, ""));

// 질문에 "결제/구매"와 특정 상품명이 함께 있으면 추천 패널 대신 결제 패널을 바로 띄운다.
// (예: "린넨 암체어 결제해줘") 상품명이 특정되지 않으면 어떤 걸 살지 알 수 없으니
// 상품 추천 패널(matchProducts)로 폴백한다.
const PAYMENT_KEYWORDS = /결제|구매|주문|살래|살게|사고\s?싶/;

function matchBuyProduct(text, catalog) {
  if (!text || !PAYMENT_KEYWORDS.test(text)) return null;
  const t = text.replace(/\s/g, "");
  return catalog.find((p) => t.includes(p.name.replace(/\s/g, ""))) || null;
}

// BuyPanel이 기대하는 상품 모양으로 변환 — 카탈로그마다 price 표기가 달라 parseWon으로 정규화.
function toBuyItem(p) {
  return {
    id: p.id, name: p.name, price: parseWon(p.price), image: p.image, quantity: 1, option_id: p.option_id ?? null,
    sub: p.sub, spec: p.spec, desc: p.longDesc || p.desc,
  };
}

// 챗봇 응답의 products(ProductDetailResponse, GET /api/shop/products와 동일한 필드 이름)를
// 옆 패널 카드(matchProducts가 만드는 로컬 카탈로그 아이템)와 같은 모양으로 변환한다.
function fromApiProduct(p) {
  return {
    id: p.id,
    name: p.name,
    desc: p.description,
    image: p.thumbnail_url,
    alt: p.name,
    price: String(p.base_price),
    originalPrice: null,
    option_id: p.options?.[0]?.id ?? null,
  };
}

// 챗봇 안에서 바로 회원가입하는 미니 패널 — Register.jsx의 검증/중복확인/캡차 로직을 그대로 재사용,
// 약관만 체크박스 하나로 합쳐서 "간편하게" 끝낸다.
function SignupPanel({ onClose, onDone }) {
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const captchaRetriedRef = useRef(false);
  // 이메일 가입 폼과 SNS 버튼 3개가 hCaptcha 위젯 하나를 공유한다 — Login.jsx와 동일한 패턴.
  // execute() 결과를 onVerify에서 어느 액션으로 처리할지 구분하는 값 ("register" 또는 provider명).
  const pendingActionRef = useRef("register");

  const [showTerms, setShowTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [agreeError, setAgreeError] = useState("");
  const [ageConfirmError, setAgeConfirmError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const checkNickname = async () => {
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요.");
      setNicknameChecked(false);
      return;
    }
    try {
      const res = await checkNicknameAPI(nickname);
      setNicknameError(res.data.available ? "사용 가능한 닉네임입니다." : res.data.message);
      setNicknameChecked(res.data.available);
    } catch {
      setNicknameError("중복 확인 중 오류가 발생했습니다.");
      setNicknameChecked(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) { setEmailError("이메일을 입력해주세요."); isValid = false; }
    else if (!emailRegex.test(email)) { setEmailError("올바른 이메일 형식을 입력해주세요."); isValid = false; }
    else setEmailError("");

    if (!nickname) { setNicknameError("닉네임을 입력해주세요."); isValid = false; }
    else if (!nicknameChecked) { setNicknameError("닉네임 중복확인을 해주세요."); isValid = false; }
    else setNicknameError("");

    if (!password) { setPasswordError("비밀번호를 입력해주세요."); isValid = false; }
    else if (password.length < 6) { setPasswordError("비밀번호는 6자 이상 입력해주세요."); isValid = false; }
    else setPasswordError("");

    if (!passwordConfirm) { setPasswordConfirmError("비밀번호 확인을 입력해주세요."); isValid = false; }
    else if (password !== passwordConfirm) { setPasswordConfirmError("비밀번호가 일치하지 않습니다."); isValid = false; }
    else setPasswordConfirmError("");

    if (!agree) { setAgreeError("필수 약관에 동의해주세요."); isValid = false; }
    else setAgreeError("");

    if (!ageConfirm) { setAgeConfirmError("만 14세 이상만 가입할 수 있습니다."); isValid = false; }
    else setAgeConfirmError("");

    if (!isValid) return;

    pendingActionRef.current = "register";
    setCaptchaError("");
    setSubmitting(true);
    captchaRetriedRef.current = false;
    recaptchaRef.current?.execute();
  };

  // 카카오/네이버/구글 버튼 — Login.jsx와 동일하게 hCaptcha를 먼저 통과시켜 1회용 ticket을
  // 받고, 브라우저를 OAuth 인가 엔드포인트로 직접 이동시킨다(SNS 로그인=신규면 자동 가입).
  const handleSocialClick = (provider) => {
    pendingActionRef.current = provider;
    setCaptchaError("");
    setSubmitting(true);
    captchaRetriedRef.current = false;
    recaptchaRef.current?.execute();
  };

  const handleCaptchaVerify = async (token) => {
    const action = pendingActionRef.current;
    if (action === "register") return handleRegisterVerify(token);
    if (action === "login-retry") return handleLoginRetryVerify(token);
    return handleSocialVerify(token, action);
  };

  const handleSocialVerify = async (token, provider) => {
    try {
      const res = await requestSocialCaptchaTicket(token);
      window.location.href = `${SPRING_URL}/oauth2/authorization/${provider}?ticket=${encodeURIComponent(res.data.ticket)}`;
    } catch (err) {
      const msg = err.response?.data?.error || "보안 인증에 실패했습니다. 다시 시도해주세요.";
      setCaptchaError(`※${msg}`);
      recaptchaRef.current?.resetCaptcha();
      setSubmitting(false);
    }
  };

  const handleRegisterVerify = async (token) => {
    try {
      await registerUser({ email, nickname, password, password_confirm: passwordConfirm, recaptcha_token: token });
      localStorage.setItem("nickname", nickname);
      recaptchaRef.current?.resetCaptcha();
      setSubmitting(false);
      onDone(nickname);
      openLogin();
    } catch (err) {
      const data = err.response?.data;
      // 이미 가입된 이메일이면 에러로 막지 않고, 방금 입력한 정보로 바로 로그인을 이어서
      // 시도한다 — hCaptcha 토큰은 1회용이라 execute()를 다시 트리거해 새 토큰을 받아야 한다.
      if (data?.email?.includes?.("이미")) {
        pendingActionRef.current = "login-retry";
        recaptchaRef.current?.resetCaptcha();
        recaptchaRef.current?.execute();
        return;
      }
      if (!data) {
        setEmailError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        if (data.email) setEmailError(Array.isArray(data.email) ? data.email[0] : data.email);
        if (data.nickname) setNicknameError(Array.isArray(data.nickname) ? data.nickname[0] : data.nickname);
        if (data.password) setPasswordError(Array.isArray(data.password) ? data.password[0] : data.password);
        if (data.password_confirm) setPasswordConfirmError(Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm);
        if (data.non_field_errors) setPasswordError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        if (data.error) setCaptchaError(`※${data.error}`);
      }
      recaptchaRef.current?.resetCaptcha();
      setSubmitting(false);
    }
  };

  // 회원가입을 시도했는데 알고 보니 이미 있던 계정인 경우 — 같은 이메일/비밀번호로
  // 로그인까지 대신 이어서 처리한다. Login.jsx와 동일하게 이메일 인증(OTP) 단계로 넘긴다.
  const handleLoginRetryVerify = async (token) => {
    try {
      const res = await loginUser({ username: email, password, recaptcha_token: token });
      sessionStorage.setItem("pending_access_token", res.data.access);
      sessionStorage.setItem("pending_refresh_token", res.data.refresh);
      sessionStorage.setItem("pending_nickname", res.data.user.nickname);
      recaptchaRef.current?.resetCaptcha();
      setSubmitting(false);
      alert("이미 가입이 된 회원입니다.\n정상적으로 로그인 완료되었습니다.");
      navigate("/email-verify");
    } catch (err) {
      const msg = err.response?.data?.error || "비밀번호가 일치하지 않습니다.";
      setEmailError(`이미 가입된 이메일입니다. ${msg}`);
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

  // "약관 보기"는 이제 폼 안 220px짜리 좁은 스크롤박스 대신, 챗봇 오른쪽 패널
  // 전체를 약관 전용 화면으로 바꿔서 보여준다 — 글이 길어서 좁은 박스로는 읽기
  // 불편했음. 뒤로가기를 누르면 입력하던 폼 내용은 그대로 유지된 채 돌아온다.
  if (showTerms) {
    return (
      <div className="chatBotSidePanel chatBotSignupPanel">
        <div className="chatBotSideHeader">
          <button className="chatBotSideBack" onClick={() => setShowTerms(false)} aria-label="회원가입으로 돌아가기">
            <ArrowLeft size={15} />
          </button>
          <p className="chatBotSideTitle">이용약관 · 개인정보 처리방침</p>
          <button className="chatBotSideClose" onClick={onClose} aria-label="회원가입 패널 닫기">✕</button>
        </div>
        <div className="chatBotSignupTermsFull" data-lenis-prevent>
          <h4>이용약관</h4>
          {TERMS_OF_SERVICE.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          <h4>개인정보 처리방침</h4>
          {PRIVACY_POLICY.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>
        <div className="chatBotSignupTermsFooter">
          <button type="button" className="chatBotSignupSubmit" onClick={() => setShowTerms(false)}>
            확인했습니다
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chatBotSidePanel chatBotSignupPanel">
      <div className="chatBotSideHeader">
        <p className="chatBotSideTitle">간편 회원가입</p>
        <button className="chatBotSideClose" onClick={onClose} aria-label="회원가입 패널 닫기">✕</button>
      </div>
      <form className="chatBotSignupBody" data-lenis-prevent onSubmit={handleRegister}>
        <div className="chatBotSignupHero">
          <span className="chatBotSignupHeroIcon"><UserPlus size={19} /></span>
          <div>
            <p className="chatBotSignupHeroTitle">집다움 회원 되기</p>
            <p className="chatBotSignupHeroSub">몇 초면 끝나요, 지금 바로 시작해보세요</p>
          </div>
        </div>

        <div className="chatBotSignupField">
          <Mail size={15} className="chatBotSignupFieldIcon" />
          <input type="text" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
        </div>
        {emailError && <p className="chatBotSignupError"><AlertCircle size={12} />{emailError}</p>}

        <div className="chatBotSignupNickRow">
          <div className="chatBotSignupField">
            <User size={15} className="chatBotSignupFieldIcon" />
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setNicknameChecked(false); setNicknameError(""); }}
              disabled={submitting}
            />
          </div>
          <button type="button" className="chatBotSignupCheckBtn" onClick={checkNickname} disabled={submitting}>중복확인</button>
        </div>
        {nicknameError && (
          <p className={nicknameChecked ? "chatBotSignupSuccess" : "chatBotSignupError"}>
            {nicknameChecked ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}{nicknameError}
          </p>
        )}

        <div className="chatBotSignupField">
          <Lock size={15} className="chatBotSignupFieldIcon" />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordConfirmError(passwordConfirm && e.target.value !== passwordConfirm ? "비밀번호가 일치하지 않습니다." : "");
            }}
            disabled={submitting}
          />
        </div>
        {passwordError && <p className="chatBotSignupError"><AlertCircle size={12} />{passwordError}</p>}

        <div className="chatBotSignupField">
          <Lock size={15} className="chatBotSignupFieldIcon" />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setPasswordConfirmError(password !== e.target.value ? "비밀번호가 일치하지 않습니다." : "");
            }}
            disabled={submitting}
          />
        </div>
        {passwordConfirmError && <p className="chatBotSignupError"><AlertCircle size={12} />{passwordConfirmError}</p>}

        <button type="button" className="chatBotSignupTermsBtn" onClick={() => setShowTerms(true)}>
          약관 보기 <ChevronDown size={13} />
        </button>

        <label className="chatBotSignupAgree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} disabled={submitting} />
          <span>이용약관 및 개인정보 처리방침에 동의합니다 <em>(필수)</em></span>
        </label>
        {agreeError && <p className="chatBotSignupError"><AlertCircle size={12} />{agreeError}</p>}

        <label className="chatBotSignupAgree">
          <input type="checkbox" checked={ageConfirm} onChange={(e) => setAgeConfirm(e.target.checked)} disabled={submitting} />
          <span>만 14세 이상입니다 <em>(필수)</em></span>
        </label>
        {ageConfirmError && <p className="chatBotSignupError"><AlertCircle size={12} />{ageConfirmError}</p>}

        <label className="chatBotSignupAgree">
          <input type="checkbox" checked={marketingAgree} onChange={(e) => setMarketingAgree(e.target.checked)} disabled={submitting} />
          <span>이벤트·혜택 정보 수신에 동의합니다 (선택)</span>
        </label>

        <HCaptcha
          ref={recaptchaRef}
          sitekey={HCAPTCHA_SITE_KEY}
          size="invisible"
          languageOverride="ko"
          onVerify={handleCaptchaVerify}
          onError={handleCaptchaError}
          onExpire={() => setSubmitting(false)}
        />
        {captchaError && <p className="chatBotSignupError"><AlertCircle size={12} />{captchaError}</p>}

        <button type="submit" className="chatBotSignupSubmit" disabled={submitting}>
          {submitting ? "확인 중..." : <>회원가입 <ArrowRight size={14} /></>}
        </button>

        {/* SNS 회원가입 — Login.jsx의 카카오/네이버/구글 버튼과 같은 흐름(이미 로드된
            Login.css의 전역 .snsLogin/.kakaoBtn 등을 그대로 재사용, 새 CSS 없이 톤 통일) */}
        <div className="chatBotSignupDivider"><span>또는</span></div>
        <div className="snsLogin chatBotSignupSns">
          <button type="button" className="kakaoBtn" disabled={submitting} onClick={() => handleSocialClick("kakao")}>
            <SiKakaotalk className="snsIcon" />카카오로 가입하기
          </button>
          <button type="button" className="naverBtn" disabled={submitting} onClick={() => handleSocialClick("naver")}>
            <SiNaver className="snsIcon" />네이버로 가입하기
          </button>
          <button type="button" className="googleBtn" disabled={submitting} onClick={() => handleSocialClick("google")}>
            <FcGoogle className="snsIcon" />Google로 가입하기
          </button>
        </div>

        <button type="button" className="chatBotSignupLoginLink" onClick={openLogin}>
          <LogIn size={12} />
          이미 계정이 있으신가요? 로그인
        </button>
      </form>
    </div>
  );
}

// 챗봇 안에서 바로 회원탈퇴하는 미니 패널 — WithdrawModal.jsx의 탈퇴 사유/동의 체크/
// withdrawUser 로직을 그대로 재사용. 완료 후 "고마웠다"는 화면을 패널 안에 따로 두지
// 않고(로그아웃 처리로 패널 자체가 닫히므로), 성공하면 onDone()으로 부모가 패널을 닫고
// 챗봇 대화창에 인사 메시지를 남기게 위임한다 — BuyPanel/SignupPanel과 동일한 패턴.
function WithdrawPanel({ onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!agree || submitting) return;
    setSubmitting(true);
    const refresh = localStorage.getItem("refresh_token");
    try {
      await withdrawUser({ refresh: refresh || null });
    } catch {
      alert("탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    window.dispatchEvent(new Event("authchange"));
    onDone();
  };

  return (
    <div className="chatBotSidePanel chatBotWithdrawPanel">
      <div className="chatBotSideHeader">
        <p className="chatBotSideTitle">회원 탈퇴</p>
        <button className="chatBotSideClose" onClick={onClose} aria-label="탈퇴 패널 닫기">✕</button>
      </div>
      <div className="chatBotWithdrawBody" data-lenis-prevent>
        <div className="chatBotWithdrawHero">
          <span className="chatBotWithdrawHeroIcon"><UserX size={19} /></span>
          <p>탈퇴 시 회원 정보와 주문 내역이 삭제되며 복구할 수 없어요.</p>
        </div>

        <div className="chatBotWithdrawNotice">
          <p><AlertTriangle size={13} /> 탈퇴 전 확인해주세요</p>
          <ul>
            <li>보유 쿠폰 및 적립금은 모두 소멸됩니다.</li>
            <li>진행 중인 주문이 있다면 탈퇴가 제한될 수 있습니다.</li>
            <li>탈퇴 후 동일 계정으로 재가입이 어려울 수 있습니다.</li>
          </ul>
        </div>

        <select className="chatBotWithdrawSelect" value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitting}>
          <option value="">탈퇴 사유를 선택해주세요 (선택)</option>
          <option value="product">원하는 상품이나 콘텐츠가 부족해요</option>
          <option value="benefit">가격이나 혜택이 아쉬워요</option>
          <option value="service">사이트 이용이 불편해요</option>
          <option value="otherService">다른 서비스를 주로 이용해요</option>
          <option value="privacy">개인정보 및 보안이 걱정돼요</option>
          <option value="etc">기타</option>
        </select>

        <label className="chatBotWithdrawAgree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} disabled={submitting} />
          <span>위 안내사항을 모두 확인했으며 탈퇴에 동의합니다.</span>
        </label>
      </div>
      <div className="chatBotWithdrawFooter">
        <button type="button" className="chatBotWithdrawCancelBtn" onClick={onClose} disabled={submitting}>취소</button>
        <button type="button" className="chatBotWithdrawDeleteBtn" onClick={handleDelete} disabled={!agree || submitting}>
          {submitting ? "처리 중..." : "탈퇴하기"}
        </button>
      </div>
    </div>
  );
}

// 챗봇 안에서 바로 결제하는 미니 패널 — Checkout.jsx의 로직(주문 생성 → 결제 준비 →
// PortOne 결제창 → 검증)을 그대로 재사용하되, 카카오페이 단일 상품 결제만 다루므로
// 배송지 입력 한 화면으로 끝낸다 (여러 단계 스테퍼·쿠폰은 여기선 생략 — 필요해지면 추가).
function BuyPanel({ item, onClose, onPaid }) {
  const { openLogin } = useAuthModal();
  const [form, setForm] = useState({ recipient: "", phone: "", address: "", detail: "" });
  const [isPaying, setIsPaying] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || 1);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const totalPrice = item.price * quantity;

  // 상세 설명 하이라이트 — HomeProductDetail.jsx와 동일한 방식으로 spec 문자열을 쪼갠다.
  // spec이 있는 카탈로그(메인)에서만 의미가 있고, 한국관은 longDesc 자체가 이미 상세 설명이라 생략.
  const materialText = item.spec?.split("MATERIAL :")[1]?.trim();
  const sizeText = item.spec?.split("·")[0]?.replace("SIZE :", "").trim();
  const highlights = item.spec
    ? [
        { Icon: Sparkles, title: "소재감", text: `${materialText} 소재를 사용해 은은한 광택과 촉감, 내구성을 함께 잡았습니다.` },
        { Icon: Ruler, title: "사이즈", text: `${sizeText}. 공간에 배치하기 전 사이즈를 꼭 확인해주세요.` },
        { Icon: ShieldCheck, title: "품질 검수", text: "출고 전 모든 제품을 하나하나 검수해 안심하고 사용하실 수 있습니다." },
      ]
    : [];

  const handlePay = async () => {
    if (!form.recipient.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("수령인, 연락처, 주소를 모두 입력해주세요.");
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }

    const shippingAddr = [form.address, form.detail].filter(Boolean).join(" ");
    setIsPaying(true);
    try {
      let orderRes;
      try {
        orderRes = await createOrder({
          shipping_addr: shippingAddr,
          coupon_code: "",
          items: [{ product_id: item.id, option_id: item.option_id || null, quantity }],
        });
      } catch (e) {
        alert(`[주문 생성 오류] ${e.response?.data?.message || e.message}`);
        return;
      }
      const { order_id } = orderRes.data;

      let readyRes;
      try {
        readyRes = await readyPayment({ order_id, method: "KAKAO" });
      } catch (e) {
        alert(`[결제 준비 오류] ${e.response?.data?.message || e.message}`);
        return;
      }
      const { merchant_uid, amount } = readyRes.data;

      const paymentResponse = await PortOne.requestPayment({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        paymentId: merchant_uid,
        orderName: item.name,
        totalAmount: amount, // 백엔드가 반환한 최종 금액
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        easyPay: { easyPayProvider: "KAKAOPAY" },
      });

      if (paymentResponse?.code != null) {
        alert(paymentResponse.message || "결제가 취소되었습니다.");
        return;
      }

      try {
        await verifyPayment({ payment_id: paymentResponse.paymentId, merchant_uid });
        onPaid(item);
      } catch (e) {
        alert(`[검증 오류] ${e.response?.data?.message || e.message}`);
      }
    } catch (e) {
      alert(`[결제 오류] ${e.message || "알 수 없는 오류가 발생했습니다."}`);
      console.error(e);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="chatBotSidePanel chatBotBuyPanel">
      <div className="chatBotSideHeader">
        <p className="chatBotSideTitle">바로 결제</p>
        <button className="chatBotSideClose" onClick={onClose} aria-label="결제 패널 닫기">✕</button>
      </div>
      <div className="chatBotBuyBody" data-lenis-prevent>
        <div className="chatBotBuyImgWrap">
          <img src={item.image} alt={item.name} className="chatBotBuyImg" />
        </div>

        <div className="chatBotBuyInfo">
          {item.sub && <p className="chatBotBuySub">{item.sub}</p>}
          <p className="chatBotBuyName">{item.name}</p>
          {item.desc && <p className="chatBotBuyDesc">{item.desc}</p>}
          {item.spec && <p className="chatBotBuySpec">{item.spec}</p>}
        </div>

        {highlights.length > 0 && (
          <div className="chatBotBuyHighlights">
            {highlights.map((h) => (
              <div className="chatBotBuyHighlight" key={h.title}>
                <h.Icon size={16} className="chatBotBuyHighlightIcon" />
                <div>
                  <p className="chatBotBuyHighlightTitle">{h.title}</p>
                  <p className="chatBotBuyHighlightText">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="chatBotBuyQtyRow">
          <span className="chatBotBuyQtyLabel">수량</span>
          <div className="chatBotBuyQtyStepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={isPaying} aria-label="수량 감소">−</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)} disabled={isPaying} aria-label="수량 증가">+</button>
          </div>
        </div>

        <div className="chatBotBuyForm">
          <input name="recipient" value={form.recipient} onChange={handleChange} placeholder="수령인" disabled={isPaying} />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처" disabled={isPaying} />
          <input name="address" value={form.address} onChange={handleChange} placeholder="주소" disabled={isPaying} />
          <input name="detail" value={form.detail} onChange={handleChange} placeholder="상세주소 (선택)" disabled={isPaying} />
        </div>
      </div>
      <div className="chatBotBuyFooter">
        <span className="chatBotBuyTotal">{totalPrice.toLocaleString("ko-KR")}원</span>
        <button className="chatBotBuyPayBtn" onClick={handlePay} disabled={isPaying}>
          {isPaying ? "결제 처리 중..." : "카카오페이로 결제"}
        </button>
      </div>
    </div>
  );
}

// catalog: 상품 추천 패널이 검색할 상품 목록 (라우트별로 카탈로그가 분리돼 있어 기본값은 메인 페이지 PRODUCTS).
// detailBasePath: 카드 클릭 시 이동할 상세페이지 경로 접두사 — 메인은 /item, 한국관은 /product.
// variant: "korean-hall"이면 ChatBot.css의 .chatBotKoreanHall 테마(한지톤+오방색)가 적용된다.
// botName / greeting: 헤더 이름과 첫 인사말 — 페이지별로 챗봇 정체성을 다르게 줄 때 사용.
function ChatBot({
  catalog = PRODUCTS,
  detailBasePath = "/item",
  variant = "default",
  botName = "집다움 챗봇",
  greeting = DEFAULT_GREETING,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
  const [messages, setMessages] = useState(() => {
    // 로그인 상태면 저장해둔 이 챗봇(variant)의 대화 기록을 복원 — 없으면 인사말만.
    if (loggedIn) {
      const saved = chatMemory[variant]?.messages;
      return saved?.length ? saved : [{ id: 0, role: "bot", text: greeting, time: Date.now() }];
    }
    // 비회원 — 인사말 다음에 브랜드 소개, 그다음 회원가입 유도 버튼까지 먼저 보여준다.
    return [
      { id: 0, role: "bot", text: greeting, time: Date.now() },
      { id: 1, role: "bot", text: GUEST_BRAND_INTRO, time: Date.now() },
      { id: 2, role: "bot", text: GUEST_SIGNUP_NUDGE, time: Date.now(), action: "signup" },
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState(null); // { title, items } | null — 질문에 맞는 상품 추천 패널
  const [buyItem, setBuyItem] = useState(null); // 옆 패널에서 "바로 구매" 누른 상품 — 있으면 추천 패널 대신 결제 패널을 보여준다
  const [showSignup, setShowSignup] = useState(false); // 회원가입 의도가 감지되면 다른 패널보다 우선해서 보여준다
  const [showWithdraw, setShowWithdraw] = useState(false); // 로그인 상태에서 탈퇴 의도가 감지되면 보여준다
  const messagesRef = useRef(null);
  const wasLoggedInRef = useRef(loggedIn);

  // 로그인 계정의 대화 기록을 저장해뒀다가(챗봇 재오픈·페이지 이동에도 유지), 로그아웃
  // 시점에 즉시 비운다. authchange는 로그인/로그아웃 양쪽에서 다 쏘는 이벤트라 직접
  // 전후 상태를 비교해서 "로그인 → 로그아웃"으로 바뀐 순간만 잡아낸다.
  useEffect(() => {
    const sync = () => {
      const now = !!localStorage.getItem("access_token");
      if (wasLoggedInRef.current && !now) {
        clearChatMemory();
        setMessages([{ id: 0, role: "bot", text: greeting, time: Date.now() }]);
        setPanel(null);
        setBuyItem(null);
        setShowSignup(false);
        setShowWithdraw(false);
      }
      wasLoggedInRef.current = now;
      setLoggedIn(now);
    };
    window.addEventListener("authchange", sync);
    return () => window.removeEventListener("authchange", sync);
  }, [greeting]);

  // 로그인 상태에서만 대화 내용을 모듈 메모리에 계속 반영한다.
  useEffect(() => {
    if (loggedIn) chatMemory[variant] = { messages };
  }, [messages, loggedIn, variant]);

  // 결제 패널(PortOne)·회원가입 패널(hCaptcha)은 화면 좌표에 고정으로 뜨는 외부 팝업을
  // 띄운다 — AuthModalContext가 로그인/회원가입 모달에서 이미 쓰는 것과 같은 이유로,
  // 배경 페이지가 계속 스크롤되면 팝업만 뜬 시점 좌표에 남아 따로 노는 것처럼 보인다.
  // 그동안은 Lenis를 멈춰서 팝업이 화면에 그대로 고정돼 보이게 한다.
  useEffect(() => {
    if (!buyItem && !showSignup) return;
    window.lenis?.stop();
    return () => window.lenis?.start();
  }, [buyItem, showSignup]);

  // CustomerCenter의 "1:1 문의"/"채팅 상담" 카드를 눌러 홈으로 넘어온 경우 —
  // 챗봇을 자동으로 펼쳐서 바로 대화를 시작할 수 있게 한다.
  useEffect(() => {
    if (sessionStorage.getItem(NAV_FLAGS.PENDING_OPEN_CHATBOT)) {
      sessionStorage.removeItem(NAV_FLAGS.PENDING_OPEN_CHATBOT);
      setOpen(true);
    }
  }, []);

  // 스크롤 자동
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const sendText = async (text) => {
    if (!text || loading) return;

    // 초기 인사말(id:0)은 실제 대화가 아니므로 서버에 보낼 history에서 제외한다.
    // history는 캡차와 무관하게 멀티턴 문맥 유지를 위해 항상 실어 보낸다.
    const history = messages
      .filter((m) => m.id !== 0)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

    // 옆 패널은 한 번에 하나만 — 회원가입 의도가 최우선, 그다음 (로그인 상태에서) 탈퇴
    // 의도, 그다음 "결제/구매"+상품명, 마지막으로 상품 추천. 넷 다 아니면 패널을 닫아
    // 매 질문마다 화면이 갱신되게 한다.
    if (SIGNUP_KEYWORDS.test(text)) {
      setShowSignup(true);
      setShowWithdraw(false);
      setBuyItem(null);
      setPanel(null);
    } else if (WITHDRAW_KEYWORDS.test(text) && loggedIn) {
      setShowWithdraw(true);
      setShowSignup(false);
      setBuyItem(null);
      setPanel(null);
    } else {
      setShowSignup(false);
      setShowWithdraw(false);
      const buyMatch = matchBuyProduct(text, catalog);
      if (buyMatch) {
        setBuyItem(toBuyItem(buyMatch));
        setPanel(null);
      } else {
        setBuyItem(null);
        setPanel(matchProducts(text, catalog));
      }
    }

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text, time: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text, history, variant);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: res.data.reply, time: Date.now() }]);
      // 챗봇이 실제로 검색해서 찾은 상품이 있으면(예: "한국관 상품 뭐가 있어" 같은 일반 질문도
      // 포함) 로컬 키워드 매칭(matchProducts) 결과를 실제 검색 결과로 덮어써서 화면과 챗봇
      // 답변이 항상 일치하게 한다. 못 찾았으면(products 없음) 로컬 매칭 결과를 그대로 둔다.
      if (res.data.products?.length > 0) {
        setBuyItem(null);
        setPanel({ title: "🔍 찾아본 상품", items: res.data.products.map(fromApiProduct) });
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: "일시적인 오류가 발생했습니다.", time: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendText(input.trim());

  return (
    <div
      className={
        "chatBotRoot" +
        (variant === "korean-hall" ? " chatBotKoreanHall" : "")
      }
      // data-lenis-prevent — onWheel stopPropagation만으로는 부족했다(Sidebar.jsx의
      // sidebarRail/recentDock/railTopBtnWrap과 같은 이유). 이 FAB은 상품 목록
      // 페이지 위에 fixed로 떠 있어서, 이 위에서 휠을 굴리면 Lenis가 이 버튼을
      // 그냥 지나쳐 배경(가로 트랙)을 스크롤해버려 페이지가 옆 패널로 튕겨나갔다.
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 채팅 패널 */}
      <div className={"chatBotPanel" + (open ? " chatBotPanelOpen" : "") + ((panel || buyItem || showSignup || showWithdraw) ? " chatBotPanelWithSide" : "")}>
        <div className="chatBotMain">
          <div className="chatBotHeader">
            <div className="chatBotAvatar">
              <img
                src={variant === "korean-hall" ? JipdaumHanokLogo : JDLogo}
                alt="집다움"
                className="chatBotAvatarImg"
              />
            </div>
            <div style={{ flex: 1 }}>
              <p className="chatBotName">{botName}</p>
              <p className="chatBotStatus">온라인</p>
            </div>
            <button className="chatBotClose" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatBotMessages" ref={messagesRef} data-lenis-prevent>
            {messages.map((msg) => (
              <div key={msg.id} className={"chatMsg " + msg.role}>
                {msg.role === "bot" && (
                  <span className="chatMsgAvatar">
                    <img
                      src={variant === "korean-hall" ? JipdaumHanokLogo : JDLogo}
                      alt="집다움"
                      className="chatMsgAvatarImg"
                    />
                  </span>
                )}
                <div className="chatMsgCol">
                  <div className="chatBubble">
                    {msg.text.split("\n").map((line, i) => (
                      <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                    ))}
                  </div>
                  {msg.action === "signup" && (
                    <button
                      className="chatQuickChip chatSignupNudgeBtn"
                      onClick={() => { setShowSignup(true); setPanel(null); setBuyItem(null); }}
                    >
                      🙋 지금 회원가입하기
                    </button>
                  )}
                  {msg.time && <span className="chatMsgTime">{formatTime(msg.time)}</span>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatMsg bot">
                <span className="chatMsgAvatar">
                  <img
                    src={variant === "korean-hall" ? JipdaumHanokLogo : JDLogo}
                    alt="집다움"
                    className="chatMsgAvatarImg"
                  />
                </span>
                <div className="chatBubble chatTyping"><span /><span /><span /></div>
              </div>
            )}
            {!messages.some((m) => m.role === "user") && !loading && (
              <div className="chatQuickReplies">
                {QUICK_REPLIES.map((q) => (
                  <button key={q} className="chatQuickChip" onClick={() => sendText(q)}>{q}</button>
                ))}
              </div>
            )}
          </div>

          <div className="chatBotInput">
            <div className="chatBotInputBar">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="메시지를 입력하세요"
                disabled={loading}
              />
              <button className="chatBotSend" onClick={send} disabled={loading || !input.trim()} aria-label="전송">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="6 11 12 5 18 11" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 옆 패널: 회원가입 의도 > 탈퇴 의도 > "바로 구매" 상품 > 추천 목록 순으로 하나만 보여준다 */}
        {showSignup ? (
          <SignupPanel
            onClose={() => setShowSignup(false)}
            onDone={(nickname) => {
              setShowSignup(false);
              setMessages((prev) => [
                ...prev,
                { id: Date.now(), role: "bot", text: `"${nickname}"님, 회원가입이 완료되었습니다! 🎉\n로그인 후 다양한 혜택을 만나보세요.`, time: Date.now() },
              ]);
            }}
          />
        ) : showWithdraw ? (
          <WithdrawPanel
            onClose={() => setShowWithdraw(false)}
            onDone={() => {
              setShowWithdraw(false);
              setMessages((prev) => [
                ...prev,
                { id: Date.now(), role: "bot", text: "그동안 집다움을 이용해주셔서 감사했습니다. 탈퇴가 완료되었습니다. 더 나은 모습으로 다시 찾아뵐게요.", time: Date.now() },
              ]);
            }}
          />
        ) : buyItem ? (
          <BuyPanel
            item={buyItem}
            onClose={() => setBuyItem(null)}
            onPaid={(item) => {
              setBuyItem(null);
              setMessages((prev) => [
                ...prev,
                { id: Date.now(), role: "bot", text: `"${item.name}" 결제가 완료되었습니다! 🎉\n주문해주셔서 감사합니다.`, time: Date.now() },
              ]);
            }}
          />
        ) : panel && (
          /* 질문 내용에 맞는 상품 추천 패널 — 질문이 바뀌면 내용도 함께 바뀐다 */
          <div className="chatBotSidePanel">
            <div className="chatBotSideHeader">
              <p className="chatBotSideTitle">{panel.title}</p>
              <button className="chatBotSideClose" onClick={() => setPanel(null)} aria-label="상품 패널 닫기">✕</button>
            </div>
            <div className="chatBotSideList" data-lenis-prevent>
              {panel.items.map((p) => {
                // 카탈로그마다 price 표기가 다르다 (메인은 "328,000" 콤마 문자열, 한국관은 128000 숫자) —
                // parseWon으로 한 번 숫자로 정규화한 뒤 toLocaleString으로 통일해서 표기한다.
                const priceNum = parseWon(p.price);
                const originalNum = p.originalPrice ? parseWon(p.originalPrice) : null;
                const discountPct = originalNum ? Math.round((1 - priceNum / originalNum) * 100) : 0;
                return (
                  <div key={p.id} className="chatBotSideCard" onClick={() => navigate(`${detailBasePath}/${p.id}`)}>
                    <img src={p.image} alt={p.alt || p.name} className="chatBotSideImg" />
                    <div className="chatBotSideInfo">
                      <p className="chatBotSideName">{p.name}</p>
                      <p className="chatBotSideDesc">{p.desc}</p>
                      <div className="chatBotSidePrice">
                        {originalNum && <span className="chatBotSideDiscount">{discountPct}%</span>}
                        <span className="chatBotSideNow">{priceNum.toLocaleString("ko-KR")}원</span>
                        {originalNum && <span className="chatBotSideOrig">{originalNum.toLocaleString("ko-KR")}원</span>}
                      </div>
                      <button
                        className="chatBotSideBuyBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBuyItem(toBuyItem(p));
                        }}
                      >
                        바로 구매
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <div className={"chatBotFabWrap" + (open ? " chatBotFabWrapHidden" : "")}>
        <button
          type="button"
          className="chatBotFab"
          onClick={() => setOpen((v) => !v)}
          aria-label="AI 채팅 열기"
        >
          <svg className="chatBotFabIcon" viewBox="0 0 24 24" fill="none">
            <defs>
              {/* 집다움(메인)만 파스텔 — 한국관은 원래 실버 톤 유지 (variant 공용 컴포넌트라 여기서 분기) */}
              <linearGradient id="chatBotFabGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={variant === "korean-hall" ? "#eef0f2" : "#f7b8d8"} />
                <stop offset="1" stopColor={variant === "korean-hall" ? "#8b9098" : "#c9baf7"} />
              </linearGradient>
            </defs>
            <path d="M4 5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4.4 3.3A.6.6 0 0 1 4.7 19.3V16.5H6a2 2 0 0 1-2-2z" fill="url(#chatBotFabGrad)" />
            <path d="M9 9.5h6M9 12.5h4" stroke="#2e2f31" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M18.5 3.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="#f4f5f6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
