from django.urls import path
from .views import MyCouponsView, ValidateCouponView

urlpatterns = [
    path('my/', MyCouponsView.as_view(), name='my_coupons'),
    path('validate/', ValidateCouponView.as_view(), name='validate_coupon'),
]
