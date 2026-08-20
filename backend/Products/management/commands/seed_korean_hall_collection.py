from django.core.management.base import BaseCommand
from Products.models import Category, Product


# frontend/src/data/products.js(한국관 페이지 진열)의 상품들을 챗봇 검색(search_products RAG)이
# 찾을 수 있도록 JIPDAUM_PRODUCT에 collection='korean_hall'로 복사해 넣는다.
#
# 주의: 프론트의 메인 진열(Home.jsx PRODUCTS)과 한국관 진열(data/products.js)은 각각 독립적으로
# id를 1부터 매기는 별도 배열이라 서로 id가 겹친다(예: 둘 다 id=1이 존재하지만 다른 상품).
# 그래서 여기서는 프론트 id를 그대로 강제하지 않고 DB가 새 id를 자동 채번하도록 둔다 — 챗봇 응답은
# DB의 id/이름/가격만 참조하므로 문제없다. (반대로 seed_korean_hall_products.py는 장바구니
# 담기용으로 프론트 id=9,10을 그대로 강제하려 했던 시도인데, 지금은 메인 진열이 이미 id 15까지
# 차 있어서 그대로 실행하면 PK 충돌로 실패한다 — 그건 건드리지 않고 별도로 남겨둔다.)
PRODUCTS = [
    {'name': '월넛 사이드 테이블', 'category': '테이블', 'base_price': 128000,
     'description': '달항아리의 둥근 선에서 출발한 실루엣을 원목 테이블 위에 옮겨왔습니다. 짙은 월넛 원목을 통짜로 깎아 다리와 상판을 하나의 흐름으로 이어, 어느 각도에서 보아도 매끄러운 곡선이 끊기지 않습니다.'},
    {'name': '한지 무드 조명', 'category': '조명', 'base_price': 89000,
     'description': '닥나무로 뜬 전통 한지를 갓 삼아 빛을 한 겹 걸러냅니다. 형광등의 직접적인 밝음 대신, 종이의 결을 통과하며 부드럽게 퍼지는 빛이 공간의 온도를 낮추어 편안하게 만들어줍니다.'},
    {'name': '무자기 꽃잎 화병 Petal vase', 'category': '소품', 'base_price': 64000,
     'description': '백자의 정갈한 흰빛과 꽃봉오리가 막 벌어지기 직전의 곡선을 하나의 형태로 빚어낸 화병입니다. 손으로 직접 빚어 굽는 무자기 방식 특성상 미세하게 다른 곡선과 두께를 지니고 있습니다.'},
    {'name': '한국 모던 나비 문양 수납장', 'category': '수납', 'base_price': 148000,
     'description': '전통 나전칠기 반닫이에서 즐겨 쓰이던 나비 장식을 브라스 손잡이로 다시 그려, 고재의 무게감에 현대적인 경쾌함을 더한 수납장입니다.'},
    {'name': '한지 펜던트 조명', 'category': '조명', 'base_price': 112000,
     'description': '얇은 철제 프레임 안에 전통 한지를 겹겹이 발라, 마치 한옥의 창호를 그대로 옮겨온 듯한 조명입니다. 켜졌을 때는 격자 사이로 은은한 빛이 새어 나와 공간에 깊이를 더합니다.'},
    {'name': '평상 소파', 'category': '소파', 'base_price': 418000,
     'description': '마루에 걸터앉던 평상의 낮은 눈높이를 그대로 소파에 옮겨왔습니다. 원목 프레임을 낮고 넓게 짜서 좌식 생활에 익숙한 몸에 자연스럽게 맞습니다.'},
    {'name': '서안청 책장', 'category': '수납', 'base_price': 268000,
     'description': '옛 선비의 서재를 채우던 서안청의 짜임을 원목으로 다시 구현한 책장입니다. 칸마다 깊이와 높이를 조금씩 달리 짜서 서책과 청자 소품을 자연스럽게 배치할 수 있도록 했습니다.'},
]


class Command(BaseCommand):
    help = '한국관(KoreanHall) 진열 상품을 collection=korean_hall로 JIPDAUM_PRODUCT에 삽입합니다 (챗봇 검색용).'

    def handle(self, *args, **kwargs):
        existing_names = set(
            Product.objects.filter(collection='korean_hall').values_list('name', flat=True)
        )
        if existing_names:
            self.stdout.write(self.style.WARNING(f'이미 존재하는 한국관 상품 {len(existing_names)}개는 건너뜁니다.'))

        created = 0
        for data in PRODUCTS:
            if data['name'] in existing_names:
                continue
            category, _ = Category.objects.get_or_create(name=data['category'])
            product = Product.objects.create(
                category=category,
                name=data['name'],
                brand='집다움',
                base_price=data['base_price'],
                description=data['description'],
                thumbnail_url='',
                collection='korean_hall',
            )
            self.stdout.write(f'  + [{product.id}] {product}')
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\n한국관 상품 {created}개 삽입 완료!'))
