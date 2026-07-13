from django.db import models
from django.conf import settings
import uuid


# 결제 마스터 테이블
class Payment(models.Model):
    METHOD_CHOICES = [
        ('KAKAO', '카카오페이'),
        ('NAVER', '네이버페이'),
        ('TOSS', '토스'),
        ('CARD', '신용카드'),
        ('BANK', '계좌이체'),
    ]

    STATUS_CHOICES = [
        ('PENDING', '결제대기'),
        ('SUCCESS', '결제완료'),
        ('FAILED', '결제실패'),
        ('REFUNDED', '환불완료'),
    ]
    
    id = models.AutoField(primary_key=True) # 오라클 시퀀스 매핑 명시
    
    # 주문 마스터와 1:1 매핑 (주문 하나당 결제 하나)
    order = models.OneToOneField(
        'Orders.Order', on_delete=models.CASCADE, related_name='payment'
    )
    # 타 앱들과 일관성을 위해 'Users.User' 문자열 참조로 통일
    user = models.ForeignKey(
        'Users.User', on_delete=models.CASCADE
    )
    merchant_uid = models.CharField(max_length=100, unique=True, default=uuid.uuid4, editable=False)  #재전송 공격방지 + 검증 시 기준점

    method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')

    amount = models.PositiveIntegerField() # 오라클 CHECK (amount >= 0) 대응
    verified_amount = models.PositiveIntegerField(null=True, blank=True)   #포트원 조회로 확인된 "실제 결제" 금액

    transaction_id = models.CharField(max_length=200, null=True, blank=True) # PG사 거래고유번호
    paid_at = models.DateTimeField(null=True, blank=True) # 결제 승인 일시
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_PAYMENT'
        verbose_name = '결제 내역'
        verbose_name_plural = '결제 내역 목록'

    def __str__(self):
        return f"결제번호 {self.id}: {self.user.username} - {self.get_method_display()} ({self.get_status_display()})"