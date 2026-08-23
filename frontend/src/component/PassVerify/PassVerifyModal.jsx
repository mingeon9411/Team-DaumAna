import "./PassVerifyModal.css";
import { forwardRef, useImperativeHandle, useState } from "react";

// PASS(통신사 본인인증) 흐름을 흉내만 내는 데모용 컴포넌트 — 실제 통신사 인증은
// NICE평가정보/다날/이니시스 같은 대행사와 사업자 계약을 맺어야 붙일 수 있어서
// (개인/학생 프로젝트로는 사실상 불가능), 화면 흐름만 재현하고 실제 검증은 하지 않는다.
//
// react-hcaptcha와 같은 imperative 인터페이스(ref.execute()/ref.resetCaptcha(),
// onVerify/onError/onExpire props)를 그대로 흉내내서, 이 컴포넌트를 쓰는 쪽
// (Register.jsx, Login.jsx, ChatBot.jsx)의 나머지 로직은 한 줄도 안 건드리고
// <HCaptcha .../> 태그만 이걸로 갈아끼우면 되게 만들었다.
const CARRIERS = [
  { id: "skt", label: "SKT" },
  { id: "kt", label: "KT" },
  { id: "lgu", label: "LG U+" },
  { id: "mvno", label: "알뜰폰" },
];

const PassVerifyModal = forwardRef(function PassVerifyModal({ onVerify, onError, onExpire }, ref) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("select"); // "select" | "verifying" | "done"
  const [carrier, setCarrier] = useState(null);

  useImperativeHandle(ref, () => ({
    execute: () => {
      setStep("select");
      setCarrier(null);
      setOpen(true);
    },
    resetCaptcha: () => {
      setOpen(false);
      setStep("select");
      setCarrier(null);
    },
  }));

  const handleSelectCarrier = (c) => {
    setCarrier(c);
    setStep("verifying");
    // 실제 통신사 인증 서버 왕복 대신, 타이머로 "인증 중 → 완료" 흐름만 재현.
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        setOpen(false);
        onVerify?.(`mock-pass-${c.id}-${Date.now()}`);
      }, 700);
    }, 1300);
  };

  const handleClose = () => {
    if (step === "verifying") return; // 인증 진행 중엔 닫기 막기(실제 PASS도 동일)
    setOpen(false);
    onExpire?.();
  };

  if (!open) return null;

  return (
    <div className="passVerifyOverlay" onClick={handleClose}>
      <div className="passVerifyBox" onClick={(e) => e.stopPropagation()}>
        {step !== "verifying" && (
          <button type="button" className="passVerifyClose" onClick={handleClose} aria-label="닫기">
            ×
          </button>
        )}

        <span className="passVerifyLogo">PASS</span>

        {step === "select" && (
          <>
            <p className="passVerifyTitle">본인확인 서비스</p>
            <p className="passVerifyDesc">통신사를 선택해주세요</p>
            <div className="passCarrierGrid">
              {CARRIERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="passCarrierBtn"
                  onClick={() => handleSelectCarrier(c)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="passVerifyNote">* 데모 환경 — 실제 본인인증 대신 화면 흐름만 재현됩니다.</p>
          </>
        )}

        {step === "verifying" && (
          <div className="passVerifyStatus">
            <span className="passSpinner" />
            <p>{carrier?.label} 인증 진행 중...</p>
          </div>
        )}

        {step === "done" && (
          <div className="passVerifyStatus">
            <span className="passCheckIcon">✓</span>
            <p>인증이 완료되었습니다</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default PassVerifyModal;
