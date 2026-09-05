import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { PRODUCTS } from "../Home/Home";
import { NAV_FLAGS, NAV_ZONE } from "../../utils/navFlags";
import { getPostById } from "./posts";
import ImageHotspots from "./ImageHotspots";
import SiteFooter from "../SiteFooter";

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

function LookbookPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = getPostById(id);

  useEffect(() => {
    sessionStorage.setItem(NAV_FLAGS.PRODUCT_DETAIL_RETURN_ZONE, NAV_ZONE.HOME);
  }, []);

  if (!post) {
    return (
      <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
        <div className="max-w-3xl mx-auto w-full px-8 pt-[130px] pb-20">
          <button
            type="button"
            onClick={() => navigate("/lookbook")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
            style={MONO}
          >
            <ChevronLeft size={14} /> 룩북으로
          </button>
          <p className="text-sm text-muted-foreground">게시물을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const cover = byId(post.coverId);
  const taggedProducts = post.tags.map((tag) => byId(tag.id)).filter(Boolean);

  return (
    <div className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto" data-hsnap data-lenis-prevent>
      <div className="max-w-3xl mx-auto w-full px-8 pt-[130px] pb-20">
        <button
          type="button"
          onClick={() => navigate("/lookbook")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={MONO}
        >
          <ChevronLeft size={14} /> 룩북으로
        </button>

        <span className="text-[10px] text-muted-foreground" style={MONO}>{post.date}</span>
        <h1 className="text-2xl md:text-3xl font-light text-foreground mt-2 mb-8" style={SERIF}>{post.title}</h1>

        <ImageHotspots
          image={cover?.interiorImage || cover?.image}
          alt={post.title}
          tags={post.tags}
          className="aspect-[4/3] mb-10"
        />

        <div className="flex flex-col gap-4 mb-14 max-w-xl">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-sm text-foreground/80 leading-relaxed">{paragraph}</p>
          ))}
        </div>

        <Hairline className="mb-10" />

        <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>
          이 게시물의 상품
        </span>
        <div className="flex flex-col gap-4 mt-4">
          {taggedProducts.map((p) => (
            <div
              key={p.id}
              className="flex gap-5 items-center p-4 rounded-2xl border border-border hover:border-foreground/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/item/${p.id}`)}
            >
              <div className="overflow-hidden rounded-xl bg-muted w-20 h-20 shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                {p.label && (
                  <span className="text-[10px] font-semibold text-foreground/70 border border-border rounded px-1.5 py-0.5" style={MONO}>
                    {p.label}
                  </span>
                )}
                <h3 className="text-sm font-medium text-foreground mt-1.5 mb-1" style={SERIF}>{p.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{p.desc}</p>
                <span className="text-sm font-semibold text-foreground" style={MONO}>₩{p.price}</span>
              </div>
            </div>
          ))}
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export default LookbookPost;
