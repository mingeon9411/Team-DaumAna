from django.contrib import admin
from django.utils.html import format_html
from .models import Coupon, UserCoupon


class UserCouponInline(admin.TabularInline):
    """쿠폰 상세 페이지에서 유저에게 직접 발급하는 인라인"""
    model = UserCoupon
    extra = 1
    fields = ['user', 'is_used', 'used_at']
    readonly_fields = ['used_at']
    autocomplete_fields = ['user']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'discount_badge', 'min_order_amount',
        'expiry_date', 'used_count', 'usage_limit', 'status_badge', 'is_personal',
    ]
    list_filter = ['discount_type', 'is_active', 'is_personal']
    search_fields = ['code', 'name']
    readonly_fields = ['used_count', 'created_at']
    inlines = [UserCouponInline]

    fieldsets = (
        ('기본 정보', {
            'fields': ('code', 'name', 'is_active', 'is_personal'),
        }),
        ('할인 설정', {
            'fields': ('discount_type', 'discount_value', 'min_order_amount', 'max_discount_amount'),
            'description': '정률 할인 시 max_discount_amount로 최대 할인 금액을 제한할 수 있습니다.',
        }),
        ('사용 제한', {
            'fields': ('expiry_date', 'usage_limit', 'used_count'),
        }),
        ('생성 정보', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='할인')
    def discount_badge(self, obj):
        if obj.discount_type == 'FIXED':
            return format_html(
                '<span style="color:#c0392b;font-weight:700">{}</span>',
                f'{obj.discount_value:,}원',
            )
        label = f'{obj.discount_value}%'
        if obj.max_discount_amount:
            label += f' (최대 {obj.max_discount_amount:,}원)'
        return format_html(
            '<span style="color:#1565c0;font-weight:700">{}</span>', label
        )

    @admin.display(description='상태')
    def status_badge(self, obj):
        if not obj.is_active:
            return format_html('<span style="color:#999">{}</span>', '비활성')
        from django.utils import timezone
        if obj.expiry_date and obj.expiry_date < timezone.now().date():
            return format_html('<span style="color:#e65100">{}</span>', '만료됨')
        if obj.usage_limit and obj.used_count >= obj.usage_limit:
            return format_html('<span style="color:#e65100">{}</span>', '소진됨')
        return format_html(
            '<span style="color:#2e7d32;font-weight:700">{}</span>', '사용가능'
        )


@admin.register(UserCoupon)
class UserCouponAdmin(admin.ModelAdmin):
    list_display = ['user', 'coupon', 'discount_info', 'is_used', 'used_at', 'created_at']
    list_filter = ['is_used', 'coupon__discount_type']
    search_fields = ['user__username', 'user__email', 'coupon__code', 'coupon__name']
    autocomplete_fields = ['user', 'coupon']
    readonly_fields = ['used_at', 'created_at']

    @admin.display(description='할인 내용')
    def discount_info(self, obj):
        c = obj.coupon
        if c.discount_type == 'FIXED':
            return f'{c.discount_value:,}원 할인'
        return f'{c.discount_value}% 할인'
