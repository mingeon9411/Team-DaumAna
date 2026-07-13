import logging
import random
import requests as http_requests
from django.conf import settings

logger = logging.getLogger(__name__)
from django.core.mail import send_mail
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP
from .serializers import RegisterSerializer


def verify_hcaptcha(token):
    """hCaptcha 토큰 서버 검증"""
    if getattr(settings, 'DEBUG', False):
        return True  # 개발 환경에서는 검증 생략
    secret = getattr(settings, 'HCAPTCHA_SECRET_KEY', '')
    if not secret:
        return True
    try:
        resp = http_requests.post(
            'https://hcaptcha.com/siteverify',
            data={'secret': secret, 'response': token},
            timeout=5,
        )
        return resp.json().get('success', False)
    except Exception:
        return False

User = get_user_model()


# ====================================================================
# 👤 회원가입
# ====================================================================
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


# ====================================================================
# 👤 JWT 로그인
# ====================================================================
class LoginView(APIView):
    def post(self, request):
        # hCaptcha 검증
        recaptcha_token = request.data.get('recaptcha_token', '')
        if not verify_hcaptcha(recaptcha_token):
            return Response(
                {'error': '보안 인증에 실패했습니다. 다시 시도해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        login_input = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=login_input, password=password)

        if user is None and login_input and '@' in login_input:
            try:
                user_obj = User.objects.get(email=login_input)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response(
                {'error': '아이디 또는 비밀번호가 올바르지 않거나 비활성화된 계정입니다.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'nickname': user.nickname,
                'email': user.email,
                'is_email_verified': user.is_email_verified,
            }
        }, status=status.HTTP_200_OK)


# ====================================================================
# 👤 로그아웃 (리프레시 토큰 블랙리스트)
# ====================================================================
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': '리프레시 토큰이 누락되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': '로그아웃 완료'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': '유효하지 않은 토큰입니다.', 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ====================================================================
# 👤 닉네임 중복 확인
# ====================================================================
class NicknameCheckView(APIView):
    def get(self, request):
        nickname = request.query_params.get('nickname', '').strip()
        if not nickname:
            return Response({'error': '닉네임을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(nickname) < 2:
            return Response({'available': False, 'message': '닉네임은 최소 2자 이상이어야 합니다.'})
        if len(nickname) > 30:
            return Response({'available': False, 'message': '닉네임은 최대 30자 이하여야 합니다.'})
        if User.objects.filter(nickname=nickname).exists():
            return Response({'available': False, 'message': '이미 사용 중인 닉네임입니다.'})
        return Response({'available': True, 'message': '사용 가능한 닉네임입니다.'})


# ====================================================================
# 👤 현재 로그인 사용자 정보
# ====================================================================
class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'nickname': user.nickname,
            'email': user.email,
            'is_email_verified': user.is_email_verified,
        })


# ====================================================================
# 📧 이메일 OTP 발송
# ====================================================================
class EmailOTPSendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        code = f'{random.randint(0, 999999):06d}'
        if settings.DEBUG:
            logger.info('[DEV] OTP %s -> %s', email, code)

        # 기존 미사용 OTP 삭제 후 새로 생성
        EmailOTP.objects.filter(user=request.user, is_used=False).delete()
        EmailOTP.objects.create(user=request.user, email=email, code=code)

        try:
            send_mail(
                subject='[집다움] 이메일 인증 코드',
                message=(
                    f'안녕하세요, 집다움입니다.\n\n'
                    f'이메일 인증 코드: {code}\n\n'
                    f'5분 이내에 입력해주세요.\n'
                    f'본인이 요청하지 않은 경우 이 메일을 무시하세요.'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            return Response(
                {'error': '이메일 발송에 실패했습니다. 이메일 주소를 확인해주세요.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response_data = {'message': '인증 코드가 발송되었습니다.'}
        if settings.DEBUG:
            response_data['dev_code'] = code
        return Response(response_data)


# ====================================================================
# 📧 이메일 OTP 인증 확인
# ====================================================================
class EmailOTPVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get('email', '').strip()
        code = request.data.get('code', '').strip()

        if not email or not code:
            return Response({'error': '이메일과 인증 코드를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp = EmailOTP.objects.filter(
                user=request.user,
                email=email,
                code=code,
                is_used=False,
            ).latest('created_at')
        except EmailOTP.DoesNotExist:
            return Response({'error': '인증 코드가 올바르지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        elapsed = (timezone.now() - otp.created_at).total_seconds()
        if elapsed > 300:
            return Response({'error': '인증 코드가 만료되었습니다. 재발송해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        request.user.is_email_verified = True
        request.user.save()

        return Response({'message': '이메일 인증이 완료되었습니다.'})
