import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuMessageSquare, LuMessageCircle, LuPhone, LuChevronDown } from "react-icons/lu";
import "./CustomerCenter.css";
import { useAuthModal } from "../../context/AuthModalContext";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";

// 실제 상담 티켓/실시간 상담 시스템은 없는 포트폴리오 프로젝트라(data/businessInfo.js 참고),
// FAQ 답변과 연락처는 그 사업자 정보와 맞춘 플레이스홀더.
const FAQS = [
  {
    q: "배송은 얼마나 걸리나요?",
    a: "결제 완료 후 평균 2~5일 내 출고돼요. 한국관 시공 상품은 별도 일정 협의 후 진행됩니다.",
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
];

function CustomerCenter() {
  const [openIdx, setOpenIdx] = useState(null);
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  // Cart.jsx와 동일한 신호 — 마운트 시점에 남겨둬야 "뒤로가기" 버튼 클릭이든 브라우저
  // 뒤로가기든 상관없이, "/" 도착 시 App.jsx의 DoorIntroController가 이 흔적을 보고
  // 대문 애니메이션·인트로 영상 패널 없이 곧장 상품 목록 패널로 스크롤한다.
  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

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

  // metallicSilver — 상품 목록 그리드(Home.jsx #home-products)와 같은 파스텔 배경
  // 클래스. 독의 "배경 톤"(pastelLevel)·다크모드 설정을 그대로 따라간다.
  return (
    <div className="ccPage metallicSilver" data-hsnap data-lenis-prevent>
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
                {openIdx === i && <p className="ccFaqA">{item.a}</p>}
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
              <p>메인·한국관 화면의<br />채팅 아이콘을 눌러주세요</p>
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
