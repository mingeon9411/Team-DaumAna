# 아이디/비밀번호 찾기용 보안질문·답변. 둘 다 nullable — 기존 회원은 NULL로 남아
# "미설정" 상태가 되고, 로그인 시 설정 안내를 받는다(Spring UserAuthService/EmailVerify.jsx 참고).
# security_answer는 평문이 아니라 해시(BCrypt)로 저장한다 — 컬럼 길이는 비밀번호 컬럼과
# 동일하게 여유 있게 잡는다.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Users', '0002_user_is_email_verified_emailotp'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='security_question',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='user',
            name='security_answer',
            field=models.CharField(max_length=255, null=True, blank=True),
        ),
    ]
