import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuMessageSquare, LuMessageCircle, LuPhone, LuChevronDown, LuSearch } from "react-icons/lu";
import "./CustomerCenter.css";
import { useAuthModal } from "../../context/AuthModalContext";
import { useNestedLenis } from "../../hooks/useNestedLenis";
import { NAV_FLAGS } from "../../utils/navFlags";

// 실제 상담 티켓/실시간 상담 시스템은 없는 포트폴리오 프로젝트라(data/businessInfo.js 참고),
// FAQ 답변과 연락처는 그 사업자 정보와 맞춘 플레이스홀더.
const FAQS = [
  {
    q: "배송은 얼마나 걸리나요?",
    a: "결제 완료 후 평균 2~5일 내 출고돼요.",
  },
  {
    q: "교환·반품은 어떻게 하나요?",
    a: "마이페이지 > 주문내역에서 신청할 수 있고, 상품 수령 후 7일 이내 단순 변심 교환·반품이 가능해요.",
  },
  {
    q: "환불은 언제 되나요?",
    a: "반품 상품 확인 후 영업일 기준 3~5일 이내 결제하신 수단으로 환불돼요.",
  },
  {
    q: "쿠폰은 어떻게 적용하나요?",
    a: "장바구니 또는 결제 화면에서 보유 쿠폰을 선택하면 결제 금액에 바로 적용돼요.",
  },
  {
    q: "회원 탈퇴는 어떻게 하나요?",
    a: "마이페이지 > 회원정보에서 탈퇴를 신청할 수 있어요. 탈퇴 시 보유 쿠폰·적립 혜택은 함께 소멸되니 참고해 주세요.",
  },
  {
    q: "쿠키는 어떤 목적으로 사용되나요?",
    // 실제로는 브라우저 쿠키가 아니라 대부분 로컬 스토리지를 쓰고 있어서(그 사실을
    // 숨기지 않고 그대로 밝힘), 처음 방문 시 뜨는 쿠키 동의 배너(CookieConsent.jsx)의
    // 4개 카테고리와 정확히 같은 이름·순서로 설명한다. 이 사이트엔 실제 통계/광고
    // 스크립트가 아직 없다는 것도 얼버무리지 않고 그대로 적는다.
    a: "정확히는 브라우저 쿠키보다 브라우저 저장소(로컬 스토리지)를 주로 씁니다. 필수 쿠키는 로그인 유지, 화면 테마·독 표시 여부 같은 사이트 이용에 꼭 필요한 정보를 저장해요. 맞춤 설정 쿠키는 최근 검색어·최근 본 상품·찜한 상품처럼 회원님이 둘러보신 내용을 바탕으로 화면을 구성하는 데 씁니다. 통계 쿠키와 마케팅 쿠키는 카테고리만 마련해뒀을 뿐, 지금 집다움은 별도의 이용 통계 도구나 외부 광고·리타게팅 스크립트를 쓰지 않아 실제로 수집되는 데이터는 없어요. 나중에 그런 도구를 들이면 이 두 카테고리 동의를 받은 경우에만 사용합니다.",
  },
  {
    q: "쿠키 사용 동의를 나중에 바꿀 수 있나요?",
    a: "cookie-settings-reopen",
  },
  { q: "주문 내역은 어디에서 확인하나요?", a: "로그인 후 마이페이지 > 주문내역 조회에서 주문 상태와 상세 내역을 확인할 수 있어요." },
  { q: "주문 후 배송지를 변경할 수 있나요?", a: "출고 전 주문이라면 1:1 문의 또는 채팅 상담으로 변경 가능 여부를 확인해 주세요. 출고가 시작된 뒤에는 변경이 어려울 수 있어요." },
  { q: "주문을 취소하고 싶어요.", a: "출고 전 주문은 마이페이지 > 주문내역에서 취소할 수 있어요. 출고된 주문은 반품 절차를 이용해 주세요." },
  { q: "비회원도 주문할 수 있나요?", a: "현재 주문과 주문 조회는 회원 로그인 후 이용할 수 있어요." },
  { q: "결제 수단에는 어떤 것이 있나요?", a: "결제 화면에서 제공되는 결제 수단을 선택해 이용할 수 있어요. 표시되는 수단은 결제 서비스의 지원 범위에 따라 달라질 수 있어요." },
  { q: "결제는 완료됐는데 주문이 보이지 않아요.", a: "결제 직후에는 주문 정보가 반영되기까지 잠시 걸릴 수 있어요. 잠시 후 마이페이지를 다시 확인하고, 계속 보이지 않으면 결제 정보와 함께 1:1 문의를 남겨주세요." },
  { q: "결제 영수증을 받을 수 있나요?", a: "마이페이지 > 주문내역에서 주문을 선택하면 결제 정보를 확인할 수 있어요. 카드 영수증은 카드사에서도 확인할 수 있습니다." },
  { q: "현금영수증은 어떻게 발급받나요?", a: "결제 과정에서 현금영수증 발급 항목이 제공되는 경우 필요한 정보를 입력해 신청할 수 있어요." },
  { q: "배송비는 얼마인가요?", a: "배송비는 상품과 배송지에 따라 달라질 수 있으며, 결제 전 주문 금액에서 최종 배송비를 확인할 수 있어요." },
  { q: "배송 조회는 어디에서 하나요?", a: "상품이 출고되면 마이페이지 > 주문내역에서 배송 상태를 확인할 수 있어요." },
  { q: "여러 상품을 주문하면 함께 배송되나요?", a: "상품의 출고 일정과 재고 상태가 다르면 나누어 배송될 수 있어요." },
  { q: "도서산간 지역도 배송되나요?", a: "배송 가능 여부와 추가 배송비는 배송지 입력 후 결제 화면에서 확인해 주세요." },
  { q: "배송 중 상품이 파손됐어요.", a: "상품과 포장 상태가 보이도록 사진을 남긴 뒤, 수령 후 가능한 빨리 1:1 문의로 주문번호와 함께 알려주세요." },
  { q: "상품이 누락되었어요.", a: "수령하신 상품과 포장 상태를 확인한 뒤 주문번호와 함께 1:1 문의를 남겨주세요. 확인 후 도와드릴게요." },
  { q: "교환·반품 배송비는 누가 부담하나요?", a: "단순 변심 교환·반품은 고객 부담이며, 상품 하자나 오배송은 확인 후 집다움에서 부담해요." },
  { q: "교환 상품은 언제 받을 수 있나요?", a: "기존 상품 회수와 상태 확인 후 교환 상품을 준비해 출고해요. 재고와 배송 상황에 따라 일정이 달라질 수 있어요." },
  { q: "반품이 불가능한 경우가 있나요?", a: "사용 흔적·훼손이 있거나 구성품이 누락된 경우, 또는 수령 후 7일이 지난 경우에는 반품이 제한될 수 있어요." },
  { q: "상품의 재입고 알림을 받을 수 있나요?", a: "현재 별도 재입고 알림 기능은 제공하지 않아요. 궁금한 상품은 채팅 상담으로 문의해 주세요." },
  { q: "상품의 실제 색상과 화면 색상이 달라요.", a: "화면 설정과 조명에 따라 색상이 다르게 보일 수 있어요. 상품 상세 이미지와 설명을 함께 확인해 주세요." },
  { q: "상품의 크기와 소재를 알고 싶어요.", a: "상품 상세 페이지의 제품 사양에서 크기·소재 정보를 확인할 수 있어요. 추가 정보가 필요하면 1:1 문의를 이용해 주세요." },
  { q: "상품 관리 방법을 알려주세요.", a: "소재별 관리 방법은 상품 상세 설명을 먼저 확인해 주세요. 세탁이나 사용 전에는 제품에 동봉된 안내를 따라주세요." },
  { q: "찜한 상품은 어디에서 보나요?", a: "로그인 후 마이페이지 > 위시리스트에서 찜한 상품을 모아볼 수 있어요." },
  { q: "쿠폰을 여러 장 함께 사용할 수 있나요?", a: "주문당 적용 가능한 쿠폰 수와 조건은 결제 화면에서 확인할 수 있어요. 적용 가능한 쿠폰을 선택해 주세요." },
  { q: "쿠폰이 적용되지 않아요.", a: "최소 주문 금액, 사용 기간, 대상 상품 등 쿠폰 조건을 확인해 주세요. 조건을 만족하는데도 적용되지 않으면 1:1 문의를 남겨주세요." },
  { q: "쿠폰 유효기간은 어디에서 확인하나요?", a: "마이페이지 > 쿠폰에서 보유 쿠폰의 사용 기간과 조건을 확인할 수 있어요." },
  { q: "비밀번호를 잊어버렸어요.", a: "로그인 화면의 비밀번호 찾기 기능을 이용해 재설정할 수 있어요." },
  { q: "회원 정보를 수정하고 싶어요.", a: "마이페이지 > 회원 정보에서 변경 가능한 정보를 확인하고 수정할 수 있어요." },
  { q: "로그인이 되지 않아요.", a: "이메일과 비밀번호를 다시 확인해 주세요. 계속 문제가 생기면 비밀번호를 재설정하거나 1:1 문의를 이용해 주세요." },
  { q: "개인정보는 어떻게 보호하나요?", a: "서비스 이용에 필요한 최소한의 정보만 처리하며, 개인정보 처리 관련 문의는 1:1 문의로 남겨주세요." },
  { q: "1:1 문의 답변은 어디에서 확인하나요?", a: "로그인 후 채팅 상담을 열면 문의 내용과 답변을 이어서 확인할 수 있어요." },
];

function CustomerCenter() {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  // data-lenis-prevent로 전역 가로 Lenis(App.jsx)는 건너뛰므로, 이 페이지 전용
  // 세로 스크롤에도 부드러운 관성을 붙인다.
  const pageRef = useRef(null);
  useNestedLenis(pageRef);

  const goBack = () => navigate("/");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaqs = normalizedQuery
    ? FAQS.filter(({ q, a }) => `${q} ${a}`.toLowerCase().includes(normalizedQuery))
    : FAQS;

  // 홈으로 이동한 뒤 챗봇을 자동으로 여는 신호를 남긴다 — 실제 챗봇 위젯은
  // Home.jsx에서만 마운트되므로(ChatBot.jsx가 이 신호를 소비) 여기선 이동만.
  const openChatbot = () => {
    sessionStorage.setItem(NAV_FLAGS.PENDING_OPEN_CHATBOT, "1");
    navigate("/");
  };

  // "1:1 문의"는 로그인 계정 대화 기록 기준이라 비회원이면 챗봇 대신 로그인부터 유도.
  const handleOneOnOne = () => {
    if (!localStorage.getItem("access_token")) {
      openLogin();
      return;
    }
    openChatbot();
  };

  // CookieConsent.jsx는 한 번 선택하면(localStorage.cookieConsent) 다시 안 뜬다 —
  // 그 값을 지우고 새로고침하면 다음 렌더에서 다시 뜬다. FAQ 답변에서 "나중에
  // 바꿀 수 있다"고 말해놓고 실제로 바꿀 방법이 없으면 안 되니, 그 방법 자체를
  // 여기 버튼으로 만들어둔다.
  const reopenCookieSettings = () => {
    localStorage.removeItem("cookieConsent");
    window.location.reload();
  };

  // metallicSilver — 상품 목록 그리드(Home.jsx #home-products)와 같은 파스텔 배경
  // 클래스. 독의 "배경 톤"(pastelLevel)·다크모드 설정을 그대로 따라간다.
  return (
    <div className="ccPage metallicSilver" data-hsnap data-lenis-prevent ref={pageRef}>
      <div className="ccWrap">
        <button type="button" className="ccBackBtn" onClick={goBack}>
          <LuChevronLeft size={14} /> 목록으로
        </button>

        <section className="ccHero">
          <p className="ccHeroGreeting">안녕하세요 👋</p>
          <h1 className="ccHeroTitle">집다움 고객센터입니다.</h1>
          <p className="ccHeroSub">주문·배송부터 교환·환불까지, 궁금한 점을 빠르게 도와드릴게요.</p>
        </section>

        <section className="ccFaq">
          <h2 className="ccSectionTitle">집다움에 물어보세요</h2>
          <label className="ccFaqSearch">
            <LuSearch size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="궁금한 내용을 검색해 보세요"
              aria-label="자주 묻는 질문 검색"
            />
          </label>
          <ul className="ccFaqList">
            {filteredFaqs.map((item) => (
              <li key={item.q} className={`ccFaqItem${openQuestion === item.q ? " ccFaqItemOpen" : ""}`}>
                <button
                  type="button"
                  className="ccFaqQ"
                  aria-expanded={openQuestion === item.q}
                  onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                >
                  <span>{item.q}</span>
                  <LuChevronDown className="ccFaqChevron" />
                </button>
                {openQuestion === item.q && (
                  item.a === "cookie-settings-reopen" ? (
                    <p className="ccFaqA">
                      네, 처음 방문 시 고르신 내용은 브라우저에 저장돼 재방문 시엔 다시 묻지
                      않아요. 선택을 바꾸고 싶으면{" "}
                      <button type="button" className="ccFaqInlineBtn" onClick={reopenCookieSettings}>
                        쿠키 설정 다시 열기
                      </button>
                      를 눌러주세요.
                    </p>
                  ) : (
                    <p className="ccFaqA">{item.a}</p>
                  )
                )}
              </li>
            ))}
            {filteredFaqs.length === 0 && (
              <li className="ccFaqEmpty">검색 결과가 없습니다. 다른 검색어를 입력해 보세요.</li>
            )}
          </ul>
        </section>

        <section className="ccConsult">
          <h2 className="ccSectionTitle">상담하기</h2>
          <div className="ccConsultGrid">
            <button type="button" className="ccConsultCard ccConsultCardBtn" onClick={handleOneOnOne}>
              <LuMessageSquare className="ccConsultIcon" />
              <h3>1:1 문의</h3>
              <p>챗봇 상담창에 남겨주시면<br />확인 후 답변드려요</p>
              <span className="ccConsultMeta">접수 24시간 · 답변 평일 09:00~18:00</span>
              <span className="ccConsultMeta ccConsultMuted">로그인 후 이용 가능</span>
            </button>

            <button type="button" className="ccConsultCard ccConsultCardBtn" onClick={openChatbot}>
              <LuMessageCircle className="ccConsultIcon" />
              <h3>채팅 상담</h3>
              <p>화면 우측 하단<br />채팅 아이콘을 눌러주세요</p>
              <span className="ccConsultMeta">평일 09:00~18:00</span>
            </button>

            <a href="tel:02-123-4567" className="ccConsultCard ccConsultCardLink">
              <LuPhone className="ccConsultIcon" />
              <h3>전화 상담 02-123-4567</h3>
              <p>급한 문의는<br />전화로 도와드릴게요</p>
              <span className="ccConsultMeta">평일 09:00~18:00</span>
              <span className="ccConsultMeta ccConsultMuted">주말·공휴일 휴무</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CustomerCenter;
