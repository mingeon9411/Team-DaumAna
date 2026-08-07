from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# [1] 카테고리 (셀프 참조 계층형)
class Category(models.Model):
    id = models.AutoField(primary_key=True) # 오라클 시퀀스 매핑
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='subcategories'
    )

    class Meta:
        db_table = 'JIPDAUM_CATEGORY'
        verbose_name = '상품 카테고리'
        verbose_name_plural = '상품 카테고리 목록'

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name


# [2] 상품 마스터
class Product(models.Model):
    id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    base_price = models.PositiveIntegerField(default=0) # 오라클 CHECK (base_price >= 0) 대응
    description = models.TextField() # 오라클 CLOB 대응
    thumbnail_url = models.CharField(max_length=500) # URLField보다 오라클 VARCHAR2(500) 직결을 위해 CharField 권장
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_PRODUCT'
        verbose_name = '상품 마스터'
        verbose_name_plural = '상품 마스터 목록'

    def __str__(self):
        return f"[{self.brand}] {self.name}"


# [3] 상품 옵션
class ProductOption(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='options')
    option_name = models.CharField(max_length=100) 
    option_value = models.CharField(max_length=100) 
    extra_price = models.IntegerField(default=0) # 옵션 마이너스 차감 금액 가능성을 고려해 IntegerField 유지
    stock_count = models.PositiveIntegerField(default=0) # 재고는 음수 불가하므로 Positive 변경

    class Meta:
        db_table = 'JIPDAUM_PRODUCT_OPTION'
        verbose_name = '상품 옵션'
        verbose_name_plural = '상품 옵션 목록'

    def __str__(self):
        return f"{self.product.name} - {self.option_name}:{self.option_value} (+{self.extra_price}원)"


# [4] 상품 리뷰 (초기 DDL 스크립트의 JIPDAUM_REVIEW 매핑 합본)
class Review(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE) # 순환 참조 방지 문자열 매핑
    rating = models.PositiveIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    ) # 오라클 CHECK (rating BETWEEN 1 AND 5) 대응
    title = models.CharField(max_length=100, blank=True, default="")
    comment = models.TextField() # 오라클 CLOB 대응
    review_image_url = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_REVIEW'
        verbose_name = '상품 리뷰'
        verbose_name_plural = '상품 리뷰 목록'

    def __str__(self):
        return f"{self.user.username}의 리뷰 - 평점: {self.rating}"