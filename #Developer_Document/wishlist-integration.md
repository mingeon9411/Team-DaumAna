# 위시리스트 연동 결과 (2026-09-06)

## 확인 결과

기존 `frontend/src/utils/wishlist.js`는 공용 localStorage 키 `wishlist`에 상품 정보를 저장했다. 회원별 구분이나 서버 저장은 없었다. 홈 화면의 하트는 별도 React 상태만 변경하여 상세·마이페이지와도 동기화되지 않았다.

## 구현

- Spring 저장소: `C:/jipdaum_Springboot-main`
- `WishlistController`, `WishlistService`: 기존 JWT 인증과 `CurrentUserProvider`로 현재 회원을 식별한다. 클라이언트에서 회원 ID나 가격을 받지 않는다.
- `GET /api/shop/wishlist`: 현재 회원 목록을 최신 등록순으로 조회하며 이름·가격·이미지는 상품 DB에서 읽는다.
- `PUT /api/shop/wishlist/{productId}`: 상품 존재 확인 후 등록한다. 반복 등록은 성공 처리하면서 중복 행을 만들지 않는다.
- `DELETE /api/shop/wishlist/{productId}`: 현재 회원의 해당 상품만 삭제한다. 이미 없는 항목도 성공 처리한다.
- Django `Products.0005_wishlist`: `JIPDAUM_WISHLIST` 테이블, 회원·상품 외래키, 회원+상품 UNIQUE 제약. 기존 원칙대로 Django가 스키마를 관리하며 Spring은 JdbcTemplate으로 접근한다.
- 프론트 `useWishlist`: 홈·상품 상세·장바구니 추천·BestItem·마이페이지 공통 API 연동. 비로그인 시 로그인으로 안내하며 변경 후 목록을 다시 조회한다. 로그인 상태 변경 시 목록을 초기화하고 다시 조회한다. 마이페이지는 로딩 및 조회 오류를 표시한다.
- 기존 localStorage 위시리스트는 회원 소유자를 알 수 없어 자동 이관하지 않으며 더 이상 읽지 않는다.

## 검증 결과

- 로컬 MySQL `127.0.0.1:3306/jibdaum`에 마이그레이션 적용 완료.
- `npm run build` 통과. 기존 번들 크기 경고 존재.
- Spring 기존 테스트 39개 통과.
- `WishlistIntegrationTest` 2개 통과: 실제 JWT 필터 → 컨트롤러 → 서비스 → MySQL 경로로 등록·조회·삭제, 중복 등록, 회원 간 조회/삭제 격리, 비로그인 401, 없는 상품 404 검증. 테스트 데이터는 트랜잭션 롤백으로 정리한다.
- 변경 파일 ESLint 실행: 기존 Home의 상수 export 관련 오류 6개, MyPage의 빈 catch 관련 오류 2개, 상품 상세의 effect 의존성 경고 3개가 남아 있다. 새 공통 훅과 API의 lint는 통과한다.

## 적용 범위

로컬 소스와 로컬 DB에 적용했다. 브라우저 클릭 E2E 및 운영 배포는 수행하지 않았다. 운영 반영 시 Django 마이그레이션을 먼저 적용한 후 Spring과 프론트를 함께 배포해야 한다. 실행 중인 Spring 서버는 새 코드를 사용하도록 재시작해야 한다.
