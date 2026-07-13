from django.contrib import admin
from .models import Cart, Order, OrderItem

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'quantity']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # created_at 대신 모델에 실제 선언된 필드만 배치 (정확한 매핑을 위해 날짜 제외 코어 필드 정렬)
    list_display = ['id', 'user', 'total_amount', 'status']
    list_filter = ['status']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    # price가 모델에 선언되어 있지 않다면 수량과 상품 단위로 관제하도록 교정
    list_display = ['id', 'order', 'product', 'quantity']