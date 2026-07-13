import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from Users.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        # username은 서버에서 자동 생성 — 프론트에서 email/nickname/password만 전송
        fields = ('nickname', 'email', 'password', 'password_confirm')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value

    def validate_nickname(self, value):
        stripped = value.strip()
        if len(stripped) < 2:
            raise serializers.ValidationError("닉네임은 최소 2자 이상이어야 합니다.")
        if len(stripped) > 30:
            raise serializers.ValidationError("닉네임은 최대 30자 이하여야 합니다.")
        if User.objects.filter(nickname=stripped).exists():
            raise serializers.ValidationError("이미 사용 중인 닉네임입니다.")
        return stripped

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        if password and password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({"password_confirm": "비밀번호와 비밀번호 확인이 일치하지 않습니다."})
            try:
                validate_password(password, user=User)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        email = validated_data.get('email')

        # 이메일 앞부분으로 username 자동 생성 (영문/숫자/밑줄만 허용)
        base = re.sub(r'[^a-zA-Z0-9_]', '_', email.split('@')[0])[:20]
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base[:17]}_{counter}"
            counter += 1

        user = User(username=username, **validated_data)
        user.set_password(password)
        user.is_email_verified = True  # 일반 가입은 이메일 직접 입력 → 인증 완료 처리
        user.save()
        return user
