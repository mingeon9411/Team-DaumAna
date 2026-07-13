from rest_framework import serializers

# ------------------------------------------------------------------------
# 🚀 [임포트 경로 최적화] 통합된 Products.models 내부에서 모든 관련 모델 로드
# ------------------------------------------------------------------------
# Review 모델은 Products/models.py로 통합 정의되었으므로 경로를 수정합니다.
from Products.models import Category, Product, ProductOption, Review


# ====================================================================
# 📦 [Products Domain] 카테고리 시리얼라이저 (셀프 참조 구조 대응)
# ====================================================================
class CategorySerializer(serializers.ModelSerializer):
    # 프론트엔드의 화면 렌더링 편의를 위해 상위 카테고리명 필드 확장
    parent_name = serializers.ReadOnlyField(source='parent.name')

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'parent_name']


# ====================================================================
# 📦 [Products Domain] 상품 옵션 상세 정보 시리얼라이저
# ====================================================================
class ProductOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOption
        fields = ['id', 'option_name', 'option_value', 'extra_price', 'stock_count']


# ====================================================================
# 📦 [Products Domain] 상품 마스터 시리얼라이저
# ====================================================================
class ProductSerializer(serializers.ModelSerializer):
    # 역참조 관계를 명시하여 상품 조회 시 하위 옵션 리스트를 한 번에 JSON으로 결합
    options = ProductOptionSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'base_price',
            'description', 'thumbnail_url',
            'category', 'category_name', 'options',
            'created_at'
        ]


# ====================================================================
# 💬 [Products Domain] 상품 구매 리뷰 시리얼라이저 (임포트 튜닝 완료)
# ====================================================================
class ReviewSerializer(serializers.ModelSerializer):
    # 오라클 JIPDAUM_USER 테이블의 데이터 역참조 바인딩
    user_nickname = serializers.ReadOnlyField(source='user.nickname')

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_nickname',
            'rating', 'comment', 'review_image_url', 'created_at'
        ]
        # 유저 정보는 뷰(views.py)에서 오라클 세션/Mock 데이터를 통해 강제 주입하므로 읽기 전용 처리
        read_only_fields = ['user']