from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status

from Products.models import Product, ProductOption
from .models import Order, OrderItem, Cart
from .serializers import CartItemSerializer


class OrderCreateView(APIView):
    """주문 생성 — 단일 상품 또는 장바구니 다수 상품을 한 번에 처리"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        shipping_addr = request.data.get('shipping_addr')
        items_data = request.data.get('items', [])

        if not shipping_addr:
            return Response(
                {"code": "MISSING_ADDRESS", "message": "배송지를 입력해주세요."},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        if not items_data:
            return Response(
                {"code": "EMPTY_ITEMS", "message": "주문 상품이 없습니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        resolved = []
        for item in items_data:
            product_id = item.get('product_id')
            option_id = item.get('option_id')
            quantity = int(item.get('quantity', 1))

            if quantity < 1:
                return Response(
                    {"code": "INVALID_QUANTITY", "message": "수량은 1개 이상이어야 합니다."},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            product = get_object_or_404(Product, id=product_id)
            option = get_object_or_404(ProductOption, id=option_id) if option_id else None

            if option and option.stock_count < quantity:
                return Response(
                    {"code": "OUT_OF_STOCK", "message": f"'{product.name}' 재고가 부족합니다."},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            unit_price = product.base_price + (option.extra_price if option else 0)
            resolved.append((product, option, quantity, unit_price))

        total_amount = sum(unit_price * qty for _, _, qty, unit_price in resolved)

        # 쿠폰 적용
        coupon_code = request.data.get('coupon_code', '').strip().upper()
        discount_amount = 0
        applied_coupon = None
        applied_user_coupon = None

        if coupon_code:
            from coupons.models import Coupon, UserCoupon

            uc = UserCoupon.objects.filter(
                user=request.user, coupon__code=coupon_code, is_used=False
            ).select_related('coupon').first()

            if uc:
                coupon = uc.coupon
                applied_user_coupon = uc
            else:
                coupon = Coupon.objects.filter(code=coupon_code, is_personal=False).first()

            if not coupon:
                return Response(
                    {'code': 'INVALID_COUPON', 'message': '유효하지 않은 쿠폰입니다.'},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            valid, msg = coupon.validate()
            if not valid:
                return Response(
                    {'code': 'COUPON_ERROR', 'message': msg},
                    status=http_status.HTTP_400_BAD_REQUEST
                )

            discount_amount = coupon.calc_discount(total_amount)
            applied_coupon = coupon

        final_amount = max(0, total_amount - discount_amount)

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                total_amount=final_amount,
                discount_amount=discount_amount,
                coupon=applied_coupon,
                shipping_addr=shipping_addr,
                status='PENDING'
            )
            for product, option, quantity, unit_price in resolved:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    option=option,
                    quantity=quantity,
                    ordered_price=unit_price
                )

            if applied_coupon:
                applied_coupon.used_count = F('used_count') + 1
                applied_coupon.save()
            if applied_user_coupon:
                applied_user_coupon.is_used = True
                applied_user_coupon.used_at = timezone.now()
                applied_user_coupon.save()

        return Response({
            "order_id": order.id,
            "total_amount": order.total_amount,
        }, status=http_status.HTTP_201_CREATED)


class OrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related(
            'items__product'
        ).order_by('-order_date')

        result = []
        for order in orders:
            try:
                pay = order.payment
                payment_method = pay.get_method_display()
                payment_status = pay.status
                paid_at = pay.paid_at.isoformat() if pay.paid_at else None
            except Exception:
                payment_method = None
                payment_status = None
                paid_at = None

            items = [
                {
                    'product_name': item.product.name,
                    'product_image': item.product.thumbnail_url,
                    'quantity': item.quantity,
                    'ordered_price': item.ordered_price,
                }
                for item in order.items.all()
            ]

            result.append({
                'id': order.id,
                'order_date': order.order_date.isoformat(),
                'status': order.status,
                'status_display': order.get_status_display(),
                'total_amount': order.total_amount,
                'shipping_addr': order.shipping_addr,
                'payment_method': payment_method,
                'payment_status': payment_status,
                'paid_at': paid_at,
                'items': items,
            })

        return Response(result, status=http_status.HTTP_200_OK)


class CartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user).select_related('product', 'option')
        serializer = CartItemSerializer(cart_items, many=True)
        return Response(serializer.data, status=http_status.HTTP_200_OK)

    def post(self, request):
        product_id = request.data.get('product')
        option_id = request.data.get('option') or request.data.get('product_option')
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response(
                {"code": "INVALID_QUANTITY", "message": "수량은 1개 이상이어야 합니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)
        option = get_object_or_404(ProductOption, id=option_id) if option_id else None

        cart_item = Cart.objects.filter(user=request.user, product=product, option=option).first()
        if cart_item:
            cart_item.quantity += quantity
            cart_item.save()
            return Response({'message': '장바구니 수량이 추가되었습니다.'}, status=http_status.HTTP_200_OK)

        Cart.objects.create(user=request.user, product=product, option=option, quantity=quantity)
        return Response({'message': '장바구니에 담겼습니다.'}, status=http_status.HTTP_201_CREATED)

    def put(self, request):
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity < 1:
            return Response(
                {"code": "INVALID_QUANTITY", "message": "수량은 1개 이상이어야 합니다."},
                status=http_status.HTTP_400_BAD_REQUEST
            )

        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': '수량이 수정되었습니다.'}, status=http_status.HTTP_200_OK)

    def delete(self, request):
        item_id = request.data.get('item_id')
        cart_item = get_object_or_404(Cart, id=item_id, user=request.user)
        cart_item.delete()
        return Response({'message': '삭제되었습니다.'}, status=http_status.HTTP_204_NO_CONTENT)
