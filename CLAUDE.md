# 집다움(JIPDAUM)

Django 백엔드(`backend/`) + React/Vite 프론트엔드(`frontend/`). 혼자 여러 PC를 오가며 작업 — 새 PC에서 시작할 때 이 파일부터 확인.

## 새 PC에서 처음 시작할 때 (순서대로)

1. **MySQL 컨테이너 실행** — 프로젝트 루트에서 `docker compose up -d` (Docker Desktop 켜져 있어야 함). `jibdaum-mysql` 컨테이너가 3306 포트로 뜬다 (DB `jibdaum`, root/rootpassword).
2. **`backend/.env` 직접 생성** — 이 파일은 git에 안 올라간다(gitignore). PC마다 새로 만들어야 함: `backend/.env.example`을 복사해서 `.env`로 만들고 값 채우기. `DB_*` 값은 docker-compose 기본값(jibdaum/root/rootpassword/127.0.0.1/3306)과 맞출 것.
3. **나머지 설치/실행 절차**는 `backend/README.md`, `frontend/README.md`에 단계별로 있음 (venv, `pip install -r requirements.txt`, `npm install` 등). 여기서 중복 설명 안 함.

주의: `mysqlclient`가 새 의존성으로 추가됨 — 플랫폼에 맞는 사전 빌드 wheel이 없으면(Windows+최신 Python 외의 환경) 컴파일러나 `libmysqlclient` 시스템 라이브러리가 추가로 필요할 수 있음. 안 되면 PyMySQL로 교체 검토.

## 아키텍처 메모 (헷갈리기 쉬운 것들)

- **DB는 Oracle → MySQL(Docker)로 전환됨** (2026-07). Oracle 관련 코드/설정은 완전히 제거됐고 잔존물 없음 — 다시 Oracle 얘기가 나오면 오래된 문서나 기억을 참고한 것이니 의심할 것.
- **상품 데이터가 두 개로 분리돼 있음**: `frontend/src/component/Home/Home.jsx`의 로컬 `PRODUCTS`(export됨, 메인 페이지 전용)와 `frontend/src/data/products.js`(한국관 페이지가 씀). id가 겹쳐도 서로 다른 상품이니 절대 섞어서 참조하면 안 됨.
- **파비콘이 라우트별로 다름**: `App.jsx`의 `FaviconController`가 `/korean-hall`이면 한옥 로고, 그 외 전부 JD 로고로 자동 전환. `index.html`의 favicon 링크는 기본값(JD)일 뿐 실제로는 이 컨트롤러가 매 라우트 변경마다 덮어씀.
- **사이드바 검색**(`Sidebar.jsx`)은 현재 라우트에 맞는 카탈로그만 검색함(한국관이면 한국관 상품만, 그 외엔 메인 상품만).
- **Lenis(스무스 스크롤)가 전역 휠 이벤트를 가로챔** — 모달처럼 내부 스크롤이 따로 필요한 요소는 `data-lenis-prevent` 속성을 반드시 달아야 스크롤이 먹힌다 (MyPage에서 이거 빠져서 스크롤 안 되던 버그 있었음).
