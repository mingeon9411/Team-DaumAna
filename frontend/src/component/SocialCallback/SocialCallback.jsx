import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socialExchange, getMe } from '../../api';

function SocialCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
            navigate('/login', { replace: true });
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
                navigate('/login', { replace: true });
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '16px', color: '#666' }}>
            로그인 처리 중...
        </div>
    );
}

export default SocialCallback;
