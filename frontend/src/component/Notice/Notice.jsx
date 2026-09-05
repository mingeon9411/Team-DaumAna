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
    date: "2026.07.10",
    tag: "이벤트",
    title: "7월 할인행사 안내",
    body: "7월 한 달간 전 상품 최대 20% 할인 이벤트를 진행합니다. 회원 등급별 추가 쿠폰도 함께 확인해보세요.",
  },
  {
    id: 2,
    date: "2026.07.05",
    tag: "배송",
    title: "여름 장마철 배송 지연 안내",
    body: "장마철 기상 상황에 따라 일부 지역 배송이 1~2일 지연될 수 있습니다. 양해 부탁드립니다.",
  },
  {
    id: 3,
    date: "2026.06.28",
    tag: "공지",
    title: "고객센터 운영시간 변경 안내",
    body: "고객센터 운영시간이 평일 09:00~18:00으로 변경되었습니다. 주말/공휴일은 휴무입니다.",
  },
  {
    id: 4,
    date: "2026.06.15",
    tag: "이벤트",
    title: "신규 회원 가입 혜택",
    body: "지금 가입하시면 첫 구매 시 사용 가능한 10% 할인 쿠폰을 드립니다.",
  },

  { id: 5,
    date: "2026.09.03",
    tag: "이벤트",
    title: "추석 맞이 특별 이벤트",
    body: "추석 맞이 전 상품을 최대 30% 할인된 가격으로 만나보세요. 한정 수량이므로 상품을 바로 확인해주세요"
  }
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
    <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
      {/* Cart.jsx(.cartPage)와 같은 130px 상단 여백 — 이 페이지는 Header.jsx의
          showExpandedNav 목록에 없어(스크롤 전에도 항상 펼쳐진 상태) 헤더 배너가
          최상단부터 떠 있다. Home.jsx 상품 그리드의 py-20(80px)을 그대로 썼더니
          그 배너에 "목록으로"/제목이 가려졌다 — Cart처럼 항상-펼침 페이지 기준으로 맞춘다. */}
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
