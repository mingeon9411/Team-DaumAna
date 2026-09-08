from django.core.management.base import BaseCommand
from django.db import transaction
from Products.models import Category, Product, ProductOption


# frontend/src/component/Home/Home.jsx 의 PRODUCTS 배열(메인 "전체 상품" 페이지 14개)을
# 그대로 MySQL(JIPDAUM_PRODUCT, collection='main')에 반영한다.
#
# 기존 seed_home_products.py가 넣어둔 7개(id 1~7, 린넨 암체어 등)는 북유럽풍으로 상품
# 라인업이 전면 교체(2026-08-24)되기 전 잔존 시드 데이터라 지금 화면과 이름부터 다르다.
# 이 커맨드는 그 스크립트를 대체한다 — 실행하면 collection='main' 행을 전부 지우고
# Home.jsx와 완전히 같은 14개(id 1~14)를 다시 넣는다.
#
# id는 프론트 배열의 id와 반드시 일치시켜야 한다 — 장바구니 담기(addToCart)가 프론트의
# product.id를 그대로 백엔드 상품 PK로 보내기 때문에, 어긋나면 "장바구니 추가 실패"로
# 이어진다(한국관 카탈로그에서 실제로 겪었던 버그와 동일 유형).
#
# thumbnail_url은 frontend/public/products-main/product-{id}.jpg를 가리키는 절대경로
# 문자열이다. 프론트가 <img src="/products-main/product-01.jpg">로 그대로 쓰면, 로컬
# (localhost:5173)이든 배포된 Cloudflare Pages 도메인이든 "현재 프론트가 떠 있는 origin"
# 기준으로 알아서 해석되므로 별도 CORS/절대 URL 설정이 필요 없다.
PRODUCTS = [
    {'id': 1, 'category': '러그', 'name': '북유럽풍 러그 B형', 'base_price': 168000,
     'description': '크림 베이스 위에 블루·올리브·더스티핑크가 어우러진 추상 아라베스크 무늬 터프팅 러그입니다. 두툼한 울 파일감이 발끝에 포근하게 감기고, 어느 벽지·바닥재와도 무난하게 어울려 거실이나 침실 중심에 깔기 좋습니다.'},
    {'id': 2, 'category': '조명', 'name': '우드 롱 무드등', 'base_price': 118000,
     'description': '오크 원목 스탠드에 라탄 케인 원통 갓을 씌운 플로어 조명입니다. 불을 켜면 라탄 사이로 은은한 그물무늬 빛이 새어나와 저녁 시간 거실에 따뜻한 분위기를 더합니다.'},
    {'id': 3, 'category': '조명', 'name': '북유럽풍 침대 작은 무드등', 'base_price': 49000,
     'description': '원뿔형 원목 다리 위에 천연 마사(자연사)를 촘촘히 감아 만든 미니 무드등입니다. 침대 협탁이나 콘솔 위에 올려두면 아늑한 저녁 조명으로 제격입니다.'},
    {'id': 4, 'category': '소파', 'name': '린넨 우드 소파', 'base_price': 498000,
     'description': '오크 프레임 팔걸이를 자연사로 엮고, 두툼한 린넨 쿠션을 올린 2인용 소파입니다. 담백한 프레임과 부드러운 쿠션감이 균형을 이뤄 거실 어디에 두어도 편안한 무게중심이 됩니다.'},
    {'id': 5, 'category': '소파', 'name': '북유럽 소파', 'base_price': 780000,
     'description': '곡선을 그리며 이어지는 프레임에 부클 원단을 두른 라운지형 3인 소파입니다. 낮은 좌면과 넉넉한 팔걸이가 몸을 편안히 감싸 주고, 오브제 같은 실루엣이 거실의 시선을 자연스럽게 붙잡습니다.'},
    {'id': 6, 'category': '소파', 'name': '유러피안 우드 소파', 'base_price': 560000,
     'description': '라탄 케인을 짜 넣은 등받이와 월넛 톤 원목 프레임이 클래식한 무드를 더하는 3인용 소파입니다. 머스터드 컬러 쿠션이 포인트가 되어 차분한 공간에 생기를 불어넣습니다.'},
    {'id': 7, 'category': '소품', 'name': '린넨 빨래 바구니', 'base_price': 32000,
     'description': '민트, 블루, 아이보리가 컬러블록으로 나뉜 패브릭 빨래 바구니입니다. 가벼운 무광 소재에 메탈 손잡이를 달아 옷방과 욕실을 오가며 들고 다니기 편합니다.'},
    {'id': 8, 'category': '소품', 'name': '북유럽 문양 빨래 바구니', 'base_price': 45000,
     'description': '가는 라탄 가닥을 별무늬로 엮어 짠 바스켓으로, 가죽 손잡이가 포인트를 더합니다. 세탁물 정리는 물론 담요나 잡지꽂이로도 어울리는 다용도 소품입니다.'},
    {'id': 9, 'category': '소품', 'name': '북유럽풍 러그 A형', 'base_price': 128000,
     'description': '삼각·다이아몬드 패턴을 세이지, 블루그레이 톤으로 촘촘히 터프팅한 러그입니다. 기하학적인 패턴이 공간에 리듬감을 더해 소파 앞이나 침대 곁 포인트 러그로 잘 어울립니다.'},
    {'id': 10, 'category': '소품', 'name': '친환경 우드 빨래 바구니', 'base_price': 39000,
     'description': '천연 라탄을 촘촘히 엮고 가죽 손잡이를 덧댄 친환경 소재 바구니입니다. 옷방, 욕실, 아이 방 등 어디에 두어도 자연스럽게 스며드는 내추럴한 분위기를 냅니다.'},
    # id 11~14는 korean_hall이 전역 PK 11~17을 이미 쓰고 있어 31~34로 옮김(2026-09-03) —
    # 실제로 이 커맨드를 그대로 돌리면 11에서 IntegrityError로 멈추는 걸 확인함. Home.jsx도 같이 맞출 것.
    {'id': 31, 'category': '의자', 'name': '우드 의자', 'base_price': 219000,
     'description': '둥근 라탄 케인 등받이와 오크 프레임이 만나는 자그마한 암체어입니다. 넉넉한 리넨 쿠션을 더해 식탁 의자로도, 침실 코너 체어로도 편안하게 쓸 수 있습니다.'},
    {'id': 32, 'category': '의자', 'name': '유럽풍 피서지 의자', 'base_price': 268000,
     'description': '티크 원목 프레임에 가죽 스트랩을 교차로 엮어 만든 로우 라운지 체어입니다. 낮은 좌면과 여유로운 각도가 휴양지에 온 듯한 편안함을 주어, 테라스나 창가 자리에 잘 어울립니다.'},
    {'id': 33, 'category': '침대', 'name': '북유럽 침대', 'base_price': 890000,
     'description': '원목의 결과 라이브 엣지를 살린 헤드보드가 인상적인 플랫폼 침대 프레임입니다. 군더더기 없는 낮은 구조로 침실을 한층 넓고 차분하게 만들어 줍니다.'},
    {'id': 34, 'category': '침대', 'name': '북유럽풍 파스텔 문양 침대', 'base_price': 950000,
     'description': '블루, 세이지, 로즈 톤의 추상 패턴 패브릭으로 감싼 업홀스터리 침대입니다. 높은 헤드보드가 침실의 포인트가 되어 주고, 부드러운 패딩감이 등을 편안하게 받쳐줍니다.'},
    # 2026-09-03 생활용품 카테고리(발매트/수건/실내화/욕실화) 추가분 — Home.jsx PRODUCTS id 18~30과 동일.
    # id 15~17이 아니라 18부터 시작하는 이유: korean_hall 컬렉션이 이미 id 11~17을 쓰고 있어서
    # (Product.id가 두 컬렉션에 걸쳐 전역으로 유니크해야 함) 그 범위를 피해야 한다. 참고로 main
    # 자체의 기존 id 11~14도 korean_hall 11~17과 겹쳐 이 커맨드가 그 줄에서 IntegrityError로
    # 멈추는 상태였다 — 이번 작업 범위 밖의 기존 버그라 건드리지 않았다.
    {'id': 18, 'category': '발매트', 'name': '스프라이트 발매트 A타입', 'base_price': 32000,
     'description': '아이보리 바탕에 브라운 톤 스트라이프를 촘촘히 짜 넣은 극세사 발매트입니다. 미끄럼 방지 네이비 바인딩으로 마감해 욕실 입구나 세면대 앞에 깔아도 안정감 있게 자리를 지킵니다.'},
    {'id': 19, 'category': '발매트', 'name': '스프라이트 발매트 B타입', 'base_price': 32000,
     'description': '아이보리 바탕에 네이비 스트라이프를 더한 극세사 발매트입니다. 짙은 컬러가 화이트·그레이 톤 욕실과 산뜻하게 어우러지고, 두툼한 파일감이 물기를 빠르게 흡수합니다.'},
    {'id': 20, 'category': '수건', 'name': '두께감 세면 수건 A타입', 'base_price': 14000,
     'description': '레드와 블루가 교차하는 헤링본 스트라이프 세면 수건입니다. 두께감 있는 순면 파일이 물기를 넉넉히 흡수하면서도 가볍게 말라 매일 쓰기 좋습니다.'},
    {'id': 21, 'category': '수건', 'name': '두께감 세면 수건 B타입', 'base_price': 14000,
     'description': '틸과 머스터드가 어우러진 헤링본 스트라이프 세면 수건입니다. 색을 맞춰 욕실 소품을 꾸미기 좋고, 도톰한 파일감이 산뜻한 사용감을 줍니다.'},
    {'id': 22, 'category': '수건', 'name': '와플 문양 수건', 'base_price': 16000,
     'description': '베이지 톤 와플 문양으로 짠 순면 수건입니다. 도톰하게 짜인 조직이 통기성이 좋아 잘 마르고, 은은한 컬러로 어떤 욕실에도 무난히 어울립니다.'},
    # 그레이/그린/브라운/네이비 4개로 나뉘어 있던 걸 한 상품(id=23)으로 합치고 색상은
    # COLOR_OPTIONS로 옵션 처리한다 — frontend/src/component/Home/Home.jsx의 PRODUCTS
    # colors[]와 동일한 구성이어야 한다.
    {'id': 23, 'category': '실내화', 'name': '부드러운 털 실내화', 'base_price': 16000,
     'description': '부드러운 극세사로 안팎을 감싼 슬리퍼형 실내화입니다. 두툼한 안창이 발끝을 포근하게 받쳐주고, 컬러별로 각기 다른 무드를 더해줍니다.'},
    {'id': 27, 'category': '욕실화', 'name': '물이 잘 빠지는 욕실화 레드', 'base_price': 10000,
     'description': '배수 슬릿을 낸 쿠션 소재 욕실화입니다. 도톰한 EVA 밑창이 푹신하게 발을 받쳐주고, 미끄럼을 줄여주는 표면 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다. 레드 컬러가 욕실에 산뜻한 포인트를 더합니다.'},
    {'id': 28, 'category': '욕실화', 'name': '물이 잘 빠지는 욕실화 블랙', 'base_price': 10000,
     'description': '배수 슬릿을 낸 쿠션 소재 욕실화입니다. 도톰한 EVA 밑창이 푹신하게 발을 받쳐주고, 미끄럼을 줄여주는 표면 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다. 블랙 컬러로 어떤 욕실에도 무난히 어울립니다.'},
    {'id': 29, 'category': '욕실화', 'name': '물이 잘 빠지는 욕실화 블루', 'base_price': 10000,
     'description': '배수 슬릿을 낸 쿠션 소재 욕실화입니다. 도톰한 EVA 밑창이 푹신하게 발을 받쳐주고, 미끄럼을 줄여주는 표면 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다. 블루 컬러가 시원한 느낌을 더합니다.'},
    {'id': 30, 'category': '욕실화', 'name': '물이 잘 빠지는 욕실화 화이트', 'base_price': 10000,
     'description': '배수 슬릿을 낸 쿠션 소재 욕실화입니다. 도톰한 EVA 밑창이 푹신하게 발을 받쳐주고, 미끄럼을 줄여주는 표면 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다. 화이트 컬러로 깔끔한 분위기를 연출합니다.'},
]

# 색상 등 옵션이 여러 개인 상품만 여기 등록 — 없는 상품은 기존처럼 기본/기본형 옵션 하나만 붙는다.
COLOR_OPTIONS = {
    23: ['그레이', '그린', '브라운', '네이비'],
}

SAME_DAY_SHIPPING_IDS = {1, 2, 4, 7, 9, 18, 19, 21, 23, 27, 31, 32, 34}


class Command(BaseCommand):
    help = '메인 "전체 상품" 페이지(Home.jsx PRODUCTS) 14개로 collection=main 데이터를 완전히 재입력합니다.'

    # id 충돌 등으로 루프 중간에 실패하면(실제로 한 번 겪음) 이미 지운 기존 데이터가
    # 복구되지 못한 채 반쪽만 남는다 — 원자적으로 묶어 실패 시 삭제 전 상태로 롤백되게 한다.
    @transaction.atomic
    def handle(self, *args, **kwargs):
        old_qs = Product.objects.filter(collection='main')
        old_count = old_qs.count()
        if old_count:
            self.stdout.write(self.style.WARNING(f'기존 main 상품 {old_count}개(+옵션) 삭제 중...'))
            old_qs.delete()

        cat_map = {
            name: Category.objects.get_or_create(name=name)[0]
            for name in {d['category'] for d in PRODUCTS}
        }

        created = 0
        for data in PRODUCTS:
            product = Product.objects.create(
                id=data['id'],
                category=cat_map[data['category']],
                name=data['name'],
                brand='집다움',
                base_price=data['base_price'],
                description=data['description'],
                thumbnail_url=f"/products-main/product-{data['id']:02d}.jpg",
                collection='main',
                same_day_shipping=data['id'] in SAME_DAY_SHIPPING_IDS,
            )
            colors = COLOR_OPTIONS.get(data['id'])
            if colors:
                for color in colors:
                    ProductOption.objects.create(
                        product=product, option_name='색상', option_value=color,
                        extra_price=0, stock_count=50,
                    )
            else:
                ProductOption.objects.create(
                    product=product, option_name='기본', option_value='기본형',
                    extra_price=0, stock_count=50,
                )
            self.stdout.write(f'  + [{product.id}] {product}')
            created += 1

        self.stdout.write(self.style.SUCCESS(f'\nmain 상품 {created}개 재입력 완료!'))
