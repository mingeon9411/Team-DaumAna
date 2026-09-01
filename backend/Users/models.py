from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=100, unique=True)
    nickname = models.CharField(max_length=100)
    is_email_verified = models.BooleanField(default=False)

    AbstractUser._meta.get_field('date_joined').db_column = 'created_at'

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'nickname']

    class Meta:
        db_table = 'JIPDAUM_USER'
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'

    def __str__(self):\
        return f"{self.username} ({self.nickname})"


class EmailOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_otps')
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'JIPDAUM_EMAIL_OTP'
        verbose_name = '이메일 OTP'
        verbose_name_plural = '이메일 OTP 목록'