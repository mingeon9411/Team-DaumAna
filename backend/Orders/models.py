from django.db import models
from django.core.validators import MinValueValidator

# ✨ 장바구니: 독립된 순수 장바구니 테이블 (초기 DDL 스크립트와 동기화)
class Cart(models.Model):
    id = models.AutoField(primary_key=True)
    # 문자열 참조로 순환 임포트(Circular Import) 방지
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE)
    product = models.ForeignKey('Products.Product', on_delete=models.CASCADE)
    # 옵션이 없는 상품일 수 있으므로 NULL/Blank 허용
    option = models.ForeignKey('Products.ProductOption', on_delete=models.SET_NULL, null=True, blank=True)
    # 수량은 최소 1개 이상이어야 하므로 Validator 추가
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_CART'
        # 동일 유저가 동일 상품+옵션을 중복해서 담지 못하도록 제약 (DDL의 UK_USER_PROD_OPT 대응)
        unique_together = ('user', 'product', 'option')
        verbose_name = '장바구니'
        verbose_name_plural = '장바구니 목록'

    def __str__(self):
        option_name = f" ({self.option.option_name})" if self.option else ""
        return f"{self.user.username}의 장바구니: {self.product.name}{option_name} x {self.quantity}"


# 결제 완료된 영구 주문 마스터 테이블
class Order(models.Model):

    STATUS_CHOICES = [
        ('PENDING', '결제대기'),
        ('ORDERED', '주문완료(결제완료)'),
        ('SHIPPED', '배송중'),
        ('DELIVERED', '배송완료'),
        ('CANCELLED', '주문취소'),
    ]


    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE)
    total_amount = models.PositiveIntegerField()
    discount_amount = models.PositiveIntegerField(default=0, verbose_name='쿠폰 할인 금액')
    coupon = models.ForeignKey(
        'coupons.Coupon', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='orders', verbose_name='적용 쿠폰'
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ORDERED')
    shipping_addr = models.CharField(max_length=500)
    order_date = models.DateTimeField(auto_now_add=True)
    # null=True — Spring Boot 서버도 같은 JIPDAUM_ORDER 테이블에 주문을 insert하는데,
    # 그쪽 엔티티는 이 컬럼들을 모르고 값을 안 채워서 NOT NULL 제약에 걸려 500이 났었음.
    # DB 레벨에서 NULL을 허용해 어느 백엔드가 insert하든 실패하지 않게 한다.
    carrier = models.CharField(max_length=50, null=True, blank=True, default='', verbose_name='택배사')
    tracking_number = models.CharField(max_length=50, null=True, blank=True, default='', verbose_name='운송장 번호')

    class Meta:
        db_table = 'JIPDAUM_ORDER'
        verbose_name = '주문 마스터'
        verbose_name_plural = '주문 마스터 목록'

    def __str__(self):
        return f"주문번호 {self.id} ({self.user.username}) - {self.status}"


# 주문 상세 테이블 (가구 금액 스냅샷 포함)
class OrderItem(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Products.Product', on_delete=models.CASCADE)
    option = models.ForeignKey('Products.ProductOption', on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    # ✨ 고도화: 주문 '당시'의 가구 금액 스냅샷 저장 (가구 가격이 나중에 변해도 구매 기록 유지)
    ordered_price = models.PositiveIntegerField() 

    class Meta:
        db_table = 'JIPDAUM_ORDER_ITEM'
        verbose_name = '주문 상세 내역'
        verbose_name_plural = '주문 상세 내역 목록'

    def __str__(self):
        return f"주문 {self.order.id}의 상세: {self.product.name} x {self.quantity}"

