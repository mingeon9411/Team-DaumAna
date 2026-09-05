import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PRODUCTS } from "../Home/Home";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import SiteFooter from "../SiteFooter";

// Home.jsx 상품 목록과 같은 타이포 시스템 — 이 페이지도 그 스타일을 그대로 따른다.
const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const byId = (id) => PRODUCTS.find((p) => p.id === id);

// 관리자가 상품을 골라 올리는 스타일링 피드 — 지금은 프론트 목업 데이터.
// 관리자 작성 기능(백엔드)이 붙기 전까지 이 배열을 실제 피드처럼 다룬다.
// tags의 x/y는 커버 이미지 안에서 그 상품이 놓인 위치를 백분율로 표시한 것 —
// 오늘의집처럼 사진 위에 "+" 핀을 정확히 그 자리에 찍기 위한 좌표.
const POSTS = [
  {
    id: 1,
    date: "2026.09.02",
    title: "가을을 준비하는 거실, 러그 하나로 톤을 바꾸다",
    excerpt:
      "차가워지는 바닥에 러그 한 장을 깔면 공간의 온도가 달라집니다. 이번 주 쇼룸 촬영에서는 블루·올리브·더스티핑크가 어우러진 아브스트랙트 러그로 거실 톤을 완성했어요.",
    coverId: 1,
    tags: [
      { id: 1, x: 48, y: 80 },
      { id: 5, x: 83, y: 58 },
    ],
  },
  {
    id: 2,
    date: "2026.08.27",
    title: "은은한 저녁 조명, 무드등 두 가지 조합",
    excerpt:
      "라탄 케인 갓의 그물무늬 빛과 자연사로 감은 미니 무드등을 함께 두면 저녁 시간이 훨씬 아늑해집니다. 침실 협탁 위 조명 레이어링, 이렇게 시작해보세요.",
    coverId: 2,
    tags: [
      { id: 2, x: 30, y: 35 },
      { id: 3, x: 88, y: 55 },
    ],
  },
  {
    id: 3,
    date: "2026.08.19",
    title: "소파 하나로 완성하는 주말 오후",
    excerpt:
      "부클 원단과 애쉬우드 프레임의 곡선이 만든 라운지 소파. 낮은 좌면과 넉넉한 팔걸이만으로도 거실의 시선이 자연스럽게 모입니다.",
    coverId: 5,
    tags: [
      { id: 5, x: 50, y: 60 },
      { id: 4, x: 20, y: 70 },
    ],
  },
  {
    id: 4,
    date: "2026.08.10",
    title: "정리는 예쁘게, 라탄 수납 바구니 활용법",
    excerpt:
      "옷방과 욕실을 오가는 빨래 바구니도 스타일링의 대상입니다. 가죽 손잡이 라탄 바구니 하나면 담요함, 잡지꽂이로도 자연스럽게 이어집니다.",
    coverId: 8,
    tags: [
      { id: 8, x: 55, y: 65 },
      { id: 10, x: 25, y: 40 },
    ],
  },
];

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

function Lookbook() {
  const navigate = useNavigate();
  // 지금 열려있는 핀 하나만 추적 — "postId-productId" 문자열 키. 다른 핀을 열거나
  // 페이지를 벗어나면 자동으로 닫히므로 별도 정리(cleanup) 로직은 필요 없다.
  const [openTag, setOpenTag] = useState(null);

  // Notice.jsx/CustomerCenter.jsx와 동일한 신호 — "목록으로" 클릭이든 브라우저
  // 뒤로가기든, "/" 도착 시 대문 애니메이션·인트로 영상 없이 곧장 상품 목록으로.
  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

  return (
    <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
      {/* 핀 팝오버가 열려있을 때 바깥을 클릭하면 닫히도록 — 팝오버 자체보다 z-index를
          낮춰 팝오버 클릭(상세페이지 이동)은 그대로 통과시킨다. */}
      {openTag && <div className="fixed inset-0 z-0" onClick={() => setOpenTag(null)} />}
      <div className="max-w-5xl mx-auto w-full px-8 pt-[130px] pb-20">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={MONO}
        >
          <ChevronLeft size={14} /> 목록으로
        </button>

        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>LOOKBOOK</span>
            <h1 className="text-3xl md:text-4xl font-light mt-2" style={SERIF}>집다움 룩북</h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-md">
              집다움 스타일팀이 상품으로 직접 완성한 공간 이야기.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/lookbook/tips")}
            className="flex items-center gap-1 text-xs font-medium text-foreground hover:opacity-70 transition-opacity shrink-0"
            style={SANS}
          >
            신상품 팁 보러가기 <ChevronRight size={13} />
          </button>
        </div>
        <Hairline className="mb-10" />

        <div className="grid sm:grid-cols-2 gap-8">
          {POSTS.map((post) => {
            const cover = byId(post.coverId);
            return (
              <article key={post.id} className="flex flex-col">
                {/* 오늘의집처럼 사진 위에 "+" 핀을 찍어두고, 눌러야 그 상품의 이름·가격이
                    뜬다 — 핀이 이미지 밖(카드 여백)까지 삐져나올 수 있어 overflow는
                    이미지 쪽(안쪽 div)에만 걸고 핀 레이어는 안 잘리게 둔다. */}
                <div className="relative mb-4">
                  <div className="overflow-hidden rounded-2xl bg-muted aspect-[4/3]">
                    <img
                      src={cover?.interiorImage || cover?.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {post.tags.map((tag) => {
                    const p = byId(tag.id);
                    if (!p) return null;
                    const key = `${post.id}-${tag.id}`;
                    const isOpen = openTag === key;
                    return (
                      <div
                        key={tag.id}
                        className="absolute z-10"
                        style={{ left: `${tag.x}%`, top: `${tag.y}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenTag(isOpen ? null : key)}
                          aria-label={`${p.name} 정보 보기`}
                          className="flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg transition-transform hover:scale-110"
                          style={{
                            background: "#2f6fed",
                            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                            boxShadow: "0 0 0 4px rgba(47,111,237,0.28)",
                          }}
                        >
                          <Plus size={15} strokeWidth={2.5} />
                        </button>

                        {isOpen && (
                          <button
                            type="button"
                            onClick={() => navigate(`/item/${tag.id}`)}
                            className="absolute top-1/2 left-full ml-2 -translate-y-1/2 flex items-center gap-2.5 bg-white text-left rounded-xl shadow-xl p-2 pr-4 hover:opacity-90 transition-opacity whitespace-nowrap"
                          >
                            <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                            <span className="flex flex-col">
                              <span className="text-xs font-medium text-neutral-900" style={SANS}>{p.name}</span>
                              <span className="text-xs font-semibold text-neutral-900" style={MONO}>₩{p.price}</span>
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] text-muted-foreground" style={MONO}>{post.date}</span>
                <h3 className="text-lg font-medium text-foreground mt-1.5 mb-2" style={SERIF}>{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
              </article>
            );
          })}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export default Lookbook;
