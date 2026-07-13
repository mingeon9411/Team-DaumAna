from django.core.management.base import BaseCommand
from Products.models import Category, Product, ProductOption


CATEGORIES = [
    # 최상위 카테고리
    ('가구',   None),
    ('조명',   None),
    ('소품',   None),
    ('침구',   None),
    ('주방',   None),
    # 하위 카테고리
    ('테이블', '가구'),
    ('의자',   '가구'),
    ('수납',   '가구'),
    ('무드등', '조명'),
    ('펜던트', '조명'),
    ('오브제', '소품'),
    ('화병',   '소품'),
]

PRODUCTS = [
    {
        'category': '테이블',
        'name': '월넛 사이드 테이블',
        'brand': '집다움',
        'base_price': 128000,
        'description': '한국적인 곡선미를 담은 원목 테이블. 월넛 특유의 결과 따뜻한 톤이 어떤 공간에도 자연스럽게 어울립니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        'options': [
            {'option_name': '사이즈', 'option_value': 'S (40×40cm)', 'extra_price': 0,     'stock_count': 12},
            {'option_name': '사이즈', 'option_value': 'M (60×60cm)', 'extra_price': 20000, 'stock_count': 8},
        ],
    },
    {
        'category': '무드등',
        'name': '한지 무드 조명',
        'brand': '집다움',
        'base_price': 89000,
        'description': '은은한 빛으로 공간을 채우는 조명. 전통 한지 소재를 활용해 따뜻하고 아늑한 분위기를 연출합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
        'options': [
            {'option_name': '색상', 'option_value': '아이보리', 'extra_price': 0,    'stock_count': 15},
            {'option_name': '색상', 'option_value': '연회색',   'extra_price': 5000, 'stock_count': 10},
        ],
    },
    {
        'category': '화병',
        'name': '도자 오브제 화병',
        'brand': '집다움',
        'base_price': 54000,
        'description': '정갈한 여백이 느껴지는 세라믹 화병. 미니멀한 형태와 무광 마감으로 공간의 포인트가 됩니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1612196808214-b7e239e5f4b0?w=600',
        'options': [
            {'option_name': '색상', 'option_value': '백자',   'extra_price': 0,    'stock_count': 20},
            {'option_name': '색상', 'option_value': '청자',   'extra_price': 8000, 'stock_count': 7},
            {'option_name': '색상', 'option_value': '분청',   'extra_price': 5000, 'stock_count': 9},
        ],
    },
    {
        'category': '의자',
        'name': '대나무 라운지 체어',
        'brand': '집다움',
        'base_price': 215000,
        'description': '자연 소재 대나무로 제작한 라운지 체어. 가볍고 통기성이 좋아 사계절 쾌적하게 사용할 수 있습니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600',
        'options': [
            {'option_name': '쿠션 색상', 'option_value': '린넨 베이지', 'extra_price': 0,     'stock_count': 6},
            {'option_name': '쿠션 색상', 'option_value': '딥 그린',     'extra_price': 10000, 'stock_count': 4},
        ],
    },
    {
        'category': '수납',
        'name': '오동나무 수납 선반',
        'brand': '집다움',
        'base_price': 178000,
        'description': '가볍고 견고한 오동나무로 만든 벽걸이 선반. 전통 짜맞춤 방식으로 제작해 못 없이도 튼튼합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1597524678053-5ada3c2fccf5?w=600',
        'options': [
            {'option_name': '너비', 'option_value': '60cm', 'extra_price': 0,     'stock_count': 10},
            {'option_name': '너비', 'option_value': '90cm', 'extra_price': 25000, 'stock_count': 5},
        ],
    },
    {
        'category': '펜던트',
        'name': '황동 펜던트 조명',
        'brand': '집다움',
        'base_price': 142000,
        'description': '시간이 지날수록 깊어지는 황동 소재 펜던트 조명. 식탁 위나 침실 코너에 클래식한 분위기를 더합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600',
        'options': [
            {'option_name': '전구 타입', 'option_value': 'LED 전구 포함',   'extra_price': 15000, 'stock_count': 8},
            {'option_name': '전구 타입', 'option_value': '전구 미포함',      'extra_price': 0,     'stock_count': 12},
        ],
    },
    {
        'category': '오브제',
        'name': '천연 향 디퓨저 세트',
        'brand': '집다움',
        'base_price': 38000,
        'description': '국내산 천연 재료로 만든 향 디퓨저. 편백, 솔잎, 국화 세 가지 향으로 집 안 가득 자연을 담습니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
        'options': [
            {'option_name': '향',  'option_value': '편백',  'extra_price': 0, 'stock_count': 25},
            {'option_name': '향',  'option_value': '솔잎',  'extra_price': 0, 'stock_count': 20},
            {'option_name': '향',  'option_value': '국화',  'extra_price': 0, 'stock_count': 18},
        ],
    },
    {
        'category': '침구',
        'name': '순면 누빔 이불',
        'brand': '집다움',
        'base_price': 96000,
        'description': '100% 순면 원단으로 제작한 사계절 이불. 전통 누빔 방식으로 충전재가 뭉치지 않아 오래 사용할 수 있습니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
        'options': [
            {'option_name': '사이즈', 'option_value': '싱글',   'extra_price': 0,     'stock_count': 15},
            {'option_name': '사이즈', 'option_value': '더블',   'extra_price': 20000, 'stock_count': 10},
            {'option_name': '사이즈', 'option_value': '킹',     'extra_price': 35000, 'stock_count': 6},
        ],
    },
    {
        'category': '주방',
        'name': '옻칠 나무 도마',
        'brand': '집다움',
        'base_price': 62000,
        'description': '국내산 은행나무에 전통 옻칠을 더한 도마. 항균 효과와 내구성이 뛰어나 주방 필수 아이템입니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600',
        'options': [
            {'option_name': '사이즈', 'option_value': 'S (28×18cm)', 'extra_price': 0,     'stock_count': 20},
            {'option_name': '사이즈', 'option_value': 'L (38×25cm)', 'extra_price': 18000, 'stock_count': 12},
        ],
    },
    {
        'category': '주방',
        'name': '백자 공기 세트 (4p)',
        'brand': '집다움',
        'base_price': 48000,
        'description': '전통 백자 기법으로 빚은 밥공기 4개 세트. 매끄러운 유약 마감으로 식기세척기 사용이 가능합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600',
        'options': [
            {'option_name': '색상', 'option_value': '순백',   'extra_price': 0,    'stock_count': 30},
            {'option_name': '색상', 'option_value': '청화',   'extra_price': 8000, 'stock_count': 15},
        ],
    },
]


class Command(BaseCommand):
    help = '집다움 샘플 상품 데이터를 DB에 삽입합니다.'

    def handle(self, *args, **kwargs):
        if Product.objects.exists():
            self.stdout.write(self.style.WARNING('이미 상품 데이터가 있습니다. 건너뜁니다.'))
            self.stdout.write('강제로 다시 삽입하려면 먼저 DB에서 데이터를 삭제하세요.')
            return

        # 카테고리 생성
        cat_map = {}
        for name, parent_name in CATEGORIES:
            parent = cat_map.get(parent_name)
            cat, _ = Category.objects.get_or_create(name=name, parent=parent)
            cat_map[name] = cat
        self.stdout.write(f'카테고리 {len(cat_map)}개 생성 완료')

        # 상품 + 옵션 생성
        for data in PRODUCTS:
            cat = cat_map[data['category']]
            product = Product.objects.create(
                category=cat,
                name=data['name'],
                brand=data['brand'],
                base_price=data['base_price'],
                description=data['description'],
                thumbnail_url=data['thumbnail_url'],
            )
            for opt in data['options']:
                ProductOption.objects.create(product=product, **opt)
            self.stdout.write(f'  + {product}')

        self.stdout.write(self.style.SUCCESS(f'\n상품 {len(PRODUCTS)}개 삽입 완료!'))
