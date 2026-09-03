# 집다움(JIPDAUM) 개발 히스토리

이 프로젝트는 저장소 2개로 나뉘어 있습니다: 프론트엔드+Django(Team-DaumAna, 이 저장소)와
실제 API 서버인 jipdaum-spring(별도 GitHub 저장소). 아래는 두 저장소의 커밋을 시간순으로
합쳐 날짜별로 정리한 기록입니다 — 커밋 메시지를 그대로 옮겼고 별도로 다시 서술하지 않았습니다.

- 기간: 2026-06-26 ~ 2026-09-03
- 총 커밋: 278개 (Team-DaumAna 191 · jipdaum-spring 87)
- 이 문서는 두 저장소의 `git log`로 생성됐습니다. 최신 상태로 다시 만들려면
  각 저장소에서 `git log --reverse --date=short --format="%ad|%h|%s"`로 뽑아 날짜별로 합치면 됩니다.

---

## 2026-06-26

- **[jipdaum-spring]** Initial commit (`d218706`)
- **[jipdaum-spring]** Initial commit (`36fd9e5`)
- **[jipdaum-spring]** Merge branch 'main' of https://github.com/mingeon9411/jipdaum_Springboot (`3332c29`)

## 2026-07-01

- **[jipdaum-spring]** feat: 결제 시스템 Spring Boot 통합 및 주문/쿠폰/상품 API 구현 (`df3e1cf`)

## 2026-07-03

- **[jipdaum-spring]** fix: 결제/인증 보안 취약점 수정 및 서비스 계층 정리 (`e7a5b74`)

## 2026-07-13

- **[Team-DaumAna]** docs: 집다움(DaumAna) 프로젝트 README (`6bc9fd2`)
- **[jipdaum-spring]** fix: pom.xml 파싱 오류 수정 및 미사용 import 정리 (`8fdcfb7`)
- **[Team-DaumAna]** feat: 집다움 프론트엔드/백엔드 초기 구현체 커밋 (`44640db`)
- **[Team-DaumAna]** fix: README 로고 이미지 경로 수정 (`d1e3f6f`)

## 2026-07-14

- **[jipdaum-spring]** chore: Claude Code 설정 디렉토리를 gitignore에 추가 (`cc654ce`)
- **[jipdaum-spring]** fix: Django-Spring 기능 감사 결과 반영 및 챗봇/카테고리 API 포팅 (`541fe09`)
- **[Team-DaumAna]** feat: 로그인 모달 전환 및 가로 스크롤 페이징 UI로 전면 개편 (`a0c964b`)

## 2026-07-15

- **[Team-DaumAna]** feat: 홈 히어로/에세이 섹션 리디자인 및 장바구니·마이페이지 모달 전환 (`55baf31`)
- **[Team-DaumAna]** feat: 씬 에셋(색상 SVG, 티룸 이미지) 추가 (`e5fc62f`)

## 2026-07-16

- **[Team-DaumAna]** feat: 메인 인트로 다크모드 연출 강화, 상품 검색 모달화, 상품 패널 바로가기 추가 (`7d6f31a`)
- **[Team-DaumAna]** feat: 헤더/도어인트로/푸터 J.D 로고 적용, 홈 에세이 홀로그램 연출 추가 (`4e0e29e`)
- **[Team-DaumAna]** feat: 한국관 페이지 신설, 홈 에세이/히어로 재구성, 헤더 일월오봉도 배너 추가 (`d122788`)

## 2026-07-17

- **[Team-DaumAna]** feat: 한국관 헤더 배치 왼쪽 상단 이동, 하단 기능바 메탈릭 실버 연출, 홈 에세이 별빛 연출 정리 (`e92d22c`)

## 2026-07-19

- **[Team-DaumAna]** feat: 로그인/회원가입/아이디비번찾기 모달 전면 리디자인, 미니바 전 모달 메탈릭 실버 통일 (`8ee2bf0`)

## 2026-07-20

- **[Team-DaumAna]** feat: 한국관 상품 모달화, 다크모드 네이비 통일, 홈/한국관 UI 다듬기 (`e788cef`)
- **[jipdaum-spring]** feat: 장고 Users 앱의 로컬 계정 인증(회원가입/로그인/로그아웃/닉네임확인/이메일OTP) 포팅 (`a946b2c`)
- **[jipdaum-spring]** fix: 로컬 인증 API를 실제 프론트엔드 계약(/api/users/*, 필드별 에러)에 맞춘다 (`da5faa5`)

## 2026-07-21

- **[jipdaum-spring]** fix: MySQL(jibdaum)로 DB 드라이버 전환, Oracle 전용 SYSDATE 제거 (`4c424a7`)
- **[Team-DaumAna]** feat: MySQL(Docker) 전환, 마이페이지 다크모드 개편, 사이드바 검색/로그인 UX 정리, 페이지별 파비콘 적용 (`e368bc8`)
- **[jipdaum-spring]** docs: 다른 PC 인수인계용 CLAUDE.md와 application.yml.example 추가 (`534b5af`)
- **[Team-DaumAna]** docs: CLAUDE.md 추가 — 새 PC 셋업 순서 및 아키텍처 메모 (`d627c2e`)
- **[jipdaum-spring]** fix: Hibernate 물리 네이밍 전략을 표준 전략으로 고정 (`80f6f61`)
- **[Team-DaumAna]** feat: 회원탈퇴 모달화, 하단 기능바 검색 개선, 상품 브랜드 검색 지원, MySQL 상품 시드 추가 (`8180ba1`)

## 2026-07-22

- **[jipdaum-spring]** feat: 소셜 로그인 안정화 및 회원 탈퇴 기능 구현 (`f81eacb`)
- **[Team-DaumAna]** feat: 회원탈퇴 완료 안내, 챗봇 홈 노출/JD 로고 적용, 모달 메탈릭 실버·폰트 통일 (`4a4e0af`)

## 2026-07-23

- **[jipdaum-spring]** Auto-provision Spring-owned tables + add order tracking (`a230de6`)
- **[Team-DaumAna]** Cart backend integration, glassmorphism cart modal, and shop UI updates (`1ab7b0a`)

## 2026-07-24

- **[jipdaum-spring]** chore: mvnw 실행 권한 복구 및 파일 끝 개행 정리 (`747daf8`)
- **[jipdaum-spring]** fix: 주문 생성 시 carrier/tracking_number NULL 제약 위반 수정 (`bc34823`)

## 2026-07-25

- **[Team-DaumAna]** feat: 홈 인트로 영상, 배송지 관리, 한국관/카트/영수증 리디자인, 상품 카테고리 필터 추가 (`8fb9b55`)

## 2026-07-26

- **[Team-DaumAna]** feat: 홈 3단 브랜드 영상 에세이 페이지, 한국관 무드 영상 밴드 추가 (`722edae`)
- **[Team-DaumAna]** feat: 한국관 배너 페이지, 사이드바/챗봇 띠 테두리, 인트로 영상 자동 진행 체인 추가 (`9477c7c`)

## 2026-07-27

- **[Team-DaumAna]** docs: 아키텍처 다이어그램 갱신 — DB를 MySQL 하나로 통합 (`17b070e`)
- **[jipdaum-spring]** docs: Spring Boot 2차 작업 결과 보고 PPT 추가 (`658b4bf`)

## 2026-07-28

- **[jipdaum-spring]** feat: 이메일 인증 발송을 로고 포함 HTML 메일로 변경 (`1742eed`)
- **[Team-DaumAna]** fix: 홈 상품 시드 스크립트 id 정합성 수정, 프론트 .env 예시 추가 (`dfe00e8`)
- **[Team-DaumAna]** fix: 로그인/회원가입 다크모드 비밀번호 필드 대비 수정, 인증 모달 바깥클릭 닫힘 방지, 홈 첫 페이지 상품 안내 문구 추가 (`85b1fb9`)

## 2026-07-29

- **[Team-DaumAna]** docs: Django 백엔드 표를 이미지 대신 마크다운 표로 교체, 오래된 내용 정정 (`979489f`)
- **[Team-DaumAna]** fix: 결제 수단에서 네이버페이 우선 제거 (`136818d`)
- **[Team-DaumAna]** feat: 메인 상품 퀵뷰 모달에 리뷰 기능 추가, 로그인/회원가입 비밀번호 필드 폰트 버그 수정 (`af7efbd`)
- **[jipdaum-spring]** feat: 인증 메일 로고를 J.D/한옥 2개로 분리 (`18cf0cf`)

## 2026-07-30

- **[Team-DaumAna]** style: 상품 상세 리뷰 섹션 카드형으로 재디자인 (`124b598`)
- **[jipdaum-spring]** fix: OWASP 점검 후 인증/권한 취약점 보완 (`0bfe543`)
- **[Team-DaumAna]** fix: 상품 모달·그리드·챗봇 휠 스크롤이 좌우 패널로 새던 문제 수정, 한국관 장바구니 이미지 깨짐 수정 (`13ac018`)
- **[Team-DaumAna]** docs: README 로고 섹션에 J.D 심볼 로고 추가 (`3bcdb2d`)

## 2026-07-31

- **[Team-DaumAna]** fix: 한국관 바로구매 로그인 체크 추가, 회원가입 중복확인 버튼 정렬 및 약관창 스크롤 수정 (`3eda810`)
- **[jipdaum-spring]** fix: 네이버 소셜 로그인 계정 불일치 및 재로그인 시 세션 재사용 문제 수정 (`bd614c0`)
- **[Team-DaumAna]** fix: 탈퇴한 계정으로 소셜 로그인 시 명확한 안내 표시 (`d14e452`)
- **[jipdaum-spring]** fix: 탈퇴한 소셜 로그인 계정이 재로그인 시 자동으로 복구되도록 수정 (`9cc5557`)

## 2026-08-03

- **[jipdaum-spring]** Add Dockerfile and CI workflow to build/push image to Docker Hub (`0f9ca4d`)

## 2026-08-04

- **[Team-DaumAna]** feat: 메인 상품 상세를 별도 페이지로 분리, 로그인·피드·사이드바 스타일 개선 (`f376907`)
- **[Team-DaumAna]** feat: 상품 상세페이지 글래스 카드화, 한국관 에세이 배경을 한지 톤으로 개선 (`a7fab08`)
- **[jipdaum-spring]** feat: 카테고리/쿠폰/상품옵션 관리자 CRUD API 추가 (`a14c44f`)
- **[Team-DaumAna]** fix: 상품 상세 페이지 푸터 스크롤 방지, 리뷰 카드 디자인 개선 (`aa19a20`)
- **[jipdaum-spring]** chore: 로그 파일 gitignore 추가 및 사소한 포맷 정리 (`6b584b8`)

## 2026-08-05

- **[jipdaum-spring]** refactor: 컨트롤러 계층 위반 정리 (Controller > Service > Repository) (`5710c6e`)
- **[Team-DaumAna]** feat: 한국관 상품 상세페이지를 홈 디자인 시스템으로 통일, 회사정보 모달 신설 (`0e22267`)

## 2026-08-07

- **[jipdaum-spring]** Add image upload support for product reviews (`c68dba0`)
- **[Team-DaumAna]** feat: 리뷰에 사진 첨부, 제목 필드 추가 (`2e8c4db`)
- **[jipdaum-spring]** Return JSON 401 instead of redirect for unauthenticated /api/** requests (`2b2d579`)
- **[Team-DaumAna]** feat: 최근 본 상품 플로팅 독 추가, 한국관 헤더/카테고리 메뉴 개선 (`e1e524c`)

## 2026-08-11

- **[Team-DaumAna]** chore: Spring API 주소를 환경변수로 설정 가능하게 변경 (`fdf37e9`)

## 2026-08-15

- **[Team-DaumAna]** fix: 비로그인 상태에서 상품 상세 페이지 빈 화면 나던 버그 수정 (`b0acbeb`)

## 2026-08-16

- **[Team-DaumAna]** style: 챗봇 세련되게 리디자인, 한국관 배너 영상 코덱 이슈 예방 수정 (`4ec11a1`)
- **[jipdaum-spring]** feat: Gemini 기반 LLM 챗봇 도입 (stateless 멀티턴 + 상품 조회 tool-calling) (`8eb7d07`)

## 2026-08-18

- **[Team-DaumAna]** feat: 로그인/최근 본 상품 독에 사이드바 레일 스타일 공유 (`c74dd29`)
- **[jipdaum-spring]** ci: main push 시 EC2 자동 배포 스텝 추가 (`b30ca2e`)

## 2026-08-19

- **[jipdaum-spring]** Merge remote-tracking branch 'origin/feature/gemini-chatbot' into ci/auto-deploy-ec2 (`efad9c9`)
- **[jipdaum-spring]** feat: 챗봇 엔드포인트에 Bucket4j rate limit 적용 (`5d903c6`)
- **[jipdaum-spring]** feat: 챗봇 system prompt를 인테리어 컨설턴트 페르소나로 개편 (`db854e6`)
- **[jipdaum-spring]** feat: 챗봇 대화 시작 시 hCaptcha 검증 추가 (`e4fb302`)
- **[jipdaum-spring]** refactor: hCaptcha/Gemini 호출을 WebClient+block()에서 RestClient로 전환 (`1c756f5`)
- **[jipdaum-spring]** fix: 네이버 소셜 로그인 client-authentication-method 누락 수정 (`dc8849a`)
- **[jipdaum-spring]** feat: 소셜 로그인(카카오/네이버/구글)에도 hCaptcha 게이트 적용 (`788c9f8`)
- **[jipdaum-spring]** feat: 챗봇 상품 검색에 RAG(임베딩 의미 검색) 도입 (`2da4d1b`)
- **[jipdaum-spring]** feat: 룩북 갤러리용 포토리뷰 조회 API 추가 (`ebfa023`)
- **[Team-DaumAna]** chore: Django를 관리자(admin) 전용으로 축소, API는 전부 Spring Boot로 이관 완료 (`2bb27d8`)
- **[Team-DaumAna]** feat: hCaptcha 로그인 게이트, 인기 검색어 미니바, 룩북 포토리뷰 갤러리 추가 (`5edc50d`)

## 2026-08-20

- **[Team-DaumAna]** ci: EC2 배포 워크플로 추가 (Django 컨테이너화 + 프론트 정적 배포) (`bb9e24c`)
- **[Team-DaumAna]** fix: ScrollToTop 파일명 대소문자를 import 경로와 맞춤 (`694f3bd`)
- **[Team-DaumAna]** fix: 챗봇에 hCaptcha 연결 (새 대화 시작 시 캡차 토큰 전송) (`ca25b5a`)
- **[jipdaum-spring]** fix: 챗봇 hCaptcha 게이트 제거 (`2401da3`)
- **[Team-DaumAna]** fix: 챗봇 hCaptcha 위젯 제거 (백엔드 게이트 제거에 맞춤) (`9de1a12`)
- **[Team-DaumAna]** feat: 챗봇 박스 확대 및 질문 맞춤 상품 추천 패널 추가 (`909c109`)
- **[Team-DaumAna]** style: 챗봇 테두리 파스텔 띠로, 내부 스크롤 잠금 해제, 패널 등장 애니메이션 개선 (`8320964`)
- **[jipdaum-spring]** fix: Gemini API 호출에 Accept: application/json 헤더 명시 (`20d9e49`)
- **[jipdaum-spring]** fix: 임베딩 API 호출에도 Accept: application/json 헤더 추가 (`25d53ac`)
- **[jipdaum-spring]** fix: Gemini 응답을 Content-Type 무관하게 문자열로 받아 직접 JSON 파싱 (`a17172c`)
- **[Team-DaumAna]** feat: 한국관 페이지에 챗봇 상품 추천 기능 활성화 (`7c8a5ad`)
- **[jipdaum-spring]** feat: 챗봇 상품 검색에 진열(collection) 스코프 추가 — 한국관 지원 (`df3c8bf`)
- **[Team-DaumAna]** feat: 한국관 챗봇이 한국관 상품을 검색/추천하도록 연결 (`821b5b7`)
- **[jipdaum-spring]** perf: 챗봇 응답 지연 개선 — 불필요한 도구 호출 라운드 축소 (`1fe06e5`)
- **[Team-DaumAna]** style: 한국관 폰트를 사이트 기본 TwayFly로 통일 (`8d091c6`)
- **[Team-DaumAna]** feat: 한국관에도 메인 페이지와 동일한 최근 본 상품 독바 구현 (`6198670`)
- **[jipdaum-spring]** docs: 챗봇 안정화/기능개선 작업 기록 추가 (2026-08-20) (`da3aa2d`)
- **[jipdaum-spring]** docs: README를 Spring Boot 담당 기능 중심으로 재작성 (`bb46363`)
- **[jipdaum-spring]** Merge branch 'docs/chatbot-2026-08-20' into main (`7eef09b`)
- **[jipdaum-spring]** docs: 챗봇 작업 기록을 #Developer_Document/springboot_developer/로 이동 (`6e85d83`)
- **[Team-DaumAna]** docs: 한옥 로고 축소본 적용 및 한국관 독바 테마 작업 요약 문서 추가 (`ae7fdbb`)
- **[Team-DaumAna]** perf: 한옥 로고를 표시 크기에 맞는 축소본으로 교체 (`1eec3a5`)
- **[Team-DaumAna]** feat: 한국관 최근 본 상품 독바에 한지톤+오방색 전용 테마 적용 (`4f453dd`)

## 2026-08-21

- **[Team-DaumAna]** fix: 로그아웃 시 authchange 이벤트 누락 수정 (`967a926`)
- **[Team-DaumAna]** feat: 챗봇 안에서 결제·회원가입까지 끝내는 사이드 패널 추가 (`dc8c424`)
- **[Team-DaumAna]** feat: 이미 가입된 계정으로 가입 시도하면 안내 후 로그인 처리 (`8a61baf`)
- **[jipdaum-spring]** feat: 소셜 로그인에 신규/기존 회원 여부 신호 추가 (`c463618`)
- **[Team-DaumAna]** style: 장바구니 UI를 더 세련되게 리디자인 (`b4f1b00`)
- **[Team-DaumAna]** fix: 회원탈퇴 패널(WithdrawPanel) CSS 누락 추가 (`b980499`)
- **[Team-DaumAna]** feat: 한국관 상품에 label/originalPrice 추가 (챗봇 추천 매칭용) (`7ffd66d`)
- **[Team-DaumAna]** docs: 새 PC 체크리스트에 frontend/.env, jipdaum-spring 설정 추가 (`461aa51`)
- **[Team-DaumAna]** style: DoorIntro에 실제 문 열림 연출 + 에디토리얼 타이포 디테일 추가 (`6c7d597`)
- **[Team-DaumAna]** feat: DoorIntro 양쪽 문에 서로 다른 인테리어 사진 적용 (`e6ac05f`)
- **[Team-DaumAna]** style: DoorIntro 브랜드명을 집다움 한글로고로, 문 색조를 밝게 전환 (`68e59b0`)
- **[Team-DaumAna]** fix: DoorIntro 하단 브랜드명을 순수 한글 텍스트로 교체 (`8ea54ea`)
- **[Team-DaumAna]** fix: DoorIntro 워드마크를 Jipdaum-logo-transparent.png로 교체 (`f519593`)
- **[Team-DaumAna]** style: DoorIntro 워드마크 크기 90px → 60px로 축소 (`8c39fe4`)
- **[Team-DaumAna]** style: DoorIntro 워드마크 60px → 34px로 더 작게 (`13fafd1`)
- **[Team-DaumAna]** style: DoorIntro 워드마크 34px → 20px로 완전히 작게 (`bffea10`)

## 2026-08-22

- **[Team-DaumAna]** fix: 상품 상세페이지에서 뒤로가기 시 대문 애니메이션 없이 목록으로 즉시 이동 (`0e6315f`)
- **[Team-DaumAna]** feat: 전자상거래법상 사업자 정보 초기화면 표시 요건 대응 페이지 추가 (`0ab98ae`)
- **[jipdaum-spring]** fix: Gemini API 호출 시 API 키를 쿼리스트링 대신 헤더로 전송 (`3dd3849`)
- **[Team-DaumAna]** feat: 모바일 반응형 대응, 한국관 챗봇 컬러 로고, 오방색 테두리 (`41664b2`)
- **[Team-DaumAna]** fix: 모바일 챗봇 패널이 화면을 거의 다 차지하던 문제 수정 (`0a714b2`)
- **[jipdaum-spring]** feat: 챗봇 검색 결과 상품을 응답에 실어 화면에 자동 표시 (`8e32f58`)
- **[Team-DaumAna]** feat: 챗봇이 찾은 상품을 응답 products로 받아 옆 패널에 자동 표시 (`4ddaeab`)

## 2026-08-23

- **[jipdaum-spring]** docs: 세션 작업 요약 추가 (pull 동기화 ~ 챗봇 상품 패널) (`38c2412`)
- **[Team-DaumAna]** feat: 공지사항 게시글 상세보기, hCaptcha를 PASS 인증 목업으로 교체, Cloudflare Pages 마이그레이션 (`1b14acc`)
- **[jipdaum-spring]** fix: PASS 데모 전환에 맞춰 백엔드 hCaptcha 실검증 제거 (`07e42a1`)
- **[Team-DaumAna]** revert: PASS 인증 목업을 다시 hCaptcha로 되돌림 (`94eaad4`)
- **[jipdaum-spring]** Revert "fix: PASS 데모 전환에 맞춰 백엔드 hCaptcha 실검증 제거" (`09c58a8`)
- **[Team-DaumAna]** fix: Cloudflare Pages 빌드용 Node 버전 고정 (vite 7이 Node 18 미지원) (`79f1975`)
- **[Team-DaumAna]** style: 대문 애니메이션에서 "집다움" 한글 워드마크 텍스트 제거 (`4e0ff02`)
- **[jipdaum-spring]** docs: PASS 목업 되돌리기 및 Cloudflare Pages 빌드 이슈 요약 (`890b85c`)
- **[Team-DaumAna]** docs: PASS 목업 되돌리기 및 Cloudflare Pages 빌드 이슈 정리 (`286832e`)
- **[jipdaum-spring]** docs: 6월~8월 전체 개발 내용 핵심 요약 추가 (`06089fa`)
- **[Team-DaumAna]** docs: 7월~8월 전체 프로젝트 개발 내용 핵심 요약 추가 (`1b7576b`)
- **[jipdaum-spring]** docs: 작업 시작일 기준 날짜별 작업일지 추가 (`70bf2ba`)
- **[Team-DaumAna]** docs: 작업 시작일 기준 날짜별 작업일지 추가 (`9ac2aea`)
- **[Team-DaumAna]** docs: 작업 요약 문서 추가 및 README 최신화 (DB/배포 섹션 정정) (`43a5687`)
- **[jipdaum-spring]** docs: 날짜별 작업일지를 날짜당 별도 파일로 분리 (`3dd2f2a`)
- **[Team-DaumAna]** docs: 날짜별 작업일지를 날짜당 별도 파일로 분리 (`41a144e`)
- **[jipdaum-spring]** docs: 날짜별 작업일지 내용 보강 (`333eec7`)
- **[Team-DaumAna]** docs: 날짜별 작업일지 내용 보강 (`4a7bbb4`)
- **[jipdaum-spring]** fix: hCaptcha 검증 실패 원인이 로그에 안 남던 문제 수정 (`b03e9d0`)

## 2026-08-24

- **[Team-DaumAna]** feat: 메인 페이지 상품 14종 교체 (러그/무드등/소파/소품/의자/침대) (`f8e813d`)
- **[Team-DaumAna]** fix: 상품 사진 잘림 없이 전체가 보이도록 object-fit 조정 (`8a47603`)
- **[Team-DaumAna]** fix: 상세페이지 히어로 배너/디테일 블록 사진도 잘리지 않게 조정 (`b63e26f`)
- **[Team-DaumAna]** fix: 상품 이미지 용량 과다로 인한 배포 화면 미표시 문제 해결 (`2b6d959`)
- **[Team-DaumAna]** fix: 최근 본 상품 사이드바 이미지 깨짐 근본 원인 수정 (`f7384f8`)
- **[Team-DaumAna]** fix: object-contain 좌우 여백을 블러 배경으로 채워 꽉 차 보이게 조정 (`b7f0551`)
- **[Team-DaumAna]** feat: 상품 그리드 4열 → 3열로 조정 (`2693b6c`)
- **[Team-DaumAna]** feat: doorintro 문 열리는 영역에 상품 이미지 배너 사진 적용 (`c92a765`)
- **[Team-DaumAna]** feat: 상품 목록 카드에 인테리어 컷 호버 전환 애니메이션 + 인기 검색어 최신화 (`95473e3`)
- **[Team-DaumAna]** feat: 나머지 상품 7종에도 인테리어 컷 호버 전환 적용 (`619791e`)
- **[Team-DaumAna]** chore: 북유럽 침대 정가 1,050,000 -> 1,250,000 조정 (`c4e2f33`)
- **[Team-DaumAna]** fix: 상품 카드 영역을 사진 실제 비율에 맞춤(고정 비율 박스 폐기) (`df651f6`)
- **[jipdaum-spring]** docs: 소셜로그인 CORS 수정/메인상품 마이그레이션 작업 기록 + OWASP Dependency-Check CI 추가 (`be6f293`)
- **[jipdaum-spring]** docs: 날짜별 작업일지에 2026-08-24 기록 추가 (`ea76e1b`)
- **[Team-DaumAna]** docs: 2026-08-24 작업일지 추가 (상품 14종 교체, 이미지 파이프라인 정비) (`c2c5c37`)

## 2026-08-25

- **[Team-DaumAna]** feat: 메인 상품 상세페이지에 바로구매 버튼 추가 (`dc15b03`)
- **[Team-DaumAna]** perf: 로그인 모달 hCaptcha 연결 예열, 홈페이지 크래시 버그 수정 (`7823b61`)
- **[Team-DaumAna]** refactor: Hero 캐러셀을 리듀서 기반 양방향 무한루프 구조로 교체 (`f7863b8`)
- **[Team-DaumAna]** docs: 2026-08-25 작업일지 추가 (바로구매 버튼, 크래시 버그 수정, Hero 캐러셀 리팩터) (`f9c3802`)
- **[Team-DaumAna]** docs: 전체 프로젝트 요약에 7단계(상품 전면 교체 및 안정성 정비, 8/24~8/25) 추가 (`938109b`)
- **[Team-DaumAna]** fix: 사이드바 장바구니 카운트 race condition, 로그아웃 에러 무시, 토글 아이콘 버그 수정 (`7acef82`)
- **[Team-DaumAna]** fix: 사이드바 독 펼침 stagger 애니메이션의 이중 스케일·순서 역전·dead code 수정 (`81c9d39`)
- **[Team-DaumAna]** fix: 플로팅 독 펼침 애니메이션에서 아이콘이 찌그러지던 근본 원인 수정 (`f886752`)
- **[Team-DaumAna]** fix: 독 펼침 애니메이션의 opacity/transform 불일치, 컨테이너-아이콘 타이밍 어긋남 조정 (`ec12e8c`)
- **[Team-DaumAna]** fix: 독 토글 버튼 자체의 회전 스프링 바운스 제거 (`ef7e299`)
- **[Team-DaumAna]** fix: 독 펼침·버튼 클릭 피드백을 Material 표준 easing으로 전면 재조정 (`9a48cb9`)
- **[Team-DaumAna]** style: 독 펼침에 Material 3 emphasized-decelerate 곡선 적용, 열기/닫기 타이밍 분리 (`58f4b3f`)
- **[Team-DaumAna]** style: 독 접힘 애니메이션 duration을 늘려 "부드럽게 줄어드는" 게 보이도록 조정 (`7c6b74e`)
- **[Team-DaumAna]** style: 독 펼침/접힘 애니메이션을 눈에 띄게 느리게 조정 (`9e01a54`)
- **[Team-DaumAna]** style: 최근 본 상품 독(recentDock)에 사이드바 하단 독바와 동일한 펼침/접힘 애니메이션 적용 (`098f4fc`)
- **[Team-DaumAna]** style: 하단바 독/우측 사이드바 펼침·접힘을 아주 느리게 재조정 (`2e6d967`)
- **[Team-DaumAna]** docs: 2026-08-25 작업일지 보강 (사이드바 코드 리뷰, 하단바 독 애니메이션 4라운드 수정, 우측 사이드바 동기화) (`19c7dad`)

## 2026-08-26

- **[Team-DaumAna]** feat: 린넨 빨래 바구니 카드에 인테리어 컷 호버 전환 적용 (`5067693`)
- **[jipdaum-spring]** fix: 프로덕션 EC2 배포에 이메일 SMTP 환경변수 주입 추가 (`51ff149`)
- **[jipdaum-spring]** docs: 프로덕션 SMTP 발송 실패 진단/수정 작업일지 추가 (`680ad43`)
- **[jipdaum-spring]** docs: SMTP 시크릿 등록/재배포 완료로 작업일지 갱신 (`51c8a6c`)
- **[Team-DaumAna]** fix: 한국관 상품 로컬 id를 백엔드 실제 id(11~17)에 맞춤 (`768ba5f`)
- **[Team-DaumAna]** style: 사업자 정보 패널 배경을 메탈릭 실버로 변경 (`08386ee`)
- **[Team-DaumAna]** docs: 2026-08-26 작업일지 추가 (상품 카탈로그-DB 연동 진단, 한국관 id 정합성 수정) (`94a6318`)
- **[jipdaum-spring]** docs: collection 파라미터 변경 작업일지 보강 (51ff149에 병합된 경위 기록) (`8f57591`)
- **[Team-DaumAna]** fix: 하단 독 상품 검색 플라이아웃이 독 전체 기준 가로 중앙에 뜨도록 수정 (`31d593e`)
- **[Team-DaumAna]** fix: 상품 목록 이미지 영역을 5:6 고정 비율로 통일(object-cover) (`82a384d`)
- **[Team-DaumAna]** chore: 상품 목록 이미지 파일을 1000x1200(5:6)으로 통일 크롭 (`df4e226`)
- **[Team-DaumAna]** fix: 메인 무드등 상품 이미지/이름을 우드 롱 무드등으로 교체 (`edf6f08`)
- **[Team-DaumAna]** fix: 모달/독 내부 스크롤에 data-lenis-prevent 누락 수정 (`dac6878`)
- **[Team-DaumAna]** fix: 인기검색어-상품명 불일치 및 챗봇 빠른답장 미노출 수정 (`aedbda3`)
- **[Team-DaumAna]** docs: 2026-08-26 작업일지 보강 (프론트 전수 점검, 챗봇 점검, 독 애니메이션 분석) (`afc0815`)
- **[jipdaum-spring]** docs: AI 챗봇 아키텍처 정리 세션 기록 추가 (`5c4049f`)
- **[Team-DaumAna]** feat: 메인 상품 14종을 하드코딩 대신 백엔드 API+DB로 연동 (`3d57022`)

## 2026-08-27

- **[Team-DaumAna]** docs: 2026-08-26 작업일지에 메인 상품 API/DB 연동 작업 추가 (`558d861`)
- **[Team-DaumAna]** ci: 운영 DB에 메인 상품 14종을 반영하기 위한 수동 워크플로 추가 (`0905dac`)
- **[jipdaum-spring]** fix: GlobalExceptionHandler에 @Valid/미처리 예외 핸들러 추가 (`90b0ef2`)
- **[Team-DaumAna]** style: 챗봇 패널 크기 축소 (560x760 → 510x690) (`9079c2d`)
- **[jipdaum-spring]** docs: 작업 워크플로우 필수 준수 규칙 CLAUDE.md에 추가 (`725435a`)

## 2026-08-28

- **[Team-DaumAna]** style: 메인 상품 그리드 배경 파스텔톤으로 변경, 상품 상세 가독성 보정 (`5788986`)
- **[Team-DaumAna]** style: 메인 상품 그리드 파스텔 배경 톤 진하게 + 광택 애니메이션 조정 (`51c5e73`)
- **[jipdaum-spring]** feat: CORS 허용 origin을 frontend-url과 분리해 여러 개 허용 (`26bac46`)
- **[Team-DaumAna]** feat: 파스텔 배경/독 아이콘 정리, 장바구니 페이지 전환, 상세 가독성 보정 (`55ae3d3`)
- **[Team-DaumAna]** style: 메인 카트 페이지 파스텔 배경 + TwayFly 폰트 적용 (`3cc2390`)
- **[Team-DaumAna]** fix: 플로팅 독 아이콘이 알약 배경 밖으로 삐져나오는 문제 수정 (`0442961`)
- **[jipdaum-spring]** fix: cors-allowed-origins 없으면 frontend-url로 폴백해 배포 크래시 방지 (`e24307d`)

## 2026-08-30

- **[jipdaum-spring]** docs: 6~8월 최대 원인(설정 드리프트) 분석 및 해결과정 정리 (`fca4974`)
- **[jipdaum-spring]** Fix typo in analysis of Spring Security issues (`f22899e`)
- **[jipdaum-spring]** docs: DB 구조/Oracle-MySQL 이관 문서 추가, 작업일지 정리 (`3eefbcb`)
- **[Team-DaumAna]** fix: 브라우저 창 리사이즈 시 가로 스크롤 패널이 겹쳐 보이던 문제 수정 (`ad4e152`)
- **[Team-DaumAna]** docs: 2026-06~08 프론트/장고 주요 장애 및 트러블슈팅 포스트모템 추가 (`55a2a95`)
- **[Team-DaumAna]** feat: 포트폴리오 사이트(portfolio/) 최초 커밋 (`0170106`)
- **[Team-DaumAna]** feat: 케이스 스터디 2건 추가, gray-matter 브라우저 Buffer 폴리필 수정 (`858945b`)
- **[Team-DaumAna]** feat: 포트폴리오 About/Contact/Case Studies 페이지 보강 (`f726cf5`)

## 2026-08-31

- **[jipdaum-spring]** docs: Spring Security 302 리다이렉트 재발 케이스 스터디 추가 (`3697450`)
- **[jipdaum-spring]** docs: 챗봇 응답 지연 개선 케이스 스터디 추가 (`b61ce39`)
- **[jipdaum-spring]** test: 두 케이스 스터디가 지적한 회귀 테스트 부재 갭 메움 (`9d7307f`)
- **[Team-DaumAna]** feat: 상품 카테고리를 대/중/소 3단으로 세분화 (`ea657c6`)
- **[jipdaum-spring]** docs: 상품 목록 collection 배선 누락 케이스 스터디 추가 (`55e7fb2`)
- **[jipdaum-spring]** refactor: 죽은 getProducts(String, Long) 2-인자 오버로드 삭제 (`69d949c`)
- **[Team-DaumAna]** feat: 상품 상세페이지를 상용 커머스 공통 구조로 재구성 (`f04887d`)
- **[Team-DaumAna]** feat: 상세페이지 구매 카드 넓히고 집다움 한글 로고 추가 (`94794f2`)
- **[Team-DaumAna]** feat: 플로팅 독을 왼쪽 세로 사이드바로 재배치, 패널 이동 화살표는 우하단 독으로 분리 (`39b4dd8`)
- **[Team-DaumAna]** feat: 화살표 독을 세로형으로, 챗봇 아이콘을 왼쪽 사이드 하단으로 (`4a0db84`)
- **[Team-DaumAna]** feat: 메인 유틸 링크·페이지 전환 애니메이션, 포트폴리오 About/Case Study 보강 (`0ef8a77`)
- **[Team-DaumAna]** feat: 화살표 독을 하단 중앙 가로형으로, 맨 위로 버튼을 우하단에 신설 (`8306065`)

## 2026-09-01

- **[Team-DaumAna]** feat: 메인 유틸 링크에 한국관/공지사항 메뉴 추가 (`43599db`)
- **[Team-DaumAna]** feat: 검색바 최근/연관 검색어, 고객센터 페이지, 한국관 스크롤 버튼 연동 (`7389d65`)
- **[Team-DaumAna]** fix: 장바구니에서 홈 아이콘으로 나갈 때 인트로 영상 패널 대신 상품 목록으로 이동 (`84763b9`)
- **[Team-DaumAna]** fix: 좌우 독 위에서 휠 스크롤 시 옆 패널로 전환되던 문제 수정 (`31044b9`)
- **[Team-DaumAna]** feat: 상품 목록 카테고리를 대>중>소 3단 계층으로 세분화 (`d98efa7`)
- **[Team-DaumAna]** fix: 고객센터 페이지 배경을 상품 목록과 같은 파스텔 톤으로 통일 (`211260a`)
- **[Team-DaumAna]** feat: 고객센터 페이지에 뒤로가기 버튼 추가, 하단 화살표 독 숨김 (`02be57e`)
- **[Team-DaumAna]** feat: 상품 목록 페이지 파스텔톤 제 작업 및 배너 상단 검색어 기능 확장 (`62a9b09`)
- **[Team-DaumAna]** docs: Karpathy 가이드라인 기반 작업 원칙 섹션 추가 (`6ca9415`)
- **[Team-DaumAna]** feat: 왼쪽 사이드바 독을 설정 페이지로 전환, 헤더 내비게이션 상시 노출 (`0f314a7`)
- **[Team-DaumAna]** fix: 상품 목록(홈) 페이지 헤더 배너를 스크롤 전엔 다시 숨김 (`c37db64`)
- **[Team-DaumAna]** fix: "목록으로" 버튼들이 상품 그리드 대신 인트로 영상에 멈춰있던 회귀 버그 수정 (`17696ec`)
- **[Team-DaumAna]** feat: 하단 화살표 독 제거, 맨 위/아래 버튼 우하단 단일 위젯으로 통합 (`8c4bff1`)
- **[Team-DaumAna]** feat: 맨 위/아래 이동 버튼을 홈 영상 인트로 패널(1~4)에서만 노출 (`d112dc0`)
- **[Team-DaumAna]** feat: 포트폴리오 핵심 기술 스택에 Cloudflare 추가 (`734aa04`)
- **[Team-DaumAna]** feat: 포트폴리오 푸터에 방문자 조회수 뱃지 추가 (`5db587a`)

## 2026-09-02

- **[Team-DaumAna]** fix: 상품 목록 그리드를 2열에서 3열로 변경 (`ed74764`)
- **[Team-DaumAna]** feat: 상품 목록 패널에 맨 위로/맨 아래로 플로팅 버튼 추가 (`01008b8`)
- **[Team-DaumAna]** feat: 설정 페이지 상단 배너를 상품 목록 페이지처럼 스크롤 시에만 노출 (`eba8067`)
- **[Team-DaumAna]** Revert "feat: 상품 목록 패널에 맨 위로/맨 아래로 플로팅 버튼 추가" (`a72133b`)
- **[Team-DaumAna]** feat: 우하단 이동 버튼을 작은 십자(+) 패드로, 최근 본 상품 독 크기 축소 (`798eac3`)
- **[Team-DaumAna]** feat: 십자 패드를 상품 그리드 전용에서 홈의 모든 패널로 확장 (`0c04b1c`)
- **[Team-DaumAna]** feat: 상단 배너 등장을 더 느긋하게, 상품 목록 스크롤에 관성 스크롤 적용 (`cf6514d`)
- **[Team-DaumAna]** fix: 헤더 우측 설정(톱니바퀴) 버튼 앞에도 구분선 추가해 간격 통일 (`6b78861`)
- **[Team-DaumAna]** feat: 설정 버튼을 헤더 우상단 모서리로 분리 배치 (`b88dd4a`)
- **[Team-DaumAna]** fix: 최근 본 상품 독의 이름/가격 툴팁이 잘려서 안 보이던 문제 수정 (`08b2d38`)
- **[Team-DaumAna]** fix: 포트폴리오 케이스 스터디 가독성 개선 (`b7403a9`)
- **[Team-DaumAna]** fix: 홈 인트로 패널 1·2가 스크롤로 재방문할 때마다 재생되던 것을 최초 1회만 재생하도록 변경 (`756e933`)
- **[Team-DaumAna]** feat: 고객센터 페이지에도 설정 페이지와 같은 스크롤 배너 적용 (`060b54a`)
- **[Team-DaumAna]** fix: 십자 패드 크기를 최근 본 상품 독 폭에 맞춤 (`8435638`)
- **[Team-DaumAna]** fix: 인트로에서 문 열리는 애니메이션(doorPanel) 제거 (`86e18e2`)
- **[Team-DaumAna]** feat: 상단 배너 등장 애니메이션을 더 부드럽고 느리게 조정 (`a378c46`)
- **[Team-DaumAna]** feat: 챗봇 회원가입 약관 보기를 오른쪽 패널 전체 화면으로 변경 (`d1caf05`)
- **[Team-DaumAna]** feat: 로그인/회원가입을 모달에서 독립 페이지(/login, /register)로 전환 (`2e45ff5`)
- **[Team-DaumAna]** fix: 한국관 헤더 내비 겹침 해소 + 상품목록 페이지 형식을 메인과 통일 (`5031093`)
- **[Team-DaumAna]** fix: /login, /register 페이지에서 공용 헤더를 숨기고 X닫기버튼 제거 (`d34ace4`)
- **[Team-DaumAna]** fix: 홈에서 다른 가로 패널로 넘어가도 헤더 배너가 고정되던 문제 수정 (`04abbb2`)
- **[Team-DaumAna]** fix: 로그인 페이지 진입 애니메이션 제거 (`0af8eba`)
- **[jipdaum-spring]** fix: 카카오 로그인에서 prompt=login 강제 파라미터 제거 (`0b79fd3`)
- **[jipdaum-spring]** merge: 카카오 QR 로그인 prompt=login 제거 fix 병합 (`90fede0`)
- **[jipdaum-spring]** fix: 카카오 인가 요청에 prompt=qr_login 추가 (`412a68d`)
- **[jipdaum-spring]** merge: 카카오 인가 요청에 prompt=qr_login 추가 fix 병합 (`c5d2b66`)

## 2026-09-03

- **[jipdaum-spring]** revert: 카카오 prompt=qr_login 제거 (ID/PW 로그인까지 회귀시킴) (`25b4180`)
- **[jipdaum-spring]** merge: 카카오 prompt=qr_login 회귀 롤백 병합 (`3dd9c38`)
- **[Team-DaumAna]** feat: 로그인 페이지에 돌아가기 버튼 추가 (`d80ffb0`)
- **[Team-DaumAna]** fix: 고객센터도 최상단에서 검색·내비까지 전부 숨기도록 확장 (`89a0ba9`)
- **[Team-DaumAna]** fix: 한국관 헤더도 스크롤 전엔 숨겼다가 내리면 나타나도록, 해/달 위치 보정 (`c519921`)
- **[Team-DaumAna]** feat: 생활용품 카테고리(발매트/수건/실내화/욕실화) 13종 추가, 사업자정보 패널을 SiteFooter로 통합 (`6abb612`)
- **[Team-DaumAna]** feat: 상품 목록 검색창도 헤더처럼 포커스 시 확대되도록 (`5e88b71`)
