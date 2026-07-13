from django.contrib import admin
from django.urls import path, include
from .chat_view import ChatView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Products (카테고리, 상품, 리뷰)
    path('api/shop/products/', include('Products.urls')),

    # Cart / Orders → Spring Boot 전담 (충돌 방지로 비활성화)
    # path('api/shop/cart/', CartAPIView.as_view(), name='cart_api'),
    # path('api/shop/orders/', include('Orders.urls')),

    # Payments
    path('api/shop/payments/', include('payments.urls')),

    # Users (회원가입 / 로그인 / 로그아웃)
    path('api/users/', include('Users.urls')),

    # Coupons
    path('api/shop/coupons/', include('coupons.urls')),

    # Chat
    path('api/shop/chat/', ChatView.as_view(), name='chat'),
]