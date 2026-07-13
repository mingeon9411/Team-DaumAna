from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status

from .models import Coupon, UserCoupon


class MyCouponsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_coupons = UserCoupon.objects.filter(
            user=request.user, is_used=False
        ).select_related('coupon').order_by('-created_at')

        result = []
        for uc in user_coupons:
            c = uc.coupon
            valid, _ = c.validate()
            if not valid:
                continue
            result.append({
                'id': uc.id,
                'code': c.code,
                'name': c.name,
                'discount_type': c.discount_type,
                'discount_value': c.discount_value,
                'min_order_amount': c.min_order_amount,
                'max_discount_amount': c.max_discount_amount,
                'expiry_date': c.expiry_date.isoformat() if c.expiry_date else None,
            })

        return Response(result, status=http_status.HTTP_200_OK)


class ValidateCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_amount = int(request.data.get('order_amount', 0))

        if not code:
            return Response(
                {'error': '쿠폰 코드를 입력해주세요.'},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # 1. 개인 발급 쿠폰 (UserCoupon) 우선 확인
        uc = UserCoupon.objects.filter(
            user=request.user, coupon__code=code, is_used=False
        ).select_related('coupon').first()

        if uc:
            coupon = uc.coupon
        else:
            # 2. 공용 코드 쿠폰
            coupon = Coupon.objects.filter(code=code, is_personal=False).first()
            if not coupon:
                return Response(
                    {'error': '유효하지 않은 쿠폰 코드입니다.'},
                    status=http_status.HTTP_404_NOT_FOUND
                )

        valid, msg = coupon.validate()
        if not valid:
            return Response({'error': msg}, status=http_status.HTTP_400_BAD_REQUEST)

        if order_amount < coupon.min_order_amount:
            return Response(
                {'error': f'최소 주문 금액 {coupon.min_order_amount:,}원 이상 시 사용 가능합니다.'},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        discount = coupon.calc_discount(order_amount)

        return Response({
            'code': coupon.code,
            'name': coupon.name,
            'discount_type': coupon.discount_type,
            'discount_value': coupon.discount_value,
            'discount_amount': discount,
            'final_amount': max(0, order_amount - discount),
        }, status=http_status.HTTP_200_OK)
