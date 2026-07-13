from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from Products.models import Category, Product, ProductOption, Review
from Users.models import User
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer


# ====================================================================
# 📦 [Products Domain] 카테고리 조회 API 
# ====================================================================
class CategoryListView(APIView):

    def get(self, request):
        # 상위 카테고리명을 Serializer가 안전하게 JOIN 쿼리할 수 있도록 select_related 추가
        categories = Category.objects.filter(parent=None).select_related('parent')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ====================================================================
# 📦 [Products Domain] 상품 목록 및 조건 검색 API (N+1 쿼리 완벽 최적화본)
# ====================================================================
class ProductListView(APIView):

    def get(self, request):
        # 카테고리는 1:1 방식이므로 select_related(SQL JOIN), 옵션은 1:N 이므로 prefetch_related(추가쿼리) 조합 최고입니다!
        products = Product.objects.select_related('category').prefetch_related('options')

        # 1. 카테고리별 필터링 조건 쿼리
        category_id = request.query_params.get('category')
        if category_id:
            products = products.filter(category_id=category_id)

        # 2. 상품명 · 브랜드 · 카테고리명 통합 검색
        keyword = request.query_params.get('search')
        if keyword:
            products = products.filter(
                Q(name__icontains=keyword) |
                Q(brand__icontains=keyword) |
                Q(category__name__icontains=keyword)
            )

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ====================================================================
# 📦 [Products Domain] 상품 상세 정보 관리 API
# ====================================================================
class ProductDetailView(APIView):

    def get(self, request, product_id):
        # 단건 조회 시에도 옵션 배열을 한 번에 오라클 쿼리로 당겨오도록 캐싱 바인딩
        product = get_object_or_404(
            Product.objects.select_related('category').prefetch_related('options'),
            id=product_id
        )
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return Response({"message": "상품이 성공적으로 삭제되었습니다."}, status=status.HTTP_204_NO_CONTENT)


class ReviewAPIView(APIView):

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        user = User.objects.first()
        if not user:
            user = User.objects.create(
                username='test_elite',
                email='test@ctrl-alt-elite.com',
                password=make_password('testpassword123'),
                nickname='엘리트멤버',
                is_active=1
            )
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)