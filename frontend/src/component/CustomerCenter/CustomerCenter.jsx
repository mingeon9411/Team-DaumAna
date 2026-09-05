import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuMessageSquare, LuMessageCircle, LuPhone, LuChevronDown } from "react-icons/lu";
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
];

function CustomerCenter() {
  const [openIdx, setOpenIdx] = useState(null);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  // data-lenis-prevent로 전역 가로 Lenis(App.jsx)는 건너뛰므로, 이 페이지 전용
  // 세로 스크롤에도 부드러운 관성을 붙인다.
  const pageRef = useRef(null);
  useNestedLenis(pageRef);

  const goBack = () => navigate("/");

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
          <ul className="ccFaqList">
            {FAQS.map((item, i) => (
              <li key={item.q} className={`ccFaqItem${openIdx === i ? " ccFaqItemOpen" : ""}`}>
                <button
                  type="button"
                  className="ccFaqQ"
                  aria-expanded={openIdx === i}
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <LuChevronDown className="ccFaqChevron" />
                </button>
                {openIdx === i && (
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
