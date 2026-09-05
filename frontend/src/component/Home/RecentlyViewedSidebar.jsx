import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ChevronDown, Trash2 } from "lucide-react";
import { removeRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed";
import { useRailStyle } from "../../hooks/useRailStyle";
import "./RecentlyViewedSidebar.css";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

const MAX_VISIBLE = 6;

// 최근에 들어가 본 상품을 macOS 독처럼 화면 오른쪽에 이미지로 항상 띄워두고,
// 올리면 살짝 튀어나오며 커지고(독 매그니피케이션), 이름/가격 툴팁이 왼쪽으로 뜬다.
function RecentlyViewedSidebar({
  items,
  onChange,
  detailBasePath = "/item",
  namespace = "main",
}) {
  const navigate = useNavigate();

  // 이름/가격 툴팁의 위치 기준(dock 자신의 좌표)과 현재 hover 중인 아이템.
  // .recentDockItems가 접기/펼치기 애니메이션 때문에 overflow:hidden이라
  // 툴팁을 그 안(items 배열 map 안)에 두면 옆으로 튀어나오는 부분이 잘려서
  // 안 보인다 — 그래서 툴팁 하나만 .recentDockItems 바깥(형제)에 두고,
  // hover된 아이템의 화면 좌표를 읽어 세로 위치만 맞춰서 띄운다.
  const dockRef = useRef(null);
  const [tooltip, setTooltip] = useState(null); // { item, top } | null

  const handleItemEnter = (item, e) => {
    const itemRect = e.currentTarget.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    setTooltip({ item, top: itemRect.top - dockRect.top + itemRect.height / 2 });
  };
  const handleItemLeave = () => setTooltip(null);

  // 하단 독바(Sidebar)와 같은 glass/메탈릭/파스텔 스타일을 공유한다.
  const { railStyle, styleSwitching } = useRailStyle();

  // 하단 독바와 마찬가지로 접힘 상태를 기억해뒀다가 다음 방문에도 유지한다.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("recentDockCollapsed") === "1"
  );

  useEffect(() => {
    localStorage.setItem("recentDockCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // /settings(Settings.jsx)에서 통째로 껐을 수 있다 — 값이 없으면(기존 사용자)
  // 기본 켬으로 취급. "dockvisibilitychange" 이벤트로 즉시 반영.
  const [dockEnabled, setDockEnabled] = useState(() => {
    const raw = localStorage.getItem("showRecentDock");
    return raw === null ? true : raw === "1";
  });
  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem("showRecentDock");
      setDockEnabled(raw === null ? true : raw === "1");
    };
    window.addEventListener("dockvisibilitychange", sync);
    return () => window.removeEventListener("dockvisibilitychange", sync);
  }, []);

  if (!dockEnabled || items.length === 0) return null;

  const visible = items.slice(0, MAX_VISIBLE);
  const overflowCount = items.length - visible.length;

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeRecentlyViewed(id, namespace);
    setTooltip(null); // 삭제된 아이템이 hover 중이던 채로 사라지면 툴팁이 남는 것 방지
    onChange();
  };

  const handleClear = () => {
    clearRecentlyViewed(namespace);
    setTooltip(null);
    onChange();
  };

  return (
    <div
      ref={dockRef}
      // 십자 패드(Sidebar.css .railTopBtnWrap--cross)와 폭·중심을 맞춘 값 —
      // "십자 버튼을 최근 본 상품 독 크기에 맞춰달라"는 요청으로 그쪽 폭을
      // 이 독(썸네일 56px + padding 16px + border ≈ 74px)에 맞춰 줄였고,
      // right 오프셋은 반대로 여기서 그 폭에 맞춰 역산했다. 십자 패드는
      // right:20px + 폭 72px → 중심이 화면 오른쪽 끝에서 56px, 이 독(폭
      // 74px)도 같은 중심이 되려면 right = 56 - 74/2 = 19px. 둘 중 하나
      // 폭이 바뀌면 이 값도 다시 계산해야 한다.
      //
      // top은 반대로 고정값을 안 쓴다 — Header.jsx가 fixed+height:auto라 상태에
      // 따라 실제 높이가 바뀌는데(검색창 포커스로 최근 검색어가 펼쳐질 때 등),
      // "top-32(128px)" 같은 어림값은 헤더가 그보다 조금만 더 자라도 이 독의
      // 윗부분이 z-index 더 높은 헤더 배너에 가려 안 보이는 원인이었다.
      // Header.jsx가 ResizeObserver로 공개하는 --header-h를 그대로 따라간다.
      className={`recentDock railStyle-${railStyle} ${styleSwitching ? "styleSwitching" : ""} ${collapsed ? "collapsed" : ""} fixed right-[19px] z-40 flex flex-col items-center ${collapsed ? "gap-0" : "gap-2"} p-2 rounded-[18px]`}
      style={{ top: "calc(var(--header-h, 128px) + 8px)" }}
      data-lenis-prevent
    >
      <button
        type="button"
        className="recentDockToggle flex items-center justify-center gap-1 pb-1 border-b border-border w-full text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "최근 본 상품 펼치기" : "최근 본 상품 접기"}
      >
        <Clock size={11} />
        <ChevronDown size={10} className="recentDockChevron" />
      </button>

      <div className="recentDockItems flex flex-col items-center gap-2 w-full">
        {visible.map((item) => (
          <div
            key={item.id}
            className="relative group"
            onMouseEnter={(e) => handleItemEnter(item, e)}
            onMouseLeave={handleItemLeave}
          >
            <button
              type="button"
              onClick={() => navigate(`${detailBasePath}/${item.id}`)}
              aria-label={item.name}
              className="recentDockItemImg block w-14 h-14 rounded-lg overflow-hidden border border-border shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.18] group-hover:-translate-x-1.5"
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </button>

            <button
              type="button"
              onClick={(e) => handleRemove(e, item.id)}
              aria-label="목록에서 삭제"
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={8} />
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
          className="pt-1 border-t border-border w-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* 이름/가격 툴팁 — .recentDockItems의 overflow:hidden(접기 애니메이션용) 밖에
          형제로 둬서 잘리지 않게 하고, hover된 아이템의 세로 위치만 따라간다. */}
      {tooltip && (
        <div
          className="pointer-events-none absolute right-full mr-2.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] shadow-lg"
          style={{ top: tooltip.top, transform: "translateY(-50%)" }}
        >
          <p style={SANS}>{tooltip.item.name}</p>
          <p className="text-background/70" style={MONO}>₩{tooltip.item.price.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default RecentlyViewedSidebar;
