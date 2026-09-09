import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { LuChevronsUp, LuChevronsDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { removeRecentlyViewed, clearRecentlyViewed } from "../../utils/recentlyViewed";
import { addToCart } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";
import "../Sidebar/Sidebar.css";
import "./RecentlyViewedSidebar.css";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

// utils/recentlyViewed.js의 저장 상한(MAX_ITEMS=20)과 맞춘다 — 이제는 6개로
// 잘라내지 않고 저장된 건 전부 렌더링한 뒤, 카드 목록 자체를 스크롤해서 본다
// (아래 .recentCartList 참고). 화면 밖으로 잘리는 대신, 다 보여주고 스크롤로
// 해결하는 쪽이 "최근 본 상품"이라는 위젯 목적에 더 맞는다.
const MAX_VISIBLE = 20;
// 카드가 이 개수보다 많아야 "+" 더보기 버튼을 보여준다 — 그 이하면 스크롤 없이도
// 다 보이니 버튼이 필요 없다(.recentCartList의 max-height와 카드 1개 높이 기준으로 맞춘 값).
const VISIBLE_WITHOUT_SCROLL = 2;

// 최근에 들어가 본 상품을 쿠팡 "최근 본 상품 담기" 위젯처럼 화면 오른쪽에 띄운다.
// 각 카드는 체크박스(기본 미선택)로 담을지 고르고, 수량은 +로만 늘리고 담기 전엔
// 휴지통으로 목록에서 뺀다 — 체크된 것만 합계에 잡히고, "장바구니 가기"를 누르면
// 체크된 것들을 한 번에 담고 나서 /cart로 이동한다.
function RecentlyViewedSidebar({
  items,
  onChange,
  detailBasePath = "/item",
  namespace = "main",
}) {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const listRef = useRef(null);

  // 로그인 전에는 이 독 자체를 안 띄운다 — Header.jsx와 같은 기준(access_token)·
  // 같은 이벤트(authchange)로 로그인/로그아웃을 즉시 반영한다.
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    window.addEventListener("authchange", sync);
    return () => window.removeEventListener("authchange", sync);
  }, []);

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

  // 담기 초안(체크 여부 · 수량) — 상품별로 관리하며, 화면에 없던 상품이 새로
  // 들어오면 기본값(미선택·수량 1)으로, 목록에서 빠지면 같이 정리된다.
  const [cart, setCart] = useState({});
  useEffect(() => {
    setCart((prev) => {
      const next = {};
      for (const item of items) {
        next[item.id] = prev[item.id] ?? { checked: false, quantity: 1 };
      }
      return next;
    });
  }, [items]);

  // Sidebar.jsx가 예전에 화면 우하단에 독립적으로 띄우던 십자패드(맨 위로/
  // 맨 아래로/이전/다음 페이지)를 이 독 맨 아래 섹션으로 옮겨 붙였다 — 모바일에서
  // 두 위젯이 따로 떠 있으면 화면을 두 번 차지했기 때문. /settings에서 켜고 끌
  // 수 있는 표시 여부도 그대로 옮겨왔다.
  const [showTopButton, setShowTopButton] = useState(() => {
    const raw = localStorage.getItem("showTopButton");
    return raw === null ? true : raw === "1";
  });
  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem("showTopButton");
      setShowTopButton(raw === null ? true : raw === "1");
    };
    window.addEventListener("dockvisibilitychange", sync);
    return () => window.removeEventListener("dockvisibilitychange", sync);
  }, []);

  // 현재 홈에서 몇 번째 가로 패널(상품 그리드/룩북)을 보고 있는지 — 좌/우 버튼의
  // 다음/이전 패널 계산과 위/아래 버튼이 어느 패널 안쪽을 스크롤할지 판단하는 데
  // 쓴다. 이 컴포넌트는 Home.jsx에서만 렌더링되므로(항상 "/" 경로) Sidebar.jsx가
  // 하던 isHome 체크는 필요 없다.
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  useEffect(() => {
    const computeActivePanel = () => {
      const panels = document.querySelectorAll("[data-hsnap]");
      let activeIndex = 0;
      let minDist = Infinity;
      panels.forEach((panel, i) => {
        const dist = Math.abs(panel.getBoundingClientRect().left);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = i;
        }
      });
      setActivePanelIndex(activeIndex);
    };
    computeActivePanel();
    window.addEventListener("scroll", computeActivePanel);
    return () => window.removeEventListener("scroll", computeActivePanel);
  }, []);

  const triggerPop = (e) => {
    const el = e.currentTarget;
    el.classList.remove("railPop");
    void el.offsetWidth; // 리플로우로 애니메이션 재시작 보장
    el.classList.add("railPop");
  };

  const scrollActivePanelTop = () => {
    document.querySelectorAll("[data-hsnap]")[activePanelIndex]?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollActivePanelBottom = () => {
    const el = document.querySelectorAll("[data-hsnap]")[activePanelIndex];
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const scrollToPanel = (index) => {
    const panels = document.querySelectorAll("[data-hsnap]");
    const target = panels[Math.max(0, Math.min(index, panels.length - 1))];
    if (!target) return;
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      target.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  const withPop = (fn) => (e) => {
    triggerPop(e);
    fn();
  };
  const handlePrevPanel = withPop(() => scrollToPanel(activePanelIndex - 1));
  const handleNextPanel = withPop(() => scrollToPanel(activePanelIndex + 1));

  if (!isLoggedIn) return null;

  const showItems = dockEnabled && items.length > 0;
  if (!showItems && !showTopButton) return null;

  const visible = items.slice(0, MAX_VISIBLE);
  const checkedItems = visible.filter((item) => cart[item.id]?.checked);
  const totalPrice = checkedItems.reduce(
    (sum, item) => sum + item.price * (cart[item.id]?.quantity ?? 1),
    0
  );

  const toggleChecked = (id) => {
    setCart((prev) => ({ ...prev, [id]: { ...prev[id], checked: !prev[id]?.checked } }));
  };

  const bumpQty = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: { ...prev[id], quantity: (prev[id]?.quantity ?? 1) + 1 },
    }));
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    await removeRecentlyViewed(id, namespace);
    onChange();
  };

  const handleClear = async () => {
    await clearRecentlyViewed(namespace);
    onChange();
  };

  // 맨 아래 "+" 버튼 — 카드 목록(.recentCartList)을 한 칸(카드 하나 높이 정도)
  // 아래로 스크롤한다. 끝까지 내려가면 처음으로 되돌아가 계속 눌러도 순환된다.
  const scrollListDown = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    el.scrollTo({ top: atBottom ? 0 : el.scrollTop + 190, behavior: "smooth" });
  };

  const handleGoToCart = async () => {
    if (checkedItems.length === 0) {
      navigate("/cart");
      return;
    }
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      openLogin();
      return;
    }
    try {
      await Promise.all(
        checkedItems.map((item) =>
          addToCart({ product: item.id, quantity: cart[item.id]?.quantity ?? 1 })
        )
      );
      window.dispatchEvent(new Event("cartchange"));
      navigate("/cart");
    } catch {
      alert("일부 상품을 장바구니에 담지 못했습니다. 옵션이 있는 상품은 상세페이지에서 담아주세요.");
    }
  };

  return (
    <div
      // right 위치는 RecentlyViewedSidebar.css의 .recentDock이 담당 — 뷰포트
      // 끝이 아니라 상품 그리드 콘텐츠(max-w-7xl) 오른쪽 끝에 붙도록 calc()로
      // 계산한다(쿠팡처럼 상품과 딱 붙어 보이게). 여기 Tailwind 클래스에는
      // 그 값과 경쟁하지 않도록 right-* 유틸리티를 넣지 않는다.
      //
      // 화면 세로 중앙에 고정 — position:fixed라 어차피 스크롤에 안 움직이니,
      // 헤더 바로 아래(예전엔 --header-h 기준 top)보다 중앙이 화면 어디서
      // 스크롤하든 시선이 닿기 쉽다. 헤더가 검색창 포커스 등으로 높이가 늘어나도
      // 중앙 정렬은 그 값과 무관해 더는 --header-h를 따라갈 필요가 없다.
      className={`recentDock ${collapsed ? "collapsed" : ""} fixed top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-2 rounded-2xl`}
      data-lenis-prevent
    >
      {showItems && (
        <>
          <button
            type="button"
            className="recentDockToggle flex items-center justify-center gap-1 pb-1.5 border-b border-border w-full text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "최근 본 상품 펼치기" : "최근 본 상품 접기"}
          >
            <span className="text-[10px] font-semibold" style={SANS}>최근 본 상품</span>
            <ChevronDown size={10} className="recentDockChevron" />
          </button>

          <div className="recentDockItems flex flex-col gap-3 w-full">
            <div className="recentCartSummary">
              <span className="recentCartTotalLabel" style={SANS}>
                합계({checkedItems.length})
              </span>
              <strong className="recentCartTotalValue" style={MONO}>
                {totalPrice.toLocaleString()}원
              </strong>
              <button
                type="button"
                className="recentCartGoBtn"
                onClick={handleGoToCart}
                style={SANS}
              >
                장바구니 가기
              </button>
            </div>

            {/* 카드가 몇 개든 이 안에서만 스크롤된다 — 예전엔 6개로 잘라 보여주고
                나머지는 "외 N개" 글자로만 표시했는데, 그러면 카드 개수가 늘어날 때마다
                독 자체가 길어져 아래 십자패드 섹션을 밀어냈다. 이제 독 높이는 고정,
                넘치는 카드는 스크롤로만 본다. */}
            <div className="recentCartList" ref={listRef}>
              {visible.map((item) => {
                const draft = cart[item.id] ?? { checked: false, quantity: 1 };
                return (
                  <div key={item.id} className={`recentCartItem${draft.checked ? " checked" : ""}`}>
                    <label className="recentCartCheckRow">
                      <input
                        type="checkbox"
                        checked={draft.checked}
                        onChange={() => toggleChecked(item.id)}
                        aria-label={`${item.name} 담기 선택`}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => navigate(`${detailBasePath}/${item.id}`)}
                      aria-label={item.name}
                      className="recentCartImg block w-[85%] mx-auto overflow-hidden rounded-lg border border-border"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </button>

                    <p className="recentCartPrice" style={MONO}>₩{item.price.toLocaleString()}</p>

                    <div className="recentCartQtyRow">
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, item.id)}
                        aria-label="목록에서 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                      <span style={MONO}>{draft.quantity}</span>
                      <button
                        type="button"
                        onClick={() => bumpQty(item.id)}
                        aria-label="수량 증가"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="recentDockFooter flex items-center justify-between w-full pt-1.5 border-t border-border">
              {visible.length > VISIBLE_WITHOUT_SCROLL ? (
                <button
                  type="button"
                  className="recentDockMoreBtn"
                  onClick={scrollListDown}
                  aria-label="최근 본 상품 더 보기(스크롤)"
                >
                  <Plus size={12} />
                </button>
              ) : <span />}
              <button
                type="button"
                onClick={handleClear}
                aria-label="최근 본 상품 전체삭제"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 예전엔 Sidebar.jsx가 화면 우하단에 따로 띄우던 십자패드 — 이 독 맨 아래
          섹션으로 옮겨 붙었다. 위 상품 목록이 없을 때도(첫 방문 등) 내비게이션은
          계속 쓸 수 있어야 하므로 showItems와 무관하게 showTopButton만 본다. */}
      {showTopButton && (
        <div className={showItems ? "pt-2 mt-1 border-t border-dashed border-border" : ""}>
          <div className="railTopBtnWrap railTopBtnWrap--cross recentDockCrossPad" data-lenis-prevent>
            <button type="button" className="railBtn railBtnUp" aria-label="맨 위로" data-tooltip="맨 위로" onClick={withPop(scrollActivePanelTop)}>
              <LuChevronsUp />
            </button>
            <button type="button" className="railBtn railBtnLeft" aria-label="이전 페이지" data-tooltip="이전 페이지" onClick={handlePrevPanel}>
              <LuChevronLeft />
            </button>
            <button type="button" className="railBtn railBtnRight" aria-label="다음 페이지" data-tooltip="다음 페이지" onClick={handleNextPanel}>
              <LuChevronRight />
            </button>
            <button type="button" className="railBtn railBtnDown" aria-label="맨 아래로" data-tooltip="맨 아래로" onClick={withPop(scrollActivePanelBottom)}>
              <LuChevronsDown />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentlyViewedSidebar;
