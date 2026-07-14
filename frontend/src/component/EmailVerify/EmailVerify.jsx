import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendEmailOTP, verifyEmailOTP } from '../../api';
import { useAuthModal } from '../../context/AuthModalContext';
import './EmailVerify.css';

function EmailVerify() {
    const navigate = useNavigate();
    const { openLogin } = useAuthModal();
    const verifiedRef = useRef(false);
    const cleanupTimerRef = useRef(null);
    const [step, setStep] = useState(1);       // 1: 이메일 입력, 2: 코드 입력
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [devCode, setDevCode] = useState('');

    useEffect(() => {
        // localStorage(일반 로그인) 또는 sessionStorage(소셜 미인증 임시) 토큰 확인
        const hasToken = localStorage.getItem('access_token') || sessionStorage.getItem('pending_access_token');
        if (!hasToken) {
            navigate('/');
            openLogin();
        }
    }, [navigate, openLogin]);

    // 페이지 이탈 시 임시 토큰 삭제 (StrictMode 이중 마운트 대응: 타이머로 지연)
    useEffect(() => {
        // 재마운트(StrictMode) 시 이전 cleanup 타이머 취소
        if (cleanupTimerRef.current) {
            clearTimeout(cleanupTimerRef.current);
            cleanupTimerRef.current = null;
        }
        return () => {
            if (!verifiedRef.current) {
                // 짧은 지연: StrictMode 재마운트면 취소, 실제 이탈이면 실행
                cleanupTimerRef.current = setTimeout(() => {
                    sessionStorage.removeItem('pending_access_token');
                    sessionStorage.removeItem('pending_refresh_token');
                    sessionStorage.removeItem('pending_nickname');
                }, 100);
            }
        };
    }, []);

    // 카운트다운 타이머
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const handleSend = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await sendEmailOTP(email);
            setStep(2);
            setCountdown(300);
            setCode('');
            setDevCode(res.data?.dev_code || '');
        } catch (err) {
            setError(err.response?.data?.error || '이메일 발송에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setCode('');
        setLoading(true);
        try {
            await sendEmailOTP(email);
            setCountdown(300);
        } catch (err) {
            setError(err.response?.data?.error || '이메일 발송에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyEmailOTP(email, code);
            // 인증 성공: 임시 토큰 → localStorage로 이동 (정식 로그인)
            const pendingAccess = sessionStorage.getItem('pending_access_token');
            const pendingRefresh = sessionStorage.getItem('pending_refresh_token');
            const pendingNickname = sessionStorage.getItem('pending_nickname');
            if (pendingAccess) {
                localStorage.setItem('access_token', pendingAccess);
                localStorage.setItem('refresh_token', pendingRefresh || '');
                localStorage.setItem('nickname', pendingNickname || '회원');
                sessionStorage.removeItem('pending_access_token');
                sessionStorage.removeItem('pending_refresh_token');
                sessionStorage.removeItem('pending_nickname');
                window.dispatchEvent(new Event('authchange'));
            }
            verifiedRef.current = true;
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || '인증에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="evWrap" data-hsnap>
            <div className="evBox">
                <div className="evIcon">✉</div>
                <h2 className="evTitle">이메일 인증</h2>
                <p className="evDesc">
                    본인 확인을 위해<br />이메일 인증이 필요합니다.
                </p>

                {step === 1 && (
                    <form className="evForm" onSubmit={handleSend}>
                        <label className="evLabel">이메일 주소</label>
                        <input
                            type="email"
                            className="evInput"
                            placeholder="인증받을 이메일을 입력하세요"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                        {error && <p className="evError">{error}</p>}
                        <button type="submit" className="evBtn" disabled={loading}>
                            {loading ? '발송 중...' : '인증코드 발송'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form className="evForm" onSubmit={handleVerify}>
                        <div className="evInfoBox">
                            <span className="evInfoIcon">✓</span>
                            <span><strong>{email}</strong>으로 인증 코드를 발송했습니다.</span>
                        </div>
                        {devCode && (
                            <div style={{background:'#fffbe6',border:'1px solid #ffe58f',borderRadius:6,padding:'8px 12px',marginBottom:8,fontSize:13}}>
                                [개발모드] 인증코드: <strong style={{letterSpacing:2}}>{devCode}</strong>
                            </div>
                        )}

                        <div className="evLabelRow">
                            <label className="evLabel">인증 코드 (6자리)</label>
                            {countdown > 0
                                ? <span className="evTimer">{formatTime(countdown)}</span>
                                : <span className="evTimerExpired">만료됨</span>
                            }
                        </div>
                        <input
                            type="text"
                            className="evInput evInputCode"
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            autoFocus
                        />
                        {error && <p className="evError">{error}</p>}

                        <button
                            type="submit"
                            className="evBtn"
                            disabled={loading || countdown === 0 || code.length !== 6}
                        >
                            {loading ? '확인 중...' : '인증 완료'}
                        </button>
                        <button
                            type="button"
                            className="evBtnOutline"
                            onClick={handleResend}
                            disabled={loading}
                        >
                            인증코드 재발송
                        </button>
                        <button
                            type="button"
                            className="evBtnText"
                            onClick={() => { setStep(1); setError(''); setCode(''); }}
                        >
                            이메일 변경
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EmailVerify;
