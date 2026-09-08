import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialExchange, getMe } from '../../api';
import { useAuthModal } from '../../context/AuthModalContext';

function SocialCallback() {
    const navigate = useNavigate();
    const { openLogin } = useAuthModal();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        if (error === 'withdrawn') {
            alert('탈퇴한 계정입니다. 새로 가입해주세요.');
            navigate('/', { replace: true });
            openLogin();
            return;
        }

        if (!code) {
            navigate('/', { replace: true });
            openLogin();
            return;
        }

        socialExchange(code)
            .then(async (res) => {
                const { access, refresh } = res.data;

                // 일시적으로 세션에 저장해 getMe() 인증에 사용
                sessionStorage.setItem('pending_access_token', access);
                sessionStorage.setItem('pending_refresh_token', refresh);

                try {
                    const me = await getMe();
                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);
                    localStorage.setItem('nickname', me.data.nickname || '회원');
                    window.dispatchEvent(new Event('authchange'));
                } catch {
                    // getMe 실패해도 토큰은 유효하므로 그대로 저장
                    localStorage.setItem('access_token', access);
                    localStorage.setItem('refresh_token', refresh);
                }

                sessionStorage.removeItem('pending_access_token');
                sessionStorage.removeItem('pending_refresh_token');

                window.location.replace('/');
            })
            .catch(() => {
                sessionStorage.removeItem('pending_access_token');
                sessionStorage.removeItem('pending_refresh_token');
                navigate('/', { replace: true });
                openLogin();
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div data-hsnap style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', flexShrink: 0, fontSize: '16px', color: '#666' }}>
            로그인 처리 중...
        </div>
    );
}

export default SocialCallback;
