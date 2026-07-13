# 🎨 JIPDAUM - Frontend Artistry
> **TEAM CTRL-ALT-ELITE** | [cite_start]2026 데브옵스 프로젝트 (Frontend Architecture) 
> [cite_start]React와 고성능 상태 관리를 기반으로, 공간의 가치를 담아내는 가장 한국적이고 우아한 UI/UX 플랫폼 

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=7A3E4D&height=200&section=header&text=JIPDAUM%20FRONTEND&fontSize=50&animation=fadeIn&fontColor=F4EAD4" width="100%"/>
</div>

<br/>

## 🪵 기술 가옥 (Tech Stacks & Core Libraries)
[cite_start]**JIPDAUM**의 견고한 서까래와 대들보가 되어주는 프런트엔드 핵심 의존성 라이브러리입니다. 

* [cite_start]**기반 프레임워크 (Core Framework):** React (v18+) 
* [cite_start]**교통망 제어 (Routing):** `react-router-dom` (싱글 페이지 애플리케이션 라우팅 제어) 
* [cite_start]**서신 왕래 (HTTP Client):** `axios` (Django 백엔드 API와의 비동기 통신) 
* [cite_start]**단청과 의복 (Styling):** `styled-components` / `Tailwind CSS` (컴포넌트 기반 모듈화 스타일링) 
* [cite_start]**문양 팩 (Icons):** `react-icons` (직관적인 UI 요소 배치를 위한 글로벌 아이콘 팩) 

<br/>

## 🏗️ 공간 구조도 (Directory Architecture)
[cite_start]유지보수와 컴포넌트 재사용성을 극대화하기 위해 조립식 한옥의 구조를 닮은 아토믹(Atomic) 기반의 구조로 설계되었습니다. 

```text
src/
[cite_start]├── assets/          # 이미지, 폰트 등 정적 파일 
[cite_start]├── components/      # 재사용 가능한 공통 컴포넌트 (Button, Modal, Navbar 등) 
[cite_start]├── hooks/           # 커스텀 훅 (useAuth, useFetch 등) 
[cite_start]├── pages/           # 라우터에 매핑되는 독립적인 페이지 단위 컴포넌트 
[cite_start]│   ├── Main/        # 대청마루 (메인 화면) 
[cite_start]│   ├── Detail/      # 사랑방 (상세 화면) 
[cite_start]│   └── Login/       # 문간방 (인증 화면) 
[cite_start]├── services/        # Axios 기반 API 통신 모듈 (api.js) 
[cite_start]├── styles/          # 글로벌 스타일 및 테마 정의 (GlobalStyle.js) 
[cite_start]├── App.js           # 라우터 설정 및 최상위 컴포넌트 
[cite_start]└── index.js         # 엔트리 포인트 (주춧돌)



🚀 기틀 마련하기 (Getting Started)프런트엔드 개발 가옥을 로컬 환경에 세우고 구동하기 위한 지침서.   
1. 자재 조달 (Dependency Installation)프로젝트 구동 및 UI 빌드에 필요한 핵심 라이브러리들을 
순차적으로 아랫목부터 설치합니다.  

 1) 라우팅 및 API 통신 라이브러리 설치   

$ npm install react-router-dom axios

 2) UI 스타일링 및 시각적 요소를 위한 패키지 설치 (추천 보완 사항)

$ npm install styled-components react-icons


2. 환경 변수 방처 (Environment Variables)
백엔드 API 서버의 주소 등 유연한 대처가 필요한 설정은 환경 변수라는 비밀 서화로 관리. 
루트 디렉토리에 .env 파일을 생성하십시오.   

⚠️ 필독 서찰: React 환경 변수는 반드시 REACT_APP_ 으로 시작해야만 브라우저 커널이 온전히 인식할 수 있습니다.   

백엔드 API 서버의 주소 등 유연한 대처가 필요한 설정은 환경 변수로 관리. 루트 디렉토리에 .env 파일을 생성.

# React 환경 변수는 반드시 REACT_APP_ 으로 시작해야 인식됨.

REACT_APP_API_URL=http://localhost:8000


3. 개발 서버 구동 (Run Server)

로컬 개발 서버를 실행. 기본적으로 http://localhost:3000/에서 실시간 핫 리로딩(Hot Reloading)과 함께 구동.

$ npm start


🎨 미학 철학 (Design System & UX Principles)조립식 한옥 구조 (Component-Driven Development): 

1. 모든 UI 요소는 독립적이고 재사용 가능하도록 목조 가구처럼 설계하여 빌드 타임을 획기적으로 단축합니다. 

2. 모든 이의 마당 (Responsive Web Design): 모바일, 태블릿, 데스크톱 등 그 어떤 디바이스라는 

창틀로 바라보아도 아름답도록 반응형 그리드 시스템을 적용합니다.   

3. 물 흐르듯 부드러운 호흡 (Fast Interaction): Axios 인터셉터(Interceptor)를 활용해 

토큰 인증 및 로딩 상태(Spinner)를 전역에서 부드럽게 제어하여 끊김 없는 사용자 경험을 선사합니다.  