import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS } from "../Home/Home";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import { POSTS } from "./posts";
import ImageHotspots from "./ImageHotspots";
import SiteFooter from "../SiteFooter";

// Home.jsx 상품 목록과 같은 타이포 시스템 — 이 페이지도 그 스타일을 그대로 따른다.
const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const byId = (id) => PRODUCTS.find((p) => p.id === id);

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

  // Notice.jsx/CustomerCenter.jsx와 동일한 신호 — "목록으로" 클릭이든 브라우저
  // 뒤로가기든, "/" 도착 시 대문 애니메이션·인트로 영상 없이 곧장 상품 목록으로.
  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

  return (
    <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
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
              <article
                key={post.id}
                className="flex flex-col cursor-pointer group"
                onClick={() => navigate(`/lookbook/${post.id}`)}
              >
                <ImageHotspots
                  image={cover?.interiorImage || cover?.image}
                  alt={post.title}
                  tags={post.tags}
                  className="aspect-[4/3] mb-4"
                />
                <span className="text-[10px] text-muted-foreground" style={MONO}>{post.date}</span>
                <h3 className="text-lg font-medium text-foreground mt-1.5 mb-2 group-hover:opacity-70 transition-opacity" style={SERIF}>
                  {post.title}
                </h3>
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
