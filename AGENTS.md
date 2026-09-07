# 집다움(JIPDAUM)

React/Vite 프론트엔드(`frontend/`) + Spring Boot 백엔드(별도 저장소 `jipdaum-spring`, 회원/상품/쿠폰/결제/챗봇 API 전부 담당) + Django(`backend/`, 관리자 화면(admin) 전용, API 없음). 혼자 여러 PC를 오가며 작업 — 새 PC에서 시작할 때 이 파일부터 확인.

**저장소가 3개로 나뉘어 있음**: 프론트+Django는 이 저장소(Team-DaumAna)에 같이 있고, 실제 API 서버인 Spring Boot는 `jipdaum-spring`이라는 완전히 별도의 GitHub 저장소다. 이 저장소만 `git pull`해서는 Spring Boot 쪽 변경사항이 안 딸려온다 — 그쪽도 따로 클론/pull해야 함.

## 새 PC에서 처음 시작할 때 (순서대로)

1. **MySQL·Redis 컨테이너 실행** — 프로젝트 루트에서 `docker compose up -d` (Docker Desktop 켜져 있어야 함). `jibdaum-mysql`(3306, DB `jibdaum`, root/rootpassword)과 `jibdaum-redis`(6379)가 뜬다. Django와 Spring Boot가 MySQL 하나를 공유하고, Redis는 Spring Boot 상품 목록 조회 캐시 전용(없어도 캐시 미스로 우회할 뿐 앱은 정상 동작).
2. **`backend/.env` 직접 생성** — 이 파일은 git에 안 올라간다(gitignore). PC마다 새로 만들어야 함: `backend/.env.example`을 복사해서 `.env`로 만들고 값 채우기. `DB_*` 값은 docker-compose 기본값(jibdaum/root/rootpassword/127.0.0.1/3306)과 맞출 것.
3. **`frontend/.env` 직접 생성** — 이것도 gitignore 대상. `frontend/.env.example`을 복사해서 `.env`로 만들고 PortOne(`VITE_PORTONE_STORE_ID`, `VITE_PORTONE_CHANNEL_KEY`)·hCaptcha(`VITE_HCAPTCHA_SITE_KEY`) 값을 채울 것 — 결제·회원가입/로그인 캡차가 이 값 없이는 로컬에서 아예 안 뜬다. `VITE_SPRING_API_URL`은 비워두면 로컬 Spring Boot(`http://localhost:8081`)를 기본으로 씀.
4. **`jipdaum-spring` 저장소를 별도로 클론/pull**하고, `src/main/resources/application.yml.example`을 복사해 같은 위치에 `application.yml`로 만들어 값 채우기 (이것도 gitignore, git에 없음). 특히:
   - `jwt.secret`은 Spring Boot 혼자 JWT를 서명·검증하는 데만 쓰는 값 — Django엔 이제 JWT를 다루는 코드가 전혀 없어서(SIMPLE_JWT 등 제거됨, API 자체가 없음) `backend/.env`의 `SECRET_KEY`와 맞출 필요가 **없다**. (예전에 Django SIMPLE_JWT와 토큰을 공유하던 시절의 요구사항이 남아있던 것 — `application.yml.example`의 주석은 아직 안 고쳐져 있으니 참고만 할 것.)
   - `portone.api-secret`은 프론트의 `VITE_PORTONE_STORE_ID`/`VITE_PORTONE_CHANNEL_KEY`와는 **다른 값**(PortOne 콘솔의 API Secret Key) — 결제 검증(verifyPayment)에 씀.
   - `hcaptcha.secret-key`가 비어 있으면 캡차 검증을 항상 통과시키므로(로컬 개발 편의), 로컬에서 급하면 비워둬도 부팅은 됨.
5. **나머지 설치/실행 절차**는 `backend/README.md`, `frontend/README.md`, `jipdaum-spring/README.md`에 단계별로 있음 (venv, `pip install -r requirements.txt`, `npm install`, `./mvnw spring-boot:run` 등). 여기서 중복 설명 안 함.

**GitHub Secrets(Actions)는 이거랑 별개** — 배포 파이프라인(EC2)이 쓰는 값이라 클라우드에 이미 저장돼 있고, 어느 PC에서 작업하든 다시 설정할 필요 없음. 위 1~4번은 어디까지나 "로컬에서 직접 실행/테스트"할 때만 필요.

주의: `mysqlclient`가 새 의존성으로 추가됨 — 플랫폼에 맞는 사전 빌드 wheel이 없으면(Windows+최신 Python 외의 환경) 컴파일러나 `libmysqlclient` 시스템 라이브러리가 추가로 필요할 수 있음. 안 되면 PyMySQL로 교체 검토.

## 아키텍처 메모 (헷갈리기 쉬운 것들)

- **DB는 Oracle → MySQL(Docker)로 전환됨** (2026-07). Oracle 관련 코드/설정은 완전히 제거됐고 잔존물 없음 — 다시 Oracle 얘기가 나오면 오래된 문서나 기억을 참고한 것이니 의심할 것.
- **API는 Django → Spring Boot로 이관 완료됨** (`backend/config/urls.py` 참고). Django는 `/admin/`만 남아있고 회원/상품/쿠폰/결제/챗봇은 전부 별도 저장소 `jipdaum-spring`(포트 8081)이 처리. "장고 서버 실행해줘" 같은 요청에 Django만 띄우면 로그인/결제/챗봇 등 실제 기능은 다 실패한다 — Spring Boot도 같이 띄워야 함.
- **한국관은 완전히 폐지됨**(2026-09, 룩북으로 대체). `frontend/src/data/products.js`(한국관 전용 카탈로그)는 삭제됐고, 상품은 이제 `frontend/src/component/Home/Home.jsx`의 `PRODUCTS` 하나뿐 — 상품 상세페이지도 `/item/:id`(`HomeProductDetail.jsx`) 하나로 통일됨. "한국관"이 코드나 옛 문서에 나오면 지워진 기능이니 의심할 것.
- **챗봇(`ChatBot.jsx`)에 여전히 `catalog` prop(기본값 `PRODUCTS`)이 남아있음** — 한국관이 있던 시절 카탈로그를 갈아끼우던 용도였는데, 지금은 카탈로그가 하나뿐이라 사실상 죽은 유연성. 새로 만질 일 있으면 굳이 prop을 안 없애도 되지만, "두 카탈로그 대응"이라고 오해하지 말 것.
- **파비콘은 라우트 무관하게 항상 JD 로고 고정**(`index.html`). 예전엔 `/korean-hall`에서 한옥 로고로 바꿔주는 `FaviconController`가 있었으나, 축소 렌더링 시 로고가 뭉개져 보여 2026-08-28 제거함.
- **검색은 `Sidebar.jsx`가 아니라 `Header/SearchOverlay.jsx` + `SearchResults.jsx`가 담당**(Sidebar.jsx는 이제 검색과 무관한 상/하/이전/다음 이동용 십자 패드 위젯). 검색은 로컬 배열 필터링이 아니라 백엔드 `searchProducts` API(Spring Boot) 호출이고, 카탈로그가 하나뿐이라 라우트별 스코프 분기도 더 이상 없음.
- **Spring Boot 상품 목록 조회에 Redis 캐시(TTL 30초)가 붙어있음** — Django admin에서 상품을 고쳐도 최대 30초간은 캐시된 옛 값이 보일 수 있다(무효화 연동 없음, 최종 일관성 타협). "방금 admin에서 고쳤는데 화면에 안 바뀐다"는 버그 리포트가 오면 이것부터 의심할 것. Redis가 죽어 있어도 캐시 미스로 우회할 뿐 조회 자체는 실패하지 않는다.
- **Lenis(스무스 스크롤)가 전역 휠 이벤트를 가로챔** — 모달처럼 내부 스크롤이 따로 필요한 요소는 `data-lenis-prevent` 속성을 반드시 달아야 스크롤이 먹힌다 (MyPage에서 이거 빠져서 스크롤 안 되던 버그 있었음). 화면에 고정으로 뜨는 외부 팝업(hCaptcha 챌린지, PortOne 결제창)이 떠 있는 동안은 `window.lenis?.stop()`/`start()`로 배경 스크롤 자체를 막아야 한다 — 안 그러면 팝업은 제자리에 있고 배경만 스크롤돼 서로 따로 노는 것처럼 보인다.

## 배포

- **Team-DaumAna**(이 저장소): 프론트(`frontend/`)는 2026-08부터 EC2가 아니라 **Cloudflare Pages**로 배포 — Cloudflare 대시보드가 이 저장소를 직접 Git 연동해서 push마다 자체 빌드/배포함(Root: `frontend`, Build: `npm run build`, Output: `dist`). 환경변수(`VITE_PORTONE_STORE_ID` 등)는 GitHub Secrets가 아니라 **Cloudflare Pages 프로젝트 설정에 따로** 등록해야 함. `.github/workflows/deploy.yml`은 이제 Django(Docker Hub → EC2 컨테이너)만 배포 — 프론트 빌드/배포 job은 삭제됨. React Router(`BrowserRouter`)를 쓰므로 `frontend/public/_redirects`(`/* /index.html 200`)가 SPA 폴백에 필수 — 지우면 새로고침 시 라우트가 다 404 남.
- **jipdaum-spring**: `main` 푸시 시 그쪽 저장소의 `.github/workflows/docker-publish.yml`이 Docker Hub → EC2 컨테이너로 배포. Spring Boot의 `application.yml`은 저장소에 없고 **EC2 서버의 `/opt/jipdaum/config/application.yml`을 컨테이너에 마운트**해서 씀 — 그 값을 바꾸려면 EC2에 직접 SSH로 들어가 파일을 고쳐야 하고, GitHub Secrets로는 안 됨.
- 둘 다 솔로 개발이라 브랜치/PR 없이 `main`에 직접 커밋 후 푸시하는 게 곧 배포 트리거. `gh workflow run deploy.yml`(또는 `docker-publish.yml`)로 코드 변경 없이 수동 재배포도 가능(예: GitHub Secret 값만 바꿨을 때).

## 작업 원칙 (Andrej Karpathy 가이드라인 기반)

출처: [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills). 속도보다 신중함 쪽으로 치우친 원칙이니 사소한 작업엔 유연하게 판단할 것.

1. **코딩 전에 먼저 생각하기** — 가정을 숨기지 말고 드러낼 것. 확신 없으면 넘겨짚지 말고 물어볼 것. 해석이 여러 갈래면 조용히 하나 골라서 진행하지 말고 선택지를 제시할 것. 더 단순한 방법이 있으면 짚고 넘어갈 것.
2. **단순함 우선** — 요청한 것 이상의 기능/추상화/설정 옵션/예외 처리를 만들지 말 것. 200줄로 짰는데 50줄로 될 것 같으면 다시 짤 것.
3. **외과수술식 변경** — 요청과 무관한 인접 코드·주석·포맷은 건드리지 말 것. 망가지지 않은 걸 리팩터링하지 말 것. 기존 스타일을 따를 것(내 취향과 달라도). 이번 변경으로 안 쓰게 된 import/변수/함수만 정리하고, 원래 있던 죽은 코드는 지우지 말고 언급만 할 것. 바뀐 줄 하나하나가 사용자 요청과 직접 연결돼야 함.
4. **목표 지향적 실행** — 작업을 검증 가능한 기준으로 바꿀 것("버그 수정" → "재현하는 테스트 작성 후 통과시키기"). 여러 단계 작업이면 `단계 → 검증 방법` 형태로 짧게 계획을 먼저 제시할 것.
