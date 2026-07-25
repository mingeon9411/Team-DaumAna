from django.core.management.base import BaseCommand
from Products.models import Category, Product, ProductOption


# frontend/src/component/Home/Home.jsx 의 PRODUCTS 배열(메인 "전체 상품" 페이지에
# 실제로 표시되는 7개 상품)을 그대로 MySQL에 반영한다.
CATEGORIES = [
    ('가구', None),
    ('조명', None),
    ('소품', None),
    ('테이블', '가구'),
    ('의자', '가구'),
    ('소파', '가구'),
    ('펜던트', '조명'),
]

PRODUCTS = [
    {
        'category': '의자',
        'name': '린넨 암체어',
        'brand': '집다움',
        'base_price': 328000,
        'description': '부드러운 린넨과 낮은 팔걸이로 온몸을 편안히 감싸는 체어. 거실 어디에 놓아도 공간의 무게중심이 됩니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '내추럴 베이지', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '테이블',
        'name': '월넛 사이드 테이블',
        'brand': '집다움',
        'base_price': 168000,
        'description': '짙은 월넛 원목의 결을 살린 사이드 테이블. 소파 옆, 침대 곁 어디서나 조용히 제 역할을 합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '블랙 월넛', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '소품',
        'name': '대나무 트레이',
        'brand': '집다움',
        'base_price': 54000,
        'description': '대나무를 엮어 만든 트레이. 차 한 잔, 작은 화분, 협탁 위 소품 정리에 두루 어울립니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '내추럴', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '소파',
        'name': '한국 모던 소파',
        'brand': '집다움',
        'base_price': 398000,
        'description': '아이보리 가죽과 완만한 곡선이 어우러진 2인용 소파. 어느 각도에서 봐도 매끈한 실루엣을 완성합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '아이보리 레더', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '소파',
        'name': '플로어 라운지 소파',
        'brand': '집다움',
        'base_price': 328000,
        'description': '낮은 좌면과 넉넉한 쿠션이 편안한 좌식형 라운지 소파. 바닥 생활에 어울리는 낮은 무게중심이 특징입니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '아이보리 부클', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '펜던트',
        'name': '한지 펜던트 조명',
        'brand': '집다움',
        'base_price': 112000,
        'description': '한지가 은은하게 빛을 머금는 프레임형 펜던트 조명. 은은한 조도로 공간에 온기를 더합니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '블랙 프레임', 'extra_price': 0, 'stock_count': 10}],
    },
    {
        'category': '의자',
        'name': '달항아리 암체어',
        'brand': '집다움',
        'base_price': 358000,
        'description': '달항아리의 둥근 선을 닮은 부클 원단 윙백 암체어. 어느 자리에 두어도 공간의 중심이 됩니다.',
        'thumbnail_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=620&fit=crop&auto=format',
        'options': [{'option_name': '색상', 'option_value': '카멜 부클', 'extra_price': 0, 'stock_count': 10}],
    },
]


class Command(BaseCommand):
    help = '프론트엔드 메인 "전체 상품" 페이지(Home.jsx PRODUCTS)의 실제 카탈로그를 MySQL에 삽입합니다.'

    def handle(self, *args, **kwargs):
        existing = {p.name for p in Product.objects.filter(name__in=[d['name'] for d in PRODUCTS])}
        if existing:
            self.stdout.write(self.style.WARNING(f'이미 존재하는 상품 {len(existing)}개는 건너뜁니다: {", ".join(existing)}'))

        cat_map = {}
        for name, parent_name in CATEGORIES:
            parent = cat_map.get(parent_name)
            cat, _ = Category.objects.get_or_create(name=name, parent=parent)
            cat_map[name] = cat

        created = 0
        for data in PRODUCTS:
            if data['name'] in existing:
                continue
            product = Product.objects.create(
                category=cat_map[data['category']],
                name=data['name'],
                brand=data['brand'],
                base_price=data['base_price'],
                description=data['description'],
                thumbnail_url=data['thumbnail_url'],
            )
            for opt in data['options']:
                ProductOption.objects.create(product=product, **opt)
            self.stdout.write(f'  + {product}')
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\n상품 {created}개 삽입 완료!'))
