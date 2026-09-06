import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Home.jsx 상품 목록과 같은 타이포 시스템 — 이 페이지도 그 스타일을 그대로 따른다.
const SERIF = { fontFamily: "'GmarketSans', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

const NOTICES = [
  {
    id: 1,
    date: "2026.09.06",
    tag: "신상품",
    title: "생활용품 라인업 대폭 확충 안내",
    body: "발매트·수건·실내화·욕실화 등 매일 쓰는 생활용품을 대거 새로 들여왔습니다. 스트라이프 발매트 2종(브라운·네이비), 헤링본 세면 수건 2종(레드·블루 / 틸·머스터드), 베이지 와플 수건, 극세사 실내화(그레이·그린·브라운·네이비 4색), 배수 슬릿 쿠션 욕실화(레드·블랙·블루·화이트 4색), 와이드 밴드 욕실화, 필로우 쿠션 슬라이드 욕실화까지 — 욕실과 옷방을 한 번에 정돈할 수 있는 상품들을 룩북에서도 스타일링 사례와 함께 확인하실 수 있습니다. 상품 상세 페이지에서 소재·사이즈·컬러 옵션을 꼼꼼히 확인해보세요.",
  },
  {
    id: 2,
    date: "2026.09.06",
    tag: "이용안내",
    title: "쇼핑 더 편하게 — 집다움 이용 꿀팁 모음",
    body: "① 위시리스트: 상품 카드의 하트 버튼을 누르면 마이페이지 > 위시리스트에 저장되어 나중에 한 번에 모아볼 수 있습니다. ② 최근 본 상품: 화면 우측 상단 독에서 최근 둘러본 상품을 다시 확인할 수 있습니다. ③ 쿠폰 미리 적용: 장바구니에서 쿠폰을 먼저 적용해보면 결제 페이지에서도 그대로 이어집니다. ④ 화면 설정: 설정 페이지에서 다크모드와 화이트·베이지·파스텔 배경 톤을 취향대로 바꿀 수 있습니다. ⑤ 검색: 헤더의 돋보기 아이콘으로 상품명·브랜드·라벨을 바로 검색할 수 있습니다.",
  },
  {
    id: 3,
    date: "2026.09.03",
    tag: "이벤트",
    title: "추석 맞이 특별 이벤트",
    body: "추석을 맞아 전 상품을 최대 30% 할인된 가격으로 만나보실 수 있는 특별 이벤트를 진행합니다. 한정 수량으로 진행되는 만큼 관심 상품은 미리 위시리스트에 담아두시길 추천드리고, 품절 시 재입고 알림은 제공되지 않으니 서둘러 확인해주세요. 이벤트 상품은 홈 화면 상단 배너와 상품 목록의 할인 배지로 표시됩니다.",
  },
  {
    id: 4,
    date: "2026.08.30",
    tag: "이용안내",
    title: "룩북에서 상품 바로 구매하는 법",
    body: "룩북은 실제 쇼룸 촬영 컷으로 상품을 스타일링해 보여주는 코너입니다. 사진 위 파란색 + 아이콘을 누르면 그 자리에 놓인 상품의 이름과 가격이 바로 뜨고, 카드를 클릭하면 상품 상세 페이지로 이동해 옵션을 선택한 뒤 곧바로 구매할 수 있습니다. 게시물 상세에서는 상품의 소재·활용법·관리 팁까지 더 자세한 이야기를 확인하실 수 있으니, 구매 전 참고해보세요.",
  },
  {
    id: 5,
    date: "2026.08.27",
    tag: "신상품",
    title: "저녁을 아늑하게 만드는 무드등 3종 출시",
    body: "라탄 케인 갓의 우드 롱 무드등, 자연사로 감은 미니 무드등, 동그란 버섯 모양의 세이지 그린 무드등까지 조명 라인업을 확장했습니다. 거실 구석에 세워두는 플로어형부터 협탁 위에 올려두는 미니 사이즈까지, 취침 전 조도를 단계적으로 낮춰가는 조명 레이어링을 완성해보실 수 있습니다. 색온도를 비슷하게 맞춰 배치하면 공간이 한 톤으로 정돈되어 보입니다.",
  },
  {
    id: 6,
    date: "2026.08.19",
    tag: "신상품",
    title: "거실·침실 신상품 4종 신규 등록",
    body: "라탄 케인 등받이의 유러피안 우드 소파, 니트 원단의 다크 브라운 고급 소파, 라이브 엣지 헤드보드의 북유럽 침대, 파스텔 추상 패턴의 업홀스터리 침대까지 4종을 새로 등록했습니다. 같은 거실이라도 어떤 소파를 두느냐에 따라 계절감이 달라지고, 침대 헤드보드 하나로 침실 전체 분위기를 새롭게 완성할 수 있습니다. 장바구니에서 쿠폰 선택 기능도 함께 개선되었으니 결제 전 확인해보세요.",
  },
  {
    id: 7,
    date: "2026.08.10",
    tag: "신상품",
    title: "라탄 수납 바구니 신상 입고",
    body: "가죽 손잡이가 포인트인 라탄 빨래 바구니와 친환경 우드 소재 바구니를 새로 들여왔습니다. 별무늬로 짠 라탄 바구니는 세탁물뿐 아니라 담요·잡지 수납함으로도 손색없고, 친환경 우드 소재 바구니는 옷방·욕실·아이 방 어디에 두어도 스며드는 내추럴한 톤이 특징입니다. 정리는 예쁘게, 라탄 수납 바구니 활용법을 룩북에서 확인해보세요.",
  },
  {
    id: 8,
    date: "2026.08.05",
    tag: "이용안내",
    title: "AI 챗봇 상담 이용 안내",
    body: "마이페이지 내 챗봇 아이콘을 누르면 AI 상담사가 상품 추천부터 자주 묻는 질문까지 실시간으로 답변해드립니다. 원하는 스타일이나 용도를 자유롭게 말씀해주시면 카탈로그 내 어울리는 상품을 찾아드리고, 배송·교환/환불 정책 같은 일반적인 문의도 바로 답변받으실 수 있습니다. 상담 내용은 대화창을 나가기 전까지 기억되니 이어서 편하게 질문해주세요.",
  },
  {
    id: 9,
    date: "2026.07.28",
    tag: "혜택",
    title: "신규 회원 가입 시 웰컴 쿠폰 자동 지급 안내",
    body: "이제 회원가입만 완료하시면 별도 신청 없이 웰컴 쿠폰이 자동으로 지급됩니다. 마이페이지 > 쿠폰함에서 바로 확인하실 수 있고, 장바구니 또는 결제 단계에서 쿠폰 코드를 입력하거나 목록에서 선택하기만 하면 바로 할인이 적용됩니다. 최소 주문 금액과 유효기간은 쿠폰함에서 함께 표시되니 사용 전 꼭 확인해주세요. 이미 가입하신 회원분들도 쿠폰함을 확인해보시면 놓친 혜택이 있을 수 있습니다.",
  },
  {
    id: 10,
    date: "2026.07.20",
    tag: "혜택",
    title: "회원 등급별 혜택 안내 — 일반부터 골드까지",
    body: "집다움 회원 등급은 누적 구매 금액을 기준으로 일반 · 그린(10만원 이상) · 브론즈(30만원 이상) · 실버(70만원 이상) · 골드(150만원 이상) 5단계로 나뉩니다. 마이페이지 > 회원등급에서 현재 등급과 다음 등급까지 남은 금액을 실시간으로 확인할 수 있고, 등급이 오를수록 다양한 혜택이 제공될 예정입니다. 등급은 별도 신청 없이 누적 구매 금액에 따라 자동으로 반영됩니다.",
  },
  {
    id: 11,
    date: "2026.07.10",
    tag: "이벤트",
    title: "7월 할인행사 안내",
    body: "7월 한 달간 전 상품 최대 20% 할인 이벤트를 진행합니다. 상품 상세 페이지에서 정가와 할인가가 함께 표시되니 할인율을 바로 확인하실 수 있고, 회원 등급별로 발급되는 추가 쿠폰과 중복 적용도 가능합니다. 장바구니에서 쿠폰을 미리 적용해보고 최종 결제 금액을 확인한 뒤 구매를 진행해보세요. 이벤트 기간과 대상 상품은 홈 화면 배너에서도 안내드립니다.",
  },
  {
    id: 12,
    date: "2026.07.05",
    tag: "배송",
    title: "여름 장마철 배송 지연 안내",
    body: "장마철 기상 상황에 따라 일부 지역의 배송이 평소보다 1~2일 지연될 수 있습니다. 주문 후 마이페이지 > 주문내역 조회에서 배송 상태를 실시간으로 확인하실 수 있고, 배송이 시작되면 배송조회 버튼을 통해 상세 위치도 확인 가능합니다. 침수 우려 지역은 안전을 위해 배송이 추가로 지연될 수 있는 점 양해 부탁드립니다. 전 상품 무료배송 정책은 장마철에도 동일하게 적용됩니다.",
  },
  {
    id: 13,
    date: "2026.06.28",
    tag: "공지",
    title: "고객센터 운영시간 변경 안내",
    body: "고객센터 운영시간이 평일 09:00~18:00으로 변경되었습니다. 주말·공휴일은 휴무이며, 운영시간 외 문의는 마이페이지 > 1:1 문의를 통해 남겨주시면 다음 영업일 순차적으로 답변드립니다. 주문·배송·교환/환불 관련 문의는 주문번호를 함께 남겨주시면 더 빠르게 확인 가능합니다. 자주 묻는 질문은 고객센터 페이지에서도 확인하실 수 있습니다.",
  },
  {
    id: 14,
    date: "2026.06.15",
    tag: "이벤트",
    title: "6월 한정 신규가입 이벤트",
    body: "6월 한 달간 신규 가입 시 첫 구매에 사용 가능한 10% 추가 할인 쿠폰을 드리는 이벤트를 진행했습니다. 현재는 상시 정책인 웰컴 쿠폰 자동 지급으로 전환되어, 언제 가입하시더라도 동일한 혜택을 받아보실 수 있습니다. 이미 참여하신 회원분들의 쿠폰은 마이페이지 > 쿠폰함에서 계속 확인 가능합니다.",
  },
  {
    id: 15,
    date: "2026.05.20",
    tag: "공지",
    title: "전자상거래법에 따른 사업자 정보 안내",
    body: "전자상거래법에 따라 집다움의 사업자 정보를 사이트 하단에 상시 게시하고 있습니다. 상호, 대표자명, 사업자등록번호, 통신판매업 신고번호, 영업소 소재지, 전화번호, 이메일, 개인정보보호책임자 정보를 확인하실 수 있으며, 이용약관과 개인정보처리방침도 함께 안내드립니다. 관련 문의는 고객센터 또는 1:1 문의를 이용해주세요.",
  },
];

// Home.jsx의 동명 헬퍼와 같은 모양 — 카테고리 구획을 가르는 무지개 헤어라인.
function Hairline({ className = "" }) {
  return (
    <div
      className={`h-[2px] ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #2a4d8f 0%, #f5f1ea 25%, #a6342a 50%, #1c1a16 75%, #c9a227 100%)",
      }}
    />
  );
}

function Notice() {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const tags = ["전체", ...new Set(NOTICES.map((n) => n.tag))];
  const filteredNotices = selectedTag === "전체" ? NOTICES : NOTICES.filter((n) => n.tag === selectedTag);
  const selected = NOTICES.find((n) => n.id === selectedId) || null;

  return (
    <div className="noticePage metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
      {/* Cart.jsx(.cartPage)와 같은 130px 상단 여백 — 접힌 헤더(로고만 있는 상태)
          높이만큼은 스크롤 여부와 무관하게 항상 필요하다. Home.jsx 상품 그리드의
          py-20(80px)을 그대로 썼더니 헤더에 "목록으로"/제목이 가려졌다. */}
      <div className="max-w-7xl mx-auto w-full px-8 pt-[130px] pb-20">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>NOTICE</span>
        <h1 className="text-3xl md:text-4xl font-light mt-2 mb-8" style={SERIF}>공지사항</h1>
        <Hairline className="mb-10" />

        {selected ? (
          <div className="max-w-2xl">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
              style={MONO}
            >
              <ChevronLeft size={14} /> 공지 목록으로
            </button>
            <span className="text-[10px] text-muted-foreground block mb-2" style={MONO}>{selected.date} · {selected.tag}</span>
            <h2 className="text-2xl font-medium text-foreground mb-6" style={SERIF}>{selected.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed" style={SANS}>{selected.body}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 flex-wrap mb-6">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTag === tag
                      ? "bg-muted-foreground/20 text-foreground border-muted-foreground/40"
                      : "bg-transparent text-muted-foreground/70 border-border/60 hover:text-foreground"
                  }`}
                  style={SANS}
                >
                  {tag}
                </button>
              ))}
            </div>

            <ul className="flex flex-col border-t border-border">
              {filteredNotices.map((n) => (
                <li key={n.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedId(n.id)}
                    className="group w-full text-left py-6 flex items-center justify-between gap-6 hover:opacity-70 transition-opacity"
                  >
                    <div>
                      <span className="text-[10px] text-muted-foreground block mb-1" style={MONO}>{n.date} · {n.tag}</span>
                      <h4 className="text-sm font-medium text-foreground" style={SANS}>{n.title}</h4>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Notice;
