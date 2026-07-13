from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # 검증 오류가 발생한 payment_method를 제외하고 안전하게 결제 상태와 금액만 우선 노출
    list_display = ['id', 'order', 'amount', 'status']
    list_filter = ['status']