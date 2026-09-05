import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PRODUCTS } from "../Home/Home";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import SiteFooter from "../SiteFooter";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

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

// 관리자가 신상품에 붙이는 스타일링 한마디 — 지금은 프론트 목업 데이터.
// PRODUCTS의 label이 "NEW"인 상품 id에 매칭시켜두고, 해당하지 않는 상품은
// 자동으로 팁 목록에서 빠진다(새 신상품이 들어오면 여기 한 줄만 추가하면 됨).
const TIPS = {
  2: "라탄 케인 갓 사이로 새어나오는 그물무늬 빛은 벽에서 30cm 정도 띄워야 무늬가 온전히 살아납니다.",
  3: "협탁 위보다 낮은 콘솔이나 바닥에 두면 마사 로프의 자연스러운 그림자가 더 길게 드리워집니다.",
  6: "월넛 프레임은 원목 가구와, 라탄 등받이는 패브릭 소품과 번갈아 매치하면 질리지 않습니다.",
  8: "가죽 손잡이는 시간이 지나면 짙어지니 처음엔 조금 밝은 톤의 옷·수건을 담아 대비를 주세요.",
  9: "지오메트릭 패턴 러그는 가구를 적게 올릴수록 무늬가 도드라져 좁은 방에도 잘 어울립니다.",
};

function LookbookTips() {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

  const newProducts = PRODUCTS.filter((p) => p.label === "NEW" && TIPS[p.id]);

  return (
    <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
      <div className="max-w-4xl mx-auto w-full px-8 pt-[130px] pb-20">
        <button
          type="button"
          onClick={() => navigate("/lookbook")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={MONO}
        >
          <ChevronLeft size={14} /> 룩북으로
        </button>

        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>TIPS</span>
        <h1 className="text-3xl md:text-4xl font-light mt-2 mb-3" style={SERIF}>신상품 스타일링 팁</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-md">
          이번에 새로 들어온 상품, 집다움 스타일팀이 짧게 코멘트를 남겼어요.
        </p>
        <Hairline className="mb-10" />

        <div className="flex flex-col gap-6">
          {newProducts.map((p) => (
            <div
              key={p.id}
              className="flex gap-5 items-start p-5 rounded-2xl border border-border hover:border-foreground/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/item/${p.id}`)}
            >
              <div className="overflow-hidden rounded-xl bg-muted w-24 h-24 shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-foreground/70 border border-border rounded px-1.5 py-0.5" style={MONO}>
                  NEW
                </span>
                <h3 className="text-base font-medium text-foreground mt-1.5 mb-1" style={SERIF}>{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{TIPS[p.id]}</p>
              </div>
            </div>
          ))}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export default LookbookTips;
