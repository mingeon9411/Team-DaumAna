from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from rest_framework_simplejwt.tokens import RefreshToken


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    refresh = RefreshToken.for_user(user)
    request.session['jwt_access'] = str(refresh.access_token)
    request.session['jwt_refresh'] = str(refresh)
