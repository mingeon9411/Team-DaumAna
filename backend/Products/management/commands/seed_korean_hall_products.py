from django.core.management.base import BaseCommand
from Products.models import Category, Product, ProductOption


# frontend/src/data/products.js 는 한국관(KoreanHall.jsx) 페이지가 그대로 렌더링하는
# 상품 목록이다. 이 중 id 9(평상 소파), 10(서안청 책장)이 MySQL JIPDAUM_PRODUCT에
# 없어서 장바구니 담기(addToCart)가 404 "상품을 찾을 수 없습니다"로 실패했다.
# id는 프론트 배열의 id와 반드시 일치시켜야 한다.
PRODUCTS = [
    {'id': 9, 'category': '소파', 'name': '평상 소파', 'base_price': 418000,
     'description': '마루에 걸터앉던 평상의 낮은 눈높이를 그대로 소파에 옮겨왔습니다. 원목 프레임을 낮고 넓게 짜서 좌식 생활에 익숙한 몸에 자연스럽게 맞고, 그 위에 두툼한 리넨 쿠션을 얹어 앉거나 누워도 편안한 쿠션감을 더했습니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '리넨 내추럴', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 10, 'category': '수납', 'name': '서안청 책장', 'base_price': 268000,
     'description': '옛 선비의 서재를 채우던 서안청의 짜임을 원목으로 다시 구현한 책장입니다. 못을 최소화하고 전통 짜맞춤 방식을 응용해 뼈대를 세워, 세월이 지나도 뒤틀림 없이 단단함을 유지합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '원목 내추럴', 'extra_price': 0, 'stock_count': 10}]},
]


class Command(BaseCommand):
    help = '한국관(KoreanHall) 페이지 전용 상품(평상 소파, 서안청 책장)을 MySQL에 id를 맞춰 삽입합니다.'

    def handle(self, *args, **kwargs):
        existing_ids = set(
            Product.objects.filter(id__in=[d['id'] for d in PRODUCTS]).values_list('id', flat=True)
        )
        if existing_ids:
            self.stdout.write(self.style.WARNING(f'이미 존재하는 id {len(existing_ids)}개는 건너뜁니다: {sorted(existing_ids)}'))

        cat_map = {name: Category.objects.get_or_create(name=name)[0] for name in {d['category'] for d in PRODUCTS}}

        created = 0
        for data in PRODUCTS:
            if data['id'] in existing_ids:
                continue
            product = Product.objects.create(
                id=data['id'],
                category=cat_map[data['category']],
                name=data['name'],
                brand='집다움',
                base_price=data['base_price'],
                description=data['description'],
                thumbnail_url=data['thumbnail_url'],
            )
            for opt in data['options']:
                ProductOption.objects.create(product=product, **opt)
            self.stdout.write(f'  + [{product.id}] {product}')
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\n상품 {created}개 삽입 완료!'))
