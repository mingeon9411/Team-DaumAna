from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status

from Orders.models import Order
from .models import Payment
from .services import get_payment_detail, PortOneVerificationError


class PaymentReadyView(APIView):
    """결제 시작 전, PENDING 상태의 Payment 레코드를 미리 생성"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        method = request.data.get('method') #'KAKAO' or 'NAVER'

        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response(
                {"code": "ORDER_NOT_FOUND", "message": "주문을 찾을 수 없습니다."},
                status = http_status.HTTP_404_NOT_FOUND
            )
        
        if Payment.objects.filter(order=order).exists():
            return Response(
                {"code": "PAYMENT_ALREADY_EXISTS", "message": "이미 결제가 진행된 주문입니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        payment = Payment.objects.create(
            order = order,
            user = request.user,
            method = method,
            amount = order.total_amount,
            status = 'PENDING'
        )

        return Response({
            "merchant_uid": str(payment.merchant_uid),
            "amount": payment.amount,
        }, status=http_status.HTTP_201_CREATED)
    

class PaymentVerifyView(APIView):
    """프론트에서 결제 완료 후 payment_id를 보내면, 포트원에 재조회하여 검증"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get('payment_id')
        merchant_uid = request.data.get('merchant_uid')

        payment = Payment.objects.filter(
            merchant_uid=merchant_uid, user=request.user
        ).first()

        if not payment:
            return Response(
                {"code": "PAYMENT_NOT_FOUND", "message": "결제 정보를 찾을 수 없습니다."},
                status=http_status.HTTP_404_NOT_FOUND
            )

        if payment.status == 'SUCCESS':
            return Response(
                {"code": "ALREADY_VERIFIED", "message": "이미 처리된 결제입니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        try:
            data = get_payment_detail(payment_id)
        except PortOneVerificationError as e:
            payment.status = 'FAILED'
            payment.save()
            return Response(
                {"code": "VERIFICATION_FAILED", "message": str(e)},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        verified_amount = data.get('amount', {}).get('total')
        portone_status = data.get('status')

        if verified_amount != payment.amount:
            payment.status = 'FAILED'
            payment.verified_amount = verified_amount
            payment.save()
            return Response(
                {"code": "AMOUNT_MISMATCH", "message": "결제 금액이 일치하지 않습니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        if portone_status != 'PAID':
            payment.status = 'FAILED'
            payment.save()
            return Response(
                {"code": "PAYMENT_NOT_COMPLETED", "message": "결제가 완료되지 않았습니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        payment.status = 'SUCCESS'
        payment.verified_amount = verified_amount
        payment.transaction_id = payment_id
        payment.paid_at = timezone.now()
        payment.save()

        payment.order.status = 'ORDERED'
        payment.order.save()

        return Response({"message": "결제가 완료되었습니다."}, status=http_status.HTTP_200_OK)

