from django.urls import path
from .views import CategoryListView, ProductListView, ProductDetailView, ReviewAPIView

urlpatterns = [
    # [1] 카테고리 전체 목록 조회 API
    # 실제 주소: GET /api/shop/products/categories/
    path('categories/', CategoryListView.as_view(), name='category-list'),

    # [2] 상품 전체 목록 및 브랜드 검색 API
    # 실제 주소: GET /api/shop/products/
    path('', ProductListView.as_view(), name='product-list'),

    # [3] 특정 가구 상품 상세 조회 API
    # 실제 주소: GET /api/shop/products/<product_id>/
    path('<int:product_id>/', ProductDetailView.as_view(), name='product-detail'),

    path('<int:product_id>/reviews/', ReviewAPIView.as_view(), name='review-list'),
]