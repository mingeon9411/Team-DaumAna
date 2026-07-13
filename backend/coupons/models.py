from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_FIXED = 'FIXED'
    DISCOUNT_PERCENT = 'PERCENT'
    DISCOUNT_TYPES = [
        (DISCOUNT_FIXED, '정액 할인'),
        (DISCOUNT_PERCENT, '정률 할인'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name='쿠폰 코드')
    name = models.CharField(max_length=100, verbose_name='쿠폰명')
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, verbose_name='할인 방식')
    discount_value = models.PositiveIntegerField(verbose_name='할인값 (원 또는 %)')
    min_order_amount = models.PositiveIntegerField(default=0, verbose_name='최소 주문 금액')
    max_discount_amount = models.PositiveIntegerField(null=True, blank=True, verbose_name='최대 할인 금액 (정률용)')
    expiry_date = models.DateField(null=True, blank=True, verbose_name='만료일')
    usage_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name='총 사용 제한 (null=무제한)')
    used_count = models.PositiveIntegerField(default=0, verbose_name='사용 횟수')
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    is_personal = models.BooleanField(default=False, verbose_name='개인 발급 전용')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_COUPON'
        verbose_name = '쿠폰'
        verbose_name_plural = '쿠폰 목록'

    def validate(self):
        if not self.is_active:
            return False, "비활성화된 쿠폰입니다."
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return False, "만료된 쿠폰입니다."
        if self.usage_limit is not None and self.used_count >= self.usage_limit:
            return False, "사용 횟수가 초과된 쿠폰입니다."
        return True, None

    def calc_discount(self, order_amount):
        if order_amount < self.min_order_amount:
            return 0
        if self.discount_type == self.DISCOUNT_FIXED:
            return min(self.discount_value, order_amount)
        discount = int(order_amount * self.discount_value / 100)
        if self.max_discount_amount:
            discount = min(discount, self.max_discount_amount)
        return discount

    def __str__(self):
        return f"[{self.code}] {self.name}"


class UserCoupon(models.Model):
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='user_coupons')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='user_coupons')
    is_used = models.BooleanField(default=False, verbose_name='사용 여부')
    used_at = models.DateTimeField(null=True, blank=True, verbose_name='사용 일시')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_USER_COUPON'
        unique_together = ('user', 'coupon')
        verbose_name = '유저 쿠폰'
        verbose_name_plural = '유저 쿠폰 목록'

    def __str__(self):
        return f"{self.user.username} - {self.coupon.code} ({'사용됨' if self.is_used else '미사용'})"
