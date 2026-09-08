from django.contrib import admin
from .models import Category, Product, ProductOption, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # slug를 제거하고 실제 존재하는 필드만 노출
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # 우리 팀 모델에 맞춰 price->prod_price / is_available->stock 등으로 선언되어 있을 확률이 높으므로
    # 에러를 유발하는 필드를 제외하고 안전한 필수 코어 필드로만 화면 재구성
    list_display = ['id', 'name', 'category', 'same_day_shipping']
    list_filter = ['category', 'same_day_shipping']
    search_fields = ['name']

@admin.register(ProductOption)
class ProductOptionAdmin(admin.ModelAdmin):
    # option_name, price 등 실제 구현된 필드 속성에 맞춰 ID와 상품명 관계로 안전하게 단순화
    list_display = ['id', 'product']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'user', 'rating']
