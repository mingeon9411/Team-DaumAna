// 라우트 간에 sessionStorage로 주고받는 1회성 내비게이션 신호들의 키를 한 곳에
// 모아둔다 — 여러 파일에 같은 문자열 리터럴을 반복하면 오타가 나도 컴파일 타임에
// 안 걸리고 조용히 무시되기 때문에(그 값을 읽는 쪽이 그냥 "없다"고 판단해버림).
export const NAV_FLAGS = {
  // HomeProductDetail/ProductDetail이 마운트될 때 "home"|"korean-hall"을 남기고,
  // App.jsx의 DoorIntroController가 "/"·"/korean-hall" 도착 시 소비한다.
  PRODUCT_DETAIL_RETURN_ZONE: "productDetailReturnZone",
  // DoorIntroController가 위 흔적을 발견하면 대신 세팅 — Home.jsx가 소비.
  SKIP_HOME_DEFAULT_PANEL: "skipHomeDefaultPanel",
  // Sidebar.jsx가 소비(상품 그리드 패널로 점프).
  PENDING_HOME_PANEL_INDEX: "pendingHomePanelIndex",
  // KoreanHall.jsx가 소비(상품 목록으로 스크롤).
  SKIP_KOREAN_HALL_INTRO: "skipKoreanHallIntro",
};

// PRODUCT_DETAIL_RETURN_ZONE에 실제로 들어가는 값들.
export const NAV_ZONE = {
  HOME: "home",
  KOREAN_HALL: "korean-hall",
};
