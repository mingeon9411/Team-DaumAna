import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ChevronDown, Trash2 } from "lucide-react";
import { removeRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed";
import { useRailStyle } from "../../hooks/useRailStyle";
import "./RecentlyViewedSidebar.css";

const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const MAX_VISIBLE = 6;

// 최근에 들어가 본 상품을 macOS 독처럼 화면 오른쪽에 이미지로 항상 띄워두고,
// 올리면 살짝 튀어나오며 커지고(독 매그니피케이션), 이름/가격 툴팁이 왼쪽으로 뜬다.
// detailBasePath: 클릭 시 이동할 상세페이지 경로 접두사 — 메인은 /item, 한국관은 /product.
// namespace: recentlyViewed.js에 넘길 저장소 구분자 — 메인은 "main", 한국관은 "korean-hall".
// variant: "korean-hall"이면 사용자가 고른 유리/메탈릭/파스텔 독 스타일 대신
// RecentlyViewedSidebar.css의 .recentDockKoreanHall 테마(한지톤+오방색)가 항상 적용된다.
function RecentlyViewedSidebar({
  items,
  onChange,
  detailBasePath = "/item",
  namespace = "main",
  variant = "default",
}) {
  const navigate = useNavigate();

  // 하단 독바(Sidebar)와 같은 glass/메탈릭/파스텔 스타일을 공유한다.
  const { railStyle, styleSwitching } = useRailStyle();

  // 하단 독바와 마찬가지로 접힘 상태를 기억해뒀다가 다음 방문에도 유지한다.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("recentDockCollapsed") === "1"
  );

  useEffect(() => {
    localStorage.setItem("recentDockCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  if (items.length === 0) return null;

  const visible = items.slice(0, MAX_VISIBLE);
  const overflowCount = items.length - visible.length;

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeRecentlyViewed(id, namespace);
    onChange();
  };

  const handleClear = () => {
    clearRecentlyViewed(namespace);
    onChange();
  };

  return (
    <div
      // right-1.5(6px)는 임의값이 아니라 하단 우측의 railTopBtnWrap(맨 위로 버튼,
      // Sidebar.css: right 20px + padding 8px + border 1.5px → 폭 59px)과 가로
      // 중심이 맞도록 역산한 값 — 이 독(폭 87px)의 중심도 화면 오른쪽 끝에서
      // 약 49.5px이 되게 맞춘다. 둘 중 하나 폭이 바뀌면 다시 계산해야 한다.
      //
      // top은 반대로 고정값을 안 쓴다 — Header.jsx가 fixed+height:auto라 상태에
      // 따라 실제 높이가 바뀌는데(검색창 포커스로 최근 검색어가 펼쳐질 때 등),
      // "top-32(128px)" 같은 어림값은 헤더가 그보다 조금만 더 자라도 이 독의
      // 윗부분이 z-index 더 높은 헤더 배너에 가려 안 보이는 원인이었다.
      // Header.jsx가 ResizeObserver로 공개하는 --header-h를 그대로 따라간다.
      className={`recentDock railStyle-${railStyle} ${variant === "korean-hall" ? "recentDockKoreanHall" : ""} ${styleSwitching ? "styleSwitching" : ""} ${collapsed ? "collapsed" : ""} fixed right-1.5 z-40 flex flex-col items-center ${collapsed ? "gap-0" : "gap-2.5"} p-2.5 rounded-[22px]`}
      style={{ top: "calc(var(--header-h, 128px) + 8px)" }}
      data-lenis-prevent
    >
      <button
        type="button"
        className="recentDockToggle flex items-center justify-center gap-1 pb-1.5 border-b border-border w-full text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "최근 본 상품 펼치기" : "최근 본 상품 접기"}
      >
        <Clock size={13} />
        <ChevronDown size={11} className="recentDockChevron" />
      </button>

      <div className="recentDockItems flex flex-col items-center gap-2.5 w-full">
        {visible.map((item) => (
          <div key={item.id} className="relative group">
            <button
              type="button"
              onClick={() => navigate(`${detailBasePath}/${item.id}`)}
              aria-label={item.name}
              className="recentDockItemImg block w-16 h-16 rounded-xl overflow-hidden border border-border shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-translate-x-1.5"
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
    </div>
  );
}

export default RecentlyViewedSidebar;
