import { useNavigate } from "react-router-dom";
import { X, Clock, Trash2 } from "lucide-react";
import { removeRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed";
import "./RecentlyViewedSidebar.css";

const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const MAX_VISIBLE = 6;

// 최근에 들어가 본 상품을 macOS 독처럼 화면 오른쪽에 이미지로 항상 띄워두고,
// 올리면 살짝 튀어나오며 커지고(독 매그니피케이션), 이름/가격 툴팁이 왼쪽으로 뜬다.
function RecentlyViewedSidebar({ items, onChange }) {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const visible = items.slice(0, MAX_VISIBLE);
  const overflowCount = items.length - visible.length;

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeRecentlyViewed(id);
    onChange();
  };

  const handleClear = () => {
    clearRecentlyViewed();
    onChange();
  };

  return (
    <div
      className="recentDock fixed right-24 top-32 z-40 flex flex-col items-center gap-2.5 p-2.5 rounded-[22px]"
      data-lenis-prevent
    >
      <div className="flex items-center justify-center pb-1.5 border-b border-border w-full">
        <Clock size={13} className="text-muted-foreground" />
      </div>

      {visible.map((item) => (
        <div key={item.id} className="relative group">
          <button
            type="button"
            onClick={() => navigate(`/item/${item.id}`)}
            aria-label={item.name}
            className="block w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-translate-x-1.5"
          >
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </button>

          {/* 왼쪽으로 뜨는 이름/가격 툴팁 */}
          <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <p style={SANS}>{item.name}</p>
            <p className="text-background/70" style={MONO}>₩{item.price.toLocaleString()}</p>
          </div>

          <button
            type="button"
            onClick={(e) => handleRemove(e, item.id)}
            aria-label="목록에서 삭제"
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {overflowCount > 0 && (
        <span className="text-[10px] text-muted-foreground" style={MONO}>+{overflowCount}</span>
      )}

      <button
        type="button"
        onClick={handleClear}
        aria-label="최근 본 상품 전체삭제"
        className="pt-1.5 border-t border-border w-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default RecentlyViewedSidebar;
