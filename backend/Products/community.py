from django.db import models

# [1] 피드 공간 유형 Choices
class SpaceType(models.TextChoices):
    LIVING_ROOM = 'LIVING_ROOM', '거실'
    BEDROOM = 'BEDROOM', '침실'
    KITCHEN = 'KITCHEN', '주방'
    BATHROOM = 'BATHROOM', '욕실'
    STUDY = 'STUDY', '서재'
    ENTRANCE = 'ENTRANCE', '현관'
    ETC = 'ETC', '기타'


# [2] 피드 게시글 (오늘의 집 '집들이' 코어 엔티티)
class Post(models.Model):
    id = models.AutoField(primary_key=True) # 오라클 시퀀스 매핑
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE) # 문자열 참조로 통일
    title = models.CharField(max_length=200)
    content = models.TextField() # 오라클 CLOB 매핑
    image_url = models.CharField(max_length=500) # 초기 DDL 필수 반영 (대표 썸네일)
    
    # 외래키 참조
    style = models.ForeignKey('core.Style', on_delete=models.SET_NULL, null=True, blank=True)
    space_type = models.CharField(max_length=20, choices=SpaceType.choices, null=True, blank=True)
    
    # ✨ 중요: through 설정을 통해 우리가 정의한 커스텀 교차 테이블(PostTaggedProduct)을 강제 지정
    tagged_products = models.ManyToManyField(
        'Products.Product', 
        through='PostTaggedProduct', 
        related_name='tagged_posts', 
        blank=True
    )
    
    # M:N 자동생성 중개 테이블 통제를 위한 설계 (아래 오라클 DDL에 반영됨)
    likes = models.ManyToManyField('Users.User', related_name='liked_posts', blank=True)
    scraps = models.ManyToManyField('Users.User', related_name='scrapped_posts', blank=True)
    
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'JIPDAUM_POST'
        verbose_name = '집들이 게시글'
        verbose_name_plural = '집들이 게시글 목록'

    def __str__(self):
        return self.title


# ✨ [3] 상품 태깅 위치 속성이 추가된 교차 엔티티 (ManyToManyField through)
class PostTaggedProduct(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    product = models.ForeignKey('Products.Product', on_delete=models.CASCADE)
    
    # 오늘의 집 스타일 사진 위 태그 좌표 저장 컬럼
    tag_position_x = models.FloatField(default=0.0) # 사진 내 가로 위치 비율 (%)
    tag_position_y = models.FloatField(default=0.0) # 사진 내 세로 위치 비율 (%)

    class Meta:
        db_table = 'JIPDAUM_POST_TAGGED_PRODUCT'
        unique_together = ('post', 'product') # unique_together 명시로 DDL의 UK_POST_PRODUCT 대응 


# [4] 피드 서브 공간 사진 업로드 (추가 이미지 슬라이드 구현용)
class PostImage(models.Model):
    id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image_url = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'JIPDAUM_POST_IMAGE'
        ordering = ['order']