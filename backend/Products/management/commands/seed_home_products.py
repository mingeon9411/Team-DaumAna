from django.core.management.base import BaseCommand
from Products.models import Category, Product, ProductOption


# frontend/src/component/Home/Home.jsx 의 PRODUCTS 배열(메인 "전체 상품" 페이지에
# 실제로 표시되는 14개 상품)을 그대로 MySQL에 반영한다. id는 프론트 배열의 id와
# 반드시 일치시켜야 한다 — 장바구니 담기(addToCart)가 프론트의 product.id를 그대로
# 백엔드 상품 PK로 보내기 때문에, 어긋나면 "장바구니 추가 실패"로 이어진다.
CATEGORIES = ["소파", "의자", "테이블", "침구", "조명", "수납", "소품"]

PRODUCTS = [
    {'id': 1, 'category': '의자', 'name': '린넨 암체어', 'base_price': 328000,
     'description': '부드러운 린넨과 낮은 팔걸이로 온몸을 편안히 감싸는 체어. 거실 어디에 놓아도 공간의 무게중심이 됩니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '내추럴 베이지', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 2, 'category': '테이블', 'name': '월넛 사이드 테이블', 'base_price': 168000,
     'description': '짙은 월넛 원목의 결을 살린 사이드 테이블. 소파 옆, 침대 곁 어디서나 조용히 제 역할을 합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '블랙 월넛', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 3, 'category': '소품', 'name': '대나무 트레이', 'base_price': 54000,
     'description': '대나무를 엮어 만든 트레이. 차 한 잔, 작은 화분, 협탁 위 소품 정리에 두루 어울립니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '내추럴', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 4, 'category': '소파', 'name': '한국 모던 소파', 'base_price': 398000,
     'description': '아이보리 가죽과 완만한 곡선이 어우러진 2인용 소파. 어느 각도에서 봐도 매끈한 실루엣을 완성합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '아이보리 레더', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 5, 'category': '소파', 'name': '플로어 라운지 소파', 'base_price': 328000,
     'description': '낮은 좌면과 넉넉한 쿠션이 편안한 좌식형 라운지 소파. 바닥 생활에 어울리는 낮은 무게중심이 특징입니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '아이보리 부클', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 7, 'category': '의자', 'name': '달항아리 암체어', 'base_price': 358000,
     'description': '달항아리의 둥근 선을 닮은 부클 원단 윙백 암체어. 어느 자리에 두어도 공간의 중심이 됩니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '카멜 부클', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 8, 'category': '조명', 'name': '한지 그림자 조명', 'base_price': 98000,
     'description': '얇은 스틸 프레임 위에 한지를 발라, 켜졌을 때 은은한 그림자 무늬가 벽에 드리우는 스탠드 조명입니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '블랙 스틸', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 9, 'category': '수납', 'name': '자작나무 오픈 책장', 'base_price': 248000,
     'description': '자작나무 합판을 오크 톤으로 마감한 5단 오픈 책장. 거실이나 서재 어디에 두어도 무게감 없이 어울립니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '화이트 오크', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 10, 'category': '소품', 'name': '백자 유약 접시 세트', 'base_price': 72000,
     'description': '전통 백자 유약 기법으로 구운 접시 4개 세트. 은은한 광택과 매끄러운 곡선이 어떤 음식을 담아도 자연스럽게 어우러집니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '구성', 'option_value': '순백 (4p)', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 11, 'category': '소품', 'name': '황동 프레임 원형 거울', 'base_price': 186000,
     'description': '가느다란 황동 프레임으로 두른 원형 거울. 현관이나 화장대 위에 걸면 공간에 은은한 광채를 더합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '골드 브라스', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 12, 'category': '침구', 'name': '리넨 누빔 침구 세트', 'base_price': 156000,
     'description': '100% 순면 리넨을 누빔 방식으로 마감한 침구 세트. 사계절 내내 보송한 촉감을 유지합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '오트밀 베이지', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 13, 'category': '소품', 'name': '무자기 오브제 화병', 'base_price': 64000,
     'description': '정갈한 여백을 살린 무자기 화병. 미니멀한 형태와 무광 마감으로 꽃 한 송이만 꽂아도 공간의 포인트가 됩니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '백자', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 14, 'category': '소품', 'name': '울 혼방 러그', 'base_price': 138000,
     'description': '울과 면을 섞어 짠 러그로, 폭신한 두께감과 은은한 색감이 거실 바닥에 차분한 톤을 더합니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '그레이시 베이지', 'extra_price': 0, 'stock_count': 10}]},
    {'id': 15, 'category': '의자', 'name': '원목 스툴', 'base_price': 88000,
     'description': '애쉬 원목을 통으로 깎아 만든 스툴. 보조 의자로도, 협탁 대용으로도 쓸 수 있는 다용도 가구입니다.',
     'thumbnail_url': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&h=620&fit=crop&auto=format',
     'options': [{'option_name': '색상', 'option_value': '내추럴 애쉬', 'extra_price': 0, 'stock_count': 10}]},
]


class Command(BaseCommand):
    help = '프론트엔드 메인 "전체 상품" 페이지(Home.jsx PRODUCTS)의 실제 카탈로그를 MySQL에 id를 맞춰 삽입합니다.'

    def handle(self, *args, **kwargs):
        existing_ids = set(
            Product.objects.filter(id__in=[d['id'] for d in PRODUCTS]).values_list('id', flat=True)
        )
        if existing_ids:
            self.stdout.write(self.style.WARNING(f'이미 존재하는 id {len(existing_ids)}개는 건너뜁니다: {sorted(existing_ids)}'))

        cat_map = {name: Category.objects.get_or_create(name=name)[0] for name in CATEGORIES}

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
