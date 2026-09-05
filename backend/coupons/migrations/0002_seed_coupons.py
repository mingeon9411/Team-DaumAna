from datetime import timedelta

from django.db import migrations
from django.utils import timezone


# 회원가입 시 자동 지급되는 웰컴 쿠폰 5종(is_personal=True) + 결제 페이지에서 누구나 코드로
# 쓸 수 있는 일반 쿠폰 5종(is_personal=False). 전부 할인율 30% 이하.
# 코드는 Spring 쪽 UserAuthService.WELCOME_COUPON_CODES와 반드시 맞춰야 한다.
def seed_coupons(apps, schema_editor):
    Coupon = apps.get_model('coupons', 'Coupon')
    today = timezone.now().date()

    coupons = [
        dict(code='WELCOME30', name='웰컴 30% 쿠폰', discount_type='PERCENT', discount_value=30,
             min_order_amount=50000, max_discount_amount=30000, expiry_date=today + timedelta(days=30), is_personal=True),
        dict(code='WELCOME15', name='웰컴 15% 쿠폰', discount_type='PERCENT', discount_value=15,
             min_order_amount=30000, max_discount_amount=20000, expiry_date=today + timedelta(days=60), is_personal=True),
        dict(code='WELCOME10', name='웰컴 10% 쿠폰', discount_type='PERCENT', discount_value=10,
             min_order_amount=20000, max_discount_amount=10000, expiry_date=today + timedelta(days=60), is_personal=True),
        dict(code='WELCOME1MAN', name='웰컴 1만원 할인쿠폰', discount_type='FIXED', discount_value=10000,
             min_order_amount=50000, max_discount_amount=None, expiry_date=today + timedelta(days=30), is_personal=True),
        dict(code='WELCOME5000', name='웰컴 5천원 할인쿠폰', discount_type='FIXED', discount_value=5000,
             min_order_amount=20000, max_discount_amount=None, expiry_date=today + timedelta(days=30), is_personal=True),
        dict(code='SHOP10000', name='1만원 할인쿠폰', discount_type='FIXED', discount_value=10000,
             min_order_amount=70000, max_discount_amount=None, expiry_date=None, is_personal=False),
        dict(code='SHOP5000', name='5천원 할인쿠폰', discount_type='FIXED', discount_value=5000,
             min_order_amount=30000, max_discount_amount=None, expiry_date=None, is_personal=False),
        dict(code='SHOP20P', name='20% 할인쿠폰', discount_type='PERCENT', discount_value=20,
             min_order_amount=50000, max_discount_amount=15000, expiry_date=None, is_personal=False),
        dict(code='SHOP10P', name='10% 할인쿠폰', discount_type='PERCENT', discount_value=10,
             min_order_amount=20000, max_discount_amount=10000, expiry_date=None, is_personal=False),
        dict(code='SHOP5P', name='5% 할인쿠폰', discount_type='PERCENT', discount_value=5,
             min_order_amount=0, max_discount_amount=5000, expiry_date=None, is_personal=False),
    ]

    for data in coupons:
        Coupon.objects.update_or_create(code=data['code'], defaults=data)


def unseed_coupons(apps, schema_editor):
    Coupon = apps.get_model('coupons', 'Coupon')
    codes = ['WELCOME30', 'WELCOME15', 'WELCOME10', 'WELCOME1MAN', 'WELCOME5000',
              'SHOP10000', 'SHOP5000', 'SHOP20P', 'SHOP10P', 'SHOP5P']
    Coupon.objects.filter(code__in=codes).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('coupons', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_coupons, unseed_coupons),
    ]
