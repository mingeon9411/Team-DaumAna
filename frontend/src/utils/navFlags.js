// 라우트 간에 sessionStorage로 주고받는 1회성 내비게이션 신호들의 키를 한 곳에
// 모아둔다 — 여러 파일에 같은 문자열 리터럴을 반복하면 오타가 나도 컴파일 타임에
// 안 걸리고 조용히 무시되기 때문에(그 값을 읽는 쪽이 그냥 "없다"고 판단해버림).
export const NAV_FLAGS = {
  // CustomerCenter의 "1:1 문의"/"채팅 상담" 카드가 세팅 — 홈으로 이동한 뒤
  // 챗봇을 자동으로 열어주도록 ChatBot.jsx가 소비.
  PENDING_OPEN_CHATBOT: "pendingOpenChatbot",
};
