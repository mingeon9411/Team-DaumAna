from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed, TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken


class SpringBootCompatToken(AccessToken):
    """
    Spring Boot 발행 JWT 호환용.
    - token_type 클레임 없음 → token_type_claim = None
    - jti 클레임 없음       → verify() 재정의해서 BlacklistMixin.verify_jti() 스킵
    """
    token_type_claim = None

    def verify(self):
        self.check_exp()  # 만료 체크만, token_type·jti 검증 생략


class CustomJWTAuthentication(JWTAuthentication):
    """
    Django SimpleJWT + Spring Boot JWT 통합 인증:
    - Django JWT: token_type='access' 클레임 + user_id 클레임 (정수 PK)
    - Spring Boot JWT: sub 클레임 (email 또는 kakao_xxx), token_type 클레임 없음
    """

    def get_validated_token(self, raw_token):
        # 1. 표준 Django AccessToken 시도 (token_type = 'access' 검증 포함)
        try:
            return AccessToken(raw_token)
        except TokenError:
            pass

        # 2. Spring Boot 호환 토큰 시도 (token_type 검증 생략)
        try:
            return SpringBootCompatToken(raw_token)
        except TokenError as e:
            raise InvalidToken(str(e))

    def get_user(self, validated_token):
        # Django JWT 경로: user_id 클레임 (정수 PK)
        user_id = validated_token.get(api_settings.USER_ID_CLAIM)
        if user_id is not None:
            try:
                user = self.user_model.objects.get(**{api_settings.USER_ID_FIELD: user_id})
            except self.user_model.DoesNotExist:
                raise AuthenticationFailed('사용자를 찾을 수 없습니다.', code='user_not_found')
            if not user.is_active:
                raise AuthenticationFailed('비활성 사용자입니다.', code='user_inactive')
            return user

        # Spring Boot JWT 경로: sub 클레임 (email 또는 kakao_xxx)
        sub = validated_token.get('sub')
        if sub is not None:
            # sub에 @가 없으면 Kakao 형식(kakao_xxx) → username으로 조회, 이메일에 @가 있는 Django 원본 유저 우선
            if '@' not in sub:
                candidates = list(self.user_model.objects.filter(username__iexact=sub))
                # 이메일에 @가 포함된 Django 소셜 유저 우선 반환 (Spring Boot 중복 유저 제외)
                user = next((u for u in candidates if u.email and '@' in u.email), None)
                if user is None and candidates:
                    user = candidates[0]
                if user is None:
                    raise AuthenticationFailed('사용자를 찾을 수 없습니다.', code='user_not_found')
            else:
                try:
                    user = self.user_model.objects.get(email=sub)
                except self.user_model.DoesNotExist:
                    raise AuthenticationFailed('사용자를 찾을 수 없습니다.', code='user_not_found')
            if not user.is_active:
                raise AuthenticationFailed('비활성 사용자입니다.', code='user_inactive')
            return user

        raise InvalidToken('토큰에 사용자 정보(user_id/sub)가 없습니다.')
