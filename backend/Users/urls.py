from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView,
    NicknameCheckView, UserMeView,
    EmailOTPSendView, EmailOTPVerifyView,
)

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='user_register'),
    path('login/', LoginView.as_view(), name='user_login'),
    path('logout/', LogoutView.as_view(), name='user_logout'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('nickname-check/', NicknameCheckView.as_view(), name='nickname_check'),
    path('email-verify/send/', EmailOTPSendView.as_view(), name='email_otp_send'),
    path('email-verify/confirm/', EmailOTPVerifyView.as_view(), name='email_otp_confirm'),
]
