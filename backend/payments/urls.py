from django.urls import path
from .views import PaymentReadyView, PaymentVerifyView

urlpatterns = [
    path('ready/', PaymentReadyView.as_view(), name='payment-ready'),
    path('verify/', PaymentVerifyView.as_view(), name='payment_verify'),
]